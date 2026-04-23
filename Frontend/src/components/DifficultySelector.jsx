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
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "border-cyan-400 bg-cyan-500 text-white shadow-soft"
                : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-cyan-500/60 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
