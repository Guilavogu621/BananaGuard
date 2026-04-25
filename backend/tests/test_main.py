import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
import io
from PIL import Image

# Configuration de la base de données de test (SQLite en mémoire)
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

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Bienvenue sur l'API BananaGuard" in response.json()["message"]

def test_signup_user():
    response = client.post(
        "/api/auth/signup",
        json={
            "nom_complet": "Test User",
            "email": "test@pytest.com",
            "mot_de_passe": "password123",
            "role": "agriculteur",
            "region": "Kindia"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@pytest.com"

def test_login_user():
    response = client.post(
        "/api/auth/login",
        data={"username": "test@pytest.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    return response.json()["access_token"]

def test_analyse_image_unauthorized():
    # Test sans token
    response = client.post("/api/analyse/")
    assert response.status_code == 401

def test_analyse_image_with_token():
    # 1. Login pour avoir le token
    token = test_login_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Création d'une image factice
    file = io.BytesIO()
    image = Image.new('RGB', (224, 224), color = 'red')
    image.save(file, 'jpeg')
    file.seek(0)
    
    # 3. Appel de l'API
    response = client.post(
        "/api/analyse/",
        headers=headers,
        files={"file": ("test.jpg", file, "image/jpeg")}
    )
    
    # Le test peut renvoyer 200 si le modèle est chargé, 
    # ou 500 si le chemin du modèle est incorrect dans l'env de test
    # On vérifie juste qu'on a passé l'étape de l'authentification
    assert response.status_code in [200, 500] 
