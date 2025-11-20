from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base
from passlib.context import CryptContext
import secrets
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class APIKeyModel(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    key = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __init__(self, name: str):
        self.name = name
        # Generate a secure API key
        self.key = hashlib.sha256(secrets.token_bytes(32)).hexdigest()

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def set_password(self, password: str):
        self.hashed_password = pwd_context.hash(password)
        
    def check_password(self, password: str):
        return pwd_context.verify(password, self.hashed_password)