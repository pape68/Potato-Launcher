import { axios, launcherBasic } from '../../assets/script/requests.js';
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
    let LaunchCommand;
    let input = document.getElementById('accounts').value;
    clearOutput();
    let path = fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt').toString();
    if (!path) return outputText('Error: Fortnite Path not set');
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    outputText('Launching game on '+acc.displayName+' <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');

    new VerifiedToken(input, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText('Error (-1): '+token);
        }
        let xchIos = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
            {
                Authorization: 'bearer '+token
            }
        );
        if (!xchIos.code) {
            clearOutput();
            return outputText('Error (0): '+xchIos.errorMessage);
        }
		
		let newToken = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
			'grant_type=exchange_code&exchange_code=' + xchIos.code,
			{
				'Authorization': 'basic '+launcherBasic,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		);
		if (!newToken.access_token){
            clearOutput();
            return outputText('Error (2): '+newToken.errorMessage);
		}
        let xch = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
            {
                Authorization: 'bearer '+newToken.access_token
            }
        );
        if (!xch.code) {
            clearOutput();
            return outputText('Error (1): '+xch.errorMessage);
        }

        fs.readdirSync("C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests").filter(i => i.endsWith('item')).forEach(item => {
            if (JSON.parse(fs.readFileSync(`C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests/${item}`).toString()).DisplayName === "Fortnite")
                LaunchCommand = (JSON.parse(fs.readFileSync(`C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests/${item}`).toString()).LaunchCommand);
        });

        child_process.exec(`start "" "FortniteLauncher.exe"${LaunchCommand} -AUTH_LOGIN=unused -AUTH_PASSWORD=${xch.code} -AUTH_TYPE=exchangecode -epicapp=Fortnite -epicenv=Prod -EpicPortal -steamimportavailable -epicusername="${acc.displayName}" -epicuserid=${acc.accountId} -epiclocale=en -epicsandboxid=fn`,
            {
                cwd: path
            }
        );

        clearOutput();
        outputText(`Launched game on ${acc.displayName} <img src="../../assets/img/emojis/ok_hand.png" alt="ok hand" width="16pt">`);
    });
}

window.launchGame = launchGame;