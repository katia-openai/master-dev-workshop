import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGrowthData, type Period, type UserCity } from "@/data/insights";
import { compactNumber } from "@/lib/utils";

const growthConfig = {
  users: { label: "This period", color: "var(--primary)" },
  previous: { label: "Previous period", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function AudienceChart({
  cities,
  period,
  onPeriodChange,
}: {
  cities: UserCity[];
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const data = getGrowthData(period, cities);
  const last = data.at(-1);

  return (
    <Card id="audience-growth" className="analytics-card growth-card">
      <CardHeader className="analytics-header">
        <div>
          <CardTitle>Audience growth</CardTitle>
          <CardDescription>
            How your audience is growing, day by day.
          </CardDescription>
        </div>
        <Tabs
          value={period}
          onValueChange={(value) => onPeriodChange(value as Period)}
        >
          <TabsList className="period-tabs" aria-label="Chart time period">
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="28d">28 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="analytics-content">
        <div className="chart-headline">
          <span>{compactNumber(last?.users ?? 0, 2)}</span>
          <span className="chart-growth">
            <ArrowUpRight aria-hidden="true" />
            18.6%
          </span>
          <span className="chart-comparison">vs. previous period</span>
        </div>
        <ChartContainer config={growthConfig} className="growth-chart">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="growthPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="90%"
                  stopColor="var(--primary)"
                  stopOpacity={0.025}
                />
              </linearGradient>
              <linearGradient id="growthPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 7" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={48}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={9}
              width={55}
              tickFormatter={(value: number) => compactNumber(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="var(--chart-3)"
              strokeWidth={1.5}
              fill="url(#growthPrevious)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#growthPrimary)"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
        <div className="chart-legend">
          <span>
            <i className="legend-current" />
            This period
          </span>
          <span>
            <i className="legend-previous" />
            Previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
