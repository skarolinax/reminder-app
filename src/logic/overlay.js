import { BrowserWindow } from "electron";

export function createOverlay(message) {
  const win = new BrowserWindow({
    width: 250,
    height: 150,
    x:40,
    y:40,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    backgroundColor: "#fff3a1",
  });

  const html = `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: sans-serif;
            background: #fffa8b;
            color: #000;
            display: flex;
            justify-content: start;
            align-items: center;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${message}
      </body>
    </html>
  `;

  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  setTimeout(() => win.close(), 2000);
}