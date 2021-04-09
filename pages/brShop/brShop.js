import { api } from '../../assets/script/api.js';
import { axios } from '../../assets/script/requests.js';
import { formatNum } from '../../assets/script/util.js';
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
    if (document.getElementById('outputTable')) document.getElementById('outputTable').remove();
    document.getElementById('output').innerHTML = '';
}

function outputText(text) {
    document.getElementById('output').innerHTML += text + '<br>';
}

function parseEntry(entry, gudShop) {
    let gudShopEntry = gudShop[gudShop.findIndex(e => e.offerId === entry.offerId)];
    console.log(entry);
    return {
        name: gudShopEntry?.displayName || entry.devName,
        devName: entry.devName,
        imageUrl: gudShopEntry?.displayAssets[0].url,
        offerId: entry.offerId,
        price: entry.prices[0]?.finalPrice || -1,
        rarity: gudShopEntry?.series ? gudShopEntry?.series.id.toLowerCase() : gudShopEntry?.rarity.id.toLowerCase() || 'common',
        realRarity: gudShopEntry?.rarity.id.toLowerCase() || 'common',
        type: entry.requirements[0]?.requiredId.split(':')[0]
    }
}

async function brShop() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    new VerifiedToken(acc.accountId, async token => {
        if (token.length !== 32) {
            clearOutput();
            return outputText(token);
        }
        let gudShop = (await axios.get('https://fortniteapi.io/v2/shop?lang=en',
            {
                Authorization: '2840821f-df7a0c5e-891f3bb7-df9aa92a'
            })).shop;
        let shop = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/storefront/v2/catalog',
            {
                Authorization: 'bearer ' + token
            }
        );

        let friends = await axios.get('https://friends-public-service-prod06.ol.epicgames.com/friends/api/v1/'+acc.accountId+'/summary?displayNames=true',
            {
                Authorization: 'bearer '+token
            }
        );

        let storefronts = shop.storefronts.filter(storefront => ['BRSpecialFeatured', 'BRWeeklyStorefront', 'BRDailyStorefront', 'BRStarterKits'].includes(storefront.name));
        let table = document.createElement('table');
        table.id = 'outputTable';
        clearOutput();
        let i = 0;
        let tr = document.createElement('tr');
        for (const storefront of storefronts) {
            for (const entry of storefront.catalogEntries.map(e => parseEntry(e, gudShop)).filter(e => e.price >= 0).sort((a, b) => {
                let rarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
                if (a.realRarity === b.realRarity) return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                return rarities.indexOf(a.realRarity)-rarities.indexOf(b.realRarity);
            })) {
                tr.innerHTML += '<td class="' + entry.rarity + '"><img width="100%" src="' + entry.imageUrl + '" alt="'+entry.name+'"><br><h4>' + entry.name + '</h4><br>' +
                    '<img src="../../assets/img/vbucks.png" width="15%" alt="vbucks"> '+ formatNum(entry.price) +
                    '<br>' +
                    '<button onclick="createOverlay(' +
                    '\'Are you sure you want to purchase this item?<br>'+entry.name+'<br><b class=&quot;v&quot;>v</b><h2>'+formatNum(entry.price)+'</h2>\',' +
                    'purchaseItem,' +
                    '\''+acc.accountId+'\',' +
                    '\''+entry.offerId+'\',' +
                    '\''+entry.price+'\'' +
                    ')">Purchase</button>' +
                    '<button onclick="createOverlay(' +
                    '\'Gifting Options for '+entry.name+' ('+formatNum(entry.price)+' V-Bucks)<br><select id=&quot;giftTo&quot;>'+friends.friends.sort((a, b) => (a.displayName || a.accountId).toLowerCase().localeCompare((b.displayName || b.accountId).toLowerCase())).map(f => '<option value=&quot;'+f.accountId+'&quot;>'+(f.displayName || f.accountId)+'</option>').join('')+'</select><br>' +
                    '<input id=&quot;message&quot; type=&quot;text&quot; placeholder=&quot;Gift Message&quot;>\',' +
                    'setTimeout,' +
                    '() => {' +
                    'createOverlay(' +
                    '\'Are you sure you want to gift this?\',' +
                    'giftItem,' +
                    '\''+acc.accountId+'\',' +
                    '\''+entry.offerId+'\',' +
                    '\''+entry.price+'\'' +
                    ') },' +
                    '0' +
                    ')">Gift</button>' +
                    '</td>';

                i++;
                if (i === 5) {
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

//needs to be tested to be sure but got valid? error messages
async function giftItem(accountId, offerId, price){
    let giftTo = window.giftTo;
    let msg = window.message;
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32) {
            clearOutput();
            return outputText(token);
        }

        let purchasing = await api.GiftCatalogEntry(accountId, offerId, price, giftTo, msg);
        clearOutput();
        if (purchasing.errorMessage) return outputText(purchasing.errorMessage);
        outputText('Successfully sent gift.');
    });
}

//this also needs to be tested, i just dont have vkeks :konk:
async function purchaseItem(accountId, offerId, price){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    new VerifiedToken(accountId, async token => {
        if (token.length !== 32) {
            clearOutput();
            return outputText(token);
        }

        let purchasing = await api.PurchaseCatalogEntry(accountId, offerId, price);
        clearOutput();
        if (purchasing.errorMessage) return outputText(purchasing.errorMessage);
        outputText('Successfully purchased.');
    });
}

window.brShop = brShop;
window.giftItem = giftItem;
window.purchaseItem = purchaseItem;