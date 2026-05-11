import json
import os
from fastapi import APIRouter, HTTPException
from app.config import settings

router = APIRouter(prefix="/api/maladies", tags=["maladies"])

@router.get("/")
def get_all_maladies():
    """
    Retourne la liste de toutes les maladies et leurs d\u00e9tails depuis la base de connaissances.
    """
    if not os.path.exists(settings.classes_path):
        raise HTTPException(status_code=404, detail="Base de connaissances des maladies non trouv\u00e9e.")
    
    try:
        with open(settings.classes_path, "r", encoding="utf-8") as f:
            maladies_data = json.load(f)
        return maladies_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la lecture de la base de maladies : {str(e)}")

@router.get("/{maladie_id}")
def get_maladie_by_id(maladie_id: str):
    """
    Retourne les d\u00e9tails d'une maladie sp\u00e9cifique par son ID.
    """
    if not os.path.exists(settings.classes_path):
        raise HTTPException(status_code=404, detail="Base de connaissances des maladies non trouv\u00e9e.")
    
    try:
        with open(settings.classes_path, "r", encoding="utf-8") as f:
            maladies_data = json.load(f)
        
        if maladie_id in maladies_data:
            return maladies_data[maladie_id]
        else:
            raise HTTPException(status_code=404, detail="Maladie non trouv\u00e9e dans la base.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche de la maladie : {str(e)}")
