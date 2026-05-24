import io
import json
import os
import numpy as np
import tensorflow as tf
from PIL import Image
import shutil
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.analyse import Analyse
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/analyse", tags=["analyse"])

# Cache pour le modèle et les classes
model = None
classes_fr = {}

def get_model():
    global model, classes_fr
    if model is None:
        if not os.path.exists(settings.model_path):
            raise RuntimeError(f"Modèle non trouvé à {settings.model_path}")
        model = tf.keras.models.load_model(settings.model_path)
        
        if os.path.exists(settings.classes_path):
            with open(settings.classes_path, "r", encoding="utf-8") as f:
                classes_fr = json.load(f)
    return model, classes_fr

def format_traitement(maladie_info: dict) -> str:
    parts = []
    
    # Description
    desc = maladie_info.get("description")
    if desc:
        parts.append(f"Description : {desc}\n")
    
    # Causes possibles
    causes = maladie_info.get("causes_possibles")
    if causes:
        parts.append("Causes possibles :")
        for cause in causes:
            parts.append(f"- {cause}")
        parts.append("")
        
    # Symptômes typiques / observés
    symptomes = maladie_info.get("symptomes_typiques") or maladie_info.get("symptomes_observes")
    if symptomes:
        parts.append("Symptômes clés :")
        for sympt in symptomes:
            parts.append(f"- {sympt}")
        parts.append("")

    # Recommandations
    recommandations = maladie_info.get("recommandations") or maladie_info.get("recommandations_immediates")
    if recommandations:
        parts.append("Recommandations :")
        for rec in recommandations:
            parts.append(f"- {rec}")
        parts.append("")
        
    # Traitement
    traitement = maladie_info.get("traitement")
    if traitement:
        if isinstance(traitement, str):
            parts.append(f"Traitement : {traitement}")
        elif isinstance(traitement, dict):
            note = traitement.get("note")
            if note:
                parts.append(f"Note : {note}\n")
            
            # Mesures de contrôle
            mesures = traitement.get("mesures_controle")
            if mesures:
                parts.append("Mesures de contrôle :")
                for mesure in mesures:
                    parts.append(f"- {mesure}")
                parts.append("")
                
            # Prévention
            prevention = traitement.get("prevention")
            if prevention and isinstance(prevention, dict):
                titre = prevention.get("titre", "Prévention")
                parts.append(f"{titre} :")
                for action in prevention.get("actions", []):
                    parts.append(f"- {action}")
                parts.append("")
                
            # Curatif
            curatif = traitement.get("curatif")
            if curatif and isinstance(curatif, dict):
                titre = curatif.get("titre", "Curatif")
                parts.append(f"{titre} :")
                produits = curatif.get("produits_locaux", [])
                if produits:
                    parts.append(f"  Produits locaux : {', '.join(produits)}")
                mode_emploi = curatif.get("mode_emploi", [])
                if mode_emploi:
                    parts.append("  Mode d'emploi :")
                    for mode in mode_emploi:
                        parts.append(f"  - {mode}")
                parts.append("")
                
            avertissement = traitement.get("avertissement")
            if avertissement:
                parts.append(f"Avertissement : {avertissement}")
                
    # Conseil / Conseil IA
    conseil = maladie_info.get("conseil") or maladie_info.get("conseil_ia_faible")
    if conseil:
        parts.append(f"Conseil : {conseil}")
        
    return "\n".join(parts).strip()

def preprocess_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize((224, 224)) # Taille MobileNetV2
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

@router.post("/")
async def analyse_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image.")

    try:
        # 1. Chargement du modèle
        ia_model, ia_classes = get_model()
        
        # 2. Lecture et Prétraitement
        content = await file.read()
        processed_image = preprocess_image(content)
        
        # 3. Prédiction
        predictions = ia_model.predict(processed_image)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        # 4. Identification de la maladie
        if isinstance(ia_classes, dict) and "classes" in ia_classes:
            classes_list = ia_classes["classes"]
            if class_idx < len(classes_list):
                maladie_info = classes_list[class_idx]
            else:
                maladie_info = f"Classe {class_idx}"
        elif isinstance(ia_classes, list):
            maladie_info = ia_classes[class_idx]
        else:
            maladie_info = ia_classes.get(str(class_idx), f"Classe {class_idx}")
        
        # Si c'est un dictionnaire, on extrait le nom et le traitement formaté
        if isinstance(maladie_info, dict):
            maladie_nom = maladie_info.get("nom_simple", maladie_info.get("nom", str(maladie_info)))
            traitement_info = format_traitement(maladie_info)
            class_info = maladie_info
        else:
            maladie_nom = maladie_info
            traitement_info = "Analyse effectuée avec succès."
            class_info = {"id": str(class_idx), "nom_simple": maladie_info}

        # 5. Sauvegarde physique du fichier
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("uploads", unique_filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # 6. Enregistrement dans l'historique (nom du fichier seulement)
        image_url = unique_filename
        
        nouvelle_analyse = Analyse(
            user_id=current_user.id,
            maladie=maladie_nom,
            confiance=confidence,
            image_url=image_url,
            traitement=traitement_info
        )
        db.add(nouvelle_analyse)
        db.commit()
        db.refresh(nouvelle_analyse)

        return {
            "id": nouvelle_analyse.id,
            "maladie": maladie_nom,
            "confiance": confidence,
            "traitement": traitement_info,
            "details": class_info if isinstance(class_info, dict) else {},
            "date": nouvelle_analyse.date_analyse
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse : {str(e)}")
