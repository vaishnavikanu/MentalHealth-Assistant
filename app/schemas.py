from pydantic import BaseModel


class MoodCreate(BaseModel):
    user_id: int
    mood: str
    note: str


class JournalCreate(BaseModel):
    user_id: int
    title: str
    content: str


class ChatSessionCreate(BaseModel):
    user_id: int
    title: str


class MessageCreate(BaseModel):
    session_id: int
    sender: str
    message: str


class UserSignup(BaseModel):
    username: str
    email: str
    password: str
    role: str
    language: str = "en"  # ← ADD THIS


class UserLogin(BaseModel):
    email: str
    password: str
    role: str
    
class AttachmentCreate(BaseModel):
    message_id: int
    filename: str
    file_path: str
    file_type: str

class AttachmentResponse(BaseModel):
    id: int
    message_id: int
    filename: str
    file_path: str
    file_type: str


