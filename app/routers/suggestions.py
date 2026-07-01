from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database_session import get_db
from ..models import DoctorSuggestion
from ..schemas import SuggestionCreate
from ..models import User

router = APIRouter()

@router.post("/suggestion")
def add_suggestion(
    data: SuggestionCreate,
    db: Session = Depends(get_db)
):

    suggestion = DoctorSuggestion(
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        suggestion=data.suggestion
    )

    db.add(suggestion)

    db.commit()

    return {
        "message": "Suggestion added"
    }
    
@router.get("/suggestions/{patient_id}")
def get_suggestions(
    patient_id: int,
    db: Session = Depends(get_db)
):

    suggestions = db.query(
        DoctorSuggestion,
        User.username
    ).join(
        User,
        DoctorSuggestion.doctor_id == User.id
    ).filter(
        DoctorSuggestion.patient_id == patient_id
    ).all()

    return [

        {
            "id": suggestion.id,
            "suggestion": suggestion.suggestion,
            "doctor_name": doctor_name,
            "created_at": suggestion.created_at
        }

        for suggestion, doctor_name
        in suggestions
    ]