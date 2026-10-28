// https://mayorana.ch/mcp — the public MCP server (src/lib/mcp-server.ts),
// on the Streamable HTTP transport: one JSON-RPC message per POST, answered
// with JSON. GET would open a server-to-client event stream, which this server
// has no use for, so it answers 405 as the transport allows.

import { handleMessage, SERVER_INFO } from '@/lib/mcp-server';

export const dynamic = 'force-dynamic';

// Read-only public data, so any origin may call it — browser-based MCP
// clients included.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export function GET(request: Request) {
  // A person opening the URL in a browser gets a pointer rather than an error.
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(
      `${SERVER_INFO.title} MCP server (read-only). Add it to Claude Code with:\n\n` +
        `  claude mcp add --transport http mayorana https://mayorana.ch/mcp\n`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS } },
    );
  }
  return new Response(null, { status: 405, headers: { Allow: 'POST, OPTIONS', ...CORS } });
}

export async function POST(request: Request) {
  let message: unknown;
  try {
    message = await request.json();
  } catch {
    return Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error.' } },
      { status: 400, headers: CORS },
    );
  }
  const response = await handleMessage(message);
  if (!response) return new Response(null, { status: 202, headers: CORS });
  return Response.json(response, { headers: CORS });
}
