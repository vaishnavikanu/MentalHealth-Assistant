from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database_session import get_db
from ..models import Mood, Journal, ChatSession, User

router = APIRouter()


@router.get("/history/{user_id}")
def get_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {"message": "User does not exist"}

    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user_id)
        .order_by(Mood.created_at.desc())
        .all()
    )

    journals = (
        db.query(Journal)
        .filter(Journal.user_id == user_id)
        .order_by(Journal.created_at.desc())
        .all()
    )

    chats = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(
        ChatSession.updated_at.desc()
    ).all()

    return {
    "patient": {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    },
    "moods": moods,
    "journals": journals,
    "chats": chats
    }