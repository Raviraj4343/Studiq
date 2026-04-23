import { ArrowLeft, BarChart3, BrainCircuit, Layers3 } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

import ChartSection from "../components/ChartSection.jsx";
import EmptyState from "../components/EmptyState.jsx";
import InsightsSection from "../components/InsightsSection.jsx";
import PlaylistSection from "../components/PlaylistSection.jsx";
import TopicBadges from "../components/TopicBadges.jsx";
import { SESSION_KEYS } from "../constants/app.constants.js";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="panel p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
            <BrainCircuit className="h-4 w-4" />
            {result.summary.subjectType} subject • {result.summary.primaryFocus} first
          </div>
          <h1 className="text-3xl font-semibold">Results Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.summary.strategy}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          New analysis
        </Link>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={BarChart3} label="Difficulty" value={result.summary.difficulty} />
        <StatCard icon={Layers3} label="Priority topics" value={result.summary.totalTopics} />
        <StatCard icon={BrainCircuit} label="Primary study focus" value={result.summary.primaryFocus} />
      </section>

      <section className="panel mb-8 p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold">Top Topics</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">The five strongest areas to hit first.</p>
        </div>
        <TopicBadges topics={result.mostImportantTopics.slice(0, 5)} />
      </section>

      <div className="space-y-8">
        <ChartSection chartData={result.chartData} />
        <PlaylistSection playlist={result.playlist} />
        <InsightsSection insights={result.insights} />
      </div>
    </main>
  );
}
