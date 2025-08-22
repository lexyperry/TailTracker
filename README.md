# TailTracker - Pet Scheduler
TailTracker helps pet owners manage daily tasks, appointments, and care routines for their pets.

# Features 
-Pet management (CRUD)
-Tasks scheduling and tracking
-Status updates(pending/done)
-Date/time filtering

# API Endpoints
- GET/POST/PUT/DELETE /api/pets
- GET/POST /api/tasks
- PATCH /api/tasks/:id/status

# Packages Installed Backend
pip install flask flask-cors sqlalchemy python-dateutil
python app.py

# To run backend locally:
>cd backend
>pipenv --python $(which python3)
>pipenv install && pipenv shell
>python app.py

# Packages Installed Frontend
vite@latest
npm 
tailwind
react-big-calendar date-fns
# To run frontend locally:
>cd frontend
>npm run dev