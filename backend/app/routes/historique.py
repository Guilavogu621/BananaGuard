import io
import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.analyse import Analyse
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/historique", tags=["historique"])

@router.get("/")
def get_historique(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "technicien":
        analyses = db.query(Analyse, User.nom_complet).join(User, Analyse.user_id == User.id).order_by(Analyse.date_analyse.desc()).offset(skip).limit(limit).all()
        result = []
        for analyse, nom_agriculteur in analyses:
            analyse_dict = {c.name: getattr(analyse, c.name) for c in analyse.__table__.columns}
            analyse_dict["nom_agriculteur"] = nom_agriculteur
            result.append(analyse_dict)
        return result
    else:
        analyses = db.query(Analyse).filter(Analyse.user_id == current_user.id).order_by(Analyse.date_analyse.desc()).offset(skip).limit(limit).all()
        return analyses

@router.get("/export")
def export_historique_csv(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analyses = db.query(Analyse).filter(Analyse.user_id == current_user.id).all()
    
    # Préparation des données pour Pandas
    data = []
    for a in analyses:
        data.append({
            "ID Analyse": a.id,
            "Date d'Analyse": a.date_analyse.strftime("%Y-%m-%d %H:%M:%S") if a.date_analyse else "N/A",
            "Maladie Détectée": a.maladie,
            "Confiance (%)": round(a.confiance * 100, 2),
            "Traitement Recommandé": a.traitement if a.traitement else "Aucun",
            "Lien Image": a.image_url if a.image_url else "N/A"
        })
        
    df = pd.DataFrame(data)
    
    stream = io.StringIO()
    df.to_csv(stream, index=False, sep=";") # sep=";" idéal pour Excel en français
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=historique_bananaguard_{current_user.id}.csv"
    return response

@router.get("/{analyse_id}")
def get_analyse(analyse_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analyse = db.query(Analyse).filter(Analyse.id == analyse_id, Analyse.user_id == current_user.id).first()
    if not analyse:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    return analyse

@router.delete("/{analyse_id}")
def delete_analyse(analyse_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analyse = db.query(Analyse).filter(Analyse.id == analyse_id, Analyse.user_id == current_user.id).first()
    if not analyse:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    db.delete(analyse)
    db.commit()
    return {"message": "Analyse supprimée avec succès"}
