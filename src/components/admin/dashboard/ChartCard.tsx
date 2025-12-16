import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/interface/adminDashboard";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: ChartData;
  height?: number;
}

export default function ChartCard({
  title,
  data,
  height = 300,
}: ChartCardProps) {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom shape component to handle zero values
  const CustomBarShape = (props: any) => {
    const { payload, fill, x, y, width, height } = props;

    // If value is 0, don't render the bar but keep the data for tooltip
    if (payload && payload.value === 0) {
      return <g />;
    }

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
        ry={4}
      />
    );
  };

  // Calculate stats directly from data array
  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const start = values[0];
  const end = values[values.length - 1];

  let growth = 0;
  if (start === 0 && end > 0) growth = 100;
  else if (start !== 0) growth = Math.round(((end - start) / start) * 100);
  // --------------------------

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-200">
            {`${
              payload[0].payload.label
            }: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }
    return value.toString();
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recharts Chart Area */}
          <div style={{ width: "100%", height: `${height}px` }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={formatYAxis}
                  width={60}
                  // --- FIX DOMAIN YAXIS ---
                  domain={[0, maxValue === 0 ? 100 : maxValue]}
                  // ----------------------
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  shape={CustomBarShape}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Peak</p>
              <p className="text-sm font-semibold">
                {maxValue.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-sm font-semibold">
                {average.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Growth</p>
              <div
                className={`flex items-center justify-center space-x-1 text-sm font-semibold ${
                  growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(growth)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
