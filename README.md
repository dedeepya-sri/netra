# Netra

Netra is an AI-native engineering intelligence platform for incident response training, synthetic infrastructure simulation, and operator workflows.

## What Is Built

- FastAPI backend with PostgreSQL persistence
- Redis-backed incident event stream and WebSocket updates
- Next.js dashboard
- Synthetic incident, log, and metric generation
- Scenario-based simulation controls
- Service health overview
- Observability summary dashboard
- AI-style incident analysis
- AI incident coach for interns and new responders
- Runbook/RAG-style retrieval
- Multi-agent incident workflow
- Rich postmortem workspace
- Docker Compose stack with frontend, backend, PostgreSQL, Redis, and ChromaDB

## Local Setup

Backend env:

```bash
copy backend\.env.example backend\.env
```

Frontend env:

```bash
copy frontend\.env.local.example frontend\.env.local
```

For Vercel deployments, set the frontend environment variable
`NEXT_PUBLIC_BACKEND_URL` to the public FastAPI backend URL. Do not use
`127.0.0.1` or `localhost` in Vercel; those point at Vercel's runtime, not
your local machine.

Start infrastructure:

```bash
cd infrastructure
docker compose up -d postgres redis chromadb
```

Run backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Run frontend:

```bash
cd frontend
npm install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

## Docker Setup

```bash
copy backend\.env.example backend\.env
cd infrastructure
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- ChromaDB: `http://localhost:8001`

Run migrations inside Docker:

```bash
docker compose exec backend alembic upgrade head
```

## Useful API Checks

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/db-health
curl http://127.0.0.1:8000/redis-health
curl http://127.0.0.1:8000/incidents/
curl http://127.0.0.1:8000/incidents/observability
curl http://127.0.0.1:8000/incidents/runbooks
```

Create a targeted simulation:

```bash
curl -X POST http://127.0.0.1:8000/incidents/simulate ^
  -H "Content-Type: application/json" ^
  -d "{\"service\":\"payment-service\",\"scenario\":\"database outage\",\"severity\":\"critical\",\"count\":3}"
```

## Frontend Verification

```bash
cd frontend
npm.cmd run lint
npm.cmd run build
```

## Notes

- Current runbook retrieval is deterministic and shaped like a RAG response so ChromaDB-backed retrieval can replace it later.
- Current multi-agent workflow is deterministic and shaped so LangGraph orchestration can replace it later.
- PowerShell may block `npm.ps1`; use `npm.cmd` on Windows.
