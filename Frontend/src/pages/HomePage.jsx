import { ArrowRight, FileText, ListChecks, Sparkles, Type } from "lucide-react";

import DifficultySelector from "../components/DifficultySelector.jsx";
import FileUploadField from "../components/FileUploadField.jsx";
import ModeTabs from "../components/ModeTabs.jsx";
import { DIFFICULTY_OPTIONS, INPUT_MODES } from "../constants/app.constants.js";
import { usePrepFlow } from "../hooks/usePrepFlow.js";

const modeIconMap = {
  text: Type,
  topics: ListChecks,
  pdf: FileText
};

export default function HomePage() {
  const {
    difficulty,
    error,
    form,
    inputMode,
    isSubmitting,
    topicPreview,
    setDifficulty,
    setInputMode,
    submit,
    updateField
  } = usePrepFlow();

  const ActiveModeIcon = modeIconMap[inputMode];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Smarter ranking, playlists, and AI revision support
            </div>
            <div>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Study the right topics first, not just the loudest ones.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Paste a syllabus, upload a PDF, or drop in a topic list. Studiq finds what matters, maps it to learning videos,
                and gives you a tight revision plan for the final run-up.
              </p>
            </div>
          </div>

          <div className="panel p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Input Workspace</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose your source and set the preparation intensity.</p>
              </div>
              <ModeTabs options={INPUT_MODES} value={inputMode} onChange={setInputMode} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <ActiveModeIcon className="h-5 w-5" />
                  </div>
                  {inputMode === "text" && "Paste your syllabus or exam scope"}
                  {inputMode === "topics" && "Add one topic per line or separate with commas"}
                  {inputMode === "pdf" && "Upload a PDF and let Studiq extract the text"}
                </div>

                {inputMode === "text" && (
                  <textarea
                    rows="12"
                    className="input-base resize-none"
                    placeholder="Example: Operating systems, CPU scheduling, deadlocks, memory management..."
                    value={form.syllabus}
                    onChange={(event) => updateField("syllabus", event.target.value)}
                  />
                )}

                {inputMode === "topics" && (
                  <>
                    <textarea
                      rows="12"
                      className="input-base resize-none"
                      placeholder={"Operating systems\nDBMS normalization\nRound robin scheduling"}
                      value={form.topicsText}
                      onChange={(event) => updateField("topicsText", event.target.value)}
                    />
                    {!!topicPreview.length && (
                      <div className="panel-muted px-4 py-4">
                        <p className="mb-3 text-sm font-medium">Topic preview</p>
                        <div className="flex flex-wrap gap-2">
                          {topicPreview.slice(0, 12).map((topic) => (
                            <span
                              key={topic}
                              className="rounded-2xl bg-white px-3 py-1 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {inputMode === "pdf" && (
                  <FileUploadField file={form.pdfFile} onChange={(file) => updateField("pdfFile", file)} />
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">Difficulty</p>
                  <DifficultySelector options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500"
                >
                  {isSubmitting ? "Analyzing..." : "Build my dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="panel-muted p-4">
                  <p className="text-sm font-medium">What you get</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li>Top-priority topics with normalized weights</li>
                    <li>Ranked learning playlist for each topic</li>
                    <li>Expected questions and a last-day revision plan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel overflow-hidden p-6">
            <p className="text-lg font-semibold">Built for daily use</p>
            <div className="mt-6 space-y-4">
              {[
                "Theory subjects lean into concepts first.",
                "Problem-heavy subjects surface examples before drills.",
                "Video ranking balances reach, approval, and exam relevance."
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <p className="text-lg font-semibold">Result preview</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top topics</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["CPU scheduling", "Normalization", "Deadlocks", "Paging"].map((item) => (
                    <span key={item} className="rounded-2xl bg-cyan-50 px-3 py-1 text-sm text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI insights</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Expect questions around scheduling trade-offs, normalization forms, and memory-management comparisons.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
