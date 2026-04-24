import { Globe, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

const MODAL_COPY = {
  syllabus: {
    eyebrow: "Playlist setup",
    title: "Add your full subject name",
    description: "This helps us return cleaner, more relevant YouTube playlist recommendations for your syllabus."
  },
  topics: {
    eyebrow: "Topic playlist",
    title: "Confirm the subject name",
    description: "A clear subject name helps us group your topics under the right study context before building the playlist."
  },
  playlist: {
    eyebrow: "Playlist setup",
    title: "Add your full subject name",
    description: "Enter the complete subject title so the generated playlist feels more accurate and professional."
  }
};

export default function SubjectPromptModal({
  error,
  isOpen,
  mode,
  onCancel,
  onChange,
  onConfirm,
  value
}) {
  const inputRef = useRef(null);
  const copy = MODAL_COPY[mode] || MODAL_COPY.playlist;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 20);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="subject-modal-backdrop">
      <div className="subject-modal-shell">
        <div className="subject-modal-panel">
          <div className="subject-modal-orb" />

          <div className="subject-modal-header">
            <div className="subject-modal-badge">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </div>

            <div className="subject-modal-brand">
              <div className="subject-modal-icon">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="subject-modal-title">{copy.title}</h2>
                <p className="subject-modal-text">{copy.description}</p>
              </div>
            </div>
          </div>

          <div className="subject-modal-body">
            <label htmlFor="subjectName" className="subject-modal-label">
              Subject name
            </label>
            <input
              ref={inputRef}
              id="subjectName"
              type="text"
              className="subject-modal-input"
              placeholder="Data Structures and Algorithms"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
            <p className="subject-modal-hint">
              Use the complete course title for more relevant playlist suggestions.
            </p>
            {error && <p className="subject-modal-error">{error}</p>}
          </div>

          <div className="subject-modal-actions">
            <button type="button" className="subject-modal-button-muted" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="subject-modal-button-primary" onClick={onConfirm}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
