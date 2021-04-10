import { axios } from './requests.js';
import { CampaignProfile } from './CampaignProfile.js';
import { VerifiedTokenPromise } from './VerifiedToken.js';

function composeMcp(accountId, endpoint, profile, payload){
    if (!payload) payload = '{}';
    return new Promise(async resolve => {
        let token = await new VerifiedTokenPromise(accountId);
        if (token.length !== 32) return resolve(JSON.stringify({ errorMessage: token }));
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
    ConvertItem: (accountId, itemId, conversion = 0) => {
        return composeMcp(accountId, 'ConvertItem', 'campaign', '{"targetItemId":"'+itemId+'","conversionIndex":"'+conversion+'"}');
    },
    GiftCatalogEntry: (accountId, offerId, expectedTotalPrice, receiverAccountId, personalMessage) => {
        return composeMcp(accountId, 'GiftCatalogEntry', 'common_core', JSON.stringify(
            {
                offerId: offerId,
                purchaseQuantity: 1,
                currency: 'MtxCurrency',
                currencySubType: '',
                expectedTotalPrice: expectedTotalPrice,
                gameContext: '',
                receiverAccountIds: [receiverAccountId],
                giftWrapTemplateId: '',
                personalMessage: personalMessage
            }
        ))
    },
    PromoteItem: (accountid, itemId) => { return composeMcp(accountid, 'PromoteItem', 'campaign', '{"targetItemId":"'+itemId+'"}') },
    PurchaseCatalogEntry: (accountId, offerId, expectedTotalPrice) => { return composeMcp(accountId, 'PurchaseCatalogEntry', 'common_core', JSON.stringify(
        {
            offerId: offerId,
            purchaseQuantity: 1,
            currencySubType: 'MtxCurrency',
            expectedTotalPrice: expectedTotalPrice,
            gameContext: ''
        }
    )) },
    PurchaseResearchStatUpgrade: (accountId, stat) => { return composeMcp(accountId, 'PurchaseResearchStatUpgrade', 'campaign', '{"statId":"'+stat+'"}') },
    QueryProfile: (accountId, profile) => { return composeMcp(accountId, 'QueryProfile', profile) },
    RecycleItem: (accountId, itemId) => { return composeMcp(accountId, 'RecycleItem', 'campaign', '{"targetItemId":"'+itemId+'"}') },
    SetHomebaseName: (accountId, homebaseName) => { return composeMcp(accountId, 'SetHomebaseName', 'common_public', '{"homebaseName":"'+homebaseName+'"}') },
    UpgradeItemBulk: (accountId, itemId, level, tier, conversion = 0) => {
        return composeMcp(accountId, 'UpgradeItemBulk', 'campaign',
            '{"targetItemId":"'+itemId+'","desiredLevel":"'+level+'","desiredTier":"'+tier+'","conversionRecipeIndexChoice":"'+conversion+'"}');
    },
    UpgradeItemRarity: (accountId, itemId) => { return composeMcp(accountId, 'UpgradeItemRarity', 'campaign', '{"targetItemId":"'+itemId+'"}') }
}