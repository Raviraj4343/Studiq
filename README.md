# Studiq - Smart Exam Preparation Assistant

Studiq helps students focus on what matters most by analyzing syllabus/topic inputs and extracting high-priority topics, then mapping those topics to curated learning videos.

## Architecture

- `Backend/`: Node.js + Express API (ES Modules)
- `Service/`: Python FastAPI ML service for topic ranking
- `Frontend/`: Reserved for UI integration

## Workflow

1. Student submits syllabus/topics/question papers.
2. Backend merges and forwards text to ML service.
3. ML service cleans text, extracts keywords, and ranks topics.
4. Backend applies difficulty profile (`easy`, `medium`, `hard`).
5. Backend fetches YouTube recommendations topic-wise.
6. API returns:
- Most important topics
- Chart-friendly importance distribution
- Structured topic-to-video playlist

## Quick Start

### 1) Run ML service

```bash
cd Service
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Run backend

```bash
cd Backend
npm install
copy .env.example .env
npm run dev
```

### 3) Run frontend

```bash
cd Frontend
npm install
npm run dev
```

## API Surface

- `POST /api/analyze`
- `POST /api/playlist`
- `POST /api/genai/insights`
- `POST /api/v1/prep/analyze` (legacy alias)

Example:

```json
{
	"syllabus": "Operating systems, databases, networking",
	"topics": ["CPU scheduling", "normalization", "TCP/IP"],
	"questionPapers": [
		"Explain normalization forms with examples",
		"Round robin scheduling and starvation"
	],
	"difficulty": "hard"
}
```
