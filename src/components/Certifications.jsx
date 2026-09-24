export default function Certifications({ certifications = [] }) {
  if (!certifications.length) return null;

  return (
    <section id="certifications" className="section reveal">
      <div className="section__head">
        <p className="section__label">Certifications</p>
        <h2 className="section__title">Credentials & achievements</h2>
      </div>

      <ul className="cert-list">
        {certifications.map((c, i) => (
          <li key={`${c.name}-${i}`} className="cert-item">
            <span className="cert-item__name">{c.name}</span>
            {(c.issuer || c.date) && (
              <span className="cert-item__meta">
                {[c.issuer, c.date].filter(Boolean).join(" · ")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
