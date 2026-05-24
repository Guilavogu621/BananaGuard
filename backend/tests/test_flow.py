from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
import io
from PIL import Image
import pytest

# Configuration de la base de données de test isolée pour le flow
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_full_flow():
    # 1. Signup
    email = "flow@example.com"
    password = "password123"
    signup_response = client.post(
        "/api/auth/signup",
        json={"email": email, "nom_complet": "Flow User", "mot_de_passe": password}
    )
    assert signup_response.status_code == 201
    
    # 2. Login
    login_response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Analyse Image
    # Create a dummy image
    img = Image.new('RGB', (224, 224), color='green')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    response = client.post(
        "/api/analyse/",
        headers=headers,
        files={"file": ("test.jpg", img_byte_arr, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "maladie" in data
    assert "confiance" in data
    
    # 4. Base de maladies
    maladies_response = client.get("/api/maladies/")
    assert maladies_response.status_code == 200
    assert len(maladies_response.json()) > 0
    print("Maladies database check passed!")
    
    # 5. Historique
    history_response = client.get("/api/historique/", headers=headers)
    assert history_response.status_code == 200
    assert len(history_response.json()) >= 1
    print("History check passed!")

if __name__ == "__main__":
    # Permet l'exécution directe si besoin
    Base.metadata.create_all(bind=engine)
    try:
        test_full_flow()
        print("Full flow test passed successfully!")
    finally:
        Base.metadata.drop_all(bind=engine)

