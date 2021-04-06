const electron = require('electron');

const { app, BrowserWindow, Menu } = electron;

app.on('ready', () => {
    let window = new BrowserWindow({
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    //window.webContents.openDevTools();
    window.loadURL('file://'+__dirname+'/index.html').then();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

function addAccountWindow(){
    let addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Account',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    addWindow.loadURL('file://'+__dirname+'/menu/account/addAccount.html').then();
    addWindow.removeMenu();
}

function convertAccountsWindow(){
    let convertWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Convert Accounts',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    convertWindow.loadURL('file://'+__dirname+'/menu/account/convertOld.html').then();
    convertWindow.removeMenu();
}

function removeAccWindow(){
    let rmWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Remove Account',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    rmWindow.webContents.openDevTools();
    rmWindow.loadURL('file://'+__dirname+'/menu/account/rmAccount.html').then();
    rmWindow.removeMenu();
}

function setPathWindow(){
    let pathWindow = new BrowserWindow({
        width: 350,
        height: 233,
        title: 'Set Path',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    pathWindow.loadURL('file://'+__dirname+'/menu/settings/setPath.html').then();
    pathWindow.removeMenu();
}

function creditsWindow(){
    let credWindow = new BrowserWindow({
        width: 350,
        height: 350,
        title: 'Potato Launcher Credits',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    credWindow.loadURL('file://'+__dirname+'/menu/credits/index.html').then();
    credWindow.removeMenu();
}

function devLoginWindow(){
    let loginWindow = new BrowserWindow({
        width: 350,
        height: 350,
        title: 'Device Auth Login',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    loginWindow.loadURL('file://'+__dirname+'/menu/account/devLogin.html').then();
    loginWindow.removeMenu();
}

function xchLoginWindow(){
    let loginWindow = new BrowserWindow({
        width: 350,
        height: 233,
        title: 'Exchange Code Login',
        icon: './assets/img/brightcore.png',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    //loginWindow.webContents.openDevTools();
    loginWindow.loadURL('file://'+__dirname+'/menu/account/xchLogin.html').then();
    loginWindow.removeMenu();
}

const menu = [
    {
        label: 'Accounts',
        submenu: [
            {
                label: 'Add Account',
                click(){
                    addAccountWindow();
                }
            },
            {
                label: 'Convert v1 Accounts',
                click(){
                    convertAccountsWindow();
                }
            },
            {
                label: 'Device Auth Login',
                click(){
                    devLoginWindow();
                }
            },
            {
                label: 'Exchange Code Login',
                click(){
                    xchLoginWindow();
                }
            },
            {
                label: 'Remove Account',
                click(){
                    removeAccWindow();
                }
            }
        ]
    },
    {
        label: 'Credits',
        click(){
            creditsWindow();
        }
    },
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Set Path',
                click() {
                    setPathWindow();
                }
            }
        ]
    }
]