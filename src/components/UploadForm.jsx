import { useState } from "react";

export default function UploadForm({ onSubmit, loading, error }) {
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function onPhotoChange(file) {
    setPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!resume) return;
    onSubmit({ resume, photo });
  }

  return (
    <form className="upload-card" onSubmit={handleSubmit}>
      <div className="upload-grid">
        <label className="field">
          <span className="field-label">Resume (PDF, DOCX, or TXT)</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            required
          />
          {resume && <span className="file-name">{resume.name}</span>}
        </label>

        <label className="field">
          <span className="field-label">Profile photo (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
          />
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="photo-preview" />
          )}
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading || !resume}>
        {loading ? "Extracting…" : "Extract CV data"}
      </button>
    </form>
  );
}
