from fastapi import FastAPI

from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.ranking import rank_topics

app = FastAPI(title="Studiq ML Service", version="1.0.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "studiq-ml-service"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    result = rank_topics(payload.text, payload.topK)
    return AnalyzeResponse(**result)
