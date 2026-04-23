import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <div className="panel p-8 text-center">
        <p className="text-2xl font-semibold">No study run yet</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Start with a syllabus, topic list, or PDF and the dashboard will appear here.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
