from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    status = Column(String, nullable=False)

    logs = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )