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
                '<td><img width="32pt" '+(hero.backendRarity === 'sr' ? 'src="../../assets/img/emojis/blank.png"'
                    :'style="cursor: pointer" src="../../assets/img/resources/'+hero.nextRarity+'flux.png" onclick="createOverlay(\'Are you sure you want to flux this hero?\', flux, \''+input+'\', \''+hero.id+'\')"')+'></td>' +
                '<td><button onclick="createOverlay(' +
                '\'Upgrade Options<br>' +
                'Tier: <input id=&quot;tier&quot; type=&quot;number&quot; placeholder=&quot;Tier&quot; min=&quot;'+hero.tier+'&quot; max=&quot;5&quot;><br>' +
                'Level: <input id=&quot;level&quot; type=&quot;number&quot; placeholder=&quot;Level&quot; min=&quot;'+hero.level+'&quot; max=&quot;60&quot;>' +
                '\', upgrade, \''+input+'\', \''+hero.id+'\', \''+JSON.stringify(hero).replace(/"/g, '&quot;')+'\')" '+(hero.level === 60 ? 'style="display:none"':'')+'>Upgrade</button></td>' +
                '<td><button onclick="createOverlay(\'Are you sure you want to recycle this hero?\', recycle, \''+input+'\', \''+hero.id+'\', \''+hero+'\')" '+(hero.favorite ? 'style="display:none"':'')+'>Recycle</button></td>';
            table.appendChild(tr);
        }

        document.getElementById('output').appendChild(table);
    });
}

async function flux(accountId, itemId){
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" width="16pt">');
    let fluxHero = await api.UpgradeItemRarity(accountId, itemId);
    if (fluxHero.errorMessage){
        clearOutput();
        return outputText(fluxHero.errorMessage);
    }
    await heroes();
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
    hero = JSON.parse(hero.replace(/&quot;/g, '"'));
    let tier = window.tier > 5 ? 5:window.tier;
    let level = window.level > 60 ? 60:window.level;

    if (tier < hero.tier){
        clearOutput();
        return outputText('Desired tier is lower than hero tier.');
    }
    if (level < hero.level){
        clearOutput();
        return outputText('Desired level is lower than hero level.');
    }

    let levelUp = await api.UpgradeItemBulk(accountId, hero.id, (level > 50 ? 50:level), ['i', 'ii', 'iii', 'iv', 'v'][tier-1]);
    if (levelUp.errorMessage){
        clearOutput();
        return outputText(levelUp.errorMessage);
    }

    if (level > 50){
        hero.id = Object.keys(levelUp.profileChanges[0].profile.items).filter(key => {
            let item = new Hero(key, levelUp.profileChanges[0].profile.items[key]);
            console.log(item.level, level, item.tier, tier, item.templateId, hero.templateId.replace(/_t0[1-5]/, '_t0'+tier));
            return [50, 52, 54, 56, 58, 60].includes(item.level) && item.tier === tier && item.templateId === hero.templateId.replace(/_t0[1-5]/, '_t0'+tier);
        })[0];
        for (let i = 50; i < level; i += 2-(level % 2)){
            console.log(i, level);
            let promotion = await api.PromoteItem(accountId, hero.id);
            if (promotion.errorMessage){
                clearOutput();
                return outputText(promotion.errorMessage);
            }
        }
    }

    await heroes();
}

window.flux = flux;
window.heroes = heroes;
window.recycle = recycle;
window.upgrade = upgrade;