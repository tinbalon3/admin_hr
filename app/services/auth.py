from fastapi import HTTPException, Depends, status
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.models import User
from app.db.database import get_db
from app.core.security import verify_password, get_user_token, get_token_payload
from app.core.security import get_password_hash
from app.utils.responses import ResponseHandler
from app.schemas.auth import Signup, LoginForm


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class AuthService:
    @staticmethod
    async def login(user_credentials: LoginForm = Depends(), db: Session = Depends(get_db)):
        user = db.query(User).filter(User.email == user_credentials.email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
        else:
            if not verify_password(user_credentials.password, user.password):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email or password incorrect")

        return await get_user_token(id=user.id)

    @staticmethod
    async def signup(db: Session, user: Signup):
        if db.query(User).filter(User.email == user.email).first():
            raise ResponseHandler.userExists()
        else:
            hashed_password = get_password_hash(user.password)
            user.password = hashed_password
            db_user = User(id=None, **user.model_dump())
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return ResponseHandler.create_success(db_user.full_name, db_user.id, db_user)

    @staticmethod
    async def get_refresh_token(token, db):
        payload = get_token_payload(token)
        user_id = payload.get('id', None)
        if not user_id:
            raise ResponseHandler.invalid_token('refresh')

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ResponseHandler.invalid_token('refresh')

        return await get_user_token(id=user.id, refresh_token=token)
    
 