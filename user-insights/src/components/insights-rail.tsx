import { ArrowRight, ArrowUpRight, CircleDot } from "lucide-react";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import {
  activitySeed,
  getCountryTotals,
  liveData,
  regions,
  type Region,
  type UserCity,
} from "@/data/insights";
import { cn, compactNumber, preciseNumber } from "@/lib/utils";

const liveConfig = {
  active: { label: "Active users", color: "var(--primary)" },
} satisfies ChartConfig;

export function InsightsRail({
  cities,
  allCities,
  region,
  onRegionChange,
}: {
  cities: UserCity[];
  allCities: UserCity[];
  region: Region;
  onRegionChange: (region: Region) => void;
}) {
  const active = cities.reduce((sum, city) => sum + city.active, 0);
  const countries = getCountryTotals(cities).slice(0, 4);
  const top = countries[0]?.users ?? 1;
  const totalAll = allCities.reduce((sum, city) => sum + city.users, 0);

  return (
    <aside className="insights-rail" aria-label="Live user insights">
      <Card className="rail-card">
        <CardHeader className="rail-header">
          <CardTitle>Insights</CardTitle>
          <span className="rail-live">
            <span className="live-dot" />
            live
          </span>
        </CardHeader>
        <CardContent className="rail-content">
          <section className="rail-section" aria-label="Real-time activity">
            <div className="rail-section-heading">
              <span>Active right now</span>
              <span className="trend-chip">
                <ArrowUpRight aria-hidden="true" />
                12.8%
              </span>
            </div>
            <div className="live-chart-value">{preciseNumber(active)}</div>
            <ChartContainer config={liveConfig} className="live-chart">
              <AreaChart
                accessibilityLayer
                data={liveData}
                margin={{ top: 5, right: 2, left: 2, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.26}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0.015}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 6" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25 }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="var(--primary)"
                  fill="url(#liveGradient)"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
            <span className="chart-footnote">updated a few seconds ago</span>
          </section>
          <Separator />
          <section className="rail-section" aria-label="Top countries">
            <div className="rail-section-heading">
              <span>Top countries</span>
              <span className="subtle-label">users</span>
            </div>
            <div className="country-list">
              {countries.map((country) => (
                <div className="country-row" key={country.country}>
                  <span className="country-identity">
                    <span className="country-flag">{country.flag}</span>
                    <span>{country.country}</span>
                  </span>
                  <span className="country-count">
                    {compactNumber(country.users)}
                  </span>
                  <span className="country-meter">
                    <span
                      style={{ width: `${(country.users / top) * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </section>
          <Separator />
          <section
            className="rail-section"
            aria-label="Audience distribution by region"
          >
            <div className="rail-section-heading">
              <span>Regional distribution</span>
              <span className="subtle-label">share</span>
            </div>
            <div className="distribution-list">
              {regions
                .filter(
                  (item): item is Exclude<Region, "Everywhere"> =>
                    item !== "Everywhere",
                )
                .map((item, index) => {
                  const count = allCities
                    .filter((city) => city.region === item)
                    .reduce((sum, city) => sum + city.users, 0);
                  const percentage = Math.round((count / totalAll) * 100);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "distribution-row",
                        region === item && "distribution-row-selected",
                      )}
                      onClick={() =>
                        onRegionChange(region === item ? "Everywhere" : item)
                      }
                      aria-pressed={region === item}
                    >
                      <span className="distribution-name">
                        <span
                          className={cn(
                            "distribution-dot",
                            `distribution-dot-${index}`,
                          )}
                        />
                        {item}
                      </span>
                      <span className="distribution-track">
                        <span
                          className={cn(
                            "distribution-fill",
                            `distribution-fill-${index}`,
                          )}
                          style={{
                            width: `${Math.min(percentage * 2.1, 100)}%`,
                          }}
                        />
                      </span>
                      <span className="distribution-percent">
                        {percentage}%
                      </span>
                    </button>
                  );
                })}
            </div>
          </section>
          <Separator />
          <section
            className="rail-section activity-section"
            aria-label="Recent user activity"
          >
            <div className="rail-section-heading">
              <span>Recent activity</span>
              <CircleDot className="activity-heading-icon" aria-hidden="true" />
            </div>
            <div className="activity-list">
              {activitySeed.slice(0, 4).map((event) => (
                <div
                  className="activity-row"
                  key={`${event.city}-${event.type}`}
                >
                  <span
                    className={cn(
                      "activity-dot",
                      `activity-dot-${event.accent}`,
                    )}
                  />
                  <div className="activity-copy">
                    <span className="activity-title">
                      {event.type}
                      <span className="activity-city">
                        {" "}
                        · {event.city} {event.flag}
                      </span>
                    </span>
                    <span className="activity-detail">{event.detail}</span>
                  </div>
                  <span className="activity-age">{event.age}</span>
                </div>
              ))}
            </div>
          </section>
          <Button
            variant="ghost"
            size="sm"
            className="view-activity"
            onClick={() =>
              document
                .getElementById("geographic-users")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            Explore all activity
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
