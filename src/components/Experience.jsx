import { formatDateRange } from "../utils/profile.js";

export default function Experience({ experience = [] }) {
  if (!experience.length) return null;

  return (
    <section id="experience" className="section reveal">
      <div className="section__head">
        <p className="section__label">Experience</p>
        <h2 className="section__title">Where I’ve worked</h2>
      </div>

      <ol className="timeline">
        {experience.map((job, i) => {
          const range = formatDateRange(job.startDate, job.endDate);
          const bullets =
            job.responsibilities?.length > 0
              ? job.responsibilities
              : job.description && job.description !== "—"
                ? [job.description]
                : [];

          return (
            <li key={`${job.title}-${job.company}-${i}`} className="timeline__item">
              <div className="timeline__marker" aria-hidden />
              <article className="timeline__card">
                <header className="timeline__header">
                  <div>
                    <h3 className="timeline__role">{job.title}</h3>
                    {job.company && (
                      <p className="timeline__company">{job.company}</p>
                    )}
                  </div>
                  {range && <time className="timeline__dates">{range}</time>}
                </header>
                {job.location && (
                  <p className="timeline__location">{job.location}</p>
                )}
                {bullets.length > 0 && (
                  <ul className="timeline__bullets">
                    {bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
