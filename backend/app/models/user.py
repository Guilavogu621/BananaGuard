from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom_complet = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)
    role = Column(String, default="agriculteur") # agriculteur, technicien, etudiant etc.
    region = Column(String, nullable=True) # Kindia, Forécariah, etc.
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
