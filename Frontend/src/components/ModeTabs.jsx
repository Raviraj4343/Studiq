export default function ModeTabs({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`min-w-28 rounded-2xl px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-white text-slate-900 shadow-soft dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
