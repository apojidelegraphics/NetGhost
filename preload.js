// NetGhost — preload bridge (safe, minimal surface)
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("netghost", {
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  popout: () => ipcRenderer.send("popout"),
  isElectron: true
});
