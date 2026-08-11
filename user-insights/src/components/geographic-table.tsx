import { ArrowUpRight, Globe2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCountryTotals, type UserCity } from "@/data/insights";
import { compactNumber } from "@/lib/utils";

export function GeographicTable({ cities }: { cities: UserCity[] }) {
  const countries = getCountryTotals(cities).slice(0, 6);

  return (
    <Card id="geographic-users" className="analytics-card geography-card">
      <CardHeader className="analytics-header">
        <div>
          <CardTitle>Geographic users</CardTitle>
          <CardDescription>Where your community calls home.</CardDescription>
        </div>
        <Globe2 className="section-icon" aria-hidden="true" />
      </CardHeader>
      <CardContent className="geography-content">
        <table className="geography-table">
          <thead>
            <tr>
              <th scope="col">Location</th>
              <th scope="col">Users</th>
              <th scope="col">Growth</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.country}>
                <td>
                  <span className="table-country">
                    <span>{country.flag}</span>
                    {country.country}
                  </span>
                </td>
                <td className="table-number">{compactNumber(country.users)}</td>
                <td>
                  <span className="table-growth">
                    <ArrowUpRight aria-hidden="true" />
                    {country.growth.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
