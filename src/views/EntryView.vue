<template>
    <section>
        <section v-if="!arkid.settings.hasEncryptionKey">
            <section class="p20">
                <form v-on:submit.prevent="create">
                  <cin icon="fa-lock" :placeholder="locale(langKeys.PLACEHOLDER_NewPassword)" type="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                  <cin icon="fa-lock" :placeholder="locale(langKeys.PLACEHOLDER_ConfirmPassword)" type="password" v-on:changed="changed => bind(changed, 'passwordConfirmation')"></cin>
                  <btn :text="locale(langKeys.BUTTON_CreateNewArkId)" type="submit" margined="true"></btn>
                </form>
            </section>
            <figure class="line"></figure>
            <section class="p20">
                <btn :text="locale(langKeys.BUTTON_LoadFromBackup)" v-on:clicked="importKeychain"></btn>
            </section>
        </section>
        <section v-else>
            <section class="p20" style="overflow:hidden;">
                <section class="unlocker" :class="{'hiding':hiding}">
                    <form v-on:submit.prevent="unlock">
                      <cin icon="fa-lock" :placeholder="locale(langKeys.PLACEHOLDER_Password)" type="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                      <btn :text="locale(langKeys.BUTTON_Unlock)" type="submit" margined="true"></btn>
                    </form>
                </section>
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing'
    import AlertMsg from '../models/alerts/AlertMsg'
    import AuthenticationService from '../services/AuthenticationService'

    export default {
        data(){ return {
            password:'',
            passwordConfirmation:'',
            scat:this.arkid,
            hiding:true,
        }},
        computed: {
            ...mapState([
                'arkid',
                'mnemonic'
            ])
        },
        mounted(){
            setTimeout(() => {
                this.hiding = false;
            }, 200)
        },
        methods: {
            bind(changed, original) { this[original] = changed },
            create(){
                if(AuthenticationService.validPassword(this.password, this.passwordConfirmation, this))
                    this[Actions.CREATE_NEW_ARKID](this.password).then(() => this.next());
            },
            unlock(){
                this.hiding = true;
                setTimeout(() => {
                    AuthenticationService.verifyPassword(this.password, this).then(() => {
                        this[Actions.LOAD_ARKID]().then(() => setTimeout(() => this.next(), 100));
                    }).catch(() => this.hiding = false);
                }, 200)
            },
            importKeychain(){
                this.$router.push({name:RouteNames.LOAD_FROM_BACKUP})
            },
            next(){
                if(this.mnemonic) this.$router.push({name:RouteNames.SHOW_MNEMONIC});
                else this.$router.push({name:RouteNames.MAIN_MENU});
            },
            ...mapActions([
                Actions.CREATE_NEW_ARKID,
                Actions.SET_SEED,
                Actions.IS_UNLOCKED,
                Actions.LOAD_ARKID,
                Actions.PUSH_ALERT
            ])
        },
    }
</script>

<style lang="scss">
    .unlocker {
        opacity:1;
        transform:translateY(0px);
        transition:all 0.2s ease;
        transition-property: opacity, transform;

        &.hiding {
            opacity:0;
            /*transform:translateY(150px);*/
        }
    }
</style>
