import { api } from '../../assets/script/api.js';
import { formatNum } from '../../assets/script/util.js';
import { ExtendedCampaignProfile } from '../../assets/script/CampaignProfile.js';

const fs = require('fs');
const costTable = JSON.parse(fs.readFileSync(__dirname+'/../../assets/json/ResearchSystem.json').toString());

const accounts = JSON.parse(fs.readFileSync(process.env.appdata + '/a.bakedpotato/fnappv2/accounts.json').toString());

const select = document.getElementById('accounts');
for (const account of accounts) {
    let acc = document.createElement('option');
    acc.textContent = account.displayName;
    acc.value = account.accountId;
    select.appendChild(acc);
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function outputText(text) {
    document.getElementById('output').innerHTML += text + '<br>';
}

async function research() {
    let input = document.getElementById('accounts').value;
    let acc = accounts.filter(acc => acc.accountId === input)[0];
    clearOutput();
    outputText('Loading <img src="../../assets/img/loading.gif" alt="loading" class="loading" width="16pt">');

    await api.ClaimCollectedResources(acc.accountId);
    new ExtendedCampaignProfile(acc.accountId, profile => {
        if (profile.errorMessage){
            clearOutput();
            return outputText(profile.errorMessage);
        }

        let table = document.createElement('table');
        function addRow(col1, col2, col3){
            let row = document.createElement('tr');
            row.innerHTML = '<td><b>'+col1+'</b></td><td>'+col2+'</td><td>'+(col3 || '<img src="../../assets/img/emojis/blank.png" width="16pt" alt="upgrade">')+'</td>';
            table.appendChild(row);
        }

        let researchPoints = profile.items[
            Object.keys(profile.items)
                .filter(item => profile.items[item].templateId === 'Token:collectionresource_nodegatetoken01')[0]
            ].quantity;
        clearOutput();
        outputText('<h2><img src="../../assets/img/fort/research.png" width="16pt" alt="research"> '+formatNum(researchPoints)+'</h2>');

        let max = 0;
        for (const stat of ['Fortitude', 'Offense', 'Resistance', 'Technology']){
            let level = profile.stats.attributes.research_levels[stat.toLowerCase()];
            let cost = 0;

            for (const item of costTable[0].ExportValue[stat.toLowerCase()+'_cost'].Keys){
                if (item.KeyTime <= level+1) cost = item.KeyValue;
            }

            if (level < 120){
                if (cost <= researchPoints){
                    addRow(
                        '<img src="../../assets/img/fort/'+stat.toLowerCase()+'.png" width="16pt" class="col1" alt="'+stat+'"> '+stat,
                        level,
                        '<img src="../../assets/img/emojis/up_arrow.png" style="cursor: pointer" width="16pt" onclick="upgrade(\''+acc.accountId+'\', \''+stat.toLowerCase()+'\')" alt="upgrade"> <img src="../../assets/img/fort/research.png" width="16pt" alt="research"> '+formatNum(cost)
                    );
                } else {
                    addRow(
                        '<img src="../../assets/img/fort/'+stat.toLowerCase()+'.png" width="16pt" class="col1" alt="'+stat+'"> '+stat,
                        level,
                        '<img src="../../assets/img/emojis/x.png" width="16pt" alt="upgrade"> <img src="../../assets/img/fort/research.png" width="16pt" alt="research"> '+formatNum(cost)
                    )
                }
            } else {
                max++;
                addRow(
                    '<img src="../../assets/img/fort/'+stat.toLowerCase()+'.png" width="16pt" class="col1" alt="'+stat+'"> '+stat,
                    level
                );
            }
        }
        console.log(max);
        if (max === 4) table.classList.add('max');

        document.getElementById('output').appendChild(table);
    });
}

async function upgrade(accountId, stat){
    let upgradePoint = await api.PurchaseResearchStatUpgrade(accountId, stat);
    if (upgradePoint.errorMessage){
        clearOutput();
        return outputText(upgradePoint.errorMessage);
    }
    research().then();
}

window.research = research;
window.upgrade = upgrade;