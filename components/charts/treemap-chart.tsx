"use client";

import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TreemapChartProps {
  data: Array<{ name: string; value: number }>;
  color?: string;
}

export function TreemapChartComponent({
  data,
  color = "hsl(var(--primary))",
}: TreemapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="value"
        stroke="hsl(var(--border))"
        fill={color}
        content={<CustomTooltip />}
      />
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{payload[0].payload.name}</p>
        <p className="text-sm text-muted-foreground">
          Value: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
}


