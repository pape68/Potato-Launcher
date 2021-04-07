import { api } from '../../assets/script/api.js';
import { formatNum } from '../../assets/script/util.js';

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

async function collectDaily() {
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    const templateIds = JSON.parse(fs.readFileSync(__dirname+'/../../assets/json/templateIds.json').toString());
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    let login = await api.ClaimLoginReward(acc.accountId);
    if (login.errorMessage){
        clearOutput();
        return outputText(login.errorMessage);
    }
    let days = login.notifications[0].daysLoggedIn;
    if (!login.notifications[0].items[0]) {
        clearOutput();
        return outputText('Already collected reward for day '+formatNum(days)+'.');
    }
    let item = login.notifications[0].items[0];
    clearOutput();
    outputText('<b>Day '+formatNum(days)+':</b> Collected '+item.quantity+'x '+(templateIds[item.itemType] || item.itemType));
}

window.collectDaily = collectDaily;