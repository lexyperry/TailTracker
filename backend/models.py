from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .db import Base

class Pet(Base):
    __tablename__ = 'pets'
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    species = Column(String(40), default="")
    notes = Column(Text, default="")
    tasks = relationship("Task", back_populates="pet", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    title = Column(String(160), nullable=False)
    category = Column(String(32), default="other")
    due_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(16), default="pending")
    notes = Column(Text, default="")
    pet = relationship("Pet", back_populates="tasks")