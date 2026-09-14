# In-app notice

A message from us to the people running a desktop build. Each product fetches
it once at startup (4 s after launch, best-effort) and shows it as a banner
until dismissed; a dismissal is remembered per `id` across every mayorana
product on that machine (`<data_local_dir>/mayorana/dismissed-notices.json`).

It is the one channel that reaches exactly the people using a product — the
download logs are anonymous — and is what the founding-users ask goes through.

## Where it lives

Served by nginx next to the builds. Not part of any release, so it survives
release CI overwriting `latest/`:

| URL | Scope |
| --- | --- |
| `https://mayorana.ch/downloads/notice.json` | every product |
| `https://mayorana.ch/downloads/<product>/notice.json` | that product only — wins when present |

On the VPS: `/var/www/mayorana-downloads/notice.json` and
`/var/www/mayorana-downloads/<product>/notice.json`. The copy in this repo at
`config/downloads-notice.json` is the single reference; publish it with

```bash
./scripts/publish-notice.sh
```

which writes the global file and one per product, each product's `url`
carrying `?tool=<product>` so `/founding` opens with that tool selected.
`--dry-run` prints the files instead. Remove the files (or publish an empty
`{}`) to show nothing.

## Format

```json
{
  "id": "founding-2026-09",
  "apps": null,
  "text": "You're one of the first people running {app}. …",
  "link_text": "Tell us how it's going",
  "url": "https://mayorana.ch/en/founding"
}
```

- `id` — what a dismissal remembers. **A new message needs a new id**, or
  anyone who dismissed the previous one never sees it.
- `apps` — `null` for every product, or a list of ids (`"ais-monitor"`, …).
- `text` — `{app}` is replaced with the product's display name.
- `link_text`, `url` — optional; without `url` the banner has no link.

The fetch identifies itself as `<product>/<version> (notice)`, distinct from
the updater's `(updater)` agent so `downloads-stats.py` does not count it as
a live install. Neither URL matches the script's download pattern.

Client implementation: `src/notice.rs` in each product repo (gitagent,
ais-monitor, ais-runner, ais-tracing, ais-analytics, appscreens).
