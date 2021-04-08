import { CampaignProfile } from '../../assets/script/CampaignProfile.js';
import { Hero } from '../../assets/script/Hero.js';

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

async function lookupAcc(){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let input = document.getElementById('search').value || document.getElementById('input').value;
    new CampaignProfile(input, (profile, acc) => {
        clearOutput();
        if (typeof profile === 'string') return outputText(profile);

        let table = document.createElement('table');
        
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
            tr.innerHTML = '<td><img src="'+hero.imageURL+'" alt="hero" width="32pt"></td><td>'+hero.name+'</td><td>'+('<img src="../../assets/img/emojis/star.png" width="16pt" alt="star" class="star"> '.repeat(hero.tier))+' '+hero.level+'</td>';
            table.appendChild(tr);
        }

        document.getElementById('output').innerHTML += '<h1>'+acc.displayName+'</h1>';
        document.getElementById('output').appendChild(table);
    });
}

window.lookupAcc = lookupAcc;