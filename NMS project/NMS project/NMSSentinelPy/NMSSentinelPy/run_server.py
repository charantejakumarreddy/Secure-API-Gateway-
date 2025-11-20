#!/usr/bin/env python3
"""
Script to initialize the database and run the NMSSentinelPy server
"""

import os
import sys

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from config import settings
import uvicorn

if __name__ == "__main__":
    print(f"Starting NMSSentinelPy server on {settings.HOST}:{settings.PORT}")
    print("Press CTRL+C to stop the server")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level="info"
    )