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
    if (document.getElementById('incomingTable')) document.getElementById('incomingTable').remove();
    if (document.getElementById('outgoingTable')) document.getElementById('outgoingTable').remove();
    if (document.getElementById('outputTable')) document.getElementById('outputTable').remove();
    if (document.getElementById('incomingTableTitle')) document.getElementById('incomingTableTitle').remove();
    if (document.getElementById('outgoingTableTitle')) document.getElementById('outgoingTableTitle').remove();
    if (document.getElementById('outputTableTitle')) document.getElementById('outputTableTitle').remove();
    document.getElementById('output').innerHTML = '';
}

function outputText(text) {
    document.getElementById('output').innerHTML += text + '<br>';
}

let hasHeadless = false;
function loadFriends() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');
    new VerifiedToken(acc.accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }

        let friendsBaseUrl = 'https://friends-public-service-prod06.ol.epicgames.com/friends/api/v1/'+acc.accountId+'/';
        let friends = await axios.get(friendsBaseUrl+'summary?displayNames=true',
            {
                Authorization: 'bearer '+token
            }
        );

        clearOutput();

        let table = document.createElement('table');
        table.id = 'outputTable';
        for (const friend of friends.friends.sort((a, b) => (a.displayName || a.accountId).toLowerCase().localeCompare((b.displayName || b.accountId).toLowerCase()))){
            if (!friend.displayName) table.classList.add('noDisplayName');
            let row = '<tr><td class="friend">'+(friend.displayName || friend.accountId)+'</td><td>' +
                '<img src="../../assets/img/emojis/incoming_envelope.png" onclick="invite(\''+acc.accountId+'\', \''+friend.accountId+'\', \''+(friend.displayName || friend.accountId)+'\')" style="cursor: pointer" width="16pt" alt="remove"> ';
           table.innerHTML += row;
        }
        if (table.classList.contains('noDisplayName')) hasHeadless = true;
        document.getElementById('output').appendChild(table);
    });
}

async function invite(accountId, friendId, friendDisplay){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }

        let party = await axios.get(
            'https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/user/'+accountId,
            {
                'Authorization': 'bearer '+token,
                'Content-Type': 'application/json'
            }
        );

        if (!party.current.length) {
            clearOutput();
            return outputText('You are not currently in a party.');
        }
        party = party.current[0];

        if (party.joinability === 'OPEN'){
            let invite = await axios.post(
                'https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/user/'+friendId+'/pings/'+accountId,
                JSON.stringify({
                    'urn:epic:invite:platformdata_s': ''
                }),
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            if (invite?.errorMessage){
                clearOutput();
                return outputText(invite.errorMessage);
            }
        } else {
            let invite = await axios.post(
                'https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/parties/'+party.id+'/invites/'+friendId+'?sendPing=true',
                JSON.stringify({
                    'epic:fg:build-id_s': '1:3:',
                    'epic:conn:platform_s': 'WIN',
                    'epic:conn:type_s': 'game',
                    'epic:invite:platform_data_s': '',
                    'epic:member:dn_s': friendDisplay
                }),
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            if (invite?.errorMessage){
                clearOutput();
                return outputText(invite.errorMessage);
            }
        }

        loadFriends();
    });
}

document.addEventListener('keyup', () => {
    let input = document.getElementById('search').value;
    let nodeList = document.getElementsByClassName('friend');
    let setHeadless = false;
    for (let i = 0; i <= nodeList.length; i++){
        let td = nodeList.item(i);
        if (td && !td.innerHTML.toLowerCase().includes(input.toLowerCase())) td.parentElement.style.display = 'none';
        else if (td){
            if (!setHeadless) td.parentElement.parentElement.parentElement.classList.remove('noDisplayName');
            td.parentElement.style.display = 'table-row';
            if (td.innerHTML.length === 32 && hasHeadless && !setHeadless) {
                td.parentElement.parentElement.parentElement.classList.add('noDisplayName');
                setHeadless = true;
            }
        }
    }
});

window.invite = invite;
window.loadFriends = loadFriends;