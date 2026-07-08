from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..models import Journal, User
from ..database_session import get_db
from ..schemas import JournalCreate

router = APIRouter()


@router.post("/journal")
def create_journal(
    journal_data: JournalCreate,
    db: Session = Depends(get_db)
):
    new_journal = Journal(
        user_id=journal_data.user_id,
        title=journal_data.title,
        content=journal_data.content
    )

    db.add(new_journal)
    db.commit()

    return {"message": "Journal added successfully"}

@router.get("/journals/{user_id}")
def get_journals(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {"message": "User does not exist"}

    journals = (
    db.query(Journal)
    .filter(Journal.user_id == user_id)
    .order_by(Journal.created_at.desc())
    .all()
)

    return journals

@router.delete("/journal/{journal_id}")
def delete_journal(
    journal_id: int,
    db: Session = Depends(get_db)
):
    journal = db.query(Journal).filter(
        Journal.id == journal_id
    ).first()

    if not journal:
        return {"message": "Journal not found"}

    db.delete(journal)
    db.commit()

    return {"message": "Journal deleted successfully"}