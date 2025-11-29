"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  angleKey: string;
  color?: string;
}

export function RadarChartComponent({
  data,
  dataKey,
  angleKey,
  color = "hsl(var(--primary))",
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={angleKey} />
        <PolarRadiusAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Radar
          name="Value"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

