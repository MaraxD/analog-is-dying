const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

// We can use Electron's built-in app.isPackaged instead of the electron-is-dev package
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    // The "kiosk" option is the magic flag! 
    // It makes the app run in fullscreen, hides the dock/taskbar, 
    // and strictly disables Alt+Tab / Command+Tab on supported OS configurations.
    kiosk: true, 
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simpler local development
    },
  });

  // Load the React app
  // In development, load the localhost dev server
  // In production, load the built index.html
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Prevent the window from being closed by standard shortcuts (Cmd+W / Alt+F4)
  mainWindow.on('close', (e) => {
    // Note: We don't preventDefault here so the dev shortcut can still close it.
  });
}

app.whenReady().then(() => {
  createWindow();

  // SECRET EXIT SHORTCUT:
  // Because Kiosk mode blocks normal exiting, we need a hidden shortcut for you (the artist/developer) to close the app.
  // Press Command+Shift+Q (Mac) or Control+Shift+Q (Windows) to exit the kiosk!
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts when quitting
  globalShortcut.unregisterAll();
});
