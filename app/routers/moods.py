from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import timedelta
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

@router.get("/streak/{user_id}")
def get_streak(
    user_id: int,
    db: Session = Depends(get_db)
):

    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user_id)
        .order_by(Mood.created_at.desc())
        .all()
    )

    if not moods:
        return {"streak": 0}

    unique_dates = []

    for mood in moods:

        mood_date = mood.created_at.date()

        if mood_date not in unique_dates:

            unique_dates.append(mood_date)

    streak = 1

    current_date = unique_dates[0]

    for next_date in unique_dates[1:]:

        if current_date - next_date == timedelta(days=1):

            streak += 1

            current_date = next_date

        else:

            break

    return {
        "streak": streak
    }