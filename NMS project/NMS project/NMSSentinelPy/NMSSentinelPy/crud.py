from sqlalchemy.orm import Session
from models import APIKeyModel, UserModel
from schemas import APIKeyCreate
from config import settings
import hashlib

def get_api_keys(db: Session):
    return db.query(APIKeyModel).all()

def create_api_key(db: Session, api_key: APIKeyCreate):
    db_api_key = APIKeyModel(name=api_key.name)
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key

def get_user_by_username(db: Session, username: str):
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, username: str, password: str):
    db_user = UserModel(username=username)
    db_user.set_password(password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def init_admin_user(db: Session):
    """Initialize the admin user if it doesn't exist"""
    user = get_user_by_username(db, settings.ADMIN_USERNAME)
    if not user:
        return create_user(db, settings.ADMIN_USERNAME, settings.ADMIN_PASSWORD)
    return user