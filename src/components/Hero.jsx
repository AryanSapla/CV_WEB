import { getInitials, shortSummary } from "../utils/profile.js";

export default function Hero({ data, photoUrl, cvDownloadUrl }) {
  const tagline = shortSummary(data) || data.summary?.text;
  const initials = getInitials(data.name);

  const links = [
    { label: "LinkedIn", href: data.linkedin },
    { label: "GitHub", href: data.github },
    { label: "Portfolio", href: data.portfolio },
  ].filter((l) => l.href);

  return (
    <section id="home" className="hero">
      <div className="hero__grid reveal">
        <div className="hero__content">
          <p className="hero__eyebrow">{data.title}</p>
          <h1 className="hero__title">{data.name}</h1>
          {tagline && <p className="hero__summary">{tagline}</p>}

          <ul className="hero__meta">
            {data.location && <li>{data.location}</li>}
            {data.email && (
              <li>
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </li>
            )}
          </ul>

          {links.length > 0 && (
            <ul className="hero__links">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer noopener">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="hero__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() =>
                document
                  .getElementById("experience")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Experience
            </button>
            {data.projects?.length > 0 && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  document
                    .getElementById("projects")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Projects
              </button>
            )}
            {cvDownloadUrl && (
              <a className="btn btn--ghost" href={cvDownloadUrl} download>
                Download CV
              </a>
            )}
          </div>
        </div>

        <div className="hero__visual" aria-hidden={!photoUrl}>
          {photoUrl ? (
            <img src={photoUrl} alt={data.name} className="hero__photo" />
          ) : (
            <div className="hero__monogram">
              <span>{initials}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
