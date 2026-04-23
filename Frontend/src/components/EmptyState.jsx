import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <div className="panel p-8 text-center">
        <p className="text-2xl font-semibold text-white">No results yet</p>
        <p className="mt-3 text-sm text-slate-400">
          Start with PYQ analysis, syllabus upload, or a topic list.
        </p>
        <Link
          to="/"
          className="primary-button mx-auto mt-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
