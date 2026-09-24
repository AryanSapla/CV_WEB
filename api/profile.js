import { loadProfile } from "../server/loadProfile.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const profile = await loadProfile();
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Profile unavailable." });
  }
}
