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

function clearOutput(){
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

function parseEntry(entry){
    return {
        name: entry.devName
            .split('for')[0]
            .split(',')[0]
            .split('1 x ')[1],
        devName: entry.devName,
        rarity: 'common',
        price: parseInt(entry.devName
            .split('for ')[1]
            .split('Mtx')[0]
        ),
        type: entry.requirements[0]?.requiredId.split(':')[0]
    }
}

async function brShop(){
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="4%">');
    new VerifiedToken(acc.accountId, async token => {
        if (token.length !== 32) {
            clearOutput();
            return outputText(token);
        }
        let shop = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/storefront/v2/catalog',
            {
                Authorization: 'bearer '+token
            }
        );
        let storefronts = shop.storefronts.filter(storefront => ['BRSpecialFeatured', 'BRWeeklyStorefront', 'BRDailyStorefront'].includes(storefront.name));
        let table = document.createElement('table');
        clearOutput();
        let i = 0;
        let tr = document.createElement('tr');
        for (const storefront of storefronts){
            for (const rawEntry of storefront.catalogEntries){
                let entry = parseEntry(rawEntry);

                tr.innerHTML += '<td class="'+entry.rarity+'">'+entry.name+'</td>';

                i++;
                if (i === 5){
                    table.appendChild(tr);
                    tr = document.createElement('tr');
                    i = 0;
                }
            }
        }
        if (i !== 5) table.appendChild(tr);
        document.getElementById('output').appendChild(table);
    });
}

window.brShop = brShop;