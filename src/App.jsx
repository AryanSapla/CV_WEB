import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Experience from "./components/Experience.jsx";
import Skills from "./components/Skills.jsx";
import Projects from "./components/Projects.jsx";
import Education from "./components/Education.jsx";
import Certifications from "./components/Certifications.jsx";
import Languages from "./components/Languages.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import { useReveal } from "./hooks/useReveal.js";

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Profile unavailable");
        const json = await res.json();
        if (!cancelled) {
          setProfile(json);
          if (json.data?.name) {
            document.title = `${json.data.name} — ${json.data.title || "Profile"}`;
          }
        }
      } catch {
        if (!cancelled) setError("Unable to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useReveal(profile?.data?.name);

  const visibleSections = useMemo(() => {
    if (!profile?.data) return {};
    const d = profile.data;
    return {
      about: Boolean(d.summary?.text || d.skills?.length),
      experience: (d.experience?.length ?? 0) > 0,
      skills: (d.skills?.length ?? 0) > 0,
      projects: (d.projects?.length ?? 0) > 0,
      education: (d.education?.length ?? 0) > 0,
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="site-loading">
        <div className="site-loading__pulse" aria-hidden />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !profile?.data) {
    return (
      <div className="site-loading site-loading--error">
        <p>{error || "Profile unavailable."}</p>
      </div>
    );
  }

  const { data, photoUrl, cvDownloadUrl } = profile;

  return (
    <div className="site">
      <Navbar
        name={data.name}
        cvDownloadUrl={cvDownloadUrl}
        visibleSections={visibleSections}
      />
      <main>
        <Hero data={data} photoUrl={photoUrl} cvDownloadUrl={cvDownloadUrl} />
        <About data={data} />
        <Experience experience={data.experience} />
        <Skills skills={data.skills} />
        <Projects projects={data.projects} />
        <Education education={data.education} />
        <Certifications certifications={data.certifications} />
        <Languages languages={data.languages} />
        <Contact data={data} />
      </main>
      <Footer name={data.name} />
    </div>
  );
}
