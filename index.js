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
            }
        ]
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