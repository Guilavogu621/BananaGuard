from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy import text
from app.database import Base, engine
from app.models import user, analyse
from app.routes import auth, historique, analyse, maladies, admin

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

# Migration: ajout colonne is_active si elle n'existe pas encore
# IF NOT EXISTS évite l'erreur si la colonne existe déjà (PostgreSQL + SQLite)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
        conn.commit()
except Exception:
    pass  # SQLite < 3.35 ne supporte pas IF NOT EXISTS — ignoré

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
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API BananaGuard. Accédez à /docs pour la documentation Swagger."
    }
