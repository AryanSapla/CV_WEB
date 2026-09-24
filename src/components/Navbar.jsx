import { useEffect, useState } from "react";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({ name, cvDownloadUrl, visibleSections }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  const links = LINKS.filter(
    (l) => l.id === "home" || l.id === "contact" || visibleSections[l.id]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [links]);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
      <div className="site-nav__inner">
        <button
          type="button"
          className="site-nav__brand"
          onClick={() => scrollTo("home")}
        >
          {name?.split(" ")[0] || "Home"}
        </button>

        <nav className="site-nav__links" aria-label="Primary">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`site-nav__link ${active === link.id ? "is-active" : ""}`}
              onClick={() => scrollTo(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {cvDownloadUrl && (
          <a className="site-nav__cta" href={cvDownloadUrl} download>
            Download CV
          </a>
        )}
      </div>
    </header>
  );
}
