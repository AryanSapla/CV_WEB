import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profilePath = path.join(__dirname, "..", "data", "profile.json");

export async function loadProfile() {
  if (process.env.PROFILE_JSON) {
    const parsed = JSON.parse(process.env.PROFILE_JSON);
    return shapeProfile(parsed);
  }

  let raw;
  try {
    raw = await fs.readFile(profilePath, "utf-8");
  } catch {
    const localPath = path.join(__dirname, "..", "data", "profile.local.json");
    raw = await fs.readFile(localPath, "utf-8");
  }

  const parsed = JSON.parse(raw);
  return shapeProfile(parsed);
}

function shapeProfile(parsed) {
  const data = parsed.data ?? parsed;
  const photoUrl = parsed.photoUrl ?? null;
  const cvDownloadUrl = parsed.cvDownloadUrl ?? null;

  if (!data?.name?.trim()) {
    throw new Error("Profile data is missing or incomplete (name required).");
  }

  return { data, photoUrl, cvDownloadUrl };
}
