from sqlalchemy import create_engine 
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///app.db", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

