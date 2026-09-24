#!/usr/bin/env node
/**
 * Maintainer-only: build data/profile.json from a resume file (uses server/extract.js).
 * Usage: node scripts/sync-profile.mjs path/to/resume.pdf [--photo public/photo.jpg]
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { extractCvData } from "../server/extract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const resumePath = process.argv[2];
if (!resumePath) {
  console.error("Usage: node scripts/sync-profile.mjs <resume.pdf|docx|txt>");
  process.exit(1);
}

const abs = path.resolve(resumePath);
const buf = await fs.readFile(abs);
const ext = path.extname(abs).toLowerCase();
const mime =
  ext === ".pdf"
    ? "application/pdf"
    : ext === ".docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "text/plain";

const { data } = await extractCvData(buf, mime, path.basename(abs));

let photoUrl = null;
const photoArg = process.argv.indexOf("--photo");
if (photoArg !== -1 && process.argv[photoArg + 1]) {
  photoUrl = process.argv[photoArg + 1].replace(/^public\//, "/");
  if (!photoUrl.startsWith("/")) photoUrl = `/${photoUrl}`;
}

const out = {
  photoUrl,
  cvDownloadUrl: "/cv.pdf",
  data,
};

await fs.writeFile(
  path.join(root, "data", "profile.json"),
  JSON.stringify(out, null, 2),
  "utf-8"
);
console.log("Wrote data/profile.json for", data.name);
