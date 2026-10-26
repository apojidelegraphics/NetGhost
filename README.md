<div align="center">

# 👻 NetGhost

### An ambient network &amp; security terminal — a "hacker screen" you can actually drive.

*A networking solution for all, by Apoji_Delegraphics.*

</div>

---

NetGhost fills your screen with a living cyber-ops console: port scans, packet captures,
credential audits, proxy hops, cluster churn, and streams of system logs — all generated
on the fly by a procedural engine and rendered in a worn, 90s-terminal dashboard. Type
commands yourself, or hit one button and let it run itself as a monitor display or stream
backdrop.

> ## ⚠️ It's a simulation — not a hacking tool.
> NetGhost performs **no real network activity whatsoever**. Every IP, host, packet, port,
> and "cracked" password on screen is random text generated locally. It opens no
> connections, scans nothing, and sends nothing. It's theatre — like the hacker screens in
> movies — for displays, demos, dashboards, and streams.

<div align="center">

![NetGhost](build/icon-256.png)

</div>

## ✨ What it does

- 🖥️ **A real terminal** (Xterm.js) with an interactive prompt — type commands, history, tab-complete.
- 🌐 **Procedural everything** — subnets, hostnames, services, CVEs and proxy chains, all seeded and reproducible.
- 📡 **Live stream generators** — nmap sweeps, hydra credential audits, tcpdump hex, `tail -f` syslog, traceroute, DDoS scrubbing and more.
- 🎬 **Preset scenes** — Recon, Red-Team Breach, DDoS Mitigation, SOC Monitor, and full-spectrum GhostNet.
- 🧩 **Plugins** — a homebrew-style package manager and store. Add Docker (WharF), Kubernetes (Jklinger), n8n (hPh), crypto mining, wi-fi wardriving, satellite, mainframe, and more — or write your own.
- 🤖 **AI analyst agents** (optional) — plug in an OpenRouter key and agents post live intel reports into their own panel; a rich simulated fallback runs with no key needed.
- 📺 **Stream / OBS mode** — kiosk and transparent modes plus URL presets, so it drops straight into OBS as a backdrop.
- 🖥️🖥️ **Multi-monitor** — pop out extra "Port" windows and spread them across screens; system load stays in sync across all of them.
- 💾 **Remembers your setup** — scene, theme, speed and plugins persist between launches.

## 🌐 Try it in your browser

Once GitHub Pages is enabled (Settings → Pages → Source: **GitHub Actions**), the web
version runs live at **https://apojidelegraphics.github.io/NetGhost/** — no install needed.

## 📥 Download

Grab the latest installer for your OS from the **[Releases page](https://github.com/apojidelegraphics/NetGhost/releases)**:

| Platform | File |
|---|---|
| **macOS** | `NetGhost-x.y.z-universal.dmg` |
| **Windows** | `NetGhost-Setup-x.y.z.exe` (installer) or `NetGhost-x.y.z.exe` (portable) |
| **Linux** | `NetGhost-x.y.z.AppImage` or `netghost_x.y.z_amd64.deb` |

> Builds are currently **unsigned**, so macOS Gatekeeper and Windows SmartScreen will warn
> you on first launch — that's expected for unsigned apps, not a real threat. See the
> [tutorial](TUTORIAL.md#14-troubleshooting) for how to open them.

## 🚀 Your first two minutes

Launch NetGhost, click the terminal, and try:

```
ghost v_start3     begin the ambient stream
scan               sweep a random host — watch the ports light up
pkg                open the plugin store and install a few
ghost              turn on Auto-Ghost and let it run itself
agent threat       get an analyst report
```

Press **Esc** for Setup, **⛶ Full** for fullscreen, **⧉ Port** to pop out a second screen.
The **[full tutorial](TUTORIAL.md)** walks through every feature.

## 🧩 Writing a plugin

Plugins live in `renderer/plugins.js` and register through a tiny API — they can add
commands, scenes and themes:

```js
window.NetGhost.registerPlugin({
  id: "myplugin",
  name: "My Plugin",
  desc: "what it does",
  commands: { hello: (args, api) => api.wl(api.pri("hi from my plugin")) },
  scenes:   { myscene: { name: "MY SCENE", desc: "…", ops: [{ fn: () => {}, w: 3 }] } }
});
```

Install it in-app with `pkg install myplugin`. Full details in the [tutorial](TUTORIAL.md#9-plugins-the-pkg-store).

## 🛠️ Run &amp; build from source

```bash
npm install
npm start          # run it
npm run dist       # build installers for your OS → release/
```

Pushing a version tag builds all three platforms and publishes a GitHub Release with notes:

```bash
npm version patch   # bumps version + creates the tag
git push && git push --tags
```

## 📓 More

- **[TUTORIAL.md](TUTORIAL.md)** — the complete guide.
- **[CHANGELOG.md](CHANGELOG.md)** — what changed in each version.

## 📄 License

MIT © Apoji_Delegraphics — see [LICENSE](LICENSE).
