"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DoughnutChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
];

export function DoughnutChartComponent({
  data,
  colors = DEFAULT_COLORS,
}: DoughnutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          innerRadius={50}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

