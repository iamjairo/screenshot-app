'use strict';

const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 30000;

let mainWindow = null;
let tray = null;
let serverProcess = null;

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

function startServer() {
  const serverEntry = path.join(__dirname, '..', 'index.js');
  serverProcess = spawn(process.execPath, [serverEntry, '-p', String(SERVER_PORT), '--oc', '1'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
    },
    stdio: 'inherit',
  });

  serverProcess.on('error', (err) => {
    console.error('[electron] Failed to start server process:', err.message);
  });

  serverProcess.on('exit', (code, signal) => {
    if (code !== 0 && !app.isQuitting) {
      console.warn(`[electron] Server exited unexpectedly (code=${code}, signal=${signal})`);
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// ---------------------------------------------------------------------------
// Wait for the HTTP server to become ready
// ---------------------------------------------------------------------------

function waitForServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    function poll() {
      http.get(SERVER_URL, (res) => {
        res.resume(); // discard body
        resolve();
      }).on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start within ${POLL_TIMEOUT_MS}ms`));
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      });
    }

    poll();
  });
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    title: 'Screenshot App',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// Tray
// ---------------------------------------------------------------------------

function createTray() {
  // Use a blank 1×1 transparent image as a fallback icon
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Screenshot App');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    } else {
      createWindow();
    }
  });
}

// ---------------------------------------------------------------------------
// App events
// ---------------------------------------------------------------------------

app.whenReady().then(async () => {
  startServer();

  try {
    await waitForServer();
  } catch (err) {
    console.error('[electron] Server failed to start:', err.message);
    app.quit();
    return;
  }

  createWindow();
  createTray();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Keep running in the tray on all platforms
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopServer();
});
