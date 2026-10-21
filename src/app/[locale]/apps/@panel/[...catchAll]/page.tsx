// Any other route under /apps (a tool's release notes)
// closes the panel: without this, a soft navigation there would leave the
// slot showing whatever panel was last open.
export default function PanelCatchAll() {
  return null;
}
