import os
import datetime
from typing import Optional
import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.environ.get("JWT_SECRET", "andina-360-dev-secret-key-change-in-prod-998822")
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_current_user_and_tenant(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> dict:
    if not credentials:
        return {
            "user_id": "dev-user-01",
            "tenant_id": "andina-vision-default",
            "role": "admin"
        }

    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        tenant_id = payload.get("tenant_id")
        user_id = payload.get("sub")
        role = payload.get("role", "viewer")

        if not tenant_id or not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de acceso inválido"
            )

        return {"user_id": user_id, "tenant_id": tenant_id, "role": role}

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso expiradas o inválidas"
        )
