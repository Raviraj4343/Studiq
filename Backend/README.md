# Studiq Backend (Node.js + Express)

Production-style backend for exam preparation analysis and topic prioritization.

## Folder Structure

- `src/config`: Environment config and validation
- `src/constants`: Reusable constants and limits
- `src/controllers`: Request handlers
- `src/routes`: API routes
- `src/services`: Business logic and external integrations
- `src/models`: Request/response schema models
- `src/middlewares`: Validation and error middlewares
- `src/utils`: Helpers and shared utility classes

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## API

- `GET /health`
- `POST /api/v1/prep/analyze`

### Sample payload

```json
{
  "syllabus": "Data structures, algorithms, operating systems, dbms",
  "questionPapers": [
    "Explain quick sort and time complexity.",
    "Difference between deadlock and starvation."
  ],
  "difficulty": "medium"
}
```
