# Netra Frontend

Next.js dashboard for the Netra engineering intelligence platform.

## Run

```bash
npm install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Create `.env.local`:

```bash
copy .env.local.example .env.local
```

Default values:

```text
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

For Vercel, set `NEXT_PUBLIC_BACKEND_URL` in the project environment
variables to the public URL of the deployed FastAPI backend. `127.0.0.1`
only works for local development.

## Checks

```bash
npm.cmd run lint
npm.cmd run build
```
