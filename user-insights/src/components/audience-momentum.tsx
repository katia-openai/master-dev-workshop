import { ArrowDownRight, ArrowUpRight, Gauge } from "lucide-react";
import { Line, LineChart, XAxis } from "recharts";
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
import {
  getCountryTotals,
  getGrowthData,
  type Period,
  type UserCity,
} from "@/data/insights";
import { cn } from "@/lib/utils";

const momentumConfig = {
  users: { label: "Audience", color: "var(--mint)" },
} satisfies ChartConfig;

const periodLabels: Record<Period, string> = {
  "7d": "7 days",
  "28d": "28 days",
  "90d": "90 days",
};

type MomentumCountry = ReturnType<typeof getCountryTotals>[number] & {
  difference: number;
};

export function AudienceMomentum({
  cities,
  period,
  selectedCountry,
  onCountrySelect,
}: {
  cities: UserCity[];
  period: Period;
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}) {
  const countries = getCountryTotals(cities);
  const averageGrowth =
    countries.reduce((total, country) => total + country.growth, 0) /
    Math.max(countries.length, 1);
  const momentum = countries.map((country) => ({
    ...country,
    difference: country.growth - averageGrowth,
  }));
  const fastest = [...momentum].sort(
    (left, right) => right.growth - left.growth,
  )[0];
  const gainers = momentum
    .filter(
      (country) =>
        country.difference >= 0 && country.country !== fastest?.country,
    )
    .sort((left, right) => right.difference - left.difference)
    .slice(0, 2);
  const slowing = momentum
    .filter((country) => country.difference < 0)
    .sort((left, right) => left.difference - right.difference)
    .slice(0, 2);
  const listedCountries = [...gainers, ...slowing];
  const fastestCities = fastest
    ? cities.filter((city) => city.country === fastest.country)
    : [];
  const trend = getGrowthData(period, fastestCities);

  const selectCountry = (country: string) => {
    onCountrySelect(selectedCountry === country ? null : country);
  };

  return (
    <Card id="audience-momentum" className="analytics-card momentum-card">
      <CardHeader className="analytics-header momentum-header">
        <div>
          <CardTitle>Audience momentum</CardTitle>
          <CardDescription>
            Countries gaining or losing pace over {periodLabels[period]}.
          </CardDescription>
        </div>
        <Gauge className="section-icon" aria-hidden="true" />
      </CardHeader>
      <CardContent className="momentum-content">
        {fastest ? (
          <div className="momentum-leader">
            <button
              type="button"
              className={cn(
                "momentum-leader-button",
                selectedCountry === fastest.country && "momentum-selected",
              )}
              onClick={() => selectCountry(fastest.country)}
              aria-pressed={selectedCountry === fastest.country}
            >
              <span className="momentum-label">Fastest-growing country</span>
              <span className="momentum-country-name">
                <span aria-hidden="true">{fastest.flag}</span>
                {fastest.country}
              </span>
              <span className="momentum-rate">
                <ArrowUpRight aria-hidden="true" />
                {fastest.growth.toFixed(1)}%
              </span>
            </button>
            <ChartContainer
              config={momentumConfig}
              className="momentum-chart"
              aria-label={`${fastest.country} audience trend over ${periodLabels[period]}`}
            >
              <LineChart
                accessibilityLayer
                data={trend}
                margin={{ top: 9, right: 5, left: 5, bottom: 0 }}
              >
                <XAxis dataKey="date" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--mint)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{
                    r: 3,
                    fill: "var(--mint)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        ) : (
          <p className="momentum-empty">No country data is available.</p>
        )}
        <div className="momentum-list" aria-label="Country momentum">
          <div className="momentum-list-heading">
            <span>Country</span>
            <span>vs. region pace</span>
          </div>
          {listedCountries.map((country: MomentumCountry) => {
            const gaining = country.difference >= 0;
            return (
              <button
                key={country.country}
                type="button"
                className={cn(
                  "momentum-row",
                  selectedCountry === country.country && "momentum-selected",
                )}
                onClick={() => selectCountry(country.country)}
                aria-pressed={selectedCountry === country.country}
                aria-label={`${country.country}, ${gaining ? "gaining" : "slowing"} by ${Math.abs(country.difference).toFixed(1)} percentage points compared with the selected region`}
              >
                <span className="momentum-row-country">
                  <span aria-hidden="true">{country.flag}</span>
                  <span>{country.country}</span>
                </span>
                <span
                  className={cn(
                    "momentum-difference",
                    gaining ? "momentum-gaining" : "momentum-slowing",
                  )}
                >
                  {gaining ? (
                    <ArrowUpRight aria-hidden="true" />
                  ) : (
                    <ArrowDownRight aria-hidden="true" />
                  )}
                  {gaining ? "+" : "−"}
                  {Math.abs(country.difference).toFixed(1)} pp
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
