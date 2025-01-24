from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import databases
import sqlalchemy
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/autocrm")
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# Define tables
queues = sqlalchemy.Table(
    "queues",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String, unique=True),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
    sqlalchemy.Column("updated_at", sqlalchemy.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
)

queue_assignments = sqlalchemy.Table(
    "queue_assignments",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("queue_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("queues.id")),
    sqlalchemy.Column("ticket_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("tickets.id")),
    sqlalchemy.Column("assigned_at", sqlalchemy.DateTime, default=datetime.utcnow),
    sqlalchemy.Column("assigned_by", sqlalchemy.String),
)

# Pydantic models
class QueueBase(BaseModel):
    name: str
    description: Optional[str] = None

class QueueCreate(QueueBase):
    pass

class Queue(QueueBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class QueueAssignmentCreate(BaseModel):
    queue_id: int
    ticket_id: int
    assigned_by: str

class QueueAssignment(QueueAssignmentCreate):
    id: int
    assigned_at: datetime

    class Config:
        orm_mode = True

# Create FastAPI app
app = FastAPI(title="AutoCRM Queue Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Queue endpoints
@app.post("/queues/", response_model=Queue)
async def create_queue(queue: QueueCreate):
    query = queues.insert().values(**queue.dict())
    try:
        queue_id = await database.execute(query)
        return {**queue.dict(), "id": queue_id, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/queues/", response_model=List[Queue])
async def list_queues():
    query = queues.select()
    return await database.fetch_all(query)

@app.get("/queues/{queue_id}", response_model=Queue)
async def get_queue(queue_id: int):
    query = queues.select().where(queues.c.id == queue_id)
    queue = await database.fetch_one(query)
    if queue is None:
        raise HTTPException(status_code=404, detail="Queue not found")
    return queue

@app.post("/queue-assignments/", response_model=QueueAssignment)
async def assign_ticket_to_queue(assignment: QueueAssignmentCreate):
    query = queue_assignments.insert().values(**assignment.dict())
    try:
        assignment_id = await database.execute(query)
        return {**assignment.dict(), "id": assignment_id, "assigned_at": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/queues/{queue_id}/tickets")
async def get_queue_tickets(queue_id: int):
    query = sqlalchemy.select([queue_assignments.c.ticket_id]).where(queue_assignments.c.queue_id == queue_id)
    return await database.fetch_all(query)
