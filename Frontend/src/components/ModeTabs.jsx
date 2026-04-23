export default function ModeTabs({ options, value, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              isActive
                ? "border-cyan-400 bg-cyan-500/10 text-white shadow-soft"
                : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-cyan-500/60 hover:text-white"
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            {option.description && (
              <div className="mt-1 text-sm text-slate-400">{option.description}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
