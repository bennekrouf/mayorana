// One-line installers, generated from src/data/tools.ts so they always point
// at the same builds as the download buttons:
//
//   macOS, Linux:  curl -fsSL https://mayorana.ch/install/<id>.sh | sh
//   Windows:       irm https://mayorana.ch/install/<id>.ps1 | iex
//
// Served by src/app/install/[file]/route.ts, prerendered at build time.
//
// What each script does, and deliberately does not:
//   macOS  — mounts the .dmg, copies the .app into /Applications (or
//            ~/Applications when that is not writable), unmounts.
//   Linux  — .tar.gz: extracts to ~/<id>-linux-x86_64 (where the MCP lines
//            on the page expect it) and links ~/.local/bin/<id>. The archive's
//            setup-linux.sh installs system packages with sudo, so it is only
//            printed for the reader to run, never run from a piped script.
//            .deb: installs the package with apt, which asks for sudo.
//   Windows — downloads the installer and starts it; the reader clicks
//            through it as with a manual download. No silent flags: the
//            installers are not all built the same way.
//
// Downloads carry a User-Agent of their own and utm_source=install-script:
// scripts/downloads-stats.py drops anything that says curl/ as a bot.

import { SITE_URL } from './seo';
import type { DesktopToolConfig, OS } from '@/data/tools';

const QUERY = 'utm_source=install-script&utm_medium=cli';

const href = (tool: DesktopToolConfig, os: OS) => tool.downloads.find((d) => d.os === os)?.href ?? '';

// Values are embedded in single-quoted strings: escape them for each shell.
const sh = (value: string) => value.replace(/'/g, `'\\''`);
const ps = (value: string) => value.replace(/'/g, "''");

export const shellInstallUrl = (id: string) => `${SITE_URL}/install/${id}.sh`;
export const powershellInstallUrl = (id: string) => `${SITE_URL}/install/${id}.ps1`;

export const shellInstallCommand = (id: string) => `curl -fsSL ${shellInstallUrl(id)} | sh`;
export const powershellInstallCommand = (id: string) => `irm ${powershellInstallUrl(id)} | iex`;

export const hasShellInstall = (tool: DesktopToolConfig) => Boolean(href(tool, 'mac') || href(tool, 'linux'));
export const hasPowershellInstall = (tool: DesktopToolConfig) => Boolean(href(tool, 'windows'));

export function shellScript(tool: DesktopToolConfig): string {
  const mac = href(tool, 'mac');
  const linux = href(tool, 'linux');
  // A build named -arm64 is Apple Silicon only; the others are universal.
  const macArmOnly = /-arm64\.dmg$/.test(mac) ? 1 : 0;

  return `#!/bin/sh
# Installs ${tool.name} from mayorana.ch.
#
#   curl -fsSL ${shellInstallUrl(tool.id)} | sh
#
# macOS: copies ${tool.name} into /Applications (or ~/Applications).
# Linux: extracts it to ~/${tool.id}-linux-x86_64 and links ~/.local/bin/${tool.id}.
# Source: ${tool.source}
# Licence: PolyForm Noncommercial 1.0.0; commercial use needs a plan,
# see ${SITE_URL}/pricing

set -eu

APP='${sh(tool.name)}'
ID='${sh(tool.id)}'
MAC_URL='${sh(mac)}'
MAC_ARM_ONLY=${macArmOnly}
LINUX_URL='${sh(linux)}'
UA="mayorana-install/1 ($ID)"
QUERY='${QUERY}'

say() { printf '%s\\n' "$*"; }
fail() { printf 'error: %s\\n' "$*" >&2; exit 1; }
fetch() { curl -fL --progress-bar -A "$UA" -o "$2" "$1?$QUERY"; }

cleanup() {
  if [ -d "$tmp/mnt" ]; then hdiutil detach -quiet "$tmp/mnt" 2>/dev/null || true; fi
  rm -rf "$tmp"
}

install_mac() {
  [ -n "$MAC_URL" ] || fail "$APP has no macOS build."
  if [ "$MAC_ARM_ONLY" = 1 ] && [ "$(uname -m)" != arm64 ]; then
    fail "$APP's macOS build is for Apple Silicon; this Mac is $(uname -m)."
  fi
  say "Downloading $APP for macOS..."
  fetch "$MAC_URL" "$tmp/$ID.dmg"
  mkdir "$tmp/mnt"
  hdiutil attach -nobrowse -readonly -quiet -mountpoint "$tmp/mnt" "$tmp/$ID.dmg"
  app=$(find "$tmp/mnt" -maxdepth 1 -name '*.app' | head -n 1)
  [ -n "$app" ] || fail "no application found in the disk image."
  dest=/Applications
  if [ ! -w "$dest" ]; then
    dest="$HOME/Applications"
    mkdir -p "$dest"
  fi
  name=$(basename "$app")
  rm -rf "\${dest:?}/$name"
  ditto "$app" "$dest/$name"
  say "Installed $name in $dest."
}

install_linux() {
  [ -n "$LINUX_URL" ] || fail "$APP has no Linux build."
  [ "$(uname -m)" = x86_64 ] || fail "$APP's Linux build is for x86_64; this machine is $(uname -m)."
  case "$LINUX_URL" in
    *.deb)
      command -v apt-get >/dev/null 2>&1 || fail "$APP's Linux build is a .deb package, for Debian and Ubuntu."
      say "Downloading $APP for Linux..."
      fetch "$LINUX_URL" "$tmp/$ID.deb"
      say "Installing the package with apt (sudo will ask for your password)..."
      sudo apt-get install -y "$tmp/$ID.deb"
      say "Installed $APP. Start it from your applications menu, or run: $ID"
      ;;
    *)
      say "Downloading $APP for Linux..."
      fetch "$LINUX_URL" "$tmp/$ID.tar.gz"
      dir="$HOME/$ID-linux-x86_64"
      rm -rf "$dir"
      tar -xzf "$tmp/$ID.tar.gz" -C "$HOME"
      [ -x "$dir/$ID" ] || fail "the archive did not contain $ID-linux-x86_64/$ID."
      mkdir -p "$HOME/.local/bin"
      ln -sf "$dir/$ID" "$HOME/.local/bin/$ID"
      say "Installed $APP in $dir and linked ~/.local/bin/$ID."
      case ":$PATH:" in
        *":$HOME/.local/bin:"*) ;;
        *) say "Add ~/.local/bin to your PATH to run it as: $ID" ;;
      esac
      if [ -x "$dir/setup-linux.sh" ]; then
        say ""
        say "One-time setup (runtime libraries and a menu entry; needs sudo):"
        say "  sudo $dir/setup-linux.sh"
      fi
      ;;
  esac
}

# Everything runs from here, so a download cut off half way runs nothing.
main() {
  command -v curl >/dev/null 2>&1 || fail "curl is required."
  tmp=$(mktemp -d)
  trap cleanup EXIT
  case "$(uname -s)" in
    Darwin) install_mac ;;
    Linux) install_linux ;;
    *) fail "this script is for macOS and Linux. On Windows, run in PowerShell: irm ${powershellInstallUrl(tool.id)} | iex" ;;
  esac
}

main
`;
}

export function powershellScript(tool: DesktopToolConfig): string {
  const windows = href(tool, 'windows');
  return `# Installs ${tool.name} from mayorana.ch.
#
#   irm ${powershellInstallUrl(tool.id)} | iex
#
# Downloads the Windows installer and starts it.
# Source: ${tool.source}
# Licence: PolyForm Noncommercial 1.0.0; commercial use needs a plan,
# see ${SITE_URL}/pricing

& {
  $ErrorActionPreference = 'Stop'
  # Invoke-WebRequest is many times slower with its progress bar drawn.
  $ProgressPreference = 'SilentlyContinue'

  $app = '${ps(tool.name)}'
  $url = '${ps(windows)}' + '?' + '${QUERY}'
  $file = Join-Path $env:TEMP ('${tool.id}-setup-' + [guid]::NewGuid().ToString('N').Substring(0, 8) + '.exe')

  Write-Host "Downloading $app for Windows..."
  Invoke-WebRequest -Uri $url -OutFile $file -UserAgent 'mayorana-install/1 (${tool.id})' -UseBasicParsing
  try {
    Write-Host "Starting the $app installer..."
    Start-Process -FilePath $file -Wait
    Write-Host "Done."
  } finally {
    Remove-Item $file -ErrorAction SilentlyContinue
  }
}
`;
}
