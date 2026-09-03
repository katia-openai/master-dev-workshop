import { Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { getCountryTotals, type UserCity } from "@/data/insights";
import { compactNumber } from "@/lib/utils";

const engagementConfig = {
  active: { label: "Active users", color: "var(--mint)" },
} satisfies ChartConfig;

export function ActiveEngagementCard({ cities }: { cities: UserCity[] }) {
  const users = cities.reduce((total, city) => total + city.users, 0);
  const active = cities.reduce((total, city) => total + city.active, 0);
  const activeShare = users === 0 ? 0 : (active / users) * 100;
  const countries = getCountryTotals(cities)
    .sort((left, right) => right.active - left.active)
    .slice(0, 6);

  return (
    <Card id="active-engagement" className="analytics-card engagement-card">
      <CardHeader className="analytics-header">
        <div>
          <CardTitle>Active engagement</CardTitle>
          <CardDescription>
            Where your audience is active right now.
          </CardDescription>
        </div>
        <Activity className="section-icon" aria-hidden="true" />
      </CardHeader>
      <CardContent className="analytics-content">
        <div className="chart-headline">
          <span>{compactNumber(active)}</span>
          <span className="chart-comparison">
            {activeShare.toFixed(1)}% of the selected audience
          </span>
        </div>
        <ChartContainer
          config={engagementConfig}
          className="growth-chart"
          aria-label="Active users by country"
        >
          <BarChart
            accessibilityLayer
            data={countries}
            margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 7" />
            <XAxis
              dataKey="country"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickFormatter={(country: string) =>
                country.length > 10 ? `${country.slice(0, 9)}…` : country
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={9}
              width={55}
              tickFormatter={(value: number) => compactNumber(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="active"
              fill="var(--mint)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
