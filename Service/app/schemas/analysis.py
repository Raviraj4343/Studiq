from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=10, max_length=100000)
    topK: int = Field(default=10, ge=3, le=50)


class TopicItem(BaseModel):
    name: str
    frequency: int
    score: float
    priority: str


class AnalyzeResponse(BaseModel):
    topics: list[TopicItem]
    total_candidates: int
