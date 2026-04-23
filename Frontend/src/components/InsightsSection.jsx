import { Brain, CalendarClock } from "lucide-react";

export default function InsightsSection({ insights }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="icon-chip">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Most Expected Questions</p>
            <p className="text-sm text-slate-400">Focused prompts for final revision.</p>
          </div>
        </div>
        <div className="space-y-3">
          {insights.expectedQuestions.map((question) => (
            <div key={question} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
              {question}
            </div>
          ))}
        </div>
      </div>
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="icon-chip">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Last Day Revision Plan</p>
            <p className="text-sm text-slate-400">A short plan for the final stretch.</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-300">{insights.revisionPlan}</p>
      </div>
    </section>
  );
}
