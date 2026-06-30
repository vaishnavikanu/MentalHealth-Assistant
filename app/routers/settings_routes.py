from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import (
    Mood,
    Journal,
    ChatSession,
    Message,
    Attachment
)
from ..database_session import get_db
import os
router = APIRouter()


@router.delete("/clear-data/{user_id}")
def clear_all_data(
    user_id: int,
    db: Session = Depends(get_db)
):

    # DELETE MOODS
    db.query(Mood).filter(
        Mood.user_id == user_id
    ).delete()

    # DELETE JOURNALS
    db.query(Journal).filter(
        Journal.user_id == user_id
    ).delete()

    # GET USER CHAT SESSIONS
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).all()

    # DELETE MESSAGES OF EACH SESSION
    for session in sessions:

        messages = db.query(Message).filter(
            Message.session_id == session.id
        ).all()

        for message in messages:

            attachments = db.query(Attachment).filter(
                Attachment.message_id == message.id
            ).all()

            for attachment in attachments:

                if os.path.exists(attachment.file_path):
                    os.remove(attachment.file_path)

                db.delete(attachment)

        db.query(Message).filter(
            Message.session_id == session.id
        ).delete()

    # DELETE CHAT SESSIONS
    db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).delete()

    db.commit()

    return {
        "message":
        "All user data deleted successfully"
    }
    
@router.delete("/clear-chat-history/{user_id}")
def clear_chat_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).all()

    for session in sessions:

        messages = db.query(Message).filter(
            Message.session_id == session.id
        ).all()

        for message in messages:

            attachments = db.query(Attachment).filter(
                Attachment.message_id == message.id
            ).all()

            for attachment in attachments:

                if os.path.exists(attachment.file_path):
                    os.remove(attachment.file_path)

                db.delete(attachment)

        db.query(Message).filter(
            Message.session_id == session.id
        ).delete()

    db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).delete()

    db.commit()

    return {
        "message": "Chat history deleted"
    }