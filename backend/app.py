from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from dateutil import parser as dtparser
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

app = Flask(__name__)
CORS(app)
engine = create_engine("sqlite:///app.db", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

#models
class Pet(Base):
    __tablename__ = "pets"
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
    status = Column(String(16), default="pending") #pending/done
    notes = Column(Text, default="")
    pet = relationship("Pet", back_populates="tasks")

#creating the table models
Base.metadata.create_all(engine)

#helpers
def iso_to_dt(v):
    # accepts '2025-08-18T14:30:00Z' or '2025-08-18T14:30:00-04:00'
    if isinstance(v, datetime):
        return v.astimezone(timezone.utc)
    return dtparser.isoparse(v).astimezone(timezone.utc)

def task_to_dict(t: Task):
    return {
        "id": t.id,
        "pet_id": t.pet_id,
        "title": t.title,
        "category": t.category,
        "due_at": t.due_at.astimezone(timezone.utc).isoformat(),
        "status": t.status,
        "notes": t.notes,
    }

def pet_to_dict(p: Pet):
    return {
        "id": p.id,
        "name": p.name,
        "species": p.species,
        "notes": p.notes,
    }

#home route
@app.route("/")
def home():
    return {"message": "Hello from Flask!"}

#pets routes
@app.route("/api/pets", methods=["GET", "POST"])
def pets_collection():
    db = SessionLocal()
    try:
        if request.method == "POST":
            data = request.get_json()
            pet = Pet(
                name=data["name"],
                species=data.get("species", "dog"),
                notes=data.get("notes", ""),
            )
            db.add(pet)
            db.commit()
            db.refresh(pet)
            return jsonify(pet_to_dict(pet)), 201

        pets = db.query(Pet).all()
        return jsonify([pet_to_dict(p) for p in pets])
    finally:
        db.close()

@app.route("/api/pets/<int:pet_id>", methods=["GET", "PUT", "DELETE"])
def pet_item(pet_id):
    db = SessionLocal()
    try:
        pet = db.query(Pet).get(pet_id)
        if not pet:
            return jsonify({"error": "not found"}), 404

        if request.method == "GET":
            return jsonify(pet_to_dict(pet))

        if request.method == "PUT":
            data = request.get_json()
            pet.name = data.get("name", pet.name)
            pet.species = data.get("species", pet.species)
            pet.notes = data.get("notes", pet.notes)
            db.commit()
            return jsonify(pet_to_dict(pet))

        db.delete(pet)
        db.commit()
        return "", 204
    finally:
        db.close()

#tasks routes
@app.route("/api/tasks", methods=["GET", "POST"])
def tasks_collection():
    db = SessionLocal()
    try:
        if request.method == "POST":
            data = request.get_json()
            task = Task(
                pet_id=data["pet_id"],
                title=data["title"],
                category=data.get("category", "other"),
                due_at=iso_to_dt(data["due_at"]),
                notes=data.get("notes", ""),
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            return jsonify(task_to_dict(task)), 201

        # GET with optional date range filter for calendar
        q = db.query(Task)
        start_iso = request.get_json().get("from") if request.is_json and request.method == "GET" else request.args.get("from")
        end_iso = request.get_json().get("to") if request.is_json and request.method == "GET" else request.args.get("to")
        if start_iso and end_iso:
            start_dt = iso_to_dt(start_iso)
            end_dt = iso_to_dt(end_iso)
            q = q.filter(Task.due_at >= start_dt, Task.due_at <= end_dt)
        tasks = q.order_by(Task.due_at.asc()).all()
        return jsonify([task_to_dict(t) for t in tasks])
    finally:
        db.close()

@app.route("/api/tasks/<int:task_id>", methods=["GET", "PUT", "DELETE"])
def task_item(task_id):
    db = SessionLocal()
    try:
        task = db.query(Task).get(task_id)
        if not task:
            return jsonify({"error": "not found"}), 404

        if request.method == "GET":
            return jsonify(task_to_dict(task))

        if request.method == "PUT":
            data = request.get_json()
            task.title = data.get("title", task.title)
            task.category = data.get("category", task.category)
            if "due_at" in data:
                task.due_at = iso_to_dt(data["due_at"])
            task.notes = data.get("notes", task.notes)
            db.commit()
            return jsonify(task_to_dict(task))

        db.delete(task)
        db.commit()
        return "", 204
    finally:
        db.close()

@app.route("/api/tasks/<int:task_id>/status", methods=["PATCH"])
def task_status(task_id):
    db = SessionLocal()
    try:
        task = db.query(Task).get(task_id)
        if not task:
            return jsonify({"error": "not found"}), 404

        data = request.get_json()
        new_status = data.get("status")
        if new_status not in ("pending", "done", "skipped"):
            return jsonify({"error": "invalid status"}), 400

        task.status = new_status
        db.commit()
        return jsonify(task_to_dict(task))
    finally:
        db.close()

#seed data
@app.route("/api/seed", methods=["POST"])
def seed():
    db = SessionLocal()
    try:
        db.query(Task).delete()
        db.query(Pet).delete()
        db.commit()

        divo = Pet(name="Divo", species="dog")
        dixie = Pet(name="Dixie", species="dog")
        squish = Pet(name="Squish", species="cat")
        db.add_all([divo, dixie, squish])
        db.commit()
        db.refresh(divo)
        db.refresh(dixie)
        db.refresh(squish)

        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        demo = [
            Task(pet_id=divo.id, title="Morning walk", category="walk", due_at=now + timedelta(hours=1)),
            Task(pet_id=dixie.id, title="Flea pill", category="med", due_at=now + timedelta(days=2, hours=9)),
            Task(pet_id=squish.id,  title="Vet visit", category="vet", due_at=now + timedelta(days=3, hours=14)),
        ]
        db.add_all(demo)
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()

if __name__ == "__main__":
    app.run(debug=True)
