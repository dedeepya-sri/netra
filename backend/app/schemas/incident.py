from datetime import datetime

from pydantic import BaseModel


class IncidentCreate(BaseModel):
    title: str
    severity: str
    status: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True