# CV Extractor

Upload a **resume** (PDF, DOCX, or TXT) and an optional **profile photo**. The app extracts structured data and displays it in a clean CV layout (contact info, skills, summary, work experience).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies API calls to the backend on port 3001.

## Better extraction (recommended)

Copy `.env.example` to `.env` and set `OPENAI_API_KEY`. Without it, the app uses basic text heuristics (works for simple resumes, less accurate for complex layouts).

## Production

```bash
npm run build
npm start
```

Serves the built frontend and API on port 3001 (set `PORT` to change).
