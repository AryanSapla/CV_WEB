import multer from "multer";
import { extractCvData } from "../server/extract.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "photo", maxCount: 1 },
      ])
    );

    const resumeFile = req.files?.resume?.[0];
    const photoFile = req.files?.photo?.[0];

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume file is required." });
    }

    const { data } = await extractCvData(
      resumeFile.buffer,
      resumeFile.mimetype,
      resumeFile.originalname
    );

    let photoDataUrl = null;
    if (photoFile) {
      const mime = photoFile.mimetype || "image/jpeg";
      photoDataUrl = `data:${mime};base64,${photoFile.buffer.toString("base64")}`;
    }

    return res.status(200).json({ data, photoDataUrl });
  } catch (err) {
    console.error("Extraction error:", err);
    return res.status(500).json({ error: err.message || "Extraction failed." });
  }
}
