import { ArrowUpRight, Radio } from "lucide-react";
import { WorldGlobe } from "@/components/world-globe";
import type { Region, UserCity } from "@/data/insights";
import { regions } from "@/data/insights";
import { cn, compactNumber } from "@/lib/utils";

export function GlobeSection({
  cities,
  region,
  onRegionChange,
}: {
  cities: UserCity[];
  region: Region;
  onRegionChange: (region: Region) => void;
}) {
  const total = cities.reduce((sum, city) => sum + city.users, 0);
  const active = cities.reduce((sum, city) => sum + city.active, 0);
  const growth =
    cities.reduce((sum, city) => sum + city.growth, 0) /
    Math.max(cities.length, 1);

  return (
    <section className="globe-section" aria-label="Worldwide audience overview">
      <div className="globe-toolbar">
        <div className="live-indicator">
          <Radio aria-hidden="true" />
          <span>Live around the world</span>
        </div>
        <div
          className="region-switch"
          role="group"
          aria-label="Filter audience by region"
        >
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "region-option",
                region === item && "region-option-active",
              )}
              aria-pressed={region === item}
              onClick={() => onRegionChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <WorldGlobe cities={cities} />
      <div className="globe-summary">
        <div className="worldwide-total">
          <span className="hero-number">{compactNumber(total, 2)}</span>
          <span className="hero-label">people worldwide</span>
        </div>
        <div className="metric-strip">
          <div className="metric-item">
            <span className="metric-value">
              <span className="live-dot" />
              {compactNumber(active)}
            </span>
            <span className="metric-caption">active right now</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">{cities.length}</span>
            <span className="metric-caption">connected cities</span>
          </div>
          <div className="metric-item">
            <span className="metric-value growth-value">
              <ArrowUpRight aria-hidden="true" />
              {growth.toFixed(1)}%
            </span>
            <span className="metric-caption">audience growth</span>
          </div>
        </div>
      </div>
    </section>
  );
}
