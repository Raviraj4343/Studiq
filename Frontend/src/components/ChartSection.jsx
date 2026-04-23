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
          <p className="text-lg font-semibold text-white">Importance Distribution</p>
          <p className="text-sm text-slate-400">Normalized weights for the strongest topics.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#cbd5e1" }} angle={-12} textAnchor="end" height={60} interval={0} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 12, fill: "#cbd5e1" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020817",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                  color: "#e2e8f0"
                }}
              />
              <Bar dataKey="value" fill="#22d3ee" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel p-6">
        <div className="mb-4">
          <p className="text-lg font-semibold text-white">Top 5 Share</p>
          <p className="text-sm text-slate-400">A quick visual of where your exam weight clusters.</p>
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
                fill="#22d3ee"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020817",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                  color: "#e2e8f0"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
