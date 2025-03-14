from fastapi import APIRouter, Depends, status, Header, Request
from sqlalchemy.orm import Session
from app.services.auth import AuthService
from app.db.database import get_db
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app.schemas.auth import UserResponse, Signup,InfoToken, LoginForm,SignupAdmin,AdminResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(tags=["Auth"], prefix="/auth")
auth_scheme = HTTPBearer()

@router.post("/signup", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def user_sinnup(
        user: Signup,
        db: Session = Depends(get_db)):
    return await AuthService.signup(db, user)


@router.post("/login", status_code=status.HTTP_200_OK, response_model=InfoToken)
async def user_login(
        user_credentials: LoginForm,
        db: Session = Depends(get_db)):
    return await AuthService.login(user_credentials, db)


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_access_token(
        refresh_token: str = Header(),
        db: Session = Depends(get_db)):
    return await AuthService.get_refresh_token(token=refresh_token, db=db)


@router.post("/admin/signup/", status_code=status.HTTP_200_OK, response_model=AdminResponse)
async def admin_sinnup(
        user: SignupAdmin,
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    return await AuthService.signup_admin(db, user, token)