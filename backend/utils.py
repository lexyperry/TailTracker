from datetime import datetime, timezone
from dateutil import parser as dtparser

def iso_to_dt(v):
    if isinstance(v, datetime):
        return v
    dt = dtparser.isoparse(v)
    if dt.tzinfo is None:
        return dt
    return dt

def task_to_dict(t):
    return {
        "id": t.id, "pet_id": t.pet_id, "title": t.title, "category": t.category,
        "due_at": t.due_at.astimezone(timezone.utc).isoformat(),
        "status": t.status, "notes": t.notes
    }

def pet_to_dict(p):
    return {"id":p.id, "name": p.name, "species": p.species, "notes": p.notes}
