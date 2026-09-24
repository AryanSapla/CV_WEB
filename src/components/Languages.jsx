export default function Languages({ languages = [] }) {
  if (!languages.length) return null;

  return (
    <section id="languages" className="section section--compact reveal">
      <div className="section__head">
        <p className="section__label">Languages</p>
        <h2 className="section__title">Communication</h2>
      </div>

      <ul className="lang-list">
        {languages.map((l, i) => (
          <li key={`${l.name}-${i}`} className="lang-item">
            <span className="lang-item__name">{l.name}</span>
            {l.proficiency && (
              <span className="lang-item__level">{l.proficiency}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
