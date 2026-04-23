import { Moon, Sun } from "lucide-react";
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import { useTheme } from "./hooks/useTheme.js";
import logo from "./logo/Studiq_logo.png";

const Header = ({ theme, toggleTheme }) => (
  <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Studiq" className="h-12 w-12 rounded-xl object-cover" />
        <div>
          <p className="text-lg font-semibold text-white">Studiq</p>
          <p className="text-sm text-slate-400">Exam prep workspace</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-500 hover:text-white"
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
      <div className="min-h-screen bg-slate-950">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<ResultsPage />} />
        </Routes>
      </div>
    </div>
  );
}
