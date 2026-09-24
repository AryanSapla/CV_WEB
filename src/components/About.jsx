import { deriveStrengths } from "../utils/profile.js";

export default function About({ data }) {
  const strengths = deriveStrengths(data.skills);
  const intro = data.summary?.text;
  const subtitle = data.summary?.subtitle;

  if (!intro && strengths.length === 0) return null;

  return (
    <section id="about" className="section reveal">
      <div className="section__head">
        <p className="section__label">About</p>
        <h2 className="section__title">Background & strengths</h2>
      </div>

      <div className="about__grid">
        <div className="about__main">
          {subtitle && <p className="about__subtitle">{subtitle}</p>}
          {intro && <p className="about__text">{intro}</p>}
        </div>

        {strengths.length > 0 && (
          <aside className="about__aside">
            <h3 className="about__aside-title">Key strengths</h3>
            <ul className="about__strengths">
              {strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
