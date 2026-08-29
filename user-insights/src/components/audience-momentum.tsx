import { ArrowDownRight, ArrowUpRight, Gauge } from "lucide-react";
import { Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  getCountryMomentum,
  type Period,
  type UserCity,
} from "@/data/insights";
import { cn } from "@/lib/utils";

const momentumConfig = {
  change: { label: "Audience movement", color: "var(--mint)" },
} satisfies ChartConfig;

export function AudienceMomentum({
  cities,
  period,
  selectedCountry,
  onCountrySelect,
}: {
  cities: UserCity[];
  period: Period;
  selectedCountry?: string;
  onCountrySelect: (country: string | undefined) => void;
}) {
  const countries = getCountryMomentum(period, cities);
  const fastest = countries[0];
  const gaining = countries
    .filter((country) => country.momentum >= 0)
    .slice(0, 2);
  const slowing = countries
    .filter((country) => country.momentum < 0)
    .sort((left, right) => left.momentum - right.momentum)
    .slice(0, 2);

  if (!fastest) return null;

  const selectCountry = (country: string) => {
    onCountrySelect(selectedCountry === country ? undefined : country);
  };

  return (
    <Card id="audience-momentum" className="analytics-card momentum-card">
      <CardHeader className="analytics-header">
        <div>
          <CardTitle>Audience momentum</CardTitle>
          <CardDescription>
            Where activity is picking up or easing off this period.
          </CardDescription>
        </div>
        <Gauge className="section-icon" aria-hidden="true" />
      </CardHeader>
      <CardContent className="momentum-content">
        <div className="momentum-feature">
          <div className="momentum-feature-copy">
            <span className="momentum-kicker">Fastest-growing country</span>
            <button
              type="button"
              className={cn(
                "momentum-country-button",
                selectedCountry === fastest.country &&
                  "momentum-country-selected",
              )}
              onClick={() => selectCountry(fastest.country)}
              aria-pressed={selectedCountry === fastest.country}
            >
              <span>{fastest.flag}</span>
              {fastest.country}
              <ArrowUpRight aria-hidden="true" />
            </button>
            <span className="momentum-value">
              +{fastest.momentum.toFixed(1)} pts
            </span>
            <span className="momentum-note">
              ahead of the selected region
            </span>
          </div>
          <ChartContainer
            config={momentumConfig}
            className="momentum-trend"
            aria-label={`${fastest.country} audience trend for the selected period`}
          >
            <AreaChart
              data={fastest.trend}
              margin={{ top: 8, right: 2, bottom: 2, left: 2 }}
            >
              <defs>
                <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--mint)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--mint)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="change"
                stroke="var(--mint)"
                strokeWidth={2}
                fill="url(#momentumGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="momentum-lists">
          <MomentumList
            title="Gaining speed"
            countries={gaining}
            selectedCountry={selectedCountry}
            onSelect={selectCountry}
          />
          <MomentumList
            title="Slowing down"
            countries={slowing}
            selectedCountry={selectedCountry}
            onSelect={selectCountry}
            slowing
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MomentumList({
  title,
  countries,
  selectedCountry,
  onSelect,
  slowing = false,
}: {
  title: string;
  countries: ReturnType<typeof getCountryMomentum>;
  selectedCountry?: string;
  onSelect: (country: string) => void;
  slowing?: boolean;
}) {
  return (
    <section className="momentum-list" aria-label={title}>
      <span className="momentum-list-title">{title}</span>
      {countries.map((country) => (
        <button
          key={country.country}
          type="button"
          className={cn(
            "momentum-row",
            selectedCountry === country.country && "momentum-row-selected",
          )}
          onClick={() => onSelect(country.country)}
          aria-pressed={selectedCountry === country.country}
        >
          <span className="momentum-row-name">
            <span>{country.flag}</span>
            {country.country}
          </span>
          <span
            className={cn(
              "momentum-row-value",
              slowing && "momentum-row-value-negative",
            )}
          >
            {slowing ? (
              <ArrowDownRight aria-hidden="true" />
            ) : (
              <ArrowUpRight aria-hidden="true" />
            )}
            {Math.abs(country.momentum).toFixed(1)} pts
          </span>
        </button>
      ))}
    </section>
  );
}
