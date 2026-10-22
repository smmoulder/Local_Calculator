const {app, BrowserWindow, Menu, shell} = require('electron');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {externalUrl} = require('./links.cjs');
const entry = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
app.setAppUserModelId('com.smmoulder.localaiworkbench');
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let window;
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(() => {
    window = new BrowserWindow({
      width: 1360, height: 940, minWidth: 760, minHeight: 600,
      title: 'Local AI Workbench', icon: app.isPackaged ? path.join(process.resourcesPath, 'icon.ico') : path.join(__dirname, 'assets/icon.ico'),
      show: false, backgroundColor: '#f7f7f2',
      webPreferences: {nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true}
    });
    const session = window.webContents.session;
    session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.setPermissionCheckHandler(() => false);
    const openExternal = value => { const url = externalUrl(value); if (url) shell.openExternal(url).catch(() => {}); };
    window.webContents.setWindowOpenHandler(({url}) => { openExternal(url); return {action: 'deny'}; });
    window.webContents.on('will-navigate', (event, url) => {
      if (url.split('#')[0] !== entry) { event.preventDefault(); openExternal(url); }
    });
    window.webContents.on('will-attach-webview', event => event.preventDefault());
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label: 'File', submenu: [{role: 'quit'}]},
      {label: 'Edit', submenu: [{role: 'undo'}, {role: 'redo'}, {type: 'separator'}, {role: 'cut'}, {role: 'copy'}, {role: 'paste'}, {role: 'selectAll'}]},
      {label: 'View', submenu: [{role: 'reload'}, {role: 'resetZoom'}, {role: 'zoomIn'}, {role: 'zoomOut'}, {role: 'togglefullscreen'}]},
      {label: 'Help', submenu: [{label: 'Project and support', click: () => openExternal('https://github.com/smmoulder/Local_Calculator')}]}
    ]));
    window.once('ready-to-show', () => window.show());
    window.on('closed', () => { window = null; });
    window.loadURL(entry);
  });
  app.on('window-all-closed', () => app.quit());
}
