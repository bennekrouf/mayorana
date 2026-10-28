'use client';

// The one-line installers under an app's download buttons: one row per
// platform, each with a Copy button and a link to read the script first.
// The commands are built on the server from src/lib/install-scripts.ts.

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface InstallRow {
  label: string;
  command: string;
  /** Link to read what the command runs; omitted when there is nothing to read. */
  scriptUrl?: string;
}

export function InstallCommands({
  heading,
  body,
  rows,
  labels,
}: {
  heading: string;
  body?: string;
  rows: InstallRow[];
  labels: { copy: string; copied: string; view?: string };
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(command: string) {
    await navigator.clipboard.writeText(command);
    setCopied(command);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mt-6 max-w-3xl">
      {heading && <p className="text-sm font-medium mb-2">{heading}</p>}
      {body && <p className="text-sm text-muted-foreground mb-3">{body}</p>}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.command}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              {row.scriptUrl && <a
                href={row.scriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {labels.view}
              </a>}
            </div>
            <div className="flex items-stretch rounded-lg border border-border bg-secondary/60 overflow-hidden">
              <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-sm">
                {row.command}
              </code>
              <button
                type="button"
                onClick={() => copy(row.command)}
                className="flex shrink-0 items-center gap-1.5 border-l border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {copied === row.command ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied === row.command ? labels.copied : labels.copy}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
