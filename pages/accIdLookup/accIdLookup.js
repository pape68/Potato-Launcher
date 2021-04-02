import { axios } from '../../assets/script/requests.js';
import { VerifiedToken } from '../../assets/script/VerifiedToken.js';

function clearOutput(){
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

async function lookupAcc(){
    new VerifiedToken(null, async token => {
        let input = document.getElementById('input').value;

        clearOutput();
        if (token.length !== 32) return outputText('Error: '+token);

        if (input.length !== 32){
            let lookup = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/'+input,
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            if (!lookup.id) return outputText(lookup.errorMessage);
            input = lookup.id;
        }

        let acc = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account?accountId='+input,
            {
                'Authorization': 'bearer '+token,
                'Content-Type': 'application/json'
            }
        );

        if (!acc[0]) return outputText(acc.errorMessage);
        acc = acc[0];

        let table = document.createElement('table');
        table.innerHTML += '<tr><td><b>Account ID:</b></td><td>'+acc.id+'</td></tr>';
        table.innerHTML += '<tr><td><b>Display Name:</b></td><td>'+acc.displayName+'</td></tr>';
        if (acc.externalAuths.psn) table.innerHTML += '<tr><td><b>PSN Username:</b></td><td>'+acc.externalAuths.psn.externalDisplayName+'</td></tr>';
        if (acc.externalAuths.xbl) table.innerHTML += '<tr><td><b>Xbox Username:</b></td><td>'+acc.externalAuths.xbl.externalDisplayName+'</td></tr>';
        document.getElementById('output').appendChild(table);

        /*outputText('<b>Account ID:</b> '+acc.id);
        outputText('<b>Display Name:</b> '+acc.displayName);
        if (acc.externalAuths.psn) outputText('<b>PSN Username:</b> '+acc.externalAuths.psn.externalDisplayName);
        if (acc.externalAuths.xbl) outputText('<b>Xbox Username:</b> '+acc.externalAuths.xbl.externalDisplayName);*/
    });
}

window.lookupAcc = lookupAcc;