# App rename, October 2026

| Before | After | Site id / download folder | Licence id (unchanged) |
| --- | --- | --- | --- |
| AppScreens | ShipScreen | `shipscreen` | — |
| Blog Toolkit | PublishKit | `publishkit` | — |
| Splitter | TrackCut | `trackcut` | `splitter` |
| Small Video | Polishcast | `polishcast` | `small-video` |
| Spreadwatch | SpreadRadar | `spreadradar` | `spreadwatch` |

## What is renamed, and what deliberately is not

Everything a person reads is renamed: site pages, copy, app windows, installers,
artifact names, changelogs, Stripe receipts and licence emails.

These keep the old name, because changing them would break existing installs:

- **Licence product ids.** A key names its product; the apps and the gateway
  (`api0/store-api0/src/payment/license.rs`) still check the old ids, and the
  site passes them through `pro.product` in `src/data/tools.ts`.
- **macOS bundle ids, Android package id, Windows AppIds.** Screen Recording
  permission (Polishcast), Keychain items and in-place upgrades are tied to them.
- **Settings, licence, Keychain and telemetry folders.** Spreadwatch's holds
  the hot wallet; Blog Toolkit's holds API keys (the previous rename lost them).
- **GitHub repository variables** (`SPLITTER_LICENSE_PUBLIC_KEY`, …).
- **Shell-profile markers** that ShipScreen writes for JAVA_HOME.

Files in people's own folders are read under both names: `splitter.cutlist.json`
(moved to the new name on the next save), `blog-toolkit.yaml` and
`appscreens.json` (kept in place). Polishcast moves `Movies/Small Video` to
`Movies/Polishcast` the first time it starts.

## Order of operations

1. **On the VPS, first:** run `./scripts/migrate-renamed-downloads.sh`
   (`--dry-run` to see it first). Each download folder moves to its new name,
   with the old name left as a symlink, so installed copies keep finding
   updates, notices and release notes. Every build gets its new file name
   (`trackcut-setup.exe`, …) beside the original, which `latest.json` still
   names. The site's download buttons use the new names, so this must run
   before the site deploys.
2. **Deploy the site.** Old `/apps/<old>` URLs 301 to the new ones
   (`next.config.ts`).
3. **Deploy `api0`**: licence emails and Stripe return URLs use the new names.
4. **Rename the products in the Stripe dashboard.**
5. **Rename the GitHub repositories** (GitHub redirects the old URLs). The apps'
   installers and READMEs already link to the new names; then switch each
   tool's `source` link in `src/data/tools.ts`.
6. **Release each app.** CI publishes its builds under the new names, and the
   installed program itself is then called `trackcut.exe`, `TrackCut.app`, …
   Until then the renamed downloads still contain the old program.

`scripts/downloads-stats.py` counts the old and new names as one product
(`RENAMED`), and on every run folds the days it stored under an old name —
downloads, installs, updates, app usage, and visits to the old app pages — into
the new one (`consolidate_renames`), so each app keeps one history.
