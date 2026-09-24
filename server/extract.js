import fs from "fs/promises";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import OpenAI from "openai";

const CV_SCHEMA = {
  name: "string",
  title: "string (job title / current role)",
  location: "string or null",
  email: "string or null",
  phone: "string or null",
  linkedin: "string (LinkedIn profile URL) or null",
  github: "string (GitHub profile URL) or null",
  portfolio: "string (Portfolio / Website URL) or null",
  yearsOfExperience: "number or string or null",
  summary: "{ subtitle: string optional, text: string }",
  skills:
    "array of { name: string, category: string optional (e.g. Programming Languages, Frontend, Backend, Databases, Cloud & DevOps, Tools & Frameworks), level: number 0-100 }",
  experience:
    "array of { title: string, company: string, location: string optional, startDate: string, endDate: string or null if current, description: string, responsibilities: array of strings optional }",
  education:
    "array of { degree: string, institution: string, field: string optional, dates: string optional, gpa: string optional }",
  projects:
    "array of { name: string, description: string, technologies: array of strings optional, link: string optional }",
  certifications:
    "array of { name: string, issuer: string optional, date: string optional }",
  languages: "array of { name: string, proficiency: string optional }",
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

function guessSocials(text) {
  const linkedin =
    text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i)?.[0] ??
    null;
  const github =
    text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i)?.[0] ?? null;
  const portfolio =
    text.match(
      /(?:https?:\/\/)?(?:www\.)?[\w\-]+\.(?:io|dev|me|app|co|com)\b(?!\/in\/)/i
    )?.[0] ?? null;
  return {
    linkedin: linkedin
      ? linkedin.startsWith("http")
        ? linkedin
        : `https://${linkedin}`
      : null,
    github: github
      ? github.startsWith("http")
        ? github
        : `https://${github}`
      : null,
    portfolio: portfolio
      ? portfolio.startsWith("http")
        ? portfolio
        : `https://${portfolio}`
      : null,
  };
}

function parseEducation(section) {
  if (!section) return [];
  const entries = [];
  const blocks = section
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const degreeLine =
      lines.find((l) =>
        /bachelor|master|b\.s|b\.a|m\.s|phd|diploma|degree|btech|mtech|associate/i.test(
          l
        )
      ) || lines[0];
    const schoolLine =
      lines.find(
        (l) =>
          l !== degreeLine &&
          /university|college|institute|school|academy/i.test(l)
      ) || lines[1] || "University";
    const dates =
      block.match(
        /\b(?:19|20)\d{2}\s*[-–—to]*\s*(?:(?:19|20)\d{2}|present|current)\b/i
      )?.[0] ||
      block.match(/\b(?:19|20)\d{2}\b/)?.[0] ||
      "—";
    const gpa =
      block.match(/(?:gpa|cgpa|grade|percentage)[:\s]*([\d.%]+(?:\/\d)?)/i)?.[1] ||
      null;

    entries.push({
      degree: degreeLine,
      institution: schoolLine,
      field: degreeLine.replace(/^(bachelor|master|b\.s|b\.tech|m\.tech|btech|mtech|diploma)\s+in\s+/i, ""),
      dates,
      gpa,
    });
  }
  return entries.slice(0, 4);
}

function parseProjects(section) {
  if (!section) return [];
  const entries = [];
  const blocks = section
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const name = lines[0].replace(/^[\-•*]\s*/, "");
    const link = block.match(/https?:\/\/[^\s]+/i)?.[0] || null;
    const techMatch = block.match(/(?:technologies|tech stack|tools|using)[:\s]*([^\n]+)/i)?.[1];
    const technologies = techMatch
      ? techMatch.split(/[,|]/).map((t) => t.trim()).filter(Boolean)
      : [];

    entries.push({
      name,
      description: lines.slice(1).join(" ").slice(0, 300) || "Project description.",
      technologies,
      link,
    });
  }
  return entries.slice(0, 5);
}

function parseCertifications(section) {
  if (!section) return [];
  const lines = section
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\-•*]\s*/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 6).map((l) => {
    const parts = l.split(/[-–—|]/);
    return {
      name: parts[0]?.trim() || l,
      issuer: parts[1]?.trim() || null,
      date: l.match(/\b(?:19|20)\d{2}\b/)?.[0] || null,
    };
  });
}

function parseLanguages(text) {
  const langSection = extractSection(text, ["languages", "spoken languages"]);
  if (!langSection) return [];
  const items = langSection
    .split(/[,|\n•·]/)
    .map((l) => l.trim())
    .filter(Boolean);
  return items.slice(0, 5).map((l) => {
    const parts = l.split(/[:\(-]/);
    return {
      name: parts[0]?.trim() || l,
      proficiency: parts[1]?.replace(/\)/g, "").trim() || "Proficient",
    };
  });
}

function categorizeSkill(name) {
  const lower = name.toLowerCase();
  if (
    /python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin|html|css|sql|r\b|matlab|scala|bash|perl/.test(
      lower
    )
  ) {
    return "Programming Languages";
  }
  if (
    /react|vue|angular|next\.?js|nuxt|svelte|tailwind|redux|sass|webpack|vite|bootstrap|jquery|uikit|css3|html5/.test(
      lower
    )
  ) {
    return "Frontend";
  }
  if (
    /node\.?js|express|django|flask|fastapi|spring|rails|net core|nest\.?js|graphql|rest|microservices|koa/.test(
      lower
    )
  ) {
    return "Backend";
  }
  if (
    /postgres|mysql|mongo|redis|sqlite|firebase|oracle|cassandra|elasticsearch|dynamodb|mariadb|prisma/.test(
      lower
    )
  ) {
    return "Databases";
  }
  if (
    /aws|azure|gcp|docker|kubernetes|terraform|ci\/cd|nginx|jenkins|github actions|linux|ansible|cloud/.test(
      lower
    )
  ) {
    return "Cloud & DevOps";
  }
  if (
    /git|github|vscode|figma|jira|postman|jest|cypress|junit|bitbucket|trello|slack/.test(
      lower
    )
  ) {
    return "Tools & Frameworks";
  }
  return "General / Technical";
}

function splitResponsibilities(text) {
  if (!text || text === "—") return [];
  const parts = text
    .split(/(?:•|\*|;\s*|\.\s+)/)
    .map((p) => p.replace(/^[\-–—\s]+/, "").trim())
    .filter((p) => p.length > 12);
  return parts.slice(0, 5);
}

function heuristicExtract(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i)?.[0]?.trim() ?? null;
  const phone =
    text.match(
      /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
    )?.[0]?.trim() ?? null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const name = lines[0]?.length < 60 ? lines[0] : "Candidate Profile";
  const socials = guessSocials(text);

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
    "No summary section found in resume text.";

  const expSection = extractSection(text, [
    "experience",
    "work experience",
    "employment",
    "professional experience",
  ]);
  const experience = parseExperience(expSection || text);

  const eduSection = extractSection(text, ["education", "academic background"]);
  const education = parseEducation(eduSection);

  const projSection = extractSection(text, ["projects", "personal projects", "portfolio projects"]);
  const projects = parseProjects(projSection);

  const certSection = extractSection(text, ["certifications", "licenses", "certificates"]);
  const certifications = parseCertifications(certSection);

  const languages = parseLanguages(text);

  return {
    name,
    title: guessTitle(lines, text),
    location: guessLocation(text),
    email,
    phone,
    linkedin: socials.linkedin,
    github: socials.github,
    portfolio: socials.portfolio,
    yearsOfExperience: experience.length ? `${experience.length * 2}+ Yrs` : null,
    skills: skills.length ? skills : [{ name: "General Competency", level: 75 }],
    summary: { subtitle: "Professional Overview", text: summaryText },
    experience: experience.length
      ? experience
      : [
          {
            title: "Professional Role",
            company: "Organization",
            startDate: "—",
            endDate: null,
            description: "Work history extracted from uploaded file.",
          },
        ],
    education,
    projects,
    certifications,
    languages,
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
    /\n\s*(education|experience|skills|projects|certifications|references|contact|languages)\s*\n/i
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
  const unique = [...new Set(items)].slice(0, 16);
  return unique.map((name, i) => ({
    name,
    category: categorizeSkill(name),
    level: Math.max(60, 95 - i * 3),
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
        !/^(skills|education|projects|certifications)/i.test(lines[i])
      ) {
        if (!lines[i + 1]?.match(DATE_RANGE)) desc.push(lines[i]);
        else if (!lines[i].match(/ at | @ /i)) desc.push(lines[i]);
        i += 1;
        if (lines[i - 1] && lines[i]?.match(DATE_RANGE)) break;
      }
      const rawDesc = desc.join(" ").slice(0, 600) || "—";
      entries.push({
        title,
        company,
        startDate: dateMatch[1].trim(),
        endDate: /present|current/.test(endRaw) ? null : dateMatch[2].trim(),
        description: rawDesc,
        responsibilities: splitResponsibilities(rawDesc),
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
    const rawDesc = blockLines
      .filter((l) => l !== titleLine && !DATE_RANGE.test(l))
      .join(" ")
      .slice(0, 600) || "—";
    entries.push({
      title,
      company,
      startDate: dateMatch[1].trim(),
      endDate: /present|current/.test(endRaw) ? null : dateMatch[2].trim(),
      description: rawDesc,
      responsibilities: splitResponsibilities(rawDesc),
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
  return lines[1]?.length < 80 ? lines[1] : "Professional Candidate";
}

function guessLocation(text) {
  const loc = text.match(
    /(?:location|address|based in)\s*[:\-]\s*([^\n]+)/i
  )?.[1];
  if (loc) return loc.trim();
  const city = text.match(
    /([A-Za-z\s]+,\s*(?:UK|USA|US|India|CA|AU|DE|FR|[A-Z]{2}))\b/
  )?.[1];
  return city?.trim() ?? null;
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
        content: `Extract candidate resume details into structured JSON adhering to schema: ${JSON.stringify(CV_SCHEMA)}. 
Rules:
- Infer skill categories (Programming Languages, Frontend, Backend, Databases, Cloud & DevOps, Tools & Frameworks).
- Extract bullet points for responsibilities if available.
- Extract degree, school, dates, GPA for education.
- Extract GitHub, LinkedIn, portfolio URLs if present.
- Never invent facts. Return null for missing items.`,
      },
      {
        role: "user",
        content: text.slice(0, 14000),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) return null;
  return JSON.parse(raw);
}

function normalize(data) {
  const cleanStr = (val) => {
    if (!val || val === "—" || val === "null" || val === "undefined") return null;
    const s = String(val).trim();
    return s.length > 0 ? s : null;
  };

  return {
    name: cleanStr(data.name) || "Candidate Profile",
    title: cleanStr(data.title) || "Professional Role",
    location: cleanStr(data.location),
    email: cleanStr(data.email),
    phone: cleanStr(data.phone),
    linkedin: cleanStr(data.linkedin),
    github: cleanStr(data.github),
    portfolio: cleanStr(data.portfolio),
    yearsOfExperience: cleanStr(data.yearsOfExperience),
    summary: {
      subtitle: cleanStr(data.summary?.subtitle) || "Professional Overview",
      text: cleanStr(data.summary?.text || data.summary),
    },
    skills: Array.isArray(data.skills)
      ? data.skills
          .map((s) => ({
            name: String(s.name || s).trim(),
            category: cleanStr(s.category) || categorizeSkill(String(s.name || s)),
            level: Math.min(100, Math.max(0, Number(s.level) || 80)),
          }))
          .filter((s) => s.name.length > 0)
      : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((e) => {
          const desc = cleanStr(e.description) || "—";
          let resp = Array.isArray(e.responsibilities)
            ? e.responsibilities.map((r) => String(r).trim()).filter(Boolean)
            : [];
          if (!resp.length) {
            resp = splitResponsibilities(desc);
          }
          return {
            title: cleanStr(e.title) || "Role",
            company: cleanStr(e.company),
            location: cleanStr(e.location),
            startDate: cleanStr(e.startDate) || "—",
            endDate: e.endDate === null || e.endDate === undefined ? null : cleanStr(e.endDate),
            description: desc,
            responsibilities: resp,
          };
        })
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((ed) => ({
          degree: cleanStr(ed.degree) || "Degree",
          institution: cleanStr(ed.institution || ed.school) || "Institution",
          field: cleanStr(ed.field),
          dates: cleanStr(ed.dates || ed.year) || "—",
          gpa: cleanStr(ed.gpa || ed.grade),
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((p) => ({
          name: cleanStr(p.name || p.title) || "Project",
          description: cleanStr(p.description),
          technologies: Array.isArray(p.technologies)
            ? p.technologies.map((t) => String(t).trim()).filter(Boolean)
            : typeof p.technologies === "string"
            ? p.technologies.split(/[,|]/).map((t) => t.trim()).filter(Boolean)
            : [],
          link: cleanStr(p.link || p.url),
        }))
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((c) => ({
          name: cleanStr(c.name || c.title || c) || "Certification",
          issuer: cleanStr(c.issuer || c.organization),
          date: cleanStr(c.date || c.year),
        }))
      : [],
    languages: Array.isArray(data.languages)
      ? data.languages.map((l) => ({
          name: cleanStr(l.name || l.language || l) || "Language",
          proficiency: cleanStr(l.proficiency || l.level) || "Proficient",
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
