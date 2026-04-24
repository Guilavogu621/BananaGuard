from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app import schemas
from app.models.user import User
from app.database import get_db
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.mot_de_passe)
    new_user = User(
        nom_complet=user.nom_complet,
        email=user.email,
        mot_de_passe_hash=hashed_password,
        role=user.role,
        region=user.region
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.mot_de_passe_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profil", response_model=schemas.UserResponse)
def update_profil(user_update: schemas.UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.nom_complet is not None:
        current_user.nom_complet = user_update.nom_complet
    if user_update.role is not None:
        current_user.role = user_update.role
    if user_update.region is not None:
        current_user.region = user_update.region
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/mot-de-passe-oublie")
def forgot_password(email: str):
    # La logique réelle d'envoi d'e-mail serait ici
    return {"message": "Si cet email est enregistré, un lien de réinitialisation vous a été envoyé."}
