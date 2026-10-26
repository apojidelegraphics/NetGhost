# Changelog

All notable changes to NetGhost. Dates are approximate; versions follow the GitHub releases.

## v1.1.2
- **Event-reactive agents** — agents auto-post the moment a host is breached or the
  threat level hits CRITICAL.
- **Agent personalities** — each analyst (GHOST-ANALYST, THREAT-SEER, NET-WARDEN…) has
  a distinct voice; **ask-the-ghost** with `ask` / `explain <question>`.
- **BIOS/POST boot screen** on launch.
- **World attack map** (`map` or the ⊕ Map button) — animated attack arcs across a world grid.
- **Missions** — optional objectives with a score (`mission`), auto-started with the stream.
- **Scene director** — auto-rotate scenes/themes on a timer (`director on`, or Setup).
- **Per-plugin sweep checkboxes** in the package store — choose exactly which plugins the minute sweep runs.
- **Close a pop-out** with `port close` / `close`.
- **Six new plugins**: Mempool (blockchain), Trainer (AI model training), Kali Toolkit
  (msf/sqlmap/john), Honeypot (watch the world attack you), DNS Tunnel, and more.
- **Hosted web version** via GitHub Pages.

## v1.1.1
- Agent reports: fixed empty responses, added a 2/hour budget for **auto**-generated AI
  reports during streams (typing `agent` yourself is never limited), and a much more
  varied local fallback.
- `ghost v_start3` / `ghost v_stop3` start and stop the ambient stream.
- Moved the Threat Matrix to the left column so it's always visible.
- Automatic release notes on every tagged build.

## v1.1.0
- **Agent feed panel** — AI/simulated analyst reports land in their own panel; the main
  stream shows a one-liner. Agents auto-post during Auto-Ghost.
- **PORTS** counter (how many NetGhost windows are open) and **SERVICES** counter
  (open ports across hosts).
- **Manual start** — NetGhost boots idle until you start the stream.
- **Synced SYS.LOAD** across every window / pop-out (Electron IPC, BroadcastChannel,
  and localStorage transports).
- Four new plugins: **WharF** (Docker), **SatCom** (satellite/SDR), **Mainframe**
  (retro z/OS), **VideoWall** (opens pop-outs). Pop-out button renamed **Port**.
- Installed plugins join the Auto-Ghost rotation, plus a plugin sweep every minute.

## v1.0.x
- **Plugin system** with a homebrew-style `pkg` manager and a clickable store overlay;
  built-ins: cryptominer, wardrive, scada, jklinger (Kubernetes), hph (n8n), coffee.
- **AI agents** via OpenRouter (optional, key stored locally) with a simulated fallback.
- **Saved setup** — scene, theme, speed, density and toggles persist across launches.
- **Stream / OBS mode** — kiosk, transparent background, and URL-param presets.
- **Preset scenes** (ghostnet, recon, red-team, DDoS, SOC), phosphor themes, speed and
  density controls, and a real Xterm.js terminal with an interactive prompt.
- Initial release: procedural ambient network/security terminal with nmap/hydra/tcpdump/
  syslog stream generators, proxy hop chain, target map, threat matrix, and Electron
  desktop builds for macOS, Windows and Linux.
