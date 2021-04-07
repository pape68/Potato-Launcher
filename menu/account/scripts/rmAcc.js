const fs = require('fs');

let accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

function updateAccounts(){
    const select = document.getElementById('accounts');
    select.innerHTML = '';
    for (const account of accounts) {
        let acc = document.createElement('option');
        acc.textContent = account.displayName;
        acc.value = account.accountId;
        select.appendChild(acc);
    }
}

async function rmAcc(){
    const input = document.getElementById('accounts').value;
    document.getElementById('output').innerHTML = 'Loading <img src="../../assets/img/loading.gif" width="20pt" alt="loading">';

    let oldAcc = accounts.filter(acc => acc.accountId === input)[0].displayName;
    accounts = accounts.filter(acc => acc.accountId !== input).sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()));
    document.getElementById('output').innerHTML = 'Goodbye, <a>'+oldAcc+'</a>. Your account has been removed.';
    fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json', JSON.stringify(accounts, null, '\t'));
    updateAccounts();
}

window.rmAcc = rmAcc;
updateAccounts();