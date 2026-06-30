from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models import User
from ..database_session import get_db

from ..schemas import (
    UserSignup,
    UserLogin
)

router = APIRouter()

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

# SIGNUP
@router.post("/signup")
def signup(
    user_data: UserSignup,
    db: Session = Depends(get_db)
):

    # Convert email to lowercase
    email_lower = user_data.email.lower()

    # CHECK EMAIL
    existing_email = db.query(User).filter(
        User.email == email_lower
    ).first()

    if existing_email:
        return {
            "message": "Email already exists"
        }

    # CHECK USERNAME
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        return {
            "message": "Username already exists"
        }

    # HASH PASSWORD
    hashed_password = pwd_context.hash(
        user_data.password
    )

    # CREATE USER
    new_user = User(
        username=user_data.username,
        email=email_lower,
        password=hashed_password,
        role=user_data.role,
        language=user_data.language  # ← ADD THIS
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role,
            "language": new_user.language  # ← ADD THIS
        }
    }

# LOGIN
@router.post("/login")
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):

    # Convert email to lowercase
    email_lower = login_data.email.lower()

    # FIND USER
    user = db.query(User).filter(
        User.email == email_lower,
        User.role == login_data.role
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    # VERIFY PASSWORD
    if not pwd_context.verify(
        login_data.password,
        user.password
    ):
        return {
            "message": "Incorrect password"
        }

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "language": user.language  # ← ADD THIS
        }
    }
    
@router.get("/patients")
def get_patients(
    db: Session = Depends(get_db)
):

    patients = db.query(User).filter(
        User.role == "patient"
    ).all()

    return patients

@router.post("/update-language/{user_id}")
def update_language(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    user.language = data.get(
        "language",
        "en"
    )

    db.commit()

    return {
        "message": "Language updated successfully",
        "language": user.language
    }