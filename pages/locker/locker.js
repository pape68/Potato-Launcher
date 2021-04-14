import { api } from '../../assets/script/api.js';
import { axios } from '../../assets/script/requests.js';

const fs = require('fs');
let accounts = [];
if (fs.existsSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json')) accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('search');
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

async function locker(){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let input = document.getElementById('search').value;
    let acc = accounts.find(acc => acc.accountId === input);

    let profile = await api.QueryProfile(input, 'athena');

    if (profile.errorMessage){
        clearOutput();
        return outputText(profile.errorMessage);
    }

    let cosmetics = await axios.get(
        'https://fortniteapi.io/v2/items/list?lang=en',
        {
            'Authorization': '2840821f-df7a0c5e-891f3bb7-df9aa92a'
        }
    );
    cosmetics = cosmetics.items;


    let sortOrder = ['AthenaCharacter', 'AthenaBackpack', 'AthenaPetCosmetic', 'AthenaPickaxe', 'AthenaGlider',
        'AthenaSkyDiveContrail', 'AthenaDance:eid_', 'AthenaDance:emoji_', 'AthenaDance:spid_', 'AthenaDance:toy_',
        'AthenaItemWrap', 'AthenaMusicPack', 'AthenaLoadingScreen'];
    let athena = profile.profileChanges[0].profile.items;
    athena = Object.keys(athena)
        .map(key => {
            let item = athena[key];
            let cosmetic = cosmetics.find(c => c.id.toLowerCase() === item.templateId.split(':')[1]);
            item.rarity = cosmetic?.series?.id || cosmetic?.rarity.id;
            item.realRarity = cosmetic?.rarity.id.toLowerCase();
            item.name = cosmetic?.name;
            item.imageUrl = cosmetic?.images.featured || cosmetic?.images.icon;
            return item;
        })
        .filter(item => {
            for (let sort of sortOrder){
                if (item.templateId.startsWith(sort)) return true;
            }
            return false;
        })
        .sort((a, b) => {
            //Assign value to item based on item type
            let sortA = 0;
            let sortB = 0;
            for (let item of sortOrder){
                if (a.templateId.startsWith(item)) sortA = sortOrder.indexOf(item);
                if (b.templateId.startsWith(item)) sortB = sortOrder.indexOf(item);
            }

            //Assign value to item based on item rarity
            let rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
            let rarityA = 0;
            let rarityB = 0;
            for (let item of rarityOrder){
                if (a.realRarity === item) rarityA = rarityOrder.indexOf(item);
                if (b.realRarity === item) rarityB = rarityOrder.indexOf(item);
            }
            if (a.rarity.toLowerCase() !== a.realRarity) rarityA -= 0.5;
            if (b.rarity.toLowerCase() !== b.realRarity) rarityB -= 0.5;

            //Sort
            if (sortA !== sortB) return sortA-sortB; //by item type
            if (rarityA !== rarityB) return rarityA-rarityB; //by rarity
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); //alphabetically
        });

    let table = document.createElement('table');
    let tr = document.createElement('tr');

    let i = 0;
    for (const item of athena){
        let td = document.createElement('td');
        td.className = item.rarity.toLowerCase();
        td.innerHTML = '<img width="100%" src="'+item.imageUrl+'" alt="image">'
                     + '<p>'+item.name+'</p>';
        tr.appendChild(td);

        i++;
        if (i === 5){
            i = 0;
            table.appendChild(tr);
            tr = document.createElement('tr');
        }
    }
    if (i !== 5) table.appendChild(tr);

    clearOutput();
    document.getElementById('output').innerHTML += '<h1>'+acc.displayName+'</h1>';
    document.getElementById('output').appendChild(table);
}

window.locker = locker;