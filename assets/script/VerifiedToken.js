import { axios, iosBasic } from './requests.js';

const fs = require('fs');
const accounts = fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json') ?
    JSON.parse(fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json').toString()) :
    [];

export class VerifiedToken {
    constructor(accountId, onFinish) {
        if (!accounts[0]) return onFinish('You have not added any accounts to the app.');
        if (!accountId) accountId = accounts[0].accountId;

        let token = fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/tokens/'+accountId+'.txt') ?
            fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/tokens/'+accountId+'.txt').toString() :
            '';
        const account = accounts.filter(acc => acc.accountId === accountId)[0] || {};
        if (!account.accountId) return onFinish('Account not found.');

        (async () => {
            let verifyToken = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/verify',
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            );
            if (verifyToken.token) return onFinish(token);
            let newToken = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
                'grant_type=device_auth&account_id='+account.accountId+'&device_id='+account.deviceId+'&secret='+account.secret,
                {
                    'Authorization': 'basic '+iosBasic,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            );
            if (newToken.errorMessage) return onFinish(newToken.errorMessage);
            fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/tokens/'+accountId+'.txt', newToken.access_token);
            return onFinish(newToken.access_token);
        })();
    }
}

export class VerifiedTokenPromise {
    constructor(accountId) {
        return new Promise(resolve => {
            new VerifiedToken(accountId, token => {
                resolve(token);
            });
        });
    }
}