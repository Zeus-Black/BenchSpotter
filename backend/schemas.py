from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CommentOut(BaseModel):
    id: int
    author: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z"
        }

class BenchOut(BaseModel):
    id: int
    latitude: float
    longitude: float
    description: Optional[str]
    note: float
    image: Optional[str]
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True
