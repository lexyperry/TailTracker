from flask import Blueprint, jsonify, request
from ..db import SessionLocal
from ..models import Task
from ..utils import iso_to_dt, task_to_dict

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

@bp.route("", methods=["GET", "POST"])
def tasks_collection():
    db = SessionLocal()
    try:
        if request.method == "POST":
            
            data = request.get_json()
            print("Parsed JSON data:", data)
            print("Data keys:", list(data.keys()) if data else "No data")
            
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400
            
            if 'pet_id' not in data:
                return jsonify({"error": "pet_id is required"}), 400
            
            task = Task(
                pet_id=data['pet_id'], 
                title=data["title"],
                category=data.get("category","other"),
                due_at=iso_to_dt(data["due_at"]),
                notes=data.get("notes",""),
            )
            db.add(task); db.commit(); db.refresh(task)
            return jsonify(task_to_dict(task)), 201

        q = db.query(Task)
        start_iso = request.args.get("from")
        end_iso = request.args.get("to")
        if start_iso and end_iso:
            q = q.filter(
                Task.due_at >= iso_to_dt(start_iso),
                Task.due_at <= iso_to_dt(end_iso)
            )
        tasks = q.order_by(Task.due_at.asc()).all()
        return jsonify([task_to_dict(t) for t in tasks])
    finally:
        db.close()

@bp.route("/<int:task_id>", methods=["GET", "PUT", "DELETE"])
def task_item(task_id):
    db = SessionLocal()
    try:
        task = db.query(Task).get(task_id)
        if not task: return jsonify({"error":"not found"}), 404
        if request.method == "GET": return jsonify(task_to_dict(task))
        if request.method == "PUT":
            data = request.get_json()
            task.title = data.get("title", task.title)
            task.category = data.get("category", task.category)
            if "due_at" in data: task.due_at = iso_to_dt(data["due_at"])
            task.notes = data.get("notes", task.notes)
            db.commit()
            return jsonify(task_to_dict(task))
        db.delete(task); db.commit()
        return "", 204
    finally:
        db.close()

@bp.route("/<int:task_id>/status", methods=["PATCH"])
def task_status(task_id):
    db = SessionLocal()
    try:
        task = db.query(Task).get(task_id)
        if not task: return jsonify({"error":"not found"}), 404
        data = request.get_json()
        new_status = data.get("status")
        if new_status not in ("pending","done","skipped"):
            return jsonify({"error":"invalid status"}), 400
        task.status = new_status
        db.commit()
        return jsonify(task_to_dict(task))
    finally:
        db.close()
