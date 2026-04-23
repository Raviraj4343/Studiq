import { Brain, CalendarClock } from "lucide-react";

const sanitizeDisplayText = (value = "") => value
  .replace(/\[[^\]]*\]/g, " ")
  .replace(/(?:^|\s)[^a-z0-9\s]{3,}(?:\s*[a-z])?(?=\s|$)/gi, " ")
  .replace(/\s*\/+\s*/g, " ")
  .replace(/\s+[/:|\\]+\s*/g, " ")
  .replace(/\b(?!a\b|i\b)[a-z]\b/gi, " ")
  .replace(/\s+/g, " ")
  .replace(/[.:\-/ ]+$/g, "")
  .trim();

const renderQuestionText = (question) => {
  if (typeof question === "string") {
    return { text: sanitizeDisplayText(question), frequency: null };
  }

  return {
    text: sanitizeDisplayText(question.text),
    frequency: question.frequency ?? null
  };
};

const inferRevisionTheme = (questions) => {
  const corpus = questions.map((item) => item.text.toLowerCase()).join(" ");

  const constitutionScore = ["constitution", "president", "supreme court", "panchayat", "election", "directive principles", "fundamental rights", "governor", "judiciary"]
    .filter((token) => corpus.includes(token)).length;
  const scienceScore = ["derive", "equation", "mechanism", "diagram", "reaction", "algorithm", "circuit", "numerical", "proof"]
    .filter((token) => corpus.includes(token)).length;

  if (constitutionScore >= scienceScore && constitutionScore >= 2) {
    return {
      label: "Polity-heavy paper",
      guidance: "Prioritize article-linked definitions, powers/functions comparison tables, and role-based answers."
    };
  }

  if (scienceScore >= 2) {
    return {
      label: "Technical/theory paper",
      guidance: "Prioritize derivations, labeled diagrams, and method-first answer structures."
    };
  }

  return {
    label: "Mixed theory paper",
    guidance: "Prioritize high-frequency concepts first, then move to short-note and comparison variants."
  };
};

const clampMinutes = (value, min, max) => Math.max(min, Math.min(max, Math.round(value)));

const estimateQuestionComplexity = (question) => {
  const wordCount = question.text.split(/\s+/).filter(Boolean).length;
  const longFormBoost = wordCount >= 18 ? 1.2 : wordCount >= 12 ? 0.7 : 0.3;
  const analyticalBoost = /(compare|differentiate|analy[sz]e|evaluate|discuss|critically)/i.test(question.text) ? 1 : 0;
  const repeatBoost = question.frequency && question.frequency >= 4 ? 0.8 : question.frequency && question.frequency >= 3 ? 0.4 : 0;

  return longFormBoost + analyticalBoost + repeatBoost;
};

const estimateRevisionTimings = (questions) => {
  const round1Set = questions.slice(0, Math.min(5, questions.length));
  const round2Set = questions.slice(0, Math.min(3, questions.length));

  const round1Minutes = clampMinutes(
    round1Set.reduce((sum, question) => sum + 4 + estimateQuestionComplexity(question) * 2.2, 8),
    18,
    60
  );

  const round2Minutes = clampMinutes(
    round2Set.reduce((sum, question) => sum + 10 + estimateQuestionComplexity(question) * 3.6, 10),
    25,
    75
  );

  return {
    round1Minutes,
    round2Minutes,
    round1Count: round1Set.length,
    round2Count: round2Set.length
  };
};

const buildRevisionSteps = (questions, theme) => {
  if (!questions.length) {
    return [
      "Re-check PYQ extraction quality and upload cleaner scans if needed.",
      "Revise constitutional definitions, articles, and landmark provisions.",
      "Practice one timed mixed answer set to lock recall under exam pressure."
    ];
  }

  const timings = estimateRevisionTimings(questions);

  return [
    `Round 1 (${timings.round1Minutes} min, calculated now): Revise top ${timings.round1Count} repeated questions, underline core directives/articles/keywords, and mark 3 must-write answers.`,
    `Round 2 (${timings.round2Minutes} min, calculated now): ${theme.label === "Polity-heavy paper" ? `Write ${timings.round2Count} timed answers (powers/functions + constitutional process style)` : `Write ${timings.round2Count} timed long-answer drafts`} with strict exam timing.`,
    `Round 3 (20 min): ${theme.guidance}`
  ];
};

export default function InsightsSection({ insights, mode = "default" }) {
  const hasQuestions = Array.isArray(insights.expectedQuestions) && insights.expectedQuestions.length > 0;
  const normalizedQuestions = hasQuestions
    ? insights.expectedQuestions.map((question) => renderQuestionText(question)).filter((item) => item.text)
    : [];
  const topRevisionQuestions = normalizedQuestions.slice(0, 4);
  const revisionTheme = inferRevisionTheme(normalizedQuestions);
  const revisionSteps = buildRevisionSteps(normalizedQuestions, revisionTheme);
  const revisionSummary = sanitizeDisplayText(insights.revisionPlan || "");

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
          {normalizedQuestions.length ? normalizedQuestions.map((item, index) => {
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
          }) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              No strong repeated question patterns were detected. Add more PYQ pages or clearer text to get better repeated-question matches.
            </div>
          )}
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

        {mode !== "pyq" && !!revisionSummary && (
          <p className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm leading-6 text-slate-200">
            {revisionSummary}
          </p>
        )}

        {mode === "pyq" && (
          <div className="mb-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Adaptive focus</p>
            <p className="mt-1 text-sm font-medium text-white">{revisionTheme.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{revisionTheme.guidance}</p>
          </div>
        )}

        {mode === "pyq" && topRevisionQuestions.length > 0 && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Top repeated questions to revise first</p>
            <div className="mt-3 space-y-2">
              {topRevisionQuestions.map((item, index) => (
                <div key={`${item.text}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <p className="leading-6">{index + 1}. {item.text}</p>
                    {item.frequency ? (
                      <span className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200">
                        {item.frequency}x
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {revisionSteps.map((step, index) => (
            <div key={`${step}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-200">
                  {index + 1}
                </span>
                <p className="leading-6">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
