import { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm.jsx";
import CvProfile from "./components/CvProfile.jsx";
import {
  IconArrowLeft,
  IconArrowRight,
  IconTrash,
  IconSpark,
  IconCheck,
} from "./components/Icons.jsx";

const STORAGE_KEY = "cv_web_extracted_data";

export default function App() {
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [view, setView] = useState(() => {
    if (window.location.hash === "#profile") return "profile";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? "profile" : "upload";
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with browser history (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.view) {
        setView(e.state.view);
      } else if (window.location.hash === "#profile") {
        setView("profile");
      } else {
        setView("upload");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (targetView) => {
    setView(targetView);
    const hash = targetView === "profile" ? "#profile" : "#upload";
    window.history.pushState({ view: targetView }, "", hash);
  };

  async function handleSubmit({ resume, photo }) {
    setError("");
    setLoading(true);

    const form = new FormData();
    form.append("resume", resume);
    if (photo) form.append("photo", photo);

    try {
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(
          `Server returned invalid response (${res.status}). If on Vercel, please re-deploy so the serverless function takes effect.`
        );
      }

      if (!res.ok) throw new Error(json.error || "Upload failed");

      setResult(json);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      } catch (e) {
        console.warn("Failed to persist to localStorage", e);
      }

      navigateTo("profile");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClearData() {
    if (
      window.confirm(
        "Are you sure you want to clear saved resume data and start fresh?"
      )
    ) {
      setResult(null);
      setError("");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      navigateTo("upload");
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-container">
          <div
            className="navbar-brand"
            onClick={() => navigateTo("upload")}
            role="button"
            tabIndex={0}
          >
            <div className="brand-icon">
              <IconSpark />
            </div>
            <span className="brand-name">CV Web Studio</span>
          </div>

          <div className="nav-steps">
            <button
              type="button"
              className={`nav-step ${view === "upload" ? "active" : ""}`}
              onClick={() => navigateTo("upload")}
            >
              <span className="step-num">1</span>
              <span>Upload CV</span>
            </button>
            <span className="nav-divider">→</span>
            <button
              type="button"
              className={`nav-step ${view === "profile" ? "active" : ""} ${!result ? "disabled" : ""}`}
              disabled={!result}
              onClick={() => result && navigateTo("profile")}
            >
              <span className="step-num">2</span>
              <span>View Profile</span>
              {result && (
                <span className="saved-badge">
                  <IconCheck /> Saved
                </span>
              )}
            </button>
          </div>

          <div className="nav-actions">
            {view === "profile" ? (
              <button
                type="button"
                className="btn-nav"
                onClick={() => navigateTo("upload")}
                title="Go back to upload page"
              >
                <IconArrowLeft />
                <span>Back to Upload</span>
              </button>
            ) : (
              result && (
                <button
                  type="button"
                  className="btn-nav btn-nav--highlight"
                  onClick={() => navigateTo("profile")}
                  title="Forward to extracted profile"
                >
                  <span>Forward to Profile</span>
                  <IconArrowRight />
                </button>
              )
            )}

            {result && (
              <button
                type="button"
                className="btn-nav btn-nav--danger"
                onClick={handleClearData}
                title="Clear current data and upload a new resume"
              >
                <IconTrash />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="app-main">
        {view === "upload" ? (
          <div className="view-container fade-in">
            <header className="hero-header">
              <span className="hero-badge">
                <IconSpark /> AI-POWERED RESUME PARSER
              </span>
              <h1>Extract & Visualize Your CV</h1>
              <p className="hero-subtitle">
                Upload your resume document and photo to generate a high-impact,
                modern profile card automatically.
              </p>
            </header>
            <UploadForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          </div>
        ) : (
          <div className="view-container fade-in">
            {result ? (
              <>
                <div className="profile-toolbar">
                  <div className="toolbar-status">
                    <span className="status-dot"></span>
                    <span>Profile Saved & Active</span>
                  </div>
                  <div className="toolbar-controls">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => navigateTo("upload")}
                    >
                      <IconArrowLeft /> Upload Another Resume
                    </button>
                  </div>
                </div>
                <CvProfile
                  data={result.data}
                  photoDataUrl={result.photoDataUrl}
                />
              </>
            ) : (
              <div className="empty-state card">
                <h2>No Profile Data Found</h2>
                <p>
                  Please upload a resume first to generate your profile card.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigateTo("upload")}
                >
                  <IconArrowLeft /> Go to Upload Page
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
