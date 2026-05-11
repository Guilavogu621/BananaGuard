from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image

client = TestClient(app)

def test_full_flow():
    # 1. Signup
    email = "flow@example.com"
    password = "password123"
    client.post(
        "/api/auth/signup",
        json={"email": email, "nom_complet": "Flow User", "mot_de_passe": password}
    )
    
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
    
    print(f"Analyse response: {response.json()}")
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
    # This won't run directly with pytest, but good for manual execution
    try:
        test_full_flow()
        print("Full flow test passed!")
    except Exception as e:
        print(f"Full flow test failed: {e}")
