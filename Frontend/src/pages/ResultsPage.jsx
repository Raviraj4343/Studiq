import { ArrowLeft, BarChart3, BookOpenText, ListChecks } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import ChartSection from "../components/ChartSection.jsx";
import EmptyState from "../components/EmptyState.jsx";
import InsightsSection from "../components/InsightsSection.jsx";
import PlaylistSection from "../components/PlaylistSection.jsx";
import TopicBadges from "../components/TopicBadges.jsx";
import { SESSION_KEYS } from "../constants/app.constants.js";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
    <div className="flex items-center gap-3">
      <div className="icon-chip">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default function ResultsPage() {
  const location = useLocation();
  const fallbackResult = window.sessionStorage.getItem(SESSION_KEYS.RESULTS);
  const result = location.state?.result || (fallbackResult ? JSON.parse(fallbackResult) : null);

  if (!result) {
    return <EmptyState />;
  }

  const isPyqWorkflow = result.meta?.workflow === "pyq";
  const pyqEvidence = result.insights?.evidence;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">{result.meta?.title || "Study output"}</div>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Results</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {result.meta?.description || result.summary.strategy}
          </p>
        </div>
        <Link to="/" className="secondary-button">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {isPyqWorkflow ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard icon={BarChart3} label="Questions requested" value={result.meta?.questionCount || result.insights?.expectedQuestions?.length || 0} />
            <StatCard icon={ListChecks} label="Repeated question groups" value={pyqEvidence?.repeatedQuestionCount || 0} />
            <StatCard icon={BookOpenText} label="Questions scanned" value={pyqEvidence?.totalQuestionCandidates || 0} />
          </section>

          {!!pyqEvidence?.relatedQuestionGroupCount && (
            <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon={ListChecks} label="Same-topic related groups" value={pyqEvidence.relatedQuestionGroupCount} />
            </section>
          )}

          {!!pyqEvidence?.recommendedTopics?.length && (
            <section className="mt-8 scroll-mt-24">
              <h2 className="section-title">High-scoring topics to maximize marks</h2>
              <div className="mt-4">
                <TopicBadges topics={pyqEvidence.recommendedTopics.map((name) => ({ name }))} />
              </div>
            </section>
          )}

          {!!result.insights && (
            <div className="mt-8">
              <InsightsSection insights={result.insights} mode="pyq" />
            </div>
          )}
        </>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard icon={BarChart3} label="Difficulty" value={result.summary.difficulty} />
            <StatCard icon={ListChecks} label="Priority topics" value={result.summary.totalTopics} />
            <StatCard icon={BookOpenText} label="Focus" value={result.summary.primaryFocus} />
          </section>

          <section className="mt-8 scroll-mt-24">
            <h2 className="section-title">Top topics</h2>
            <div className="mt-4">
              <TopicBadges topics={result.mostImportantTopics.slice(0, 10)} />
            </div>
          </section>

          <div className="mt-8 space-y-8">
            <ChartSection chartData={result.chartData} />
            {!!result.playlist?.length && <PlaylistSection playlist={result.playlist} />}
            {!!result.insights && <InsightsSection insights={result.insights} />}
          </div>
        </>
      )}
    </main>
  );
}
