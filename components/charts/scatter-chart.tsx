"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScatterChartProps {
  data: Array<{ x: number; y: number; name?: string }>;
  xKey?: string;
  yKey?: string;
  color?: string;
}

export function ScatterChartComponent({
  data,
  xKey = "x",
  yKey = "y",
  color = "hsl(var(--primary))",
}: ScatterChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xKey}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          dataKey={yKey}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Scatter name="Data" data={data} fill={color} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}


