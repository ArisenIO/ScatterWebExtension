import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'

export const m5_0_2 = async arkid => {
    const rsn = PluginRepository.plugin(Blockchains.RSN);
    const endorsedNetwork = await rsn.getEndorsedNetwork();
    if(!arkid.settings.networks.find(network => network.host === endorsedNetwork.host))
        arkid.settings.networks.push(endorsedNetwork);
};
