'use client';

// The line that adds a tool's MCP server to Claude Code or Codex, one per OS,
// each with a Copy button, and a switch between the two clients. A client
// component only for the switch and the clipboard; the commands themselves are
// built server-side from src/data/tools.ts.

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { McpClient, OS } from '@/data/tools';

export function McpInstall({
  clients,
  labels,
}: {
  clients: { id: McpClient; label: string; body: string; commands: { os: OS; command: string }[] }[];
  labels: { os: Record<OS, string>; copy: string; copied: string };
}) {
  const [client, setClient] = useState<McpClient>(clients[0].id);
  const [copied, setCopied] = useState<OS | null>(null);
  const current = clients.find((c) => c.id === client) ?? clients[0];

  async function copy(os: OS, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(os);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <div role="tablist" className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-xs">
        {clients.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === client}
            onClick={() => {
              setClient(id);
              setCopied(null);
            }}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              id === client ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{current.body}</p>
      <div className="space-y-3">
        {current.commands.map(({ os, command }) => (
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
    </div>
  );
}
