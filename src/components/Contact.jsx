export default function Contact({ data }) {
  const links = [
    { label: "Email", href: data.email ? `mailto:${data.email}` : null, text: data.email },
    { label: "LinkedIn", href: data.linkedin, text: "LinkedIn" },
    { label: "GitHub", href: data.github, text: "GitHub" },
    { label: "Website", href: data.portfolio, text: "Portfolio" },
  ].filter((l) => l.href);

  if (!links.length) return null;

  return (
    <section id="contact" className="section section--contact reveal">
      <div className="section__head">
        <p className="section__label">Contact</p>
        <h2 className="section__title">Let’s connect</h2>
      </div>

      <ul className="contact-links">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer noopener">
              <span className="contact-links__label">{l.label}</span>
              <span className="contact-links__value">{l.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
