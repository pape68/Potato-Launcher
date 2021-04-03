import { CampaignProfile } from '../../assets/script/CampaignProfile.js';
import { formatNum } from '../../assets/script/util.js';

const fs = require('fs');

function clearOutput(){
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

async function lookupAcc(){
    let input = document.getElementById('input').value;
    new CampaignProfile(input, (profile, acc) => {
        clearOutput();
        if (typeof profile === 'string') {
            return outputText(profile);
        }

        let table = document.createElement('table');
        let addRow = (col1, col2) => table.innerHTML += '<tr><td><b>'+col1+'</b></td><td>'+col2+'</td></tr>';
        let addBlankRow = () => table.innerHTML += '<tr><td height="10" colspan="2"></td></tr>';
        let addTitleRow = (col1, col2) => addRow(col1, '<b>'+col2+'</b>');

        addTitleRow('Banner', 'Challenges');
        let names = {
            buildstructures: 'Talented Builder',
            destroygnomes: 'Go Gnome!',
            explorezones: 'World Explorer',
            killmistmonsters: 'Unspeakable Horrors',
            loottreasurechests: 'Loot Legend',
            playwithothers: 'Plays Well with Others',
            savesurvivors: 'Guardian Angel'
        }
        let values = {
            buildstructures: 'build_any_structure',
            destroygnomes: 'destroy_gnome',
            explorezones: 'complete_exploration_1',
            killmistmonsters: 'kill_husk_smasher',
            loottreasurechests: 'interact_treasurechest',
            playwithothers: 'quick_complete',
            savesurvivors: 'questcollect_survivoritemdata'
        }
        let amts = {
            buildstructures: 500000,
            destroygnomes: 100,
            explorezones: 1500,
            killmistmonsters: 20000,
            loottreasurechests: 300,
            playwithothers: 1000,
            savesurvivors: 10000
        }
        for (const value of Object.keys(profile).filter(key => profile[key].templateId.startsWith('Quest:achievement_')).map(key => profile[key])){
            let name = names[value.templateId.split('_')[1]];
            let progress = values[value.templateId.split('_')[1]];
            let amt = amts[value.templateId.split('_')[1]];
            let done = value.attributes['completion_'+progress];
            if (!name) continue;
            addRow('<img src="../../assets/img/banners/'+name.toLowerCase().replace(/\W/g, '')+'.png" width="6%" alt="banner"> '+name+':', formatNum(done)+'/'+formatNum(amt)+' ('+((done/amt)*100).toString().substr(0, 5)+'%)');
        }

        outputText('<h1>'+acc.displayName+'</h1>');
        document.getElementById('output').appendChild(table);
    });
}

window.lookupAcc = lookupAcc;