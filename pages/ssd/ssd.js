import { api } from '../../assets/script/api.js';
import { axios } from '../../assets/script/requests.js';
import { formatNum } from '../../assets/script/util.js';
import { VerifiedToken } from '../../assets/script/VerifiedToken.js';

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

let ssds = ['Stonewood', 'Plankerton', 'Canny Valley', 'Twine Peaks'];
async function loadSsd(accountId, ssd){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }

        let accounts = ssd.attributes.outpost_core_info.accountsWithEditPermission;
        let accountsToQuery = [];
        for (let i = 0; i <= accounts.length; i += 99){
            accountsToQuery.push(accounts.slice(i, i+99));
        }
        let accountIds = {};
        for (const query of accountsToQuery){
            let queriedAccounts = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account?accountId='+query.join('&accountId='),
                {
                    Authorization: 'bearer '+token
                }
            );
            for (let acc of queriedAccounts){
                accountIds[acc.id] = acc.displayName || acc.id;
            }
        }

        let sortedAccounts = Object.values(accountIds).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        clearOutput();
        outputText('<h2>'+ssds[parseInt(ssd.templateId.substr(-1))-1]+'</h2>');
        outputText('Save Count: '+formatNum(ssd.attributes.cloud_save_info.saveCount));
        if (ssd.attributes.outpost_core_info.highestEnduranceWaveReached) outputText('Endurance Wave: '+ssd.attributes.outpost_core_info.highestEnduranceWaveReached);
        if (!sortedAccounts.length) return;
        outputText('<h2>Accounts with Edits</h2>');
        for (const acc of sortedAccounts){
            outputText(acc);
        }
    });
}

async function ssd() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');

    let metadata = await api.QueryProfile(acc.accountId, 'metadata');
    if (metadata.errorMessage){
        clearOutput();
        outputText(metadata.errorMessage);
    }
    let profile = metadata.profileChanges[0].profile;
    let table = document.createElement('table');
    for (const ssd of Object.keys(profile.items).filter(key => ssds[parseInt(profile.items[key].templateId.substr(-1))-1]).map(key => profile.items[key]).sort((a, b) => a.templateId.localeCompare(b.templateId))){
        let name = ssds[parseInt(ssd.templateId.substr(-1))-1];
        let row = document.createElement('tr');
        row.innerHTML = '<td>'+name+((ssd.attributes.outpost_core_info.highestEnduranceWaveReached) ? ' Endurance Wave '+ssd.attributes.outpost_core_info.highestEnduranceWaveReached:' Level '+ssd.attributes.level)+'</td><td><img src="../../assets/img/emojis/information_source.png" width="8%" style="cursor: pointer" onclick="loadSsd(\''+acc.accountId+'\', '+JSON.stringify(ssd).replace(/"/g, '\'')+')"></td>';
        table.appendChild(row);
    }

    clearOutput();
    document.getElementById('output').appendChild(table);
}

window.ssd = ssd;
window.loadSsd = loadSsd;