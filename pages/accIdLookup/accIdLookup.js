import { axios } from '../../assets/script/requests.js';
import { VerifiedToken, VerifiedTokenPromise } from '../../assets/script/VerifiedToken.js';

const fs = require('fs');
let accounts = [];
if (fs.existsSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json')) accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('search');
for (const account of accounts) {
    let acc = document.createElement('option');
    acc.textContent = account.displayName;
    acc.value = account.accountId;
    select.appendChild(acc);
}

function clearOutput(){
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

async function lookupAcc(){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    new VerifiedToken(null, async token => {
        let input = document.getElementById('search').value || document.getElementById('input').value;

        if (token.length !== 32){
            clearOutput();
            return outputText('Error: '+token);
        }

        if (input.length !== 32){
            let lookup = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/'+input,
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            if (!lookup.id){
                clearOutput();
                return outputText(lookup.errorMessage);
            }
            input = lookup.id;
        }

        let ownedAccount = false;
        if (accounts.filter(acc => acc.accountId === input).length){
            ownedAccount = true;
            token = await new VerifiedTokenPromise(input);
        }

        let acc = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account?accountId='+input,
            {
                'Authorization': 'bearer '+token,
                'Content-Type': 'application/json'
            }
        );

        clearOutput();
        if (!acc[0]) return outputText(acc.errorMessage);
        acc = acc[0];

        let table = document.createElement('table');
        table.innerHTML += '<tr><td><b>Account ID:</b></td><td>'+acc.id+'</td></tr>';
        if (acc.displayName) table.innerHTML += '<tr><td><b>Display Name:</b></td><td>'+acc.displayName+'</td></tr>';
        if (acc.externalAuths.psn) table.innerHTML += '<tr><td><b>PSN Username:</b></td><td>'+acc.externalAuths.psn.externalDisplayName+'</td></tr>';
        if (acc.externalAuths.twitch) table.innerHTML += '<tr><td><b>Twitch Username:</b></td><td>'+acc.externalAuths.twitch.externalDisplayName+'</td></tr>';
        if (acc.externalAuths.xbl) table.innerHTML += '<tr><td><b>Xbox Username:</b></td><td>'+acc.externalAuths.xbl.externalDisplayName+'</td></tr>';

        if (ownedAccount){
            let myAcc = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/'+acc.displayName,
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            table.innerHTML += '<tr><td height="10" colspan="2"></td></tr>';
            table.innerHTML += '<tr><td><b><u>Private</u></b></td><td><b><u>Information</u></b></td></tr>';
            table.innerHTML += '<tr><td height="10" colspan="2"></td></tr>';
            table.innerHTML += '<tr><td><b>Country:</b></td><td>'+myAcc.country+'</td></tr>';
            if (myAcc.lastDisplayNameChange) table.innerHTML += '<tr><td><b>Display Name Changed:</b></td><td>'+myAcc.lastDisplayNameChange+'</td></tr>';
            if (myAcc.numberOfDisplayNameChanges) table.innerHTML += '<tr><td><b>Display Name Changes:</b></td><td>'+myAcc.numberOfDisplayNameChanges+'</td></tr>';
            table.innerHTML += '<tr><td><b>E-Mail:</b></td><td>'+myAcc.email+'</td></tr>';
            table.innerHTML += '<tr><td><b>Language:</b></td><td>'+myAcc.preferredLanguage+'</td></tr>';
            if (myAcc.lastLogin) table.innerHTML += '<tr><td><b>Last Login:</b></td><td>'+myAcc.lastLogin+'</td></tr>';
            table.innerHTML += '<tr><td><b>Name:</b></td><td>'+myAcc.name+' '+myAcc.lastName+'</td></tr>';
            if (myAcc.phoneNumber) table.innerHTML += '<tr><td><b>Phone Number:</b></td><td>'+myAcc.phoneNumber+'</td></tr>';
        }
        document.getElementById('output').appendChild(table);

        /*outputText('<b>Account ID:</b> '+acc.id);
        outputText('<b>Display Name:</b> '+acc.displayName);
        if (acc.externalAuths.psn) outputText('<b>PSN Username:</b> '+acc.externalAuths.psn.externalDisplayName);
        if (acc.externalAuths.xbl) outputText('<b>Xbox Username:</b> '+acc.externalAuths.xbl.externalDisplayName);*/
    });
}

window.lookupAcc = lookupAcc;