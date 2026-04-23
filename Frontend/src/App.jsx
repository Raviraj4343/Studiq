import { Moon, Sparkles, Sun } from "lucide-react";
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import { useTheme } from "./hooks/useTheme.js";

const Header = ({ theme, toggleTheme }) => (
  <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-soft">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold">Studiq</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI exam prep workspace</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        aria-label="Toggle theme"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  </header>
);

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<ResultsPage />} />
        </Routes>
      </div>
    </div>
  );
}
