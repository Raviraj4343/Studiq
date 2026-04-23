import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useMemo, useState } from "react";

const PIE_COLORS = ["#22d3ee", "#06b6d4", "#0891b2", "#155e75", "#67e8f9"];

const chartTooltipStyle = {
  backgroundColor: "#020817",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#e2e8f0",
  boxShadow: "0 10px 30px rgba(2, 8, 23, 0.35)"
};

const formatAxisLabel = (value) => (
  value.length > 12 ? `${value.slice(0, 12)}...` : value
);

const formatWeight = (value) => Number(value).toFixed(3);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={chartTooltipStyle} className="min-w-[148px] px-3 py-2 text-sm">
      <p className="font-medium text-slate-100">{label || payload[0].name}</p>
      <p className="mt-1 text-cyan-300">Weight: {formatWeight(payload[0].value)}</p>
    </div>
  );
}

export default function ChartSection({ chartData }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmallScreen(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const pieData = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.values[index]
  }));

  const xAxisInterval = useMemo(() => {
    const totalTopics = pieData.length;
    if (!totalTopics) {
      return 0;
    }

    const targetVisibleTicks = isSmallScreen ? 4 : 7;
    const calculatedInterval = Math.ceil(totalTopics / targetVisibleTicks) - 1;

    return Math.max(0, calculatedInterval);
  }, [isSmallScreen, pieData.length]);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold text-white">Importance Distribution</p>
          <p className="text-sm text-slate-400">Normalized weights for the strongest topics.</p>
        </div>
        <div className="h-[320px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData} margin={{ top: 8, right: 8, left: -20, bottom: isSmallScreen ? 64 : 42 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                tickFormatter={formatAxisLabel}
                angle={isSmallScreen ? -35 : -18}
                textAnchor="end"
                height={isSmallScreen ? 92 : 72}
                interval={xAxisInterval}
                tickMargin={10}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                tickFormatter={(value) => `${value}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34, 211, 238, 0.08)" }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[10, 10, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold text-white">Top 5 Share</p>
          <p className="text-sm text-slate-400">A quick visual of where your exam weight clusters.</p>
        </div>
        <div className="h-[280px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.slice(0, 5)}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={3}
                stroke="#e2e8f0"
                strokeWidth={2}
              >
                {pieData.slice(0, 5).map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {pieData.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="truncate text-slate-200">{item.name}</span>
              </div>
              <span className="text-slate-400">{formatWeight(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
