import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { loadProfile } from "./loadProfile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const app = express();
app.use(cors());

app.get("/api/profile", async (_req, res) => {
  try {
    const profile = await loadProfile();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Profile unavailable." });
  }
});

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
  console.log(`Profile site listening on http://localhost:${port}`);
});
