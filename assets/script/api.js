import { axios } from './requests.js';
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
    ClaimLoginReward: (accountId) => { return composeMcp(accountId, 'ClaimLoginReward', 'campaign') },
    QueryProfile: (accountId, profile) => { return composeMcp(accountId, 'QueryProfile', profile) },
    SetHomebaseName: (accountId, homebaseName) => { return composeMcp(accountId, 'SetHomebaseName', 'common_public', '{"homebaseName":"'+homebaseName+'"}') }
}