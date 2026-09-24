import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import CvProfile from "./components/CvProfile.jsx";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit({ resume, photo }) {
    setError("");
    setLoading(true);
    setResult(null);

    const form = new FormData();
    form.append("resume", resume);
    if (photo) form.append("photo", photo);

    try {
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>CV Extractor</h1>
        <p>Upload a resume and photo — we pull out contact info, skills, summary, and experience.</p>
      </header>

      {!result ? (
        <UploadForm onSubmit={handleSubmit} loading={loading} error={error} />
      ) : (
        <>
          <div className="toolbar">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Upload another
            </button>
          </div>
          <CvProfile data={result.data} photoDataUrl={result.photoDataUrl} />
        </>
      )}
    </div>
  );
}
