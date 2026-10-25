# NetGhost — Full Tutorial

A complete, beginner-friendly guide to using NetGhost. If you're lost, start at the
top and work down — by the end you'll know every feature.

> **Reminder:** NetGhost is a **simulation**. Everything on screen — IPs, packets,
> scans, "cracked" passwords — is randomly generated text. It never touches a real
> network. Think of it as a movie "hacker screen" you can actually drive.

---

## 1. Getting it running

You have two ways to use NetGhost:

### A) The desktop app (the real thing)
1. Download the installer from your **GitHub Releases** page (the `.dmg` for Mac,
   `.exe` for Windows, `.AppImage`/`.deb` for Linux), **or** run from source:
   ```
   cd ~/Downloads/netghost
   npm install
   npm start
   ```
2. The window opens straight into NetGhost.

> On an unsigned build, macOS may say *"Electron.app is damaged / malware"* and
> Windows may show a SmartScreen warning. That's the **unsigned-app warning**, not a
> real threat (see Troubleshooting). Signing + notarization removes it.

### B) The web preview (no install)
Open the NetGhost artifact link in your browser. It's the same app, running in a tab.
Great for trying things fast. (The only feature that may not work in the web preview
is live AI — more on that in section 10.)

---

## 2. The screen — a tour

NetGhost is a split-pane console. From the outside in:

- **Top bar** — the NETGHOST logo, and live stats: **LINK** (idle/live/engaged),
  **SCENE**, **TARGETS** (hosts found), **PORTS** (how many NetGhost windows/pop-outs are
  open), **SERVICES** (total open nmap ports across hosts), **PKT/S**, **THREAT**, and
  **UPTIME**. On the right are the buttons:
  `▶Ghost` · `⚙Setup` · `⊞ Pkgs` · `⏸Hold` · `⧉Pop` · `⛶Full`.
- **Left column**
  - **PROXY.CHAIN** — the fake anonymizing hops your traffic is "routed" through.
  - **TARGET.MAP** — every host discovered. A square shows status: green = up,
    amber = being scanned, red = breached.
- **Center** — **GHOST://CONSOLE**, the terminal. This is where output streams and
  where you type commands.
- **Right column**
  - **SYS.LOAD** — fake CPU / memory / network / disk / temperature meters.
  - **THREAT.MATRIX** — a running log of "threats", escalating LOW → CRITICAL.

---

## 3. Two ways to drive it

**Manual mode (default):** you type commands in the console and watch the results.

**Auto-Ghost mode:** NetGhost runs itself — endlessly queuing realistic multi-step
operations. This is the "leave it on as a backdrop" mode. Turn it on with:
- the **▶Ghost** button, or
- the command `ghost`, or
- the hotkey **Ctrl+Shift+G**.

Turn it off the same way. When it's on, you'll see the **AUTO-GHOST ENGAGED** badge.

---

## 4. The command line

Click the console and type. Press **Enter** to run. Use **↑ / ↓** for history and
**Tab** to autocomplete. Type `help` anytime for the list.

| Command | What it does |
|---|---|
| `help` | List all commands |
| `ghost v_start3` | Begin the ambient stream (NetGhost boots idle) |
| `ghost v_stop3` | Halt the stream — back to idle |
| `scan [ip]` / `nmap <ip>` | Port/service sweep of a host (random if no IP) |
| `ping [ip]` | ICMP echo |
| `trace [ip]` | Traceroute through the proxy chain |
| `hydra [ip]` | Simulated credential "brute force" |
| `sniff` | Dump raw packets (hex) |
| `syslog` | Tail a fake system log feed |
| `targets` | List discovered hosts |
| `hops` | Rebuild the proxy chain |
| `scene <id>` | Switch scene (see section 6) |
| `theme <id>` | Change colour (see section 7) |
| `speed <id>` | Stream speed: slow / normal / fast / overdrive |
| `pkg` | Open the plugin store (section 9) |
| `agent [topic]` | AI/simulated analyst report (section 10) |
| `kiosk` / `obs` | Stream mode (section 11) |
| `reseed [n]` | Generate a fresh random world |
| `pause` | Freeze / resume all streams |
| `reset` | Restore default settings |
| `full` | Fullscreen |
| `clear` | Wipe the screen |
| `about` | What NetGhost is |

Installed plugins add more commands (e.g. `mine`, `wifi`, `scada`, `jk`, `hph`, `coffee`).

---

## 5. Example: your first 2 minutes

```
help                 (see what's available)
scan                 (scan a random host — watch the ports light up)
targets              (see what you've found)
hydra                (watch a fake credential attack)
ghost                (turn on Auto-Ghost and let it run)
```

---

## 6. Scenes

A **scene** sets the mood — which operations run and how aggressive it feels. Switch
with `scene <id>` or in **Setup**.

| Scene | Vibe |
|---|---|
| `ghostnet` | Everything, cycling endlessly (default) |
| `recon` | Quiet enumeration — scans and traces, no breaches |
| `redteam` | Aggressive: scan → crack → root → exfil. Threat spikes. |
| `ddos` | Defensive DDoS-mitigation console under heavy load |
| `soc` | Calm blue-team "watch floor" |

Plugins add more scenes (e.g. `mining`, `wardrive`, `scada`, `cluster`, `automation`).

---

## 7. Look & feel

- **Theme (phosphor colour):** `theme green` / `amber` / `cyan` / `clash` / `mono`.
- **Speed:** `speed slow` / `normal` / `fast` / `overdrive`.
- **Density:** how much each burst prints — set in Setup (sparse / normal / dense).
- **CRT effects:** scanlines, grime, and flicker toggle in Setup.

---

## 8. Setup panel & saved settings

Open it with **⚙Setup**, the `setup` command, or **Esc**. It's a DOS-style dialog
where you can click scene, phosphor, speed, density, the CRT toggles, Auto-Ghost, and
AI agents. There's also **⟳ RESEED WORLD**.

**Everything you set is saved automatically** and comes back the next time you open
NetGhost. To wipe it back to defaults, run `reset`.

---

## 9. Plugins (the `pkg` store)

Plugins add new commands, scenes, and themes. Two ways to manage them:

- **Clickable:** press **⊞ Pkgs** (or type `pkg`) to open the store, then hit
  **INSTALL** / **REMOVE** on any plugin.
- **Command line:** `pkg list`, `pkg install <id>`, `pkg remove <id>`, `pkg info <id>`.

Installed plugins are remembered across launches.

### Built-in plugins

| id | Adds |
|---|---|
| `cryptominer` | `mine` command + `mining` scene — GPU hashrate feed |
| `wardrive` | `wifi` command + `wardrive` scene — 802.11 capture |
| `scada` | `scada` command + `scada` scene — industrial Modbus/PLC |
| `jklinger` | `jk get pods\|nodes\|events` + `cluster` scene — Kubernetes-style |
| `hph` | `hph` command + `automation` scene — n8n-style workflows |
| `wharf` | `wharf ps\|pull` (or `docker`) + `containers` scene — Docker-style |
| `satcom` | `satcom` / `uplink` + `orbit` scene — satellite/SDR telemetry |
| `mainframe` | `mainframe` / `jcl` + `batch` scene + an `ibm` theme — retro z/OS |
| `videowall` | `wall [n]` — opens up to 4 monitor pop-outs |
| `coffee` | `coffee` command — ☕ easter egg |

Installed plugins join the Auto-Ghost `ghostnet` rotation, and NetGhost runs a **plugin
sweep every minute** so a few of them always fire — even in manual mode. Toggle it with
**Setup → PLUGINS→AUTO**.

### Writing your own plugin

Open `renderer/plugins.js` and copy one of the examples. The shape:

```js
window.NetGhost.registerPlugin({
  id: "myplugin",
  name: "My Plugin",
  desc: "what it does",
  commands: { hello: (args, api) => api.wl(api.pri("hi!")) },
  scenes:   { myscene: { name:"MY SCENE", desc:"…", ops:[{ fn:()=>{}, w:3 }] } },
  themes:   { mytheme: { rgb:[255,0,128], vars:{ "--primary":"#ff0080" } } }
});
```

Every command/op gets an `api` with drawing helpers (`wl`, `pri`, `dim`, `fg`,
`amber`, `red`, …), the seeded RNG (`api.R`), the world state (`api.W`), `api.q` to
queue paced steps, and `api.pushThreat`. Install it with `pkg install myplugin`.

---

## 10. AI agents (optional, via OpenRouter)

NetGhost can call a real language model to write **intel reports** about the current
(fake) telemetry. It's off by default.

### Setup
1. Make an account at **https://openrouter.ai** and create an **API key**.
2. In NetGhost: **⚙Setup → AI AGENTS → ON**. Two fields appear.
3. Paste your key into **API KEY**.
4. Set **MODEL** to a good instruct model — recommended:
   `openai/gpt-4o-mini` or `anthropic/claude-3.5-haiku`.
   (Avoid "free"/reasoning models — some of them leak their thinking into the report.)

### Use it
```
agent threat
agent what should I do next
agent              (reports on the current operation)
```
The agent reads the current scene, hosts, and threats and writes a short report.

**Notes**
- Your key is stored **only in local storage on your device** — it's never uploaded
  anywhere by NetGhost.
- OpenRouter charges per request based on the model (gpt-4o-mini is very cheap).
- With AI **off or offline**, agents print a **simulated** report instead, so the
  command always does something.
- In the **web preview**, the browser's security policy may block the OpenRouter
  call; if so it falls back to the simulated report. Live AI works in the **desktop app**.

---

## 11. Stream / OBS mode

NetGhost makes a great stream backdrop. You can preset and strip the UI with **URL
parameters** (works in the web version / OBS browser source):

| Param | Effect |
|---|---|
| `?scene=redteam` | start in a scene |
| `?theme=amber` | start with a colour |
| `?speed=fast` | start at a speed |
| `?ghost=1` | auto-engage Auto-Ghost |
| `?kiosk=1` | hide all chrome — just the terminal |
| `?transparent=1` | transparent background (for an overlay) |

Combine them: `…/index.html?scene=redteam&theme=amber&ghost=1&kiosk=1`

In the app itself: the `kiosk` command toggles the chrome anytime, and `obs` prints
this list.

### Using it in OBS
1. Add a **Browser Source**.
2. Point it at the NetGhost URL with your params, e.g. `…?kiosk=1&ghost=1&scene=soc`.
3. For an overlay, add `&transparent=1` and OBS will show only the text over your scene.

---

## 12. Hotkeys

| Key | Action |
|---|---|
| **Esc** | Open/close Setup (or close an open dialog) |
| **Ctrl+Shift+G** | Toggle Auto-Ghost |
| **Ctrl+Shift+F** | Fullscreen |
| **↑ / ↓** | Command history |
| **Tab** | Autocomplete |
| **Ctrl+C** | Cancel the current line |
| **Ctrl+L** | Clear the screen |

(Plain `G` / `F` / `Esc` also work when the terminal isn't focused — e.g. after
clicking a side panel.)

---

## 13. Multi-monitor / pop-out ("Port")

Press **⧉ Port** (or type `port`, or in the desktop app menu → **New Monitor Window**)
to open a ghost screen in a new window — like opening a port. Drag it to another
monitor; it auto-runs in Auto-Ghost. Open several for a wall, or use the `videowall`
plugin's `wall [n]` command to spawn up to four at once. **SYS.LOAD is synced across
every window**, so all screens show the same CPU/memory/network/temperature.

---

## 14. Troubleshooting

**macOS: "Electron.app … contains malware / is damaged."**
False positive on the unsigned Electron binary. Update macOS (Apple fixes these),
then:
```
node node_modules/electron/install.js
xattr -cr node_modules/electron/dist/Electron.app
npm start
```
The permanent fix is code-signing + notarization (Apple Developer ID).

**`npm start` → `Error: spawn … Electron ENOENT`**
Electron's binary didn't download during install. Run:
```
node node_modules/electron/install.js
npm start
```

**The "10 vulnerabilities" message after `npm install`.**
They're in build-time dev dependencies, not your shipped app. Don't run
`npm audit fix --force` — it can break the build.

**AI agent prints its "thinking" instead of a report.**
You're on a reasoning/free model. Switch MODEL to `openai/gpt-4o-mini` or
`anthropic/claude-3.5-haiku` in Setup.

---

## 15. Building & releasing (recap)

```
npm run dist          # build installers for your OS → release/
```
To publish installers for all platforms, push a version tag — GitHub Actions builds
mac/win/linux and attaches them to a Release:
```
npm version patch     # bumps version + makes a tag
git push && git push --tags
```

---

Happy ghosting. ☕
