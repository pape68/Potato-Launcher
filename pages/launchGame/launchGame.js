import { axios } from '../../assets/script/requests.js';
import { VerifiedToken } from '../../assets/script/VerifiedToken.js';

const child_process = require('child_process');
const fs = require('fs');

const accounts = JSON.parse(fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('accounts');
for (const account of accounts){
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

function launchGame(){
    let input = document.getElementById('accounts').value;
    clearOutput();
    let path = fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt').toString();
    if (!path) return outputText('Error: Fortnite Path not set');
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    outputText('Launching game on '+acc.displayName+' <img src="../../assets/img/loading.gif" alt="loading" width="4%">');

    new VerifiedToken(input, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText('Error: '+token);
        }
        let xch = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
            {
                Authorization: 'bearer '+token
            }
        );
        if (!xch.code) {
            clearOutput();
            return outputText('Error: '+xch.errorMessage);
        }

        child_process.exec('start "" "FortniteLauncher.exe" -AUTH_LOGIN=unused -AUTH_PASSWORD="'+xch.code+'" -AUTH_TYPE=exchangecode -epicapp=Fortnite -epicenv=Prod -epicportal -epiclocale=en-us',
            {
                cwd: path
            }
        );
    });
}

window.launchGame = launchGame;