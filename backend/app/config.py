import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    secret_key: str = "change_me_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    database_url: str = "sqlite:///./bananaguard.db"
    model_path: str = os.path.join(BASE_DIR, "ai_model", "model", "bananaguard_best.h5")
    classes_path: str = os.path.join(BASE_DIR, "ai_model", "model", "resultats_complets_modifie.json")

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
