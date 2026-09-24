# Personal Professional Profile

A single-page portfolio site generated from structured CV data. Visitors see your professional profile immediately—no uploads, login, or ATS views.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Profile data

Content is served from **`data/profile.json`** via `GET /api/profile`.

### Option A — From a saved browser export

If you previously extracted a CV in this project:

1. In the browser console on the old app:  
   `copy(localStorage.getItem('cv_web_extracted_data'))`
2. Paste into `data/profile-export.json`
3. Run:

```bash
node scripts/import-browser-export.mjs
```

Put a headshot at `public/photo.jpg` and set `"photoUrl": "/photo.jpg"` in `data/profile.json`.  
Add your PDF resume as `public/cv.pdf` for the Download CV button.

### Option B — From a resume file (maintainer script)

```bash
node scripts/sync-profile.mjs path/to/resume.pdf --photo public/photo.jpg
```

Requires `OPENAI_API_KEY` in `.env` for best results (uses `server/extract.js`).

### Option C — Vercel env

Set `PROFILE_JSON` to the full JSON object (`{ "data": { ... }, "photoUrl", "cvDownloadUrl" }`).

## Production

```bash
npm run build
npm start
```

Deploy to Vercel with the included `api/profile.js` serverless route.
