import io
import json
import os
import numpy as np
import tensorflow as tf
from PIL import Image
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
        # Si le JSON est une liste ou un dict
        if isinstance(ia_classes, list):
            maladie = ia_classes[class_idx]
        else:
            maladie = ia_classes.get(str(class_idx), f"Classe {class_idx}")

        # 5. Enregistrement dans l'historique
        nouvelle_analyse = Analyse(
            user_id=current_user.id,
            maladie=maladie,
            confiance=confidence,
            image_url=file.filename,
            traitement="Analyse effectuée avec succès. Consultez la base de connaissances pour le traitement."
        )
        db.add(nouvelle_analyse)
        db.commit()
        db.refresh(nouvelle_analyse)

        return {
            "id": nouvelle_analyse.id,
            "maladie": maladie,
            "confiance": confidence,
            "date": nouvelle_analyse.date_analyse
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse : {str(e)}")
