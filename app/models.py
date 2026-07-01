from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import DateTime
from datetime import datetime
from datetime import timedelta
from sqlalchemy import Text
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    language = Column(String, default="en")  # ← Add this

class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id")
    )
    mood = Column(String)
    note = Column(String)
    created_at = Column(
    DateTime,
    default=lambda: datetime.utcnow() + timedelta(hours=5, minutes=30)
    )
    
class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id")
    )
    title = Column(String)
    content = Column(Text)
    created_at = Column(
    DateTime,
    default=lambda: datetime.utcnow() + timedelta(hours=5, minutes=30)
    )
    
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id")
    )
    title = Column(String)
    created_at = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=5, minutes=30)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=5, minutes=30)
    )
 
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
    Integer,
    ForeignKey("chat_sessions.id")
    )
    sender = Column(String)
    message = Column(Text)
    created_at = Column(
    DateTime,
    default=lambda: datetime.utcnow() + timedelta(hours=5, minutes=30)
    )

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    message_id = Column(
        Integer,
        ForeignKey("messages.id"),
        nullable=True
    )

    filename = Column(String)

    file_path = Column(String)

    file_type = Column(String)
    
    
class DoctorSuggestion(Base):

    __tablename__ = "doctor_suggestions"
    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    doctor_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    suggestion = Column(Text)

    created_at = Column(
        DateTime,
        default=lambda:
            datetime.utcnow() +
            timedelta(hours=5, minutes=30)
    )    
