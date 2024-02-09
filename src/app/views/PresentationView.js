    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import reportPresentation from 'components/reportPresentation.vue'

    const template = `
        <article>
            <section class="login-view-presentation" v-show="!ui.success">
               <div class="lone-logo">
                   <img :src="getImage()">
               </div>
            
               <section class="form report-login" v-show="!ui.success">
                   <form v-on:submit.prevent="checkPin(pin)">
                           <div class="description-enter-pin-code" v-show="ui.pinError"><p class="error-login-presentation">{{ui.dictionary.presentations.OhNo}}!</p>{{ui.dictionary.presentations.pinError}}</div>
                           <div class="input-field" :style="ui.pinError ? 'padding: 6px;' : ''">
                           <span class="title-enter-pin-code" v-show="!ui.pinError">{{ui.dictionary.presentations.showPresentation}}</span>
                           <p class="description-enter-pin-code" v-show="!ui.pinError">{{ui.dictionary.presentations.showInfoPinCode}}</p>
                           <span class="filled" v-show="!ui.pinError">{{ui.dictionary.presentations.pin}}:</span>
                           <input class="white" v-show="!ui.pinError" style="margin-top: 6px;" type="password" v-model="pin" />
                       </div>
                       <section class="toolbar" style="padding: 0 0 1rem 0;">
                           <div class="working" v-show="ui.working"></div><button type="submit" class="accent enter-pin-code" v-show="!ui.working && !ui.pinError" :disabled="pin === ''" :style="pin !== '' ? 'background-color: #ffa630 !important;' : 'background-color: #cccccc !important;'">{{ui.dictionary.presentations.showPresentation}}</button>
                           <button type="submit" class="accent back-to-app" @click="goToCrediWire()" v-show="!ui.working && ui.pinError">{{ui.dictionary.presentations.backToCrediwire}}</button>
                       </section>
                   </form>
               </section>
            </section>
            
           <div v-if="ui.success">
               <report-presentation :presentation="presentation"></report-presentation>
           </div>
        </article>
    `;
    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            success : false,
            pinError : false,
            working : false
        },
        pin : '',
        presentation : null
    });

    const methods = {
        checkPin(pin) {
            this.ui.working = true;
            var token = this.$route.query.token;

            PresentationTemplateCollection.checkTokenPin(token, pin)
                .then(function (res) {
                    if (res.token && res.language) {
                        var scope = this;
                        DictionaryModel.setLanguage(res.language);
                        DictionaryModel.fetchDictionary(true)
                            .then(function(dictionary) {
                                DictionaryModel.setHash(dictionary);
                                scope.presentation = res;
                                scope.ui.dictionary.meta.symbol = res.currency;
                                scope.ui.dictionary = dictionary;
                                scope.ui.success = true;
                            });
                    } else {
                        this.ui.working = false;
                        this.ui.pinError = true;
                    }
                }.bind(this));
        },

        getImage() {
            return new AssetModel('/assets/img/logo/default.png').path;
        },

        goToCrediWire() {
            event.preventDefault();
            this.ui.pinError = false;
            this.pin = '';
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'report-presentation' : reportPresentation
        }
    });
