import { createContext, useContext, useId, type ComponentProps } from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn, preciseNumber } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color: string }>;

const ChartContext = createContext<ChartConfig>({});

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ComponentProps<"div"> & {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  const id = useId().replaceAll(":", "");
  const variables = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color]),
  );

  return (
    <ChartContext.Provider value={config}>
      <div
        data-chart={id}
        className={cn(
          "flex aspect-[2/1] justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        style={variables}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = Tooltip;

type TooltipItem = {
  dataKey?: string | number;
  color?: string;
  name?: string;
  value?: number | string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
}) {
  const config = useContext(ChartContext);

  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-lg border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-xl">
      <div className="mb-2 text-[11px] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-col gap-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "value");
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ background: config[key]?.color ?? item.color }}
                />
                {config[key]?.label ?? item.name}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {typeof item.value === "number"
                  ? preciseNumber(item.value)
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
