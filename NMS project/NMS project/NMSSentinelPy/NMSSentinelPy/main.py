from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn
import hashlib
import os

from models import APIKeyModel, UserModel
from schemas import APIKeyCreate, APIKey, Token, User
from database import engine, get_db
from auth import authenticate_user, create_access_token
from crud import create_api_key, get_api_keys, init_admin_user
from config import Settings
from middleware import RateLimitMiddleware

# Create tables
from models import Base
Base.metadata.create_all(bind=engine)

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    from database import SessionLocal
    db = SessionLocal()
    try:
        init_admin_user(db)
    finally:
        db.close()
    
    yield
    
    # Shutdown event (if needed)
    pass

# Initialize app with lifespan
app = FastAPI(title="NMSSentinelPy API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/token")

settings = Settings()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "NMSSentinelPy API is running"}

# Token endpoint for admin authentication
@app.post("/admin/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Get all API keys (admin only)
@app.get("/admin/apikeys", response_model=List[APIKey])
async def read_api_keys(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # In a real implementation, you would verify the token here
    # For demo purposes, we'll just return all keys
    return get_api_keys(db)

# Create a new API key (admin only)
@app.post("/admin/apikeys", response_model=APIKey)
async def create_new_api_key(api_key: APIKeyCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # In a real implementation, you would verify the token here
    # For demo purposes, we'll just create the key
    return create_api_key(db, api_key)

# Proxy endpoint for NMS operations
@app.get("/nms/proxy")
async def nms_proxy(token: str = Depends(oauth2_scheme)):
    # In a real implementation, this would proxy requests to NMS systems
    # For demo purposes, we'll return sample data
    return {
        "status": "success",
        "data": {
            "message": "NMS proxy is working",
            "timestamp": "2023-01-01T00:00:00Z",
            "systems_monitored": 5,
            "alerts_active": 2
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, log_level="info")