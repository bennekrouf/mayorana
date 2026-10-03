// Claude skills for the desktop tools.
//
// A tool that has one ships it from its release CI, next to its builds, as
// `<id>-claude-skill.zip` (see `claudeSkill` in src/data/tools.ts). The link
// only appears on the detail page once that file exists: a tool gets the
// `claudeSkill` field before the release that first publishes the file, and a
// download button pointing at a 404 is worse than no button.
//
// Re-checked on the same one-hour revalidate as the release feed, so the link
// shows up within the hour of the release that publishes it, without a deploy.
// A GET rather than a HEAD, because only GET responses go through Next's data
// cache; the file is a few kilobytes.

export async function isClaudeSkillPublished(href: string): Promise<boolean> {
  try {
    const response = await fetch(href, { next: { revalidate: 3600 } });
    return response.ok;
  } catch {
    return false;
  }
}
