import { FileText, UploadCloud } from "lucide-react";

export default function FileUploadField({ file, onChange }) {
  return (
    <label className="panel-muted flex cursor-pointer items-center gap-4 px-5 py-6 transition hover:border-cyan-400">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
        {file ? <FileText className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{file ? file.name : "Choose a PDF syllabus or notes file"}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {file ? "Ready to extract text from the document." : "We will parse the PDF and feed it into the analyzer."}
        </p>
      </div>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}
