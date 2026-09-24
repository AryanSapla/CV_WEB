import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { extractCvData } from "./extract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const uploadDir = path.join(root, "uploads");

await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json());

app.post(
  "/api/extract",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    const resumeFile = req.files?.resume?.[0];
    const photoFile = req.files?.photo?.[0];

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume file is required." });
    }

    try {
      const { data } = await extractCvData(
        resumeFile.path,
        resumeFile.mimetype
      );

      let photoDataUrl = null;
      if (photoFile) {
        const buf = await fs.readFile(photoFile.path);
        const mime = photoFile.mimetype || "image/jpeg";
        photoDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      }

      res.json({ data, photoDataUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Extraction failed." });
    } finally {
      for (const f of [resumeFile, photoFile].filter(Boolean)) {
        fs.unlink(f.path).catch(() => {});
      }
    }
  }
);

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  const dist = path.join(root, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  if (!process.env.OPENAI_API_KEY) {
    console.log(
      "Tip: set OPENAI_API_KEY for smarter resume parsing (heuristics used otherwise)."
    );
  }
});
