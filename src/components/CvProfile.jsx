import { useState } from "react";
import {
  IconBriefcase,
  IconCalendar,
  IconHome,
  IconMail,
  IconPhone,
  IconSpark,
  IconPrinter,
  IconCopy,
  IconCheck,
  IconLinkedin,
  IconGithub,
  IconGlobe,
  IconGraduationCap,
  IconAward,
  IconCode,
  IconAlertTriangle,
  IconExternalLink,
  IconTranslate,
} from "./Icons.jsx";

function calculateConfidence(data) {
  const needsVerification = [];

  // Header & Contact Confidence
  let headerScore = 100;
  if (!data.email) {
    headerScore -= 30;
    needsVerification.push({ field: "Email", reason: "Missing contact email" });
  }
  if (!data.phone) {
    headerScore -= 20;
    needsVerification.push({ field: "Phone", reason: "Missing phone number" });
  }
  if (!data.location) {
    headerScore -= 15;
    needsVerification.push({ field: "Location", reason: "Location not specified" });
  }
  if (!data.linkedin && !data.github && !data.portfolio) {
    headerScore -= 15;
    needsVerification.push({ field: "Social Links", reason: "No LinkedIn or GitHub links detected" });
  }

  // Work Experience Confidence
  let expScore = 100;
  if (!data.experience || data.experience.length === 0) {
    expScore = 0;
    needsVerification.push({ field: "Experience", reason: "Work history section missing" });
  } else {
    data.experience.forEach((e, idx) => {
      if (!e.company) {
        expScore -= 15;
        needsVerification.push({ field: `Experience #${idx + 1}`, reason: `Missing company name for role "${e.title}"` });
      }
      if (e.startDate === "—") {
        expScore -= 10;
      }
    });
    expScore = Math.max(30, expScore);
  }

  // Skills Confidence
  let skillsScore = 100;
  if (!data.skills || data.skills.length === 0) {
    skillsScore = 0;
    needsVerification.push({ field: "Skills", reason: "No skills extracted" });
  } else if (data.skills.length < 3) {
    skillsScore = 50;
    needsVerification.push({ field: "Skills", reason: "Low skill count extracted" });
  }

  // Education Confidence
  let eduScore = 100;
  if (!data.education || data.education.length === 0) {
    eduScore = 40;
    needsVerification.push({ field: "Education", reason: "Education details not found" });
  }

  // Projects Confidence
  let projScore = data.projects && data.projects.length > 0 ? 95 : 60;

  const overall = Math.round(
    headerScore * 0.25 +
      expScore * 0.35 +
      skillsScore * 0.2 +
      eduScore * 0.1 +
      projScore * 0.1
  );

  return {
    overall: Math.min(100, Math.max(15, overall)),
    sections: {
      header: Math.max(0, headerScore),
      experience: Math.max(0, expScore),
      skills: Math.max(0, skillsScore),
      education: Math.max(0, eduScore),
      projects: Math.max(0, projScore),
    },
    needsVerification,
  };
}

function calculateYearsOfExperience(experience) {
  if (!experience || experience.length === 0) return null;
  const count = experience.length;
  if (count === 1) return "1-2 Yrs";
  if (count === 2) return "3+ Yrs";
  if (count >= 3) return `${count * 2 - 1}+ Yrs`;
  return `${count} Roles`;
}

export default function CvProfile({ data, photoDataUrl }) {
  const [copied, setCopied] = useState(false);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  const {
    name,
    title,
    location,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    yearsOfExperience,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    languages,
  } = data;

  const confidence = calculateConfidence(data);
  const calculatedYrs = yearsOfExperience || calculateYearsOfExperience(experience);

  // Group skills by Category
  const skillCategories = {};
  (skills || []).forEach((s) => {
    const cat = s.category || "General / Technical";
    if (!skillCategories[cat]) skillCategories[cat] = [];
    skillCategories[cat].push(s);
  });

  function handlePrint() {
    window.print();
  }

  function handleCopySummary() {
    const summaryText = `Candidate Candidate Profile: ${name}
Role: ${title}
Contact: ${email || "N/A"} | ${phone || "N/A"} | ${location || "N/A"}
LinkedIn: ${linkedin || "N/A"} | GitHub: ${github || "N/A"}

Summary:
${summary?.text || "N/A"}

Key Skills:
${(skills || []).map((s) => s.name).join(", ")}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="ats-candidate-profile">
      {/* Top Toolbar */}
      <div className="ats-actions-bar no-print">
        <div className="ats-badge-group">
          <span className="recruiter-badge">Recruiter ATS Profile View</span>
          <div className="confidence-pill" onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}>
            <span className="confidence-dot" style={{ background: confidence.overall > 80 ? "#10b981" : "#f59e0b" }}></span>
            <span>Parsing Confidence: <strong>{confidence.overall}%</strong></span>
            {confidence.needsVerification.length > 0 && (
              <span className="verify-warning-badge">
                <IconAlertTriangle /> {confidence.needsVerification.length} Needs Verification
              </span>
            )}
          </div>
        </div>

        <div className="ats-actions-buttons">
          <button type="button" className="btn-action" onClick={handleCopySummary}>
            {copied ? <IconCheck /> : <IconCopy />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
          <button type="button" className="btn-action btn-action--primary" onClick={handlePrint}>
            <IconPrinter />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Confidence Breakdown Panel */}
      {showConfidenceDetails && (
        <div className="confidence-panel card no-print fade-in">
          <div className="panel-header">
            <h3><IconSpark /> Parser Section-by-Section Confidence Score</h3>
            <button type="button" className="close-btn" onClick={() => setShowConfidenceDetails(false)}>✕</button>
          </div>
          <div className="confidence-grid">
            <div className="confidence-item">
              <span>Header & Contact</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${confidence.sections.header}%` }} /></div>
              <span>{confidence.sections.header}%</span>
            </div>
            <div className="confidence-item">
              <span>Work Experience</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${confidence.sections.experience}%` }} /></div>
              <span>{confidence.sections.experience}%</span>
            </div>
            <div className="confidence-item">
              <span>Skills & Competencies</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${confidence.sections.skills}%` }} /></div>
              <span>{confidence.sections.skills}%</span>
            </div>
            <div className="confidence-item">
              <span>Education</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${confidence.sections.education}%` }} /></div>
              <span>{confidence.sections.education}%</span>
            </div>
          </div>

          {confidence.needsVerification.length > 0 && (
            <div className="verification-alerts">
              <h4><IconAlertTriangle /> Fields Flagged for Verification ({confidence.needsVerification.length}):</h4>
              <ul className="alert-list">
                {confidence.needsVerification.map((v, i) => (
                  <li key={i}>
                    <span className="flag-tag">Needs Verification</span>
                    <strong>{v.field}:</strong> {v.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Candidate Header */}
      <header className="candidate-header card">
        <div className="header-main">
          <div className="candidate-avatar-wrap">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt={name} className="candidate-photo" />
            ) : (
              <div className="candidate-avatar-fallback">
                {name?.charAt(0) || "C"}
              </div>
            )}
          </div>

          <div className="candidate-identity">
            <div className="title-row">
              <h1 className="candidate-name">{name}</h1>
              <span className="role-pill">{title}</span>
            </div>

            {/* Contact Badges */}
            <div className="candidate-contact-chips">
              {email ? (
                <a href={`mailto:${email}`} className="contact-chip">
                  <IconMail /> <span>{email}</span>
                </a>
              ) : (
                <span className="contact-chip contact-chip--unverified" title="Needs Verification">
                  <IconMail /> <span>Email: Needs Verification</span>
                </span>
              )}

              {phone ? (
                <a href={`tel:${phone}`} className="contact-chip">
                  <IconPhone /> <span>{phone}</span>
                </a>
              ) : (
                <span className="contact-chip contact-chip--unverified" title="Needs Verification">
                  <IconPhone /> <span>Phone: Needs Verification</span>
                </span>
              )}

              {location ? (
                <span className="contact-chip">
                  <IconHome /> <span>{location}</span>
                </span>
              ) : (
                <span className="contact-chip contact-chip--unverified" title="Needs Verification">
                  <IconHome /> <span>Location: Needs Verification</span>
                </span>
              )}

              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="contact-chip contact-chip--social">
                  <IconLinkedin /> <span>LinkedIn Profile</span> <IconExternalLink />
                </a>
              )}

              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="contact-chip contact-chip--social">
                  <IconGithub /> <span>GitHub Profile</span> <IconExternalLink />
                </a>
              )}

              {portfolio && (
                <a href={portfolio} target="_blank" rel="noopener noreferrer" className="contact-chip contact-chip--social">
                  <IconGlobe /> <span>Portfolio Website</span> <IconExternalLink />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="stat-card card">
          <div className="stat-icon"><IconBriefcase /></div>
          <div className="stat-info">
            <span className="stat-value">{calculatedYrs || "N/A"}</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon"><IconCode /></div>
          <div className="stat-info">
            <span className="stat-value">{skills ? skills.length : 0}</span>
            <span className="stat-label">Skills Parsed</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon"><IconHome /></div>
          <div className="stat-info">
            <span className="stat-value">{experience ? experience.length : 0}</span>
            <span className="stat-label">Companies / Roles</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon"><IconSpark /></div>
          <div className="stat-info">
            <span className="stat-value">{projects ? projects.length : 0}</span>
            <span className="stat-label">Projects Built</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Recruiter ATS Grid */}
      <div className="ats-grid">
        {/* Left Sidebar Column */}
        <aside className="ats-sidebar">
          {/* Skills Grouped by Category */}
          {skills && skills.length > 0 && (
            <section className="card ats-section">
              <h3 className="section-title">
                <IconCode /> Skills & Expertise
              </h3>
              <div className="categories-list">
                {Object.entries(skillCategories).map(([category, items]) => (
                  <div key={category} className="skill-category-block">
                    <h4 className="category-title">{category}</h4>
                    <div className="skill-chips-group">
                      {items.map((skill, idx) => (
                        <span key={`${skill.name}-${idx}`} className="skill-chip">
                          {skill.name}
                          <span className="skill-pct-chip">{skill.level}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          <section className="card ats-section">
            <h3 className="section-title">
              <IconGraduationCap /> Education
            </h3>
            {education && education.length > 0 ? (
              <div className="education-list">
                {education.map((edu, idx) => (
                  <div key={idx} className="education-item">
                    <h4 className="edu-degree">{edu.degree}</h4>
                    <p className="edu-school">{edu.institution}</p>
                    <div className="edu-meta">
                      <span className="edu-dates"><IconCalendar /> {edu.dates}</span>
                      {edu.gpa && <span className="edu-gpa-badge">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="unverified-box">
                <IconAlertTriangle />
                <span>Education details missing or unparsed. <span className="verify-tag">Needs Verification</span></span>
              </div>
            )}
          </section>

          {/* Certifications & Achievements */}
          {certifications && certifications.length > 0 && (
            <section className="card ats-section">
              <h3 className="section-title">
                <IconAward /> Certifications & Honors
              </h3>
              <ul className="certifications-list">
                {certifications.map((cert, idx) => (
                  <li key={idx} className="cert-item">
                    <div className="cert-bullet"><IconCheck /></div>
                    <div className="cert-info">
                      <h4 className="cert-name">{cert.name}</h4>
                      {cert.issuer && <span className="cert-issuer">{cert.issuer}</span>}
                      {cert.date && <span className="cert-date">({cert.date})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Spoken Languages */}
          {languages && languages.length > 0 && (
            <section className="card ats-section">
              <h3 className="section-title">
                <IconTranslate /> Languages
              </h3>
              <div className="languages-chips">
                {languages.map((lang, idx) => (
                  <div key={idx} className="lang-chip">
                    <span className="lang-name">{lang.name}</span>
                    <span className="lang-prof">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Right Main Column */}
        <main className="ats-main">
          {/* Professional Summary */}
          {summary && (summary.text || summary.subtitle) && (
            <section className="card ats-section">
              <h3 className="section-title">
                <IconSpark /> Executive Summary
              </h3>
              <p className="summary-body">{summary.text}</p>
            </section>
          )}

          {/* Work Experience Vertical Timeline */}
          <section className="card ats-section">
            <h3 className="section-title">
              <IconBriefcase /> Professional Work Experience
            </h3>
            {experience && experience.length > 0 ? (
              <div className="timeline-container">
                {experience.map((job, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-node"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="job-role-group">
                          <h4 className="job-role-title">{job.title}</h4>
                          {job.company && (
                            <span className="job-company-name">@ {job.company}</span>
                          )}
                        </div>

                        <div className="job-meta-badges">
                          <span className="duration-pill">
                            <IconCalendar />
                            <span>{job.startDate} — {job.endDate ?? "Present"}</span>
                          </span>
                          {job.endDate === null && <span className="active-badge">Active</span>}
                          {job.location && <span className="loc-badge"><IconHome /> {job.location}</span>}
                        </div>
                      </div>

                      {/* Bullet-point Responsibilities */}
                      {job.responsibilities && job.responsibilities.length > 0 ? (
                        <ul className="responsibilities-list">
                          {job.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx}>{resp}</li>
                          ))}
                        </ul>
                      ) : (
                        job.description && <p className="job-desc-fallback">{job.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="unverified-box">
                <IconAlertTriangle />
                <span>Work history not extracted. <span className="verify-tag">Needs Verification</span></span>
              </div>
            )}
          </section>

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="card ats-section">
              <h3 className="section-title">
                <IconCode /> Featured Projects & Portfolio
              </h3>
              <div className="projects-grid">
                {projects.map((proj, idx) => (
                  <div key={idx} className="project-card">
                    <div className="project-header">
                      <h4 className="project-title">{proj.name}</h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link">
                          View Live <IconExternalLink />
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="project-desc">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="project-tech-tags">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
