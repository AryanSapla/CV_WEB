export default function Education({ education = [] }) {
  if (!education.length) return null;

  return (
    <section id="education" className="section reveal">
      <div className="section__head">
        <p className="section__label">Education</p>
        <h2 className="section__title">Academic background</h2>
      </div>

      <ul className="education-list">
        {education.map((ed, i) => (
          <li key={`${ed.institution}-${i}`} className="education-card">
            <div className="education-card__main">
              <h3 className="education-card__degree">{ed.degree}</h3>
              <p className="education-card__school">{ed.institution}</p>
              {ed.field && <p className="education-card__field">{ed.field}</p>}
            </div>
            <div className="education-card__meta">
              {ed.dates && ed.dates !== "—" && (
                <span className="education-card__dates">{ed.dates}</span>
              )}
              {ed.gpa && <span className="education-card__gpa">{ed.gpa}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
