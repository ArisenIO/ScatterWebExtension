import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'

export const m6_0_0 = async arkid => {
    arkid.meta.acceptedTerms = false;
    return true;
};
