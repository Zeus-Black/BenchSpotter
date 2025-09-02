from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Bench(Base):
    __tablename__ = "benches"
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    note = Column(Float, default=0, nullable=True)
    image = Column(String, nullable=True)
    comments = relationship("Comment", back_populates="bench", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    bench_id = Column(Integer, ForeignKey("benches.id"))
    author = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    bench = relationship("Bench", back_populates="comments")
