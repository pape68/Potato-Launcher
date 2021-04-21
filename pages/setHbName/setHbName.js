import { api } from '../../assets/script/api.js';

const fs = require('fs');

const accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('accounts');
for (const account of accounts) {
    let acc = document.createElement('option');
    acc.textContent = account.displayName;
    acc.value = account.accountId;
    select.appendChild(acc);
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function outputText(text) {
    document.getElementById('output').innerHTML += text + '<br>';
}

async function setHbName() {
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    let hbName = document.getElementById('newHbName').value;
    let profile = await api.SetHomebaseName(acc.accountId, hbName);
    if (profile.errorMessage){
        clearOutput();
        return outputText(profile.errorMessage);
    }
    let newHbName = profile.profileChanges[0].profile.stats.attributes.homebase_name;
    clearOutput();
    outputText('Homebase name changed to '+newHbName);
}

window.setHbName = setHbName;