import sys
import os
from sqlalchemy.orm import Session

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.utils.security import get_password_hash

def main():
    # Make sure all tables are created on the real DB
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        email = "test@bananaguard.com"
        nom_complet = "Testeur BananaGuard"
        password = "BananaGuard2025"
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"L'utilisateur de test '{email}' existe déjà.")
            # Let's update their password just in case it was changed
            existing_user.mot_de_passe_hash = get_password_hash(password)
            existing_user.nom_complet = nom_complet
            db.commit()
            print("Mot de passe mis à jour avec succès.")
        else:
            new_user = User(
                email=email,
                nom_complet=nom_complet,
                mot_de_passe_hash=get_password_hash(password),
                role="agriculteur",
                region="Kindia"
            )
            db.add(new_user)
            db.commit()
            print(f"Utilisateur de test créé avec succès !")
            print(f"Email : {email}")
            print(f"Mot de passe : {password}")
    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
