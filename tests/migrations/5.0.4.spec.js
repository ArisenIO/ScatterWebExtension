import Network from '../../src/models/Network'

const {m5_0_4} = require('../../src/migrations/versions/5.0.4');

import { expect, assert } from 'chai';
import 'mocha';

describe('Identity', () => {

    it('should upgrade a ArisenID instances endorsed networks', done => {
        new Promise(async () => {
            const fakeArkId = {
                settings:{
                    networks:[
                        Network.fromJson({host:'greatchain.arisennodes.io', port:80}),
                        Network.fromJson({host:'tester.com', port:80}),
                        Network.fromJson({host:'tester2.com', port:443})
                    ]
                }
            };

            await m5_0_4(fakeArkId);

            assert(fakeArkId.settings.networks[0].name === 'Arisen Mainnet', 'Arisen Endorsed network was not named');
            assert(fakeArkId.settings.networks[1].protocol === 'http', 'Port 80 got the wrong protocol');
            assert(fakeArkId.settings.networks[2].protocol === 'https', 'Port 443 got the wrong protocol');

            done();
        });
    })
});
