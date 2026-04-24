from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    nom_complet: str
    email: EmailStr
    mot_de_passe: str
    role: Optional[str] = "agriculteur"
    region: Optional[str] = None

class UserUpdate(BaseModel):
    nom_complet: Optional[str] = None
    role: Optional[str] = None
    region: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    nom_complet: str
    email: EmailStr
    role: str
    region: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
