from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import shutil

from ..database_session import get_db
from ..models import Attachment
from ..schemas import AttachmentResponse
from fastapi import HTTPException
router = APIRouter()
class AttachmentUpdate(BaseModel):
    message_id: int
UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    new_attachment = Attachment(

        message_id=None,

        filename=file.filename,

        file_path=file_path,

        file_type=file.content_type

    )

    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)

    return {

        "id": new_attachment.id,

        "message_id": new_attachment.message_id,

        "filename": new_attachment.filename,

        "file_path": new_attachment.file_path,

        "file_type": new_attachment.file_type

    }
    
@router.put("/attachment/{attachment_id}")
def update_attachment(
    attachment_id: int,
    data: AttachmentUpdate,
    db: Session = Depends(get_db)
):
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id
    ).first()

    if attachment:
        attachment.message_id = data.message_id
        db.commit()

    return {"message": "Attachment updated"}    


@router.delete("/attachment/{attachment_id}")
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db)
):

    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id
    ).first()

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )

    # Delete file from uploads folder
    if os.path.exists(attachment.file_path):

        os.remove(
            attachment.file_path
        )

    # Delete from database
    db.delete(attachment)

    db.commit()

    return {
        "message": "Attachment deleted"
    }