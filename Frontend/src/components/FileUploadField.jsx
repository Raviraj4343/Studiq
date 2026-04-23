import { FileImage, FileText, UploadCloud, X } from "lucide-react";

const fileIcon = (file) => {
  if (!file) {
    return UploadCloud;
  }

  if (file.type === "application/pdf") {
    return FileText;
  }

  return FileImage;
};

export default function FileUploadField({
  file,
  onChange,
  accept,
  title,
  hint
}) {
  const Icon = fileIcon(file);

  return (
    <div className="space-y-3">
      <label className="upload-field flex cursor-pointer items-center gap-4">
        <div className="icon-chip">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{file ? file.name : title}</p>
          <p className="mt-1 text-sm text-slate-400">{file ? "File ready for analysis." : hint}</p>
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <X className="h-4 w-4" />
          Remove file
        </button>
      )}
    </div>
  );
}
