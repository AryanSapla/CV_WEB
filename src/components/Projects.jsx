export default function Projects({ projects = [] }) {
  if (!projects.length) return null;

  return (
    <section id="projects" className="section reveal">
      <div className="section__head">
        <p className="section__label">Projects</p>
        <h2 className="section__title">Selected work</h2>
      </div>

      <div className="projects-grid">
        {projects.map((project, i) => (
          <article
            key={project.name}
            className={`project-card ${i === 0 ? "project-card--featured" : ""}`}
          >
            <header className="project-card__head">
              <h3 className="project-card__title">{project.name}</h3>
              {project.link && (
                <a
                  href={project.link}
                  className="project-card__link"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View
                </a>
              )}
            </header>
            {project.description && (
              <p className="project-card__desc">{project.description}</p>
            )}
            {project.technologies?.length > 0 && (
              <ul className="chip-list chip-list--compact">
                {project.technologies.map((t) => (
                  <li key={t} className="chip chip--muted">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
