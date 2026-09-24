const CATEGORY_ORDER = [
  "Programming Languages",
  "Programming",
  "Frontend",
  "Backend",
  "Databases",
  "Cloud & DevOps",
  "Cloud/DevOps",
  "Tools & Frameworks",
  "Tools",
  "Other technologies",
  "General / Technical",
];

const CATEGORY_LABELS = {
  "Programming Languages": "Programming",
  "Cloud & DevOps": "Cloud / DevOps",
  "Tools & Frameworks": "Tools",
  "General / Technical": "Other technologies",
};

export function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function groupSkills(skills = []) {
  const groups = {};
  for (const skill of skills) {
    const raw = skill.category || "Other technologies";
    const label = CATEGORY_LABELS[raw] || raw;
    if (!groups[label]) groups[label] = [];
    groups[label].push(skill.name);
  }

  const ordered = [];
  for (const key of CATEGORY_ORDER) {
    const label = CATEGORY_LABELS[key] || key;
    if (groups[label]) {
      ordered.push({ label, items: groups[label] });
      delete groups[label];
    }
  }
  for (const [label, items] of Object.entries(groups)) {
    ordered.push({ label, items });
  }
  return ordered.filter((g) => g.items.length > 0);
}

export function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function formatDateRange(start, end) {
  if (!hasText(start) || start === "—") return null;
  const endPart = end == null ? "Present" : end;
  return `${start} — ${endPart}`;
}

export function deriveStrengths(skills, limit = 6) {
  return (skills || [])
    .slice(0, limit)
    .map((s) => s.name)
    .filter(Boolean);
}

export function shortSummary(data) {
  const text = data.summary?.text?.trim();
  if (!text) return null;
  const first = text.split(/(?<=[.!?])\s+/)[0];
  return first.length < 220 ? first : `${text.slice(0, 217).trim()}…`;
}
