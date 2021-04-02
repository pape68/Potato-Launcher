import {axios} from '../../assets/script/requests.js';
import {VerifiedToken} from '../../assets/script/VerifiedToken.js';

const fs = require('fs');
const clipboardy = require("clipboardy");

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

function genXc() {
    let input = document.getElementById('accounts').value;
    clearOutput();
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    outputText('Generating exchange on ' + acc.displayName + ' <img src="../../assets/img/loading.gif" alt="loading" width="4%">');

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

        clearOutput();
        outputText(`Exchange code: ${xch.code}`);
        clipboardy.writeSync(xch.code);
    });
}

window.genXc = genXc;