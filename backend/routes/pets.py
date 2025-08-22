from flask import Blueprint, jsonify, request
from ..db import SessionLocal
from ..models import Pet
from ..utils import pet_to_dict

bp = Blueprint("pets", __name__, url_prefix="/api/pets")

@bp.route("", methods=["GET", "POST"])
def pets_collection():
    db = SessionLocal()
    try:
        if request.method == "POST":
            data = request.get_json()
            pet = Pet(name=data["name"], species=data.get("species","dog"), notes=data.get("notes",""))
            db.add(pet); db.commit(); db.refresh(pet)
            return jsonify(pet_to_dict(pet)), 201
        pets = db.query(Pet).all()
        return jsonify([pet_to_dict(p) for p in pets])
    finally:
        db.close()

@bp.route("/<int:pet_id>", methods=["GET", "PUT", "DELETE"])
def pet_item(pet_id):
    db = SessionLocal()
    try:
        pet = db.query(Pet).get(pet_id)
        if not pet: return jsonify({"error":"not found"}), 404
        if request.method == "GET": return jsonify(pet_to_dict(pet))
        if request.method == "PUT":
            data = request.get_json()
            pet.name = data.get("name", pet.name)
            pet.species = data.get("species", pet.species)
            pet.notes = data.get("notes", pet.notes)
            db.commit()
            return jsonify(pet_to_dict(pet))
        db.delete(pet); db.commit()
        return "", 204
    finally:
        db.close()
