import { api } from '../../assets/script/api.js';
import { CampaignProfile } from '../../assets/script/CampaignProfile.js';
import { Hero } from '../../assets/script/Hero.js';

const fs = require('fs');
let accounts = [];
if (fs.existsSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json')) accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('accounts');
for (const account of accounts) {
    let acc = document.createElement('option');
    acc.textContent = account.displayName;
    acc.value = account.accountId;
    select.appendChild(acc);
}

function clearOutput(){
    if (document.getElementById('outputTable')) document.getElementById('outputTable').remove();
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

async function heroes(){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let input = document.getElementById('accounts').value;
    new CampaignProfile(input, (profile, acc) => {
        clearOutput();
        if (typeof profile === 'string') return outputText(profile);

        let table = document.createElement('table');
        table.id = 'outputTable';
        
        for (let key of Object.keys(profile).filter(key => profile[key].templateId.startsWith('Hero:')).sort((aKey, bKey) => {
            let a = new Hero(aKey, profile[aKey]);
            let b = new Hero(bKey, profile[bKey]);
            
            let rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
            let aRarity = rarities.indexOf(a.rarity);
            let bRarity = rarities.indexOf(b.rarity);
            
            if (a.level === b.level){
                if (a.tier !== b.tier) return b.tier-a.tier;
                if (aRarity === bRarity) return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                return bRarity-aRarity;
            }
            return b.level-a.level;
        })){
            let hero = new Hero(key, profile[key]);
            let tr = document.createElement('tr');
            tr.classList.add(hero.rarity);
            tr.innerHTML = '' +
                '<td><img src="'+hero.imageURL+'" alt="hero" width="32pt"></td>' +
                '<td>'+hero.name+'</td><td>'+('<img src="../../assets/img/emojis/star.png" width="16pt" alt="star" class="star"> '.repeat(hero.tier))+' '+hero.level+'</td>' +
                '<td><button onclick="createOverlay(' +
                '\'Upgrade Options<br>' +
                'Tier: <input type=&quot;number&quot; placeholder=&quot;Tier&quot; min=&quot;'+hero.tier+'&quot; max=&quot;5&quot;><br>' +
                'Level: <input type=&quot;number&quot; placeholder=&quot;Level&quot; min=&quot;'+hero.level+'&quot; max=&quot;60&quot;>' +
                '\', upgrade, \''+input+'\', \''+hero.id+'\', \''+hero+'\')" '+(hero.level === 60 ? 'style="display:none"':'')+'>Upgrade</button></td>' +
                '<td><button onclick="createOverlay(\'Are you sure you want to recycle this hero?\', recycle, \''+input+'\', \''+hero.id+'\', \''+hero+'\')" '+(hero.favorite ? 'style="display:none"':'')+'>Recycle</button></td>';
            table.appendChild(tr);
        }

        document.getElementById('output').appendChild(table);
    });
}

async function recycle(accountId, itemId, hero){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    if (hero.favorite){
        clearOutput();
        return outputText('Error: Hero is favorited. Recycling favorited items is currently disabled.');
    }
    let recycleHero = await api.RecycleItem(accountId, itemId);
    if (recycleHero.errorMessage) {
        clearOutput();
        return outputText(recycleHero.errorMessage);
    }
    await heroes();
}

async function upgrade(accountId, itemId, hero){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let tier = window.tier > 5 ? 5:window.tier;
    let level = window.level > 60 ? 60:window.level;



    heroes().then();
}

window.heroes = heroes;
window.recycle = recycle;
window.upgrade = upgrade;