import { axios } from '../../assets/script/requests.js';
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
    if (document.getElementById('outputTable')) document.getElementById('outputTable').remove();
    document.getElementById('output').innerHTML = '';
}

function outputText(text) {
    document.getElementById('output').innerHTML += text + '<br>';
}

function devAuth() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');
    new VerifiedToken(acc.accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }

        let deviceAuths = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/'+acc.accountId+'/deviceAuth',
            {
                Authorization: 'bearer '+token
            }
        );

        if (deviceAuths.errorMessage){
            clearOutput();
            return outputText(deviceAuths.errorMessage);
        }

        let deviceAuthTable = document.createElement('table');
        deviceAuthTable.id = 'outputTable';
        for (const device of deviceAuths.sort((a, b) => a.deviceId.localeCompare(b.deviceId))){
            let row = '<tr><td><img src="../../assets/img/'+(
                acc.deviceId === device.deviceId ? 'brightcore'
            :   device.created.ipAddress === '135.181.135.181' ? 'ak47'
            :   device.created.ipAddress === '172.88.227.180' ? 'fndaily'
            :   'emojis/blank'
            )+'.png" width="16pt" alt="this device"></td><td>'+device.deviceId+'</td><td>' +

                '<img src="../../assets/img/emojis/information_source.png" style="cursor: pointer" onclick="createInfoOverlay(\'' +
                'Device ID: '+device.deviceId+'<br>' +
                (device.userAgent ? 'User Agent: '+device.userAgent+'<br>':'') +
                'Created on '+device.created.dateTime+' in '+device.created.location+' (IP: '+device.created.ipAddress+')<br>' +
                (device.lastAccess ? 'Last accessed on '+device.lastAccess.dateTime+' in '+device.lastAccess.location+' (IP: '+device.lastAccess.ipAddress+')':'This device auth has not been used.') +
                '\')" width="16pt" alt="i"> ' +

                '<img src="../../assets/img/emojis/no_entry.png" style="cursor: pointer" onclick="createOverlay(' +
                '\'Delete this device?<br>'+device.deviceId+'\',' +
                'delDevice,' +
                '\''+acc.accountId+'\',' +
                '\''+device.deviceId+'\'' +
                ')" width="16pt" alt="x">' +
                '</td></tr>';
            deviceAuthTable.innerHTML += row;
        }
        clearOutput();
        document.getElementById('output').appendChild(deviceAuthTable);
    });
}

async function delDevice(accountId, deviceId){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');
    new VerifiedToken(accountId, async token => {
        let r = await axios.delete('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/'+accountId+'/deviceAuth/'+deviceId,
            {
                Authorization: 'bearer '+token
            }
        );

        clearOutput();
        if (r && r.errorMessage) return outputText(r.errorMessage);
        outputText('Successfully deleted device '+deviceId+' for account '+accountId);
    });
}

window.devAuth = devAuth;
window.delDevice = delDevice;