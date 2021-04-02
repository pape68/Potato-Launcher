const fs = require('fs');

function finished(){
    document.getElementById('loading').style.display = 'none';
    document.getElementById('done').style.display = 'block';
}

if (!fs.existsSync(process.env.appdata+'/a.bakedpotato/fnapp/accounts.json')) throw finished();

const oldAcc = JSON.parse(fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnapp/accounts.json').toString());
const newAcc = [];

for (const [accountId, account] of Object.entries(oldAcc)){
    console.log(accountId, account);
    account.accountId = accountId;
    newAcc.push(account);
}

if (!fs.existsSync(process.env.appdata+'/a.bakedpotato')) fs.mkdirSync(process.env.appdata+'/a.bakedpotato');
if (!fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2')) fs.mkdirSync(process.env.appdata+'/a.bakedpotato/fnappv2');
if (!fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/tokens')) fs.mkdirSync(process.env.appdata+'/a.bakedpotato/fnappv2/tokens');

fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json', JSON.stringify(newAcc, null, '\t'));
finished();