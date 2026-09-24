#!/usr/bin/env node
/**
 * Convert a browser export into data/profile.json
 * Paste localStorage value from cv_web_extracted_data into data/profile-export.json, then run:
 * node scripts/import-browser-export.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "data", "profile-export.json");
const dest = path.join(root, "data", "profile.json");

const raw = JSON.parse(await fs.readFile(src, "utf-8"));
const out = {
  photoUrl: raw.photoDataUrl?.startsWith("data:")
    ? null
    : raw.photoUrl || raw.photoDataUrl || null,
  cvDownloadUrl: raw.cvDownloadUrl || "/cv.pdf",
  data: raw.data || raw,
};

if (raw.photoDataUrl?.startsWith("data:")) {
  console.warn(
    "Base64 photo in export — save the image to public/photo.jpg and set photoUrl to /photo.jpg"
  );
}

if (!out.data?.name) {
  console.error("Export is missing data.name");
  process.exit(1);
}

await fs.writeFile(dest, JSON.stringify(out, null, 2));
console.log("Wrote data/profile.json for", out.data.name);
