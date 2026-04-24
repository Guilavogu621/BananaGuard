import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "change_me_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    database_url: str = "sqlite:///./bananaguard.db"
    model_path: str = "../ai_model/model/bananaguard_model.h5"
    classes_path: str = "../ai_model/model/bananaguard_classes_fr.json"

    class Config:
        env_file = ".env"

settings = Settings()
