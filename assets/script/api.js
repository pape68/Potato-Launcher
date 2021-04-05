import { axios } from './requests.js';
import { CampaignProfile } from './CampaignProfile.js';
import { VerifiedTokenPromise } from './VerifiedToken.js';

function composeMcp(accountId, endpoint, profile, payload){
    if (!payload) payload = '{}';
    return new Promise(async resolve => {
        let token = await new VerifiedTokenPromise(accountId);
        let composition = await axios.post('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/'+accountId+'/client/'+endpoint+'?profileId='+profile,
            payload,
            {
                'Authorization': 'bearer '+token,
                'Content-Type': 'application/json'
            }
        );
        resolve(composition);
    });
}

export const api = {
    ClaimCollectedResources: (accountId) => {
        return new Promise(resolve => {
            new CampaignProfile(accountId, async profile => {
                if (profile.errorMessage) return resolve(profile.errorMessage);
                let collectorsToClaim = Object.keys(profile).filter(key => profile[key].templateId === 'CollectedResource:Token_collectionresource_nodegatetoken01');
                resolve(await composeMcp(accountId, 'ClaimCollectedResources', 'campaign', '{"collectorsToClaim":'+JSON.stringify(collectorsToClaim)+'}'));
            });
        });
    },
    ClaimLoginReward: (accountId) => { return composeMcp(accountId, 'ClaimLoginReward', 'campaign') },
    PurchaseResearchStatUpgrade: (accountId, stat) => { return composeMcp(accountId, 'PurchaseResearchStatUpgrade', 'campaign', '{"statId":"'+stat+'"}') },
    QueryProfile: (accountId, profile) => { return composeMcp(accountId, 'QueryProfile', profile) },
    SetHomebaseName: (accountId, homebaseName) => { return composeMcp(accountId, 'SetHomebaseName', 'common_public', '{"homebaseName":"'+homebaseName+'"}') }
}