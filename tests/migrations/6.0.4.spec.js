import Network from '../../src/models/Network'
import PluginRepository from '../../src/plugins/PluginRepository';
import {Blockchains} from '../../src/models/Blockchains'

const {m6_0_4} = require('../../src/migrations/versions/6.0.4');

import { expect, assert } from 'chai';
import 'mocha';

describe('Identity', () => {

    it('should upgrade a ArisenID instances endorsed networks', done => {
        new Promise(async () => {
            const rsnEnd = await PluginRepository.plugin(Blockchains.RSN).getEndorsedNetwork();
            const eodEndWrongPort = rsnEnd;
            rsnEnd.port = 80;
            const fakeArkId = {
                keychain:{
                    identities:[
                        {
                            accounts:{
                                'unlinkednetwork':{shouldBe:'deleted'},
                                [rsnEnd.unique()]:{shouldBe:'left'}
                            }
                        }
                    ]
                },
                settings:{
                    networks:[eodEndWrongPort]
                }
            };

            await m6_0_4(fakeArkId);

            assert(fakeArkId.settings.networks[0].port === 443, 'Arisen Endorsed network had a bad port');
            assert(Object.keys(fakeArkId.keychain.identities[0].accounts).length === 1, 'Too many accounts');
            assert(JSON.stringify(fakeArkId.keychain.identities[0].accounts[rsnEnd.unique()]) === JSON.stringify({shouldBe:'left'}), 'Did not delete the right accounts');

            done();
        });
    })
});
