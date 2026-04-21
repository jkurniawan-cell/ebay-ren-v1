"""
Database models and connection setup for eBay REN dashboard.
"""
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class RoadmapSnapshot(Base):
    """Approved, frozen roadmap snapshots."""
    __tablename__ = 'roadmap_snapshots'

    id = Column(Integer, primary_key=True)
    planning_cycle = Column(String(50), nullable=False)  # "H2 2026", "Q3 2026"
    version = Column(Integer, nullable=False)  # 1, 2, 3 (for re-approvals)
    approved_by = Column(String(100), default="Jordan")
    approved_at = Column(DateTime, nullable=False)
    csv_data_json = Column(JSON, nullable=False)  # Full CSV data snapshot
    created_at = Column(DateTime, default=datetime.utcnow)

class RoadmapDraft(Base):
    """Current draft (upcoming) roadmap data."""
    __tablename__ = 'roadmap_draft'

    id = Column(Integer, primary_key=True)
    planning_cycle = Column(String(50), nullable=False)
    csv_data_json = Column(JSON, nullable=False)
    last_uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String(100), default="Team")

def get_database_url():
    """Get database URL from environment or use default."""
    # Use SQLite for development, PostgreSQL for production
    return os.getenv('DATABASE_URL', 'sqlite:///ebay_ren.db')

def init_db():
    """Initialize database connection and create tables."""
    engine = create_engine(get_database_url())
    Base.metadata.create_all(engine)
    return engine

def get_session():
    """Get a database session."""
    engine = init_db()
    Session = sessionmaker(bind=engine)
    return Session()
