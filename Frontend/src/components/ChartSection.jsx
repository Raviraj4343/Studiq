import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function ChartSection({ chartData }) {
  const pieData = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.values[index]
  }));

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold">Importance Distribution</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Normalized weights for the strongest topics.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-12} textAnchor="end" height={60} interval={0} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold">Top 5 Share</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">A quick visual of where your exam weight clusters.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.slice(0, 5)}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                fill="#06b6d4"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
