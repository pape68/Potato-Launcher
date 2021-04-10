const fs = require('fs');
setTimeout(() => {
    createOverlay('Are you sure you want to convert v1 settings? This will overwrite any existing v2 settings.', run);
}, 100);

function finished(){
    document.getElementById('loading').style.display = 'none';
    document.getElementById('done').style.display = 'block';
}

let cancelled = true;
function run(){
    cancelled = false;
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
    fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt', fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnapp/settings/path.txt').toString());
    finished();
}

document.addEventListener('click', () => {
    if (!document.getElementById('overlay') && cancelled) {
        setTimeout(() => {
            document.getElementById('done').innerHTML = 'Your settings have not been converted.';
            finished();
        }, 100);
    }
});