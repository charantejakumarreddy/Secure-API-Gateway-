import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add the parent directory to the path so we can import the main module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from config import settings

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    
def test_token_endpoint():
    """Test the token endpoint with valid credentials"""
    response = client.post(
        "/admin/token",
        data={
            "username": settings.ADMIN_USERNAME,
            "password": settings.ADMIN_PASSWORD
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    
def test_token_endpoint_invalid_credentials():
    """Test the token endpoint with invalid credentials"""
    response = client.post(
        "/admin/token",
        data={
            "username": "invalid",
            "password": "invalid"
        }
    )
    assert response.status_code == 401