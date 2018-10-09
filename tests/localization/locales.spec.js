import {locales} from '../../src/localization/locales'
import chrome from '../helpers/chrome';

import Rsn from 'arisenjs';

import { expect, assert } from 'chai';
import 'mocha';


describe('Signature Request', async testDone => {

    global.chrome = chrome;

    it('should work', done => {
        console.log('locales', locales());
        done();
    });



});
