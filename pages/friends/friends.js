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

function friends() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="4%">');
    new VerifiedToken(acc.accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }

        let friendsBaseUrl = 'https://friends-public-service-prod06.ol.epicgames.com/friends/api/v1/'+acc.accountId+'/';

        let incoming = await axios.get(friendsBaseUrl+'incoming?displayNames=true',
            {
                Authorization: 'bearer '+token
            }
        );
        let outgoing = await axios.get(friendsBaseUrl+'outgoing?displayNames=true',
            {
                Authorization: 'bearer '+token
            }
        );
        let friends = await axios.get(friendsBaseUrl+'summary?displayNames=true',
            {
                Authorization: 'bearer '+token
            }
        );

        if (incoming.errorMessage){
            clearOutput();
            return outputText(incoming.errorMessage);
        }

        clearOutput();
        if (incoming.length){
            outputText('<h2 id="incomingTableTitle">Incoming ('+incoming.length+')</h2>');
            let incomingTable = document.createElement('table');
            incomingTable.id = 'incomingTable';

            let width = 5;
            if (incoming.filter(f => !f.displayName).length) width = 10;
            for (const request of incoming.sort((a, b) => (a.displayName || a.accountId).toLowerCase().localeCompare((b.displayName || b.accountId).toLowerCase()))){
                if (!request.displayName) incomingTable.classList.add('noDisplayName');
                incomingTable.innerHTML += '<tr><td>'+(request.displayName || request.accountId)+'</td><td>' +
                    '<img src="../../assets/img/emojis/white_check_mark.png" onclick="addFriend(\''+acc.accountId+'\',\''+request.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="accept"> ' +
                    '<img src="../../assets/img/emojis/x.png" onclick="delFriend(\''+acc.accountId+'\', \''+request.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="deny"> ' +
                    '<img src="../../assets/img/emojis/no_entry_sign.png" onclick="createOverlay(\'Are you sure you want to block this user?<br>'+(request.displayName || request.accountId)+'\', blockUser, \''+acc.accountId+'\', \''+request.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="block"></td></tr>'
            }

            document.getElementById('output').appendChild(incomingTable);
        }

        if (outgoing.length){
            outputText('<h2 id="outgoingTableTitle">Outgoing ('+outgoing.length+')</h2>');
            let outgoingTable = document.createElement('table');
            outgoingTable.id = 'outgoingTable';

            let width = 5;
            if (outgoing.filter(f => !f.displayName).length) width = 10;
            for (const request of outgoing.sort((a, b) => (a.displayName || a.accountId).toLowerCase().localeCompare((b.displayName || b.accountId).toLowerCase()))){
                if (!request.displayName) outgoingTable.classList.add('noDisplayName');
                outgoingTable.innerHTML += '<tr><td>'+(request.displayName || request.accountId)+'</td><td>' +
                    '<img src="../../assets/img/emojis/x.png" onclick="delFriend(\''+acc.accountId+'\', \''+request.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="cancel"> ' +
                    '<img src="../../assets/img/emojis/no_entry_sign.png" onclick="createOverlay(\'Are you sure you want to block this user?<br>'+(request.displayName || request.accountId)+'\', blockUser, \''+acc.accountId+'\', \''+request.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="block"></td></tr>'
            }

            document.getElementById('output').appendChild(outgoingTable);
        }

        outputText('<h2 id="outputTableTitle">Friends ('+friends.friends.length+')</h2>');
        let table = document.createElement('table');
        table.id = 'outputTable';
        let width = 5;
        if (friends.friends.filter(f => !f.displayName).length) width = 10;
        for (const friend of friends.friends.sort((a, b) => (a.displayName || a.accountId).toLowerCase().localeCompare((b.displayName || b.accountId).toLowerCase()))){
            if (!friend.displayName) table.classList.add('noDisplayName');
            let row = '<tr><td>'+(friend.displayName || friend.accountId)+'</td><td>' +
                '<img src="../../assets/img/emojis/no_entry.png" onclick="createOverlay(\'Are you sure you want to remove this friend?<br>'+(friend.displayName || friend.accountId)+'\', delFriend, \''+acc.accountId+'\', \''+friend.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="remove"> ' +
                '<img src="../../assets/img/emojis/no_entry_sign.png" onclick="createOverlay(\'Are you sure you want to block this user?<br>'+(friend.displayName || friend.accountId)+'\', blockUser, \''+acc.accountId+'\', \''+friend.accountId+'\')" style="cursor: pointer" width="'+width+'%" alt="block"></td>';
            table.innerHTML += row;
        }
        document.getElementById('output').appendChild(table);
    });
}

async function addFriend(accountId, friendId){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="4%">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }
        let sendFr = await axios.post(
            'https://friends-public-service-prod06.ol.epicgames.com/friends/api/public/friends/'+accountId+'/'+friendId,
            '{}',
            {
                Authorization: 'bearer '+token
            }
        );
        if (sendFr && sendFr.errorMessage){
            clearOutput();
            return outputText(sendFr.errorMessage);
        }
        friends();
    });
}

async function blockUser(accountId, friendId){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="4%">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }
        let block = await axios.post(
            'https://friends-public-service-prod06.ol.epicgames.com/friends/api/v1/'+accountId+'/blocklist/'+friendId,
            '{}',
            {
                Authorization: 'bearer '+token
            }
        );
        if (block && block.errorMessage){
            clearOutput();
            return outputText(block.errorMessage);
        }
        friends();
    });
}

async function delFriend(accountId, friendId){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="4%">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32){
            clearOutput();
            return outputText(token);
        }
        let delFr = await axios.delete(
            'https://friends-public-service-prod06.ol.epicgames.com/friends/api/public/friends/'+accountId+'/'+friendId,
            {
                Authorization: 'bearer '+token
            }
        );
        if (delFr && delFr.errorMessage){
            clearOutput();
            return outputText(delFr.errorMessage);
        }
        friends();
    });
}

async function sendRequest(){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="4%">');
    new VerifiedToken(null, async token => {
        let input = document.getElementById('input').value;
        let myInput = document.getElementById('accounts').value;
        let myAcc = accounts.filter(acc => acc.accountId === myInput)[0];

        if (token.length !== 32) {
            clearOutput();
            return outputText('Error: ' + token);
        }

        if (input.length !== 32) {
            let lookup = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/' + input,
                {
                    'Authorization': 'bearer ' + token,
                    'Content-Type': 'application/json'
                }
            );
            if (!lookup.id) {
                clearOutput();
                return outputText(lookup.errorMessage);
            }
            input = lookup.id;
        }

        let acc = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account?accountId=' + input,
            {
                'Authorization': 'bearer ' + token,
                'Content-Type': 'application/json'
            }
        );

        if (!acc[0]){
            clearOutput();
            return outputText(acc.errorMessage);
        }
        acc = acc[0];
        addFriend(myAcc.accountId, acc.id).then();
    });
}

window.friends = friends;
window.addFriend = addFriend;
window.blockUser = blockUser;
window.delFriend = delFriend;
window.sendRequest = sendRequest;