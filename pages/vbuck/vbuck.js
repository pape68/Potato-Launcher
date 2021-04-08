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

async function vbuck() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');

    let ccProfile = await api.QueryProfile(acc.accountId, 'common_core');
    ccProfile = ccProfile.profileChanges[0].profile.items;

    clearOutput();
    let total = 0;
    for (const item of Object.values(ccProfile).filter(i => i.templateId.startsWith('Currency:')).sort((a, b) => b.quantity-a.quantity)){
        outputText('<b>'+formatNum(item.quantity)+' x</b> '+item.attributes.platform+' '+item.templateId.split('Mtx')[1]
            .replace('Complimentary', 'Complimentary (STW)')
            .replace('Giveaway', 'Giveaway (BR)')
        );
        total += item.quantity;
    }
    outputText('<h2>'+formatNum(total)+' V-Bucks</h2>');
}

window.vbuck = vbuck;