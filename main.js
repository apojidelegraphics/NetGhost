// NetGhost — Electron main process
// Ambient network/security terminal (SIMULATION ONLY). Author: Apoji_Delegraphics
const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("path");

let mainWindow = null;
const childWindows = new Set();

function createWindow(opts = {}) {
  const win = new BrowserWindow({
    width: opts.width || 1360,
    height: opts.height || 840,
    minWidth: 900,
    minHeight: 560,
    backgroundColor: "#07070a",
    title: "NetGhost",
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  const hash = opts.monitor ? "#monitor" : "";
  win.loadFile(path.join(__dirname, "renderer", "index.html"), { hash });
  win.once("ready-to-show", () => win.show());

  // let window.open (pop-out fallback) spawn a native monitor window
  win.webContents.setWindowOpenHandler(() => ({
    action: "allow",
    overrideBrowserWindowOptions: {
      width: 1280, height: 720, backgroundColor: "#07070a",
      autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
    }
  }));

  return win;
}

function buildMenu() {
  const template = [
    {
      label: "NetGhost",
      submenu: [
        { label: "New Monitor Window", accelerator: "CmdOrCtrl+N", click: () => openMonitor() },
        { type: "separator" },
        { role: "togglefullscreen" },
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: (_, w) => w && w.reload() },
        { label: "DevTools", accelerator: "CmdOrCtrl+Alt+I", click: (_, w) => w && w.webContents.toggleDevTools() },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    { role: "editMenu" },
    {
      label: "Help",
      submenu: [
        { label: "About NetGhost", click: () => shell.openExternal("https://github.com/Apoji-Delegraphics/netghost") }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openMonitor() {
  const win = createWindow({ monitor: true, width: 1280, height: 720 });
  childWindows.add(win);
  win.on("closed", () => childWindows.delete(win));
}

app.whenReady().then(() => {
  buildMenu();
  mainWindow = createWindow();

  ipcMain.on("toggle-fullscreen", (e) => {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (w) w.setFullScreen(!w.isFullScreen());
  });
  ipcMain.on("popout", () => openMonitor());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
