import { FileImage, FileText, UploadCloud, X } from "lucide-react";

const fileIcon = (files) => {
  if (!files?.length) {
    return UploadCloud;
  }

  if (files.every((file) => file.type === "application/pdf")) {
    return FileText;
  }

  return FileImage;
};

export default function FileUploadField({
  files = [],
  onChange,
  accept,
  title,
  hint
}) {
  const Icon = fileIcon(files);

  const handleFileSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    if (!incomingFiles.length) {
      return;
    }

    const existing = new Map(files.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file]));
    for (const file of incomingFiles) {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      existing.set(key, file);
    }

    onChange(Array.from(existing.values()));
    event.target.value = "";
  };

  const removeFile = (indexToRemove) => {
    onChange(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="upload-field flex cursor-pointer items-center gap-4">
        <div className="icon-chip">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : title}</p>
          <p className="mt-1 text-sm text-slate-400">{files.length ? "Files ready for analysis." : hint}</p>
        </div>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleFileSelection}
        />
      </label>

      {!!files.length && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
              <p className="truncate text-sm text-slate-300">{file.name}</p>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
