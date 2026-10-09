// The "how it compares" table on a tool's detail page.
//
// Every row is something the tool does well, so the tool's own column is a
// tick on every row and is drawn from that rather than stored. A competitor
// cell is true (does it too), false (doesn't), null (the row makes no sense
// for that product) or a short string saying what it does instead — a
// partial answer is worth more to a reader than a half-filled circle.

import { Check, Minus, X } from 'lucide-react';

export type ComparisonCell = boolean | string | null;

export interface Comparison {
  competitors: string[];
  rows: { feature: string; them: ComparisonCell[] }[];
}

interface Labels {
  feature: string;
  yes: string;
  no: string;
  na: string;
}

function Cell({ value, labels }: { value: ComparisonCell; labels: Labels }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-muted-foreground" aria-label={labels.yes} />;
  }
  if (value === false) {
    return <X className="w-4 h-4 text-red-500/80" aria-label={labels.no} />;
  }
  if (value === null) {
    return <Minus className="w-4 h-4 text-muted-foreground/50" aria-label={labels.na} />;
  }
  return (
    <span className="inline-block max-w-[11rem] text-xs leading-snug text-amber-700 dark:text-amber-300">
      {value}
    </span>
  );
}

export function ComparisonTable({
  name,
  comparison,
  labels,
}: {
  name: string;
  comparison: Comparison;
  labels: Labels;
}) {
  return (
    // The table keeps its columns at phone width and scrolls inside this box
    // rather than squeezing four products into 375px.
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="sticky left-0 z-[1] bg-background p-3 text-left font-medium text-muted-foreground"
            >
              {labels.feature}
            </th>
            <th scope="col" className="p-3 text-center font-bold text-primary bg-primary/10">
              {name}
            </th>
            {comparison.competitors.map((competitor) => (
              <th
                key={competitor}
                scope="col"
                className="p-3 text-center font-medium text-muted-foreground"
              >
                {competitor}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-b-0">
              {/* Pinned, so the row's subject stays in view while the competitor
                  columns scroll past it on a phone. */}
              <th
                scope="row"
                className="sticky left-0 z-[1] bg-background p-3 text-left font-medium align-middle max-w-[14rem] md:max-w-none"
              >
                {row.feature}
              </th>
              <td className="p-3 text-center align-middle bg-primary/10">
                <Check
                  className="inline w-5 h-5 text-green-600 dark:text-green-400"
                  aria-label={labels.yes}
                />
              </td>
              {row.them.map((value, i) => (
                <td key={i} className="p-3 text-center align-middle">
                  <span className="inline-flex justify-center">
                    <Cell value={value} labels={labels} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
