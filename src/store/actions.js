import * as Actions from './constants'
import Hasher from '../util/Hasher'
import Mnemonic from '../util/Mnemonic'
import ArkId from '../models/ArkId'
import Identity from '../models/Identity'
import Meta from '../models/Meta'
import Network from '../models/Network'
import InternalMessage from '../messages/InternalMessage'
import * as InternalMessageTypes from '../messages/InternalMessageTypes'
import PluginRepository from '../plugins/PluginRepository'
import RIDLService from '../services/RIDLService'
import StorageService from '../services/StorageService'
import IdGenerator from '../util/IdGenerator'
import ridl from 'ridl';

export const actions = {
    [Actions.SET_ARKID]:({commit}, arkid) => commit(Actions.SET_ARKID, arkid),
    [Actions.SET_MNEMONIC]:({commit}, mnemonic) => commit(Actions.SET_MNEMONIC, mnemonic),
    [Actions.IS_UNLOCKED]:() => InternalMessage.signal(InternalMessageTypes.IS_UNLOCKED).send(),
    [Actions.LOCK]:() => InternalMessage.payload(InternalMessageTypes.SET_SEED, '').send(),
    [Actions.DESTROY]:({dispatch}) => InternalMessage.signal(InternalMessageTypes.DESTROY).send(),

    [Actions.SET_SEED]:({commit}, password) => {
        return new Promise(async (resolve, reject) => {
            let seed, mnemonic;
            if(password.split(' ').length >= 12) {
                seed = await Mnemonic.mnemonicToSeed(password);
                mnemonic = password;
            } else {
                const [m, s] = await Mnemonic.generateMnemonic(password);
                seed = s;
                mnemonic = m;
            }

            InternalMessage.payload(InternalMessageTypes.SET_SEED, seed).send().then(() => {
                resolve(mnemonic)
            })
        })
    },

    [Actions.SET_AUTO_LOCK]:({commit}, timeoutMinutes) => {
        return new Promise((resolve, reject) => {
            commit(Actions.SET_AUTO_LOCK, timeoutMinutes);
            InternalMessage.payload(InternalMessageTypes.SET_TIMEOUT, timeoutMinutes).send().then(() => {
                resolve(timeoutMinutes)
            })
        })
    },

    [Actions.LOAD_ARKID]:({dispatch}) => {
        return new Promise((resolve, reject) => {
            InternalMessage.signal(InternalMessageTypes.LOAD).send().then(_arkid => {
                dispatch(Actions.SET_ARKID, ArkId.fromJson(_arkid));
                resolve();
            })
        })
    },

    [Actions.UPDATE_STORED_ARKID]:({dispatch}, arkid) => {
        return new Promise((resolve, reject) => {
            InternalMessage.payload(InternalMessageTypes.UPDATE, arkid).send().then(_arkid => {
                dispatch(Actions.SET_ARKID, ArkId.fromJson(_arkid));
                resolve(_arkid)
            })
        })
    },

    [Actions.IMPORT_ARKID]:({dispatch}, {imported, seed}) => {
        return new Promise(async (resolve, reject) => {

            const arkid = ArkId.fromJson(imported);

            arkid.settings.hasEncryptionKey = true;

            const networkUniques = arkid.settings.networks.map(network => network.unique());
            await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
                const network = await plugin.getEndorsedNetwork();

                arkid.settings.networks = arkid.settings.networks.filter(_network => _network.unique() !== network.unique());
                arkid.settings.networks.push(network);
            }));

            arkid.meta = new Meta();

            InternalMessage.payload(InternalMessageTypes.SET_SEED, seed).send().then(() => {
                dispatch(Actions.UPDATE_STORED_ARKID, arkid).then(_arkid => {
                    resolve();
                })
            });
        })
    },

    [Actions.CREATE_NEW_ARKID]:({state, commit, dispatch}, password) => {
        return new Promise(async (resolve, reject) => {
            const arkid = ArkId.fromJson(state.arkid);
            arkid.settings.hasEncryptionKey = true;
            await Promise.all(PluginRepository.signatureProviders().map(async plugin => {
                const network = await plugin.getEndorsedNetwork();
                arkid.settings.networks.push(network);
            }));


            const firstIdentity = Identity.placeholder();
            await firstIdentity.initialize(arkid.hash);
            const identified = await RIDLService.identify(firstIdentity.publicKey);
            if(identified) {
                firstIdentity.name = identified;
                arkid.keychain.updateOrPushIdentity(firstIdentity);
            }

            await StorageService.setSalt(Hasher.insecureHash(IdGenerator.text(32)));

            dispatch(Actions.SET_SEED, password).then(mnemonic => {
                dispatch(Actions.UPDATE_STORED_ARKID, arkid).then(_arkid => {
                    dispatch(Actions.SET_MNEMONIC, mnemonic);
                    dispatch(Actions.SET_ARKID, ArkId.fromJson(_arkid));
                    resolve();
                })
            })
        })
    },

    [Actions.SIGN_RIDL]:({commit}, {hash, publicKey}) => {
        return new Promise(async (resolve, reject) => {
            InternalMessage.payload(InternalMessageTypes.PUB_TO_PRIV, publicKey).send().then(privateKey => {
                if(!privateKey) return resolve(null);
                resolve(ridl.sign(hash, privateKey));
            });
        })
    },




    [Actions.PUSH_ALERT]:({state, commit}, error) => {
        function waitForErrorResult(resolve){
            if(state.alertResult) {
                const alertResult = Object.assign({}, state.alertResult);
                commit(Actions.CLEAR_ALERT_RESULT);
                resolve(alertResult)
            } else setTimeout(() => {
                waitForErrorResult(resolve);
            }, 100)
        }

        return new Promise((resolve, reject) => {
            commit(Actions.PUSH_ALERT, error);
            waitForErrorResult(resolve);
        })
    },
    [Actions.PULL_ALERT]:({commit}) => commit(Actions.PULL_ALERT),
    [Actions.PUSH_ALERT_RESULT]:({commit}, alertResult) => commit(Actions.PUSH_ALERT_RESULT, alertResult),
    [Actions.CLEAR_ALERT_RESULT]:({commit}) => commit(Actions.CLEAR_ALERT_RESULT),


    [Actions.PUSH_PROMPT]:({state, commit}, prompt) => {
        if(state.prompt) state.prompt.responder(null);
        commit(Actions.PUSH_PROMPT, prompt);
    },
};
