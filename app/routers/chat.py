from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..models import ChatSession, Message, User, Attachment
from ..database_session import get_db
from datetime import datetime, timedelta
from ..schemas import (
    ChatSessionCreate,
    MessageCreate
)
from src.api import routes as rag_routes

router = APIRouter()


@router.post("/chat-session")
def create_chat_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db)
):
    new_session = ChatSession(
        user_id=session_data.user_id,
        title=session_data.title
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "message": "Chat session created",
        "session_id": new_session.id
    }

@router.get("/chat-sessions/{user_id}")
def get_chat_sessions(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {"message": "User does not exist"}

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(
        ChatSession.updated_at.desc()
    ).all()

    return sessions

@router.post("/message")
def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    new_message = Message(
        session_id=message_data.session_id,
        sender=message_data.sender,
        message=message_data.message
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    session = db.query(ChatSession).filter(
        ChatSession.id == message_data.session_id
    ).first()

    # Update with IST timezone
    session.updated_at = datetime.utcnow() + timedelta(hours=5, minutes=30)

    db.commit()

    if message_data.sender != "user":
        return {
            "message": "Message added",
            "id": new_message.id,
            "bot_reply": None
        }

    user = db.query(User).filter(
        User.id == session.user_id
    ).first()

    mapped_role = user.role if user.role in ("patient", "clinician") else "patient"

    if rag_routes.pipeline is None:
        return {
            "message": "Message added",
            "id": new_message.id,
            "bot_reply": None,
            "error": "RAG pipeline not initialized"
        }

    result = rag_routes.pipeline.query(
        query=message_data.message,
        role=mapped_role,
        user_id=str(session.user_id),
        top_k=5
    )

    bot_message = Message(
        session_id=message_data.session_id,
        sender="bot",
        message=result.response
    )

    db.add(bot_message)
    db.commit()
    db.refresh(bot_message)

    session.updated_at = datetime.utcnow() + timedelta(hours=5, minutes=30)
    db.commit()

    return {
        "message": "Message added",
        "id": new_message.id,
        "bot_reply": result.response,
        "bot_message_id": bot_message.id
    }

@router.get("/messages/{session_id}")
def get_messages(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).first()

    if not session:
        return {"message": "Chat session does not exist"}

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    result = []

    for message in messages:

        attachments = db.query(Attachment).filter(
            Attachment.message_id == message.id
        ).all()

        result.append({
            "sender": message.sender,
            "message": message.message,
            "attachments": [
                {
                    "id": attachment.id,
                    "filename": attachment.filename,
                    "file_path": attachment.file_path,
                    "file_type": attachment.file_type
                }
                for attachment in attachments
            ]
        })

    return result

@router.delete("/chat-session/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db)
):

    session = db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).first()

    if not session:
        return {
            "message": "Session not found"
        }

    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).all()

    for message in messages:

        attachments = db.query(Attachment).filter(
            Attachment.message_id == message.id
        ).all()

        for attachment in attachments:
            db.delete(attachment)

        db.delete(message)

    # IMPORTANT
    db.flush()

    db.delete(session)

    db.commit()

    return {
        "message": "Chat deleted successfully"
    }