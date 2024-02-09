    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import ErpModel from 'models/ErpModel'
    import PartnerModel from 'models/PartnerModel'
    import Validator from 'services/Validator'
    import CreateCompanyView from 'views/CreateCompanyView'
    import CompanyErpView from 'views/CompanyErpView'
    import EventBus from 'services/EventBus'
    import EconomicSelf from 'services/EconomicSelf'
    import Toast from 'services/Toast'
    import AssetModel from 'models/AssetModel'
    import logoWidthMixin from 'mixins/logoWidthMixin'
    import modal from 'elements/modals/modal'
    import Track from 'services/Track'

    const template = `
        <article v-on:click="triggerClickAppBodyEvent()">
           <section class="lone-component">

           <div class="lone-logo">
               <img :src="getImage()" :style="{ width: logoWidth }">
           </div>

           <div class="login-form">
               <h3 class="setup-heading">{{ui.dictionary.setup.title}}</h3>

               <ul class="progressbar" :class="{ twostep : presetToken }">
                   <li :class="{ active : ui.step > 0, 'from-invite-link' : !companyFromInvitationLink }">{{ui.dictionary.setup.steps.profile}}</li>
                   <li v-if="companyFromInvitationLink" :class="{ active : ui.step > 1 }">{{ui.dictionary.setup.steps.company}}</li>
                   <li :class="{ active : ui.step > 3, 'from-invite-link' : !companyFromInvitationLink }" v-show="!presetToken">{{ui.dictionary.setup.steps.erp}}</li>
               </ul>

               <div class="center-text small-text">
                   <div v-show="ui.step === 1" class="onpage-tip">{{ui.dictionary.setup.tips.profile}}</div>
                   <div v-if="companyFromInvitationLink" v-show="ui.step === 3" class="onpage-tip">{{ui.dictionary.setup.tips.company}}</div>
                   <div v-show="ui.step === 4" class="onpage-tip">{{ui.dictionary.setup.tips.erp}}</div>
               </div>

               <section v-show="ui.step === 1">
                   <section class="form">
                       <form v-on:submit.prevent="updateProfile()">
                           <div class="input-field">
                               <input
                                    data-test-id="setupProfileNameInput"
                                    class="white"
                                    :placeholder="ui.dictionary.profile.name"
                                    type="text"
                                    v-model="profile.name.value"
                                    v-bind:class="{ invalid : !profile.name.valid }"
                                    v-on:keyup="validateName()"
                                    v-on:blur="validateName(true)"
                                >
                               <label v-bind:class="{ filled: profile.name.value.length > 0 }">{{ui.dictionary.profile.name}}</label>
                               <div class="warning" v-bind:class="{ show : !profile.name.valid }">{{ui.dictionary.general.validation.name}}</div>
                           </div>
                           <div class="input-field">
                               <input
                                    data-test-id="setupProfilePhoneInput"
                                    class="white"
                                    :placeholder="ui.dictionary.profile.phone"
                                    type="text"
                                    v-model="profile.phone.value"
                                >
                               <label v-bind:class="{ filled: profile.phone.value.length > 0 }">{{ui.dictionary.profile.phone}}</label>
                           </div>
                           <section class="toolbar full-width">
                               <div class="working" v-show="ui.working"></div><button
                                    data-test-id="setupProfileSaveButton"
                                    type="submit"
                                    v-show="!ui.working"
                                    class="accent"
                                >{{ui.dictionary.profile.save}}</button>
                           </section>
                       </form>
                   </section>
               </section>

               <section v-show="ui.step === 2" class="full-width">
                   <p v-html="getCompanyName(ui.dictionary.connections.connectConfirmation)"></p>
                   <div><button class="primary" v-on:click="ui.step++">{{ui.dictionary.connections.connectConfirmationPositive}}</button></div>
                   <div class="line-spacer"></div><div class="center-text"><a
                        data-test-id="setupSkipButton"
                        v-on:click="showScipConfirmationDialog();"
                        class="skip"
                    >{{ui.dictionary.setup.skip}}</a></div>
               </section>

               <section v-if="companyFromInvitationLink" v-show="ui.step === 3" class="full-width">
                   <create-company></create-company>
                   <div class="line-spacer"></div><div class="center-text"><a
                        data-test-id="setupSkipCompanyButton"
                        v-on:click="showScipConfirmationDialog()"
                        class="skip"
                    >{{ui.dictionary.setup.skip}}</a></div>
               </section>

               <section v-if="ui.step === 4" class="in-setup full-width">
                   <erp-view :forceSave="true" :setup="true"></erp-view>
                   <div class="line-spacer"></div><div class="center-text"><a
                        data-test-id="setupSkipConnectionButton"
                        v-on:click="showScipConfirmationDialog()"
                        class="skip"
                    >{{ui.dictionary.setup.skip}}</a></div>
               </section>
           </div>

           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false,
            step : 1,
        },
        profile : {
            name : { value : '', valid : true },
            phone : { value : '', valid : true }
        },
        appBodyEvent : null,
        presetData : EconomicSelf.getInfo(),
        presetToken : EconomicSelf.getToken(),
        partner : PartnerModel.getPartner()
    });

    const methods = {
        init() {

            if (this.presetData && this.presetData.user && this.presetData.user.name) {
                this.profile.name.value = this.presetData.user.name;
            }

            if (this.presetData && this.presetData.company && this.presetData.company.phone) {
                this.profile.phone.value = this.presetData.company.phone;
            }

            ContextModel.forgetContext();
        },

        getImage() {
            if (this.partner && this.partner.logo) {
                return new AssetModel(this.partner.logo).path;
            }

            return new AssetModel('/assets/img/logo/default.png').path;
        },

        getCompanyName(string) {
            var lang = this.ui.dictionary.meta.code;

            // TODO for using marked:
            // return marked(string, { sanitize: true });

            if (this.partner && this.partner.confirmation && this.partner.confirmation[lang]) {
                string =  this.partner.confirmation[lang];
                return string.replace(':company', this.partner.name).replace(':company', this.partner.name);
            } else if (this.partner) {
                return string.replace(':company', this.partner.name).replace(':company', this.partner.name);
            }

            return string;
        },

        validateName(force) {
            if (force || !this.profile.name.valid) {
                this.profile.name.valid = Validator.name(this.profile.name.value, 2);
            }

            return this.profile.name.valid;
        },

        triggerClickAppBodyEvent() {
            EventBus.$emit('click');
            EventBus.$emit('clickAppBody');
            document.dispatchEvent(this.appBodyEvent);
        },

        /**
         * Update user profile
         */
        updateProfile() {
            if ( !this.validateName(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.working = true;

            var profile = UserModel.profile();
            profile.name = this.profile.name.value;
            profile.phone = this.profile.phone.value;
            UserModel.construct(profile);

            UserModel.save()
                .then(function(res) {
                    if (scope.partner && scope.partner.autoConnect) {
                        scope.ui.step === 1 ? scope.ui.step += 3 : scope.ui.step += 1;
                    } else {
                        scope.ui.step === 1 && !scope.companyFromInvitationLink ? scope.ui.step += 3 : scope.ui.step += 2;
                    }
                    scope.updateWidgetInfo(res.contents?.id, res.contents?.name, res.contents?.email);
                    scope.ui.working = false;
                });
        },

        /**
         * Go to connections
         */
        gotoAccount() {
            if (CompanyModel.getCompany()) {
                this.$router.push('/account/connections/all');
            } else {
                this.$router.push('/account/create-company');
            }
        },

        autoConnectEconomic(token) {
            ErpModel.createConnection('e-conomic', token)
                .then(function(response) {
                    if (response.status) {
                        ErpModel.setErp(response);

                        Toast.show(this.ui.dictionary.erp.saved);

                        /**
                         * Pageview for GA conversions
                         */
                        Track.ga.setPage('erp-connected');
                        Track.ga.sendPageView();

                        this.$router.push('/account/updating');

                        EconomicSelf.forgetAll();
                    } else {
                        ErpModel.forgetErp();
                        this.$router.push('/account/company/erp');
                        Toast.show(this.ui.dictionary.erp.notsaved, 'warning');

                    }
                }.bind(this));
        },

        showScipConfirmationDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.setup.continueSetup,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.setup.declineSkip,
                        class: 'highlighted-text setupDeclineSkipButton'
                    },
                    {
                        title: this.ui.dictionary.setup.confirmSkip,
                        class: 'warning setupConfirmSkipButton',
                        handler: () => { this.gotoAccount(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        updateWidgetInfo(id, name, email) {
            legal.widget({
                type: "signup",
                widgetPublicKey: this.getWidgetKey,
                identifier: id
            });
            legal.user({
                email,
                name
            });
        }
    };

    const computed = {
        companyFromInvitationLink() {
            return this.$store.getters.isInvitationLinkCompany;
        },

        getWidgetKey() {
            return this.$store.getters.getWidgetPublicKey;
        }
    }

    !function(){var i,e,t,s=window.legal=window.legal||[];if(s.SNIPPET_VERSION="3.0.0",i="https://widgets.legalmonster.com/v1/legal.js",!s.__VERSION__)if(s.invoked)window.console&&console.info&&console.info("legal.js: The initialisation snippet is included more than once on this page, and does not need to be.");else{for(s.invoked=!0,s.methods=["cookieConsent","document","ensureConsent","handleWidget","signup","user"],s.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(t),s.push(e),s}},e=0;e<s.methods.length;e++)t=s.methods[e],s[t]=s.factory(t);s.load=function(e,t){var n,o=document.createElement("script");o.setAttribute("data-legalmonster","sven"),o.type="text/javascript",o.async=!0,o.src=i,(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(o,n),s.__project=e,s.__loadOptions=t||{}},s.widget=function(e){s.__project||s.load(e.widgetPublicKey),s.handleWidget(e)}}}();

    export default Vue.extend({
        template,
        data,
        methods,
        computed,
        components : {
            'create-company' : CreateCompanyView,
            'erp-view' : CompanyErpView
        },
        mixins: [logoWidthMixin],
        created() {
            this.appBodyEvent = document.createEvent('Event');
            this.appBodyEvent.initEvent('clickAppBody', true, true);
            this.init();
        },
        beforeRouteLeave(to, from, next) {
            if (to.path == '/account/company/settings') {
                if (this.presetToken) {
                    this.autoConnectEconomic(this.presetToken);
                } else {
                    this.ui.step++;
                }

                next(false);
            } else {
                next();
            }
        }
    });
