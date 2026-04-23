import { Brain, CalendarClock } from "lucide-react";

export default function InsightsSection({ insights }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Most Expected Questions</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Focused prompts for final revision.</p>
          </div>
        </div>
        <div className="space-y-3">
          {insights.expectedQuestions.map((question) => (
            <div key={question} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/80">
              {question}
            </div>
          ))}
        </div>
      </div>
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Last Day Revision Plan</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">An AI-generated sprint plan for the final stretch.</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{insights.revisionPlan}</p>
      </div>
    </section>
  );
}
