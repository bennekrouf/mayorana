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

1. **Deploy the site.** Old `/apps/<old>` URLs 301 to the new ones
   (`next.config.ts`); download buttons still point at the old folders, which
   exist today.
2. **Deploy `api0`**: licence emails and Stripe return URLs use the new names.
3. **Rename the products in the Stripe dashboard.**
4. **On the VPS, before any app release:** move each download folder and
   redirect the old path, so installed copies keep finding updates, notices
   and release notes:

   ```bash
   cd /var/www/mayorana-downloads
   mv appscreens shipscreen && mv blog-toolkit publishkit && mv splitter trackcut \
     && mv small-video polishcast && mv spreadwatch spreadradar
   ```

   ```nginx
   # http block
   map $old_app $new_app {
       appscreens   shipscreen;
       blog-toolkit publishkit;
       splitter     trackcut;
       small-video  polishcast;
       spreadwatch  spreadradar;
   }

   # server block, before the /downloads/ location
   location ~ ^/downloads/(?<old_app>appscreens|blog-toolkit|splitter|small-video|spreadwatch)/(?<rest>.*)$ {
       return 301 /downloads/$new_app/$rest$is_args$args;
   }
   ```

   Check that the release deploy key (rrsync) still allows the new folders.
5. **Rename the GitHub repositories** (GitHub redirects the old URLs). The apps'
   installers and READMEs already link to the new names.
6. **Release each app.** CI publishes `<new>-*` artifacts into the new folder.
   Then switch that tool's download constants and file names in
   `src/data/tools.ts`, and its `source` link, to the new name.

`scripts/downloads-stats.py` counts the old and new names as one product
(`RENAMED`), so each app keeps one history.
