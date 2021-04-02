const electron = require('electron');

const { app, BrowserWindow, Menu } = electron;

let window;
let addWindow;

app.on('ready', () => {
    window = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    window.loadURL('file://'+__dirname+'/index.html').then();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

function addAccountWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Account',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
    addWindow.loadURL('file://'+__dirname+'/menu/account/addAccount.html').then();
    addWindow.removeMenu();
    //addWindow.webContents.openDevTools();
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
            }
        ]
    }
]