export default function DifficultySelector({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-cyan-500 text-white shadow-soft"
                : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
