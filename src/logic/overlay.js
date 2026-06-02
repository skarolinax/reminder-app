import { BrowserWindow, app } from "electron";
import path from "path";

export function createOverlay(message) {
  const win = new BrowserWindow({
    width: 500,
    height: 280,
    x: 40,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
  });

  const filePath = path.join(app.getAppPath(), "public/overlay.html");

  win.loadURL(
    `file://${filePath}?message=${encodeURIComponent(message)}`
  );

  setTimeout(() => win.close(), 5000); // How quickly to close the overlay
}