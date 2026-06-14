from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.analyse import Analyse
from app.routes.auth import get_current_user
from app.utils.security import get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])

def require_technicien(current_user: User = Depends(get_current_user)):
    if current_user.role != "technicien":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé. Rôle technicien requis.")
    return current_user

@router.get("/utilisateurs")
def get_utilisateurs(db: Session = Depends(get_db), current_user: User = Depends(require_technicien)):
    return db.query(User).all()

@router.get("/analyses")
def get_toutes_analyses(db: Session = Depends(get_db), current_user: User = Depends(require_technicien)):
    analyses = db.query(Analyse, User.nom_complet).join(User, Analyse.user_id == User.id).order_by(Analyse.date_analyse.desc()).all()
    result = []
    for analyse, nom_agriculteur in analyses:
        analyse_dict = {c.name: getattr(analyse, c.name) for c in analyse.__table__.columns}
        analyse_dict["nom_agriculteur"] = nom_agriculteur
        result.append(analyse_dict)
    return result

@router.get("/statistiques")
def get_statistiques(db: Session = Depends(get_db), current_user: User = Depends(require_technicien)):
    total_analyses = db.query(Analyse).count()
    total_agriculteurs = db.query(User).filter(User.role == "agriculteur").count()
    total_utilisateurs = db.query(User).count()
    
    stats = db.query(
        User.region,
        Analyse.maladie,
        func.count(Analyse.id).label('count')
    ).join(User, Analyse.user_id == User.id)\
     .group_by(User.region, Analyse.maladie)\
     .order_by(func.count(Analyse.id).desc()).all()
     
    maladies_par_region = {}
    for region, maladie, count in stats:
        if region not in maladies_par_region:
            maladies_par_region[region] = []
        maladies_par_region[region].append({"maladie": maladie, "count": count})

    return {
        "total_analyses": total_analyses,
        "total_agriculteurs": total_agriculteurs,
        "total_utilisateurs": total_utilisateurs,
        "maladies_par_region": maladies_par_region
    }

@router.post("/init-technicien")
def init_technicien(secret_key: str, db: Session = Depends(get_db)):
    if secret_key != "BananaGuard2024!":
        raise HTTPException(status_code=403, detail="Clé secrète invalide")
    
    existing_admin = db.query(User).filter(User.email == "admin@bananaguard.com").first()
    if existing_admin:
        return {"message": "Le compte technicien existe déjà"}
        
    hashed_password = get_password_hash("Admin1234!")
    new_admin = User(
        nom_complet="Technicien Admin",
        email="admin@bananaguard.com",
        mot_de_passe_hash=hashed_password,
        role="technicien",
        region="Toutes"
    )
    db.add(new_admin)
    db.commit()
from pydantic import BaseModel

class TechnicienCreate(BaseModel):
    nom_complet: str
    email: str
    mot_de_passe: str
    region: str

@router.post("/creer-technicien")
def creer_technicien(tech: TechnicienCreate, db: Session = Depends(get_db), current_user: User = Depends(require_technicien)):
    existing_user = db.query(User).filter(User.email == tech.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
        
    hashed_password = get_password_hash(tech.mot_de_passe)
    new_tech = User(
        nom_complet=tech.nom_complet,
        email=tech.email,
        mot_de_passe_hash=hashed_password,
        role="technicien",
        region=tech.region
    )
    db.add(new_tech)
    db.commit()
    db.refresh(new_tech)
    return new_tech
