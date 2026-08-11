import { cn } from "@/lib/utils";

export function BlossomMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <path
        d="M20 2.5c-3.1 4.1-5.1 8.4-5.1 11.25a5.1 5.1 0 0 0 10.2 0C25.1 10.9 23.1 6.6 20 2.5Z"
        fill="currentColor"
      />
      <path
        d="M37.5 20c-4.1-3.1-8.4-5.1-11.25-5.1a5.1 5.1 0 0 0 0 10.2c2.85 0 7.15-2 11.25-5.1Z"
        fill="currentColor"
        opacity=".84"
      />
      <path
        d="M20 37.5c3.1-4.1 5.1-8.4 5.1-11.25a5.1 5.1 0 0 0-10.2 0c0 2.85 2 7.15 5.1 11.25Z"
        fill="currentColor"
        opacity=".72"
      />
      <path
        d="M2.5 20c4.1 3.1 8.4 5.1 11.25 5.1a5.1 5.1 0 0 0 0-10.2C10.9 14.9 6.6 16.9 2.5 20Z"
        fill="currentColor"
        opacity=".88"
      />
      <circle cx="20" cy="20" r="3" fill="var(--background)" />
      <circle cx="30.7" cy="9.3" r="1.65" fill="var(--mint)" />
      <circle cx="9.3" cy="30.7" r="1.65" fill="var(--mint)" opacity=".8" />
    </svg>
  );
}
