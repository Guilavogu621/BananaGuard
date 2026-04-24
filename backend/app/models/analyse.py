from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Analyse(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=True)
    maladie = Column(String, nullable=False)
    confiance = Column(Float, nullable=False)
    traitement = Column(String, nullable=True)
    date_analyse = Column(DateTime(timezone=True), server_default=func.now())
