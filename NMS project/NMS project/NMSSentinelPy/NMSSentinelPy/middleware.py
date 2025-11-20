from fastapi import Request, HTTPException, status
from jose import JWTError, jwt
from config import settings
import time

# Simple rate limiting middleware
class RateLimitMiddleware:
    def __init__(self, app):
        self.app = app
        self.requests = {}
        self.limit = 100  # Max requests per minute
        self.window = 60  # Time window in seconds

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        client_ip = scope.get("client", ["unknown"])[0]
        current_time = time.time()
        
        # Clean old requests
        self.requests = {ip: times for ip, times in self.requests.items() 
                         if current_time - times[0] < self.window}
        
        # Check if IP exists in requests
        if client_ip in self.requests:
            # Remove old requests outside the window
            self.requests[client_ip] = [t for t in self.requests[client_ip] 
                                        if current_time - t < self.window]
            
            # Check if limit exceeded
            if len(self.requests[client_ip]) >= self.limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded"
                )
            
            self.requests[client_ip].append(current_time)
        else:
            self.requests[client_ip] = [current_time]
        
        await self.app(scope, receive, send)

# JWT token verification middleware
async def verify_token(request: Request, call_next):
    # Skip verification for login and root endpoints
    if request.url.path in ["/", "/admin/token"]:
        return await call_next(request)
    
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split("Bearer ")[1]
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    response = await call_next(request)
    return response