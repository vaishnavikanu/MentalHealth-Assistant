from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import Mood, User
from ..database_session import get_db
from ..schemas import MoodCreate

router = APIRouter()


@router.post("/mood")
def create_mood(
    mood_data: MoodCreate,
    db: Session = Depends(get_db)
):
    new_mood = Mood(
        user_id=mood_data.user_id,
        mood=mood_data.mood,
        note=mood_data.note
    )

    db.add(new_mood)
    db.commit()

    return {"message": "Mood added successfully"}

@router.get("/moods/{user_id}")
def get_moods(
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

    return moods

@router.put("/mood/{mood_id}")
def update_mood(
    mood_id: int,
    mood_data: MoodCreate,
    db: Session = Depends(get_db)
):
    mood = db.query(Mood).filter(
        Mood.id == mood_id
    ).first()

    if not mood:
        return {"message": "Mood not found"}

    mood.mood = mood_data.mood
    mood.note = mood_data.note

    db.commit()

    return {"message": "Mood updated successfully"}

@router.delete("/mood/{mood_id}")
def delete_mood(
    mood_id: int,
    db: Session = Depends(get_db)
):
    mood = db.query(Mood).filter(
        Mood.id == mood_id
    ).first()

    if not mood:
        return {"message": "Mood not found"}

    db.delete(mood)
    db.commit()

    return {"message": "Mood deleted successfully"}