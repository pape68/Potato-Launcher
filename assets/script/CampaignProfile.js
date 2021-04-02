import { axios, iosBasic } from './requests.js';
import { VerifiedToken } from "./VerifiedToken.js";

const fs = require('fs');
const accounts = fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json') ?
    JSON.parse(fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/accounts.json').toString()) :
    [];

export class CampaignProfile {
    constructor(accountId, onFinish) {
        new VerifiedToken(null, async token => {
            if (token.length !== 32) return onFinish(token);

            if (accountId.length !== 32){
                let lookup = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/'+accountId,
                    {
                        'Authorization': 'bearer '+token,
                        'Content-Type': 'application/json'
                    }
                );
                if (!lookup.id) return onFinish(lookup.errorMessage);
                accountId = lookup.id;
            }

            let acc = await axios.get('https://account-public-service-prod.ol.epicgames.com/account/api/public/account?accountId='+accountId,
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );

            if (!acc[0]) return onFinish(acc.errorMessage);
            acc = acc[0];

            let campaign = await axios.post('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/'+acc.id+'/public/QueryPublicProfile?profileId=campaign',
                '{}',
                {
                    'Authorization': 'bearer '+token,
                    'Content-Type': 'application/json'
                }
            );
            if (campaign.errorMessage) return onFinish(campaign.errorMessage);
            campaign = campaign.profileChanges[0].profile.items;
            onFinish(campaign);
        });
    }
}