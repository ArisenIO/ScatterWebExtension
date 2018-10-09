import StorageService from '../../src/services/StorageService';
import chrome from '../helpers/chrome'
import { expect, assert } from 'chai';
import 'mocha';



describe('StorageService', () => {

    global.chrome = chrome;

    let arkid = null;

    it('should be able to get an instance of arkid from the storage even if one does not exist', (done) => {
        StorageService.get().then(stored => {
            arkid = stored;
            done();
        })
    });

    it('should be able to save an instance of arkid to the storage', (done) => {
        arkid.meta.version = '1.2';
        StorageService.save(arkid).then(saved => {
            StorageService.get().then(stored => {
                assert(stored.meta.version === arkid.meta.version, "Saved arkid does not match");
                done();
            })
        })
    });

    it('should be able to remove the instance of arkid from the storage', (done) => {
        StorageService.remove().then(saved => {
            StorageService.get().then(stored => {
                assert(stored.meta.version !== arkid.meta.version, "Saved arkid does not match");
                done();
            })
        })
    });

});
