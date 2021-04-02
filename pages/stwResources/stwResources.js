import { CampaignProfile } from '../../assets/script/CampaignProfile.js';

const fs = require('fs');

function clearOutput(){
    document.getElementById('output').innerHTML = '';
}

function outputText(text){
    document.getElementById('output').innerHTML += text+'<br>';
}

async function lookupAcc(){
    let input = document.getElementById('input').value;
    new CampaignProfile(input, profile => {
        clearOutput();
        if (typeof profile === 'string') {
            return outputText(profile);
        }

        const templateIds = JSON.parse(fs.readFileSync('./assets/json/templateIds.json').toString());

        const sr = ['AccountResource:reagent_evolverarity_sr', 'AccountResource:reagent_alteration_upgrade_sr', 'AccountResource:reagent_alteration_gameplay_generic',
                    'AccountResource:voucher_herobuyback', 'AccountResource:voucher_item_buyback', 'AccountResource:reagent_promotion_heroes',
                    'AccountResource:reagent_promotion_survivors', 'AccountResource:reagent_promotion_traps', 'AccountResource:reagent_promotion_weapons',
                    'AccountResource:voucher_cardpack_jackpot'];
        const vr = ['AccountResource:reagent_evolverarity_vr', 'AccountResource:reagent_alteration_upgrade_vr', 'AccountResource:reagent_c_t03',
                    'AccountResource:reagent_c_t02', 'AccountResource:reagent_c_t01', 'AccountResource:reagent_c_t04', 'AccountResource:currency_xrayllama'];
        const r  = ['AccountResource:eventcurrency_scaling', 'AccountResource:eventcurrency_lunar', 'AccountResource:reagent_evolverarity_r',
                    'AccountResource:reagent_alteration_upgrade_r', 'AccountResource:eventcurrency_summer'];
        const uc = ['AccountResource:reagent_alteration_upgrade_uc'];
        const c  = ['AccountResource:reagent_alteration_ele_nature', 'AccountResource:reagent_alteration_ele_fire', 'AccountResource:reagent_alteration_ele_water',
                    'AccountResource:heroxp', 'AccountResource:reagent_alteration_generic', 'AccountResource:schematicxp', 'AccountResource:personnelxp',
                    'AccountResource:reagent_people', 'AccountResource:reagent_traps', 'AccountResource:phoenixxp', 'AccountResource:reagent_weapons'];

        let keys = Object.keys(profile)
            .filter(itemId => profile[itemId].templateId.startsWith('AccountResource:'))
            .sort((aK, bK) => {
            let a = profile[aK];
            let b = profile[bK];

            let aR = (sr.includes(a.templateId)) ? 4
            :        (vr.includes(a.templateId)) ? 3
            :        ( r.includes(a.templateId)) ? 2
            :        (uc.includes(a.templateId)) ? 1
            :                                      0
            let bR = (sr.includes(b.templateId)) ? 4
            :        (vr.includes(b.templateId)) ? 3
            :        ( r.includes(b.templateId)) ? 2
            :        (uc.includes(b.templateId)) ? 1
            :                                      0

            if (aR === bR) return templateIds[a.templateId].toLowerCase().localeCompare(templateIds[b.templateId].toLowerCase());
            return bR-aR;
        });

        let table = document.createElement('table');
        let tr = document.createElement('tr');

        let i = 0;
        for (const key of keys){
            let value = profile[key];
            let rarity = (sr.includes(value.templateId)) ? 'legendary'
            :            (vr.includes(value.templateId)) ? 'epic'
            :            ( r.includes(value.templateId)) ? 'rare'
            :            (uc.includes(value.templateId)) ? 'uncommon'
            :                                              'common'

            let td = document.createElement('td');
            td.className = rarity;
            td.innerHTML = '<img width="100%" src="../../assets/img/resources/'+templateIds[value.templateId].toLowerCase().replace(/\W/g, '')+'.png" alt="'+templateIds[value.templateId]+'">'
                         + '<p>'+templateIds[value.templateId]+'</p>'
                         + '<p class="quantity">'+value.quantity.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')+'</p>';
            tr.appendChild(td);

            i++;
            if (i === 5){
                i = 0;
                table.appendChild(tr);
                tr = document.createElement('tr');
            }

            /*outputText(
                '<div class="'+rarity+'">'
                + '<img src="../../assets/img/resources/'+templateIds[value.templateId].toLowerCase().replace(/\W/g, '')+'.png" alt="'+templateIds[value.templateId]+'">'
                + '<p>'+templateIds[value.templateId]+'</p>'
                + '<p class="quantity">'+value.quantity.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')+'</p>'
                + '</div>'
            );*/
        }
        if (i !== 5) table.appendChild(tr);

        document.getElementById('output').appendChild(table);
    });
}

window.lookupAcc = lookupAcc;