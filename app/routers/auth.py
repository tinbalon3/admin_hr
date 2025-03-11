from fastapi import APIRouter, Depends, status, Header, Request
from sqlalchemy.orm import Session
from app.services.auth import AuthService
from app.db.database import get_db
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app.schemas.auth import UserResponse, Signup,TokenResponse, LoginForm


router = APIRouter(tags=["Auth"], prefix="/auth")


@router.post("/signup", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def user_sinnup(
        user: Signup,
        db: Session = Depends(get_db)):
    return await AuthService.signup(db, user)


@router.post("/login", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def user_login(
        user_credentials: LoginForm,
        db: Session = Depends(get_db)):
    return await AuthService.login(user_credentials, db)


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_access_token(
        refresh_token: str = Header(),
        db: Session = Depends(get_db)):
    return await AuthService.get_refresh_token(token=refresh_token, db=db)
