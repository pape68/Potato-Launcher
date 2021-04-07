import {axios} from '../../assets/script/requests.js';
import {VerifiedToken} from '../../assets/script/VerifiedToken.js';

const electron = require('electron');
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

function accountSettings() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Opening account settings for ' + acc.displayName + ' <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');

    new VerifiedToken(input, async token => {
        if (token.length !== 32) {
            clearOutput();
            return outputText('Error: ' + token);
        }
        let xch = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
            {
                Authorization: 'bearer ' + token
            }
        );
        if (!xch.code) {
            clearOutput();
            return outputText('Error: ' + xch.errorMessage);
        }

        await electron.shell.openExternal('https://www.epicgames.com/id/exchange?exchangeCode='+xch.code);
        clearOutput();
        outputText(`Opened browser for ${acc.displayName} <img src="../../assets/img/emojis/ok_hand.png" alt="ok hand" width=16pt>`);
    });
}

window.accountSettings = accountSettings;