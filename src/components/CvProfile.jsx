import {
  IconBriefcase,
  IconCalendar,
  IconHome,
  IconMail,
  IconPhone,
  IconSpark,
} from "./Icons.jsx";

export default function CvProfile({ data, photoDataUrl }) {
  const { name, title, location, email, phone, skills, summary, experience } =
    data;

  return (
    <div className="cv-layout">
      <aside className="cv-sidebar card">
        <div className="photo-wrap">
          {photoDataUrl ? (
            <img src={photoDataUrl} alt={name} className="profile-photo" />
          ) : (
            <div className="profile-photo placeholder">No photo</div>
          )}
        </div>
        <h2 className="cv-name">{name}</h2>

        <ul className="contact-list">
          <li>
            <IconBriefcase />
            <span>{title}</span>
          </li>
          <li>
            <IconHome />
            <span>{location}</span>
          </li>
          <li>
            <IconMail />
            <a href={`mailto:${email}`}>{email}</a>
          </li>
          <li>
            <IconPhone />
            <span>{phone}</span>
          </li>
        </ul>

        <section className="skills-block">
          <h3>
            <IconSpark /> Skills
          </h3>
          <ul className="skills-list">
            {skills.map((s) => (
              <li key={s.name}>
                <div className="skill-row">
                  <span>{s.name}</span>
                  <span className="skill-pct">{s.level}%</span>
                </div>
                <div className="skill-track">
                  <div
                    className="skill-fill"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <main className="cv-main">
        <section className="card section">
          <h3>
            <IconSpark /> Key Summary
          </h3>
          {summary.subtitle && (
            <p className="section-sub">{summary.subtitle}</p>
          )}
          <p className="body-text">{summary.text}</p>
        </section>

        <section className="card section">
          <h3>
            <IconBriefcase /> Work Experience
          </h3>
          <ul className="experience-list">
            {experience.map((job, i) => (
              <li key={`${job.title}-${i}`} className="job">
                <p className="job-title">
                  {job.title}
                  {job.company ? ` / ${job.company}` : ""}
                </p>
                <p className="job-dates">
                  <IconCalendar />
                  <span>
                    {job.startDate}
                    {" — "}
                    {job.endDate ?? "Current"}
                  </span>
                  {job.endDate === null && (
                    <span className="badge-current">Current</span>
                  )}
                </p>
                <p className="body-text">{job.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
