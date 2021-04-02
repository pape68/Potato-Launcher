import {axios} from '../../../assets/script/requests.js';

const electron = require('electron');
const fs = require('fs');

const loading = document.getElementById('loading');
const output = document.getElementById('code');

const iosBasic = 'MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=';
const switchBasic = 'NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3=';

(async () => {
    let deviceCodeToken = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
        'grant_type=client_credentials',
        {
            'Authorization': 'basic '+switchBasic,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    );

    let deviceCode = await axios.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization',
        'prompt=login',
        {
            'Authorization': 'bearer '+deviceCodeToken.access_token,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    );

    await electron.shell.openExternal(deviceCode.verification_uri_complete);

    output.getElementsByTagName('p')[0].innerHTML = deviceCode.user_code;
    loading.style.display = 'none';
    output.style.display = 'block';

    const interval = setInterval(async () => {
        let checkLoggedIn = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
            'grant_type=device_code&device_code='+deviceCode.device_code,
            {
                'Authorization': 'basic '+switchBasic,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        );
        if (!checkLoggedIn.access_token) return null;

        output.style.display = 'none';
        loading.style.display = 'block';

        let xch = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
            {
                Authorization: 'bearer '+checkLoggedIn.access_token
            }
        );

        let ios = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
            'grant_type=exchange_code&exchange_code='+xch.code,
            {
                'Authorization': 'basic '+iosBasic,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        );

        if (!fs.existsSync(process.env.appdata+'/a.bakedpotato')) fs.mkdirSync(process.env.appdata+'/a.bakedpotato');
        if (!fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2')) fs.mkdirSync(process.env.appdata+'/a.bakedpotato/fnappv2');

        let accountsFile = (fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json')) ?
            JSON.parse(fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json').toString())
            : [];
        let thisAcc = accountsFile.filter(acc => acc.accountId === ios.account_id);

        if (thisAcc[0]){
            let checkAcc = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
                'grant_type=device_auth&account_id='+thisAcc[0].accountId+'&device_id='+thisAcc[0].deviceId+'&secret='+thisAcc[0].secret,
                {
                    'Authorization': 'basic '+iosBasic,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            );
            if (!checkAcc.access_token) thisAcc = [];
        }

        if (thisAcc[0]){
            accountsFile[accountsFile.indexOf(thisAcc[0])].displayName = ios.displayName;
            output.getElementsByTagName('h5')[0].innerHTML = 'Welcome back, <a>'+ios.displayName+'</a>. Your display name has been updated. You can now close this window.';
            output.getElementsByTagName('p')[0].innerHTML = '';
        } else {
            let devAuth = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/'+ios.account_id+'/deviceAuth',
                '{}',
                {
                    'Authorization': 'bearer '+ios.access_token,
                    'Content-Type': 'application/json'
                }
            );

            accountsFile.push({
                accountId: ios.account_id,
                deviceId: devAuth.deviceId,
                secret: devAuth.secret,
                displayName: ios.displayName
            });
            output.getElementsByTagName('h5')[0].innerHTML = 'Hello, <a>'+ios.displayName+'</a>. Your account has been saved. You can now close this window.';
            output.getElementsByTagName('p')[0].innerHTML = '';
        }

        loading.style.display = 'none';
        output.style.display = 'block';

        accountsFile = accountsFile.sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()));
        fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json', JSON.stringify(accountsFile, null, '\t'));
        clearInterval(interval);
    }, 10000);
    setTimeout(() => clearInterval(interval), 600000);
})();