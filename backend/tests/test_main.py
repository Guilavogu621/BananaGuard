from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API BananaGuard. Accédez à /docs pour la documentation Swagger."}

def test_auth_signup():
    # Test simple de création d'utilisateur
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "nom_complet": "Test User", "mot_de_passe": "password123"}
    )
    # Si l'utilisateur existe déjà, ça peut être 400, sinon 201
    assert response.status_code in [201, 400]
