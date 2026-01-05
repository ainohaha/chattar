const { app, BrowserWindow, systemPreferences } = require('electron');

async function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "Chattar Live Cam",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        backgroundColor: '#000000'
    });

    // Load the standalone camera view from the Vite dev server
    win.loadURL('http://localhost:5001/standalone-cam');

    // Open DevTools for debugging (can be removed later)
    // win.webContents.openDevTools();
}

app.whenReady().then(async () => {
    // Request camera access on macOS
    if (process.platform === 'darwin') {
        const status = await systemPreferences.askForMediaAccess('camera');
        if (!status) {
            console.log('Camera access denied or not granted yet.');
        }
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
