import { useMemo, useState } from "react";
import { AudienceChart } from "@/components/audience-chart";
import { GeographicTable } from "@/components/geographic-table";
import { GlobeSection } from "@/components/globe-section";
import { InsightsRail } from "@/components/insights-rail";
import { TopNav } from "@/components/top-nav";
import { cities, getCities, type Period, type Region } from "@/data/insights";

export default function App() {
  const [region, setRegion] = useState<Region>("Everywhere");
  const [period, setPeriod] = useState<Period>("28d");
  const selectedCities = useMemo(() => getCities(region), [region]);

  return (
    <div className="app-shell" id="overview">
      <TopNav />
      <main className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>Your world, in view.</h1>
            <p>A living, breathing look at the people behind your product.</p>
          </div>
          <div className="date-label">
            <span className="date-dot" />
            Tuesday, July 28
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="main-column">
            <GlobeSection
              cities={selectedCities}
              region={region}
              onRegionChange={setRegion}
            />
            <div className="analytics-grid">
              <AudienceChart
                cities={selectedCities}
                period={period}
                onPeriodChange={setPeriod}
              />
              <GeographicTable cities={selectedCities} />
            </div>
          </div>
          <InsightsRail
            cities={selectedCities}
            allCities={cities}
            region={region}
            onRegionChange={setRegion}
          />
        </div>
        <footer className="dashboard-footer">
          <span>Made with a little perspective.</span>
          <span>
            <span className="live-dot" />
            All systems operational
          </span>
        </footer>
      </main>
    </div>
  );
}
