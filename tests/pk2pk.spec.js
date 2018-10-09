import {assert} from 'chai';
import 'mocha';

import PluginRepository from '../src/plugins/PluginRepository';
import {Blockchains} from '../src/models/Blockchains'

import ecc from 'arisenjs-ecc';
import secp256k1 from 'secp256k1';
import utils from 'ethereumjs-util';

describe('Ethereum key to RSN key', () => {

    const eth = PluginRepository.plugin(Blockchains.ETH);
    const rsn = PluginRepository.plugin(Blockchains.RSN);

    let ethPrivateKey = '';
    let ethPublicKey = '';
    let rsnPublicKey = '';

    it('should generate base keys', done => {
        new Promise(async(resolve, reject) => {
            ethPrivateKey = await eth.randomPrivateKey();
            ethPublicKey = '0x'+utils.privateToPublic(utils.toBuffer(utils.addHexPrefix(ethPrivateKey))).toString('hex')
            done();
        });
    });

    it('should convert publicKeys', () => {
        let buffer    =         Buffer.from(ethPublicKey.slice(2), 'hex'),
            converted =         secp256k1.publicKeyConvert(Buffer.concat([ Buffer.from([4]), buffer ]), true);
        rsnPublicKey =          ecc.PublicKey.fromBuffer(converted).toString();
        assert(rsn.validPublicKey(rsnPublicKey), "RSN public key was not valid")
    });

    it('should convert keys', () => {
        let ethBuffer =     Buffer.from(ethPrivateKey, 'hex');
        const p =           ecc.PrivateKey.fromHex(ethBuffer);
        const pk =          ecc.privateToPublic(p);
        assert(rsnPublicKey === pk, "Converted public and converted private -> public key does not match");
    })

});
