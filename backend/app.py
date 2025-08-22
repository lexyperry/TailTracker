from flask import Flask, request
from flask_cors import CORS
from .db import Base, engine
from .routes.pets import bp as pets_bp
from .routes.tasks import bp as tasks_bp
from .models import Pet, Task 

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173","http://127.0.0.1:5173"]}})
    Base.metadata.create_all(engine)

    @app.after_request
    def add_cors_headers(resp):
        origin = request.headers.get("Origin")
        if origin in ("http://localhost:5173","http://127.0.0.1:5173"):
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return resp

    app.register_blueprint(pets_bp)
    app.register_blueprint(tasks_bp)

    @app.route("/")
    def home():
        return {"message": "Hello from Flask!"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
