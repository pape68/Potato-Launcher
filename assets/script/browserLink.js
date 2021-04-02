const electron = require('electron');

document.body.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() !== 'a') return null;
    e.preventDefault();
    electron.shell.openExternal(e.target.href).then();
});