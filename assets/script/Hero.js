const fs = require('fs');
const templateIds = JSON.parse(fs.readFileSync(__dirname+'/../../assets/json/templateIds.json').toString());

const mythics = ['Azalea Clark', 'Black Knight Garridan', 'Bladestorm Enforcer', 'Blakebeard the Blackhearted',
    'Carbide', 'Dennis Jr.', 'Dire', 'Field Agent Rio', 'Lynx Kassandra', 'Master Grenadier Ramirez',
    'MEGA B.A.S.E. Kyle', 'Phase Scout Jess', 'Calamity', 'Ragnarok', 'Raven', 'Steel Wool Anthony', 'Steel Wool Carlos',
    'Steel Wool Syd', 'Subzero Zenith', 'Swordmaster Ken', 'The Cloaked Star', 'Wukong'];

export class Hero {
    constructor(id, hero){
        if (!hero?.templateId?.startsWith('Hero:')) return 'This is not a hero!';
        this.templateId = hero.templateId;
        this.name = templateIds[hero.templateId] || hero.templateId;
        this.rarity =
            (mythics.includes(this.name)) ? 'mythic'
        :   (this.templateId.includes('sr')) ? 'legendary'
        :   (this.templateId.includes('vr')) ? 'epic'
        :   (this.templateId.includes('r'))  ? 'rare'
        :   (this.templateId.includes('uc')) ? 'uncommon'
        :   'common';
        this.backendRarity = {
            'mythic': 'sr',
            'legendary': 'sr',
            'epic': 'vr',
            'rare': 'r',
            'uncommon': 'uc',
            'common': 'c'
        }[this.rarity];
        this.nextRarity =
            (this.templateId.includes('vr')) ? 'legendary'
        :   (this.templateId.includes('r'))  ? 'epic'
        :   (this.templateId.includes('uc')) ? 'rare'
        :   'uncommon';
        this.level = hero.attributes.level;
        this.tier = this.templateId.substr(-1);
        this.id = id;
        this.favorite = hero.attributes.favorite;
        this.imageURL = 'https://mayor.fri.uniza.sk/m4tonoob/potato/heroes/'+this.name.toLowerCase().replace(/\W/g, '')+'.png';

        if (this.templateId === this.name) this.name = this.rarity.substr(0, 1).toUpperCase()+this.rarity.substr(1)+' Hero';
    }
}