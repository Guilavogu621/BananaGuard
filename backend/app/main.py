from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import Base, engine
from app.models import user, analyse
from app.routes import auth, historique, analyse, maladies

# Création des tables dans la base de données 
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BananaGuard API",
    description="Backend API pour BananaGuard - Détection IA des maladies du bananier",
    version="1.2.0"
)

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création du dossier uploads s'il n'existe pas
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Service des fichiers statiques pour les images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enregistrement des routes
app.include_router(auth.router)
app.include_router(historique.router)
app.include_router(analyse.router)
app.include_router(maladies.router)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API BananaGuard. Accédez à /docs pour la documentation Swagger."
    }
