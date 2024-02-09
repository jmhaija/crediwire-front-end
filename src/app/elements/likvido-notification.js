define([

    'Vue',
    'models/DictionaryModel',
    'models/AssetModel',
    'models/UserModel',
    'constants/userRoles',

], function(Vue, DictionaryModel, AssetModel, UserModel, userRoles) {
    const template = `
        <div class="likvido-notification" v-show="showNotification">
            <div class="close" @click="dismissNotification()"><i class="cwi-close"></i></div>
            <div class="image"><img :src="likvidoImage"></div>
            <div class="heading">New Feature in CrediWire!</div>
            <div class="description">You can now collect debt from your clients using our new Debt Collectio feature made possible by Likvido.</div>
            <div class="got-it"><button class="primary" @click="dismissNotification()">Got it!</button></div>
        </div>              
    `;

    const data = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
            },
            likvidoImage: new AssetModel('/assets/img/other/likvido.png').path,
            profile : UserModel.profile()
        };
    };

    const methods = {
        dismissNotification() {
            this.$store.dispatch('dismissLikvidoNotification');
        }
    };

    const computed = {
        hasCollectorsRole() {
            const { roles } = this.profile;
            return roles && roles.indexOf(userRoles.DEBT_COLLECTION_ROLE) >= 0;
        },
        showNotification() {
            return this.$store.getters.likvidoNotification && !this.isUnderTutorial;
        },
        showOverlay() {
            return this.hasCollectorsRole && this.showNotification;
        }
    };


    return Vue.extend({
        name : 'likvido-notification',
        template,
        data,
        methods,
        computed,
        props : ['collectDebt', 'isUnderTutorial'],
        created : function() {
            const profile = UserModel.profile();
            if (!profile.settings.sawLikvidoNotification) {
                this.$store.dispatch('setLikvidoNotification', true);
            }

            if (this.showOverlay) {
                this.$store.dispatch('setOverlay', true);
            }
        },
        destroyed: function () {
            this.$store.dispatch('setOverlay', false);
        }
    });
});
