// NetGhost — preload bridge (safe, minimal surface)
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("netghost", {
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  popout: () => ipcRenderer.send("popout"),
  sync: (data) => ipcRenderer.send("ng-sync", data),
  onSync: (cb) => ipcRenderer.on("ng-sync", (_e, d) => cb(d)),
  isElectron: true
});
