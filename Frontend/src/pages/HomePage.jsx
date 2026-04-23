import {
  ArrowRight,
  FileQuestion,
  ListChecks,
  ScanSearch
} from "lucide-react";

import DifficultySelector from "../components/DifficultySelector.jsx";
import FileUploadField from "../components/FileUploadField.jsx";
import ModeTabs from "../components/ModeTabs.jsx";
import {
  DEFAULT_QUESTION_COUNT,
  DIFFICULTY_OPTIONS,
  WORKFLOW_OPTIONS
} from "../constants/app.constants.js";
import { usePrepFlow } from "../hooks/usePrepFlow.js";

const workflowIconMap = {
  pyq: FileQuestion,
  syllabus: ScanSearch,
  topics: ListChecks
};

export default function HomePage() {
  const {
    difficulty,
    error,
    form,
    isSubmitting,
    questionCount,
    setDifficulty,
    setQuestionCount,
    setWorkflow,
    submit,
    topicPreview,
    updateField,
    workflow
  } = usePrepFlow();

  const ActiveIcon = workflowIconMap[workflow];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="eyebrow">Exam prep made simple</div>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Analyze PYQs, build syllabus playlists, and study the right topics first.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Choose one task, add your file or topic list, and get a clear study output without extra setup.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <ModeTabs options={WORKFLOW_OPTIONS} value={workflow} onChange={setWorkflow} />
      </section>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center gap-3">
              <div className="icon-chip">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {workflow === "pyq" && "PYQ Analysis"}
                  {workflow === "syllabus" && "Syllabus to Playlist"}
                  {workflow === "topics" && "Topic Playlist"}
                </p>
                <p className="text-sm text-slate-400">
                  {workflow === "pyq" && "Upload a PDF or image of previous year questions, or paste the text."}
                  {workflow === "syllabus" && "Upload a syllabus image or PDF, or paste syllabus text."}
                  {workflow === "topics" && "Enter topic names line by line or separated by commas."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {workflow === "pyq" && (
                <>
                  <FileUploadField
                    files={form.pyqFiles}
                    onChange={(files) => updateField("pyqFiles", files)}
                    accept=".pdf,image/*"
                    title="Upload PYQ PDFs or images"
                    hint="You can select multiple files. Use clean scans for better extraction."
                  />
                  <textarea
                    rows="8"
                    className="input-base"
                    placeholder="Or paste PYQ text here"
                    value={form.pyqText}
                    onChange={(event) => updateField("pyqText", event.target.value)}
                  />
                  <div>
                    <label htmlFor="questionCount" className="mb-2 block text-sm font-medium text-slate-300">
                      Number of important questions
                    </label>
                    <input
                      id="questionCount"
                      type="number"
                      min="1"
                      max="30"
                      className="input-base max-w-xs"
                      value={questionCount}
                      onChange={(event) => setQuestionCount(Number(event.target.value) || DEFAULT_QUESTION_COUNT)}
                    />
                  </div>
                </>
              )}

              {workflow === "syllabus" && (
                <>
                  <FileUploadField
                    files={form.syllabusFiles}
                    onChange={(files) => updateField("syllabusFiles", files)}
                    accept=".pdf,image/*"
                    title="Upload syllabus images or PDFs"
                    hint="You can select multiple files. Photo, screenshot, or PDF all work."
                  />
                  <textarea
                    rows="8"
                    className="input-base"
                    placeholder="Or paste syllabus text here"
                    value={form.syllabusText}
                    onChange={(event) => updateField("syllabusText", event.target.value)}
                  />
                </>
              )}

              {workflow === "topics" && (
                <>
                  <textarea
                    rows="12"
                    className="input-base"
                    placeholder={"DBMS normalization\nCPU scheduling\nDeadlocks"}
                    value={form.topicsText}
                    onChange={(event) => updateField("topicsText", event.target.value)}
                  />
                  {!!topicPreview.length && (
                    <div className="flex flex-wrap gap-2">
                      {topicPreview.slice(0, 18).map((topic) => (
                        <span key={topic} className="topic-pill">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">Difficulty</p>
                <DifficultySelector options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className="primary-button w-full"
              >
                {isSubmitting ? "Working..." : "Run analysis"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="section-title">What this mode gives you</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {workflow === "pyq" && (
                <>
                  <p>1. Ranked topics pulled from your previous year questions</p>
                  <p>2. A list of the most expected questions in the count you choose</p>
                  <p>3. A quick revision plan for the final round</p>
                </>
              )}
              {workflow === "syllabus" && (
                <>
                  <p>1. Important syllabus topics ranked by priority</p>
                  <p>2. YouTube playlist suggestions for each topic</p>
                  <p>3. A short revision summary to guide your order</p>
                </>
              )}
              {workflow === "topics" && (
                <>
                  <p>1. Ranked topic order based on importance</p>
                  <p>2. YouTube playlists for each topic</p>
                  <p>3. A cleaner study sequence for your subject list</p>
                </>
              )}
            </div>
          </section>

          <section>
            <h2 className="section-title">Quick tips</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Use clear scans for PDFs and images.</p>
              <p>Keep topic names short and specific.</p>
              <p>If API keys are missing, Studiq still returns fallback insights and search links.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
