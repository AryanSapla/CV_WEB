import { useRef, useState } from "react";
import { IconDocument, IconImage, IconUpload, IconSpark } from "./Icons.jsx";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({
  id,
  title,
  hint,
  accept,
  optional,
  file,
  onFile,
  variant,
  previewUrl,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function handleFiles(list) {
    const f = list?.[0];
    if (f) onFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function clear(e) {
    e.stopPropagation();
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const filled = Boolean(file);

  return (
    <div
      className={`drop-zone drop-zone--${variant} ${dragOver ? "drop-zone--over" : ""} ${filled ? "drop-zone--filled" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={pick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-labelledby={`${id}-label`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="drop-zone-input"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />

      {variant === "photo" && previewUrl ? (
        <div className="drop-zone-photo-preview">
          <img src={previewUrl} alt="Profile preview" />
          <div className="drop-zone-photo-overlay">
            <IconUpload />
            <span>Change photo</span>
          </div>
        </div>
      ) : filled && variant === "resume" ? (
        <div className="drop-zone-inner drop-zone-inner--success">
          <div className="drop-zone-icon drop-zone-icon--success">
            <IconDocument />
          </div>
          <p className="drop-zone-title">Resume Attached</p>
          <p className="drop-zone-hint">Click or drop to replace</p>
        </div>
      ) : (
        <div className="drop-zone-inner">
          <div className="drop-zone-icon">
            {variant === "photo" ? <IconImage /> : <IconDocument />}
          </div>
          <p className="drop-zone-title" id={`${id}-label`}>
            {title}
            {optional && <span className="drop-zone-optional">optional</span>}
          </p>
          <p className="drop-zone-hint">{hint}</p>
          <span className="drop-zone-cta">
            <IconUpload />
            Browse or Drag File
          </span>
        </div>
      )}

      {filled && (
        <div className="drop-zone-file" onClick={(e) => e.stopPropagation()}>
          <div className="drop-zone-file-meta">
            <span className="drop-zone-file-name">{file.name}</span>
            <span className="drop-zone-file-size">{formatSize(file.size)}</span>
          </div>
          <button type="button" className="drop-zone-remove" onClick={clear}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

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
    <form className="upload-shell" onSubmit={handleSubmit}>
      <div className="upload-card">
        <div className="upload-card-head">
          <h2>Select Resume & Photo</h2>
          <p>
            Drop your resume document (PDF, DOCX, TXT) and an optional profile picture.
          </p>
        </div>

        <div className="upload-grid">
          <DropZone
            id="resume-upload"
            variant="resume"
            title="Resume Document"
            hint="PDF, DOCX, or TXT · Up to 10 MB"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            file={resume}
            onFile={setResume}
          />
          <DropZone
            id="photo-upload"
            variant="photo"
            title="Profile Avatar"
            hint="JPG, PNG, or WebP image"
            optional
            accept="image/*"
            file={photo}
            onFile={onPhotoChange}
            previewUrl={photoPreview}
          />
        </div>

        {error && (
          <div className="upload-error" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary btn-primary--large"
          disabled={loading || !resume}
        >
          {loading ? (
            <>
              <span className="btn-spinner" aria-hidden />
              <span>Analyzing & Extracting CV…</span>
            </>
          ) : (
            <>
              <IconSpark />
              <span>Extract & Generate Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
