import { Brain, CalendarClock } from "lucide-react";

const renderQuestionText = (question) => {
  if (typeof question === "string") {
    return { text: question, frequency: null };
  }

  return {
    text: question.text,
    frequency: question.frequency ?? null
  };
};

export default function InsightsSection({ insights, mode = "default" }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="icon-chip">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {mode === "pyq" ? "Most Repeated Expected Questions" : "Most Expected Questions"}
            </p>
            <p className="text-sm text-slate-400">
              {mode === "pyq" ? "Picked from the repeated patterns in your submitted PYQs." : "Focused prompts for final revision."}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {insights.expectedQuestions.map((question, index) => {
            const item = renderQuestionText(question);

            return (
              <div key={`${item.text}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <p className="leading-6">{item.text}</p>
                  {item.frequency ? (
                    <span className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200">
                      seen {item.frequency}x
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
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
