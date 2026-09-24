import fs from "fs/promises";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import OpenAI from "openai";

const CV_SCHEMA = {
  name: "string",
  title: "string (job title or role)",
  location: "string",
  email: "string",
  phone: "string",
  skills: "array of { name: string, level: number 0-100 }",
  summary: "{ subtitle: string optional, text: string }",
  experience:
    "array of { title: string, company: string, startDate: string, endDate: string or null if current, description: string }",
};

export async function textFromResume(filePath, mimetype) {
  const buffer = await fs.readFile(filePath);
  if (mimetype === "application/pdf" || filePath.endsWith(".pdf")) {
    const data = await pdf(buffer);
    return data.text;
  }
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mimetype === "text/plain" || filePath.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
}

function heuristicExtract(text) {
  const email =
    text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i)?.[0]?.trim() ?? "";
  const phone =
    text.match(
      /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
    )?.[0]?.trim() ?? "";

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const name = lines[0]?.length < 60 ? lines[0] : "Unknown";

  const skillSection = extractSection(text, [
    "skills",
    "technical skills",
    "core competencies",
  ]);
  const skills = parseSkills(skillSection);

  const summarySection = extractSection(text, [
    "summary",
    "profile",
    "about",
    "objective",
    "professional summary",
  ]);
  const summaryText =
    summarySection.slice(0, 800) ||
    lines.slice(1, 4).join(" ") ||
    "No summary found in resume.";

  const expSection = extractSection(text, [
    "experience",
    "work experience",
    "employment",
    "professional experience",
  ]);
  const experience = parseExperience(expSection || text);

  return {
    name,
    title: guessTitle(lines, text),
    location: guessLocation(text),
    email,
    phone,
    skills: skills.length ? skills : [{ name: "General", level: 70 }],
    summary: { subtitle: "Professional summary", text: summaryText },
    experience: experience.length
      ? experience
      : [
          {
            title: "Role",
            company: "Company",
            startDate: "—",
            endDate: null,
            description:
              "Could not parse experience. Add OPENAI_API_KEY for better extraction, or use a clearer resume format.",
          },
        ],
  };
}

function extractSection(text, headings) {
  const lower = text.toLowerCase();
  let start = -1;
  let matchedLen = 0;
  for (const h of headings) {
    const idx = lower.indexOf(h);
    if (idx !== -1 && (start === -1 || idx < start)) {
      start = idx;
      matchedLen = h.length;
    }
  }
  if (start === -1) return "";
  const chunk = text.slice(start + matchedLen);
  const nextHeading = chunk.search(
    /\n\s*(education|experience|skills|projects|certifications|references|contact)\s*\n/i
  );
  return (nextHeading > 0 ? chunk.slice(0, nextHeading) : chunk).trim();
}

function parseSkills(section) {
  if (!section) return [];
  const cut = section.split(/work experience|employment|education/i)[0];
  const items = cut
    .split(/[,|\n•·]/)
    .flatMap((line) => line.split(/\s{2,}/))
    .map((s) => s.replace(/^[\-–—]\s*/, "").trim())
    .filter(
      (s) =>
        s.length > 1 &&
        s.length < 40 &&
        !/^\d{4}/.test(s) &&
        !/present|current/i.test(s) &&
        !/developer at|engineer at/i.test(s)
    );
  const unique = [...new Set(items)].slice(0, 10);
  return unique.map((name, i) => ({
    name,
    level: Math.max(55, 95 - i * 5),
  }));
}

const DATE_RANGE =
  /(\w{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(\w{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current)/gi;

function parseExperience(section) {
  const entries = [];
  const lines = section.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let i = 0;
  while (i < lines.length) {
    const dateMatch = lines[i].match(
      /^((?:\w{3,9}\.?\s+)?\d{4})\s*[-–—]\s*((?:\w{3,9}\.?\s+)?\d{4}|present|current)$/i
    );
    if (dateMatch && i > 0) {
      const [title, company] = splitTitleCompany(lines[i - 1]);
      const endRaw = dateMatch[2].toLowerCase();
      const desc = [];
      i += 1;
      while (
        i < lines.length &&
        !lines[i].match(
          /^((?:\w{3,9}\.?\s+)?\d{4})\s*[-–—]\s*((?:\w{3,9}\.?\s+)?\d{4}|present|current)$/i
        ) &&
        !/^(skills|education|projects)/i.test(lines[i])
      ) {
        if (!lines[i + 1]?.match(DATE_RANGE)) desc.push(lines[i]);
        else if (!lines[i].match(/ at | @ /i)) desc.push(lines[i]);
        i += 1;
        if (lines[i - 1] && lines[i]?.match(DATE_RANGE)) break;
      }
      entries.push({
        title,
        company,
        startDate: dateMatch[1].trim(),
        endDate: /present|current/.test(endRaw) ? null : dateMatch[2].trim(),
        description: desc.join(" ").slice(0, 500) || "—",
      });
      continue;
    }
    i += 1;
  }

  if (entries.length) return entries.slice(0, 8);

  for (const block of section.split(/\n\n+/)) {
    const dateMatch = [...block.matchAll(DATE_RANGE)][0];
    if (!dateMatch) continue;
    const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const titleLine =
      blockLines.find((l) => !DATE_RANGE.test(l) && l.length < 80) ||
      "Position";
    const [title, company] = splitTitleCompany(titleLine);
    const endRaw = dateMatch[2].toLowerCase();
    entries.push({
      title,
      company,
      startDate: dateMatch[1].trim(),
      endDate: /present|current/.test(endRaw) ? null : dateMatch[2].trim(),
      description:
        blockLines
          .filter((l) => l !== titleLine && !DATE_RANGE.test(l))
          .join(" ")
          .slice(0, 500) || "—",
    });
  }
  return entries.slice(0, 8);
}

function splitTitleCompany(line) {
  const at = line.split(/\s+at\s+|\s+@\s+|\s+\/\s+/i);
  if (at.length >= 2) return [at[0].trim(), at.slice(1).join(" ").trim()];
  return [line, ""];
}

function guessTitle(lines, text) {
  const role = text.match(
    /(?:title|role|position)\s*[:\-]\s*([^\n]+)/i
  )?.[1];
  if (role) return role.trim();
  return lines[1]?.length < 80 ? lines[1] : "Professional";
}

function guessLocation(text) {
  const loc = text.match(
    /(?:location|address|based in)\s*[:\-]\s*([^\n]+)/i
  )?.[1];
  if (loc) return loc.trim();
  const city = text.match(
    /([A-Za-z\s]+,\s*(?:UK|USA|US|India|CA|AU|[A-Z]{2}))\b/
  )?.[1];
  return city?.trim() ?? "—";
}

async function llmExtract(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const openai = new OpenAI({ apiKey: key });
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract resume data as JSON matching this shape: ${JSON.stringify(CV_SCHEMA)}. 
Use null for endDate when the job is current. Infer skill levels 50-95 from context if not stated. 
Keep descriptions concise. Only use facts from the resume text.`,
      },
      {
        role: "user",
        content: text.slice(0, 12000),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) return null;
  return JSON.parse(raw);
}

function normalize(data) {
  return {
    name: String(data.name || "Unknown"),
    title: String(data.title || "—"),
    location: String(data.location || "—"),
    email: String(data.email || "—"),
    phone: String(data.phone || "—"),
    skills: Array.isArray(data.skills)
      ? data.skills.map((s) => ({
          name: String(s.name || s),
          level: Math.min(100, Math.max(0, Number(s.level) || 70)),
        }))
      : [],
    summary: {
      subtitle: String(data.summary?.subtitle || "Key summary"),
      text: String(data.summary?.text || data.summary || ""),
    },
    experience: Array.isArray(data.experience)
      ? data.experience.map((e) => ({
          title: String(e.title || "Role"),
          company: String(e.company || ""),
          startDate: String(e.startDate || "—"),
          endDate:
            e.endDate === null || e.endDate === undefined
              ? null
              : String(e.endDate),
          description: String(e.description || "—"),
        }))
      : [],
  };
}

export async function extractCvData(filePath, mimetype) {
  const text = await textFromResume(filePath, mimetype);
  if (!text?.trim()) {
    throw new Error("Could not read text from resume.");
  }

  let data = null;
  try {
    data = await llmExtract(text);
  } catch (err) {
    console.warn("LLM extraction failed, using heuristics:", err.message);
  }

  if (!data) {
    data = heuristicExtract(text);
  }

  return { data: normalize(data), rawTextPreview: text.slice(0, 500) };
}
