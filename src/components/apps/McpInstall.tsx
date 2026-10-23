'use client';

// The line that adds a tool's MCP server to Claude Code, one per OS, each with
// a Copy button. A client component only for the clipboard; the commands
// themselves are built server-side from src/data/tools.ts.

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { OS } from '@/data/tools';

export function McpInstall({
  commands,
  labels,
}: {
  commands: { os: OS; command: string }[];
  labels: { os: Record<OS, string>; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState<OS | null>(null);

  async function copy(os: OS, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(os);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-3">
      {commands.map(({ os, command }) => (
        <div key={os}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">{labels.os[os]}</span>
            <button
              type="button"
              onClick={() => copy(os, command)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied === os ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === os ? labels.copied : labels.copy}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs">
            <code className="font-mono">{command}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}
