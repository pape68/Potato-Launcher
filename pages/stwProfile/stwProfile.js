import { ExtendedCampaignProfile } from '../../assets/script/CampaignProfile.js';
import { formatNum } from '../../assets/script/util.js';

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
    new ExtendedCampaignProfile(input, (profile, acc) => {
        clearOutput();
        if (typeof profile === 'string') {
            return outputText(profile);
        }

        let table = document.createElement('table');
        let addRow = (col1, col2) => table.innerHTML += '<tr><td><b>'+col1+'</b></td><td>'+col2+'</td></tr>';
        let addBlankRow = () => table.innerHTML += '<tr><td height="10" colspan="2"></td></tr>';
        let addTitleRow = (col1, col2) => addRow('<u>'+col1+'</u>', '<b><u>'+col2+'</u></b>');

        addTitleRow('Save the World', 'Profile');
        addRow('Commander Level:', formatNum(profile.stats.attributes.level+profile.stats.attributes.rewards_claimed_post_max_level));
        addRow('Days Logged In:', formatNum(profile.stats.attributes.daily_rewards.totalDaysLoggedIn || 0));
        addRow('Mythic Schematics:', Object.keys(profile.items).filter(key => profile.items[key].templateId.includes('stormking_sr')).length);
        addRow('Homebase Name:', profile.homebase_name);
        addRow('Revisions:', formatNum(profile.rvn));
        addBlankRow();

        addTitleRow('Banner', 'Challenges');
        let data = {
            buildstructures: {
                name: 'Talented Builder',
                value: 'build_any_structure',
                amt: 500000
            },
            destroygnomes: { name: 'Go Gnome!', value: 'destroy_gnome', amt: 100 },
            explorezones: {
                name: 'World Explorer',
                value: 'complete_exploration_1',
                amt: 1500
            },
            killmistmonsters: {
                name: 'Unspeakable Horrors',
                value: 'kill_husk_smasher',
                amt: 20000
            },
            loottreasurechests: { name: 'Loot Legend', value: 'interact_treasurechest', amt: 300 },
            playwithothers: {
                name: 'Plays Well with Others',
                value: 'quick_complete',
                amt: 1000
            },
            savesurvivors: {
                name: 'Guardian Angel',
                value: 'questcollect_survivoritemdata',
                amt: 10000
            }
        }
        for (const value of Object.keys(profile.items).filter(key => profile.items[key].templateId.startsWith('Quest:achievement_')).map(key => profile.items[key])){
            let key = value.templateId.split('_')[1];
            let info = data[key];
            if (!info) continue;
            let done = value.attributes['completion_'+info.value];
            addRow('<img src="../../assets/img/banners/'+info.name.toLowerCase().replace(/\W/g, '')+'.png" width="6%" alt="banner"> '+info.name+':', formatNum(done)+'/'+formatNum(info.amt)+' ('+((done/info.amt)*100).toString().substr(0, 5)+'%)');
        }
        addBlankRow();

        addTitleRow('Research', 'Levels');
        for (const item of ['Fortitude', 'Offense', 'Resistance', 'Technology']){
            addRow('<img src="../../assets/img/fort/'+item.toLowerCase()+'.png" width="6%" alt="'+item+'"> '+item+':', profile.stats.attributes.research_levels[item.toLowerCase()]);
        }
        let research = profile.items[Object.keys(profile.items).filter(key => profile.items[key].templateId === 'Token:collectionresource_nodegatetoken01')[0]].quantity;
        addRow('<img src="../../assets/img/fort/research.png" width="6%" alt="research"> Research Points:', formatNum(research));
        addBlankRow();

        addTitleRow('Collection', 'Book');
        addRow('Level:', formatNum(profile.stats.attributes.collection_book.maxBookXpLevelAchieved+1));
        addRow('Unslot Cost:', '<img src="../../assets/img/vbucks.png" width="8%" alt="vkeks" class="col2"> '+formatNum(profile.stats.attributes.unslot_mtx_spend));
        addBlankRow();

        addTitleRow('Profile', 'Dates');
        addRow('Creation Date:', profile.created.split('T')[0]);
        addRow('Last Updated:', profile.updated.split('T')[0]);
        addBlankRow();

        outputText('<h1>'+acc.displayName+'</h1>');
        document.getElementById('output').appendChild(table);
    });
}

window.lookupAcc = lookupAcc;