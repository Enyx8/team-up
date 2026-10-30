from datetime import datetime, UTC
import uuid
from typing import Literal, Text

from pydantic import BaseModel, ConfigDict, Field

#пока делаем так, и при создании и при ГЕТ возвращаем чисто всё что можно, это чисто
#чтобы проверить что всё соединяется всё работает, дальше будц репу чесать что да как что скрывать что не надо
class ListingBase(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    type: Literal["seeking_team", "seeking_members"]
    role_focus: Literal["backend", "frontend", "fullstack", "mobile", "ml", "data", "devops", "qa", "design", "pm"]
    bio: Text
    format: Literal["online", "offline"]
    status: Literal["active", "closed"]
    hackathons_count: int
    created_at: datetime


class ListingCreate(ListingBase):
    pass

class ListingResponse(ListingBase):
    model_config = ConfigDict(from_attributes=True)