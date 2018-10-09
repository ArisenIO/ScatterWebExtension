import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';
import * as LANG_KEYS from '../localization/keys';

import {IdentityRequiredFields} from '../models/Identity'

Vue.use(Vuex);

const state = {
    arkid:null,
    mnemonic:null,

    alerts:[],
    alertResult:null,

    prompt:null,
};

const getters = {
    meta:state => state.arkid.meta,
    identities:state => state.arkid.keychain.identities,
    permissions:state => state.arkid.keychain.permissions,
    keypairs:state => state.arkid.keychain.keypairs,
    networks:state => state.arkid.settings.networks,
    histories:state => state.arkid.histories,
    autoLockInterval:state => state.arkid.settings.inactivityInterval,
    language:state => state.arkid.settings.language,

    // FOR PROMPTS ONLY
    identityFields:state => IdentityRequiredFields.fromJson(state.prompt.data),
    requiredFields:state => IdentityRequiredFields.fromJson(state.prompt.data.requiredFields || {}),
    messages:state => state.prompt.data.messages || [],
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})
