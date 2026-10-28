// /install/<id>.sh and /install/<id>.ps1 — see src/lib/install-scripts.ts.

import { desktopToolsConfig, getToolBySlug } from '@/data/tools';
import {
  hasPowershellInstall,
  hasShellInstall,
  powershellScript,
  shellScript,
} from '@/lib/install-scripts';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return desktopToolsConfig.flatMap((tool) => [
    ...(hasShellInstall(tool) ? [{ file: `${tool.id}.sh` }] : []),
    ...(hasPowershellInstall(tool) ? [{ file: `${tool.id}.ps1` }] : []),
  ]);
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = file.match(/^(.+)\.(sh|ps1)$/);
  const tool = match ? getToolBySlug(match[1]) : undefined;
  if (!match || !tool) return new Response('Not found', { status: 404 });
  // text/plain so a browser shows the script instead of downloading it:
  // reading it before piping it into a shell is the point.
  const body = match[2] === 'sh' ? shellScript(tool) : powershellScript(tool);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
