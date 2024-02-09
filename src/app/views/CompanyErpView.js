/* global ga, localStorage */

define([

    'Vue',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/UserModel',
    'models/ContextModel',
    'models/AssetModel',
    'config/erp-providers',
    'services/Validator',
    'services/Config',
    'services/Seges',
    'services/C5',
    'models/CompanyModel',
    'services/Toast',
    'services/EventBus',
    'elements/inventio-uploader',
    'views/CompanySettingsView',
    'elements/ms-dynamics-wizard',
    'elements/modals/modal',
    'elements/modals/economic-confirmation',
    'elements/modals/economic-managed-account',
    'elements/modals/seges-popup',
    'elements/modals/approve-mismatching-data-confirm',
    'mixins/companyErpMixin',
    'services/Track',
    'components/vatApproval'
], function(Vue, DictionaryModel, ErpModel, UserModel, ContextModel, AssetModel, providers, Validator, Config, Seges, C5, CompanyModel, Toast, EventBus, inventioUploader, CompanySettingsView, msDynamicsWizard, modal, economicConfirmation, economicManagedAccount, segesPopup, approveMismatchingDataModal, companyErpMixin, Track, vatApproval) {

    /**
     * View template
     */
    var template = [
        '<article class="connections manage-dashboards">',

        '   <header class="section-heading">{{ui.dictionary.erp.title}}</header>',


        '   <section v-show="ui.loading || (!permissions && !permissions.id && !setup)">',
        '       <div v-show="erp.saving">',
        '           <div class="form">',
        '               <div class="input-field">',
        '                   <input type="text" v-model="ui.dictionary.erp.providers[erp.provider]" disabled="disabled">',
        '                   <label class="filled">{{ui.dictionary.erp.provider}}</label>',
        '               </div>',
        '           </div>',
        '           <p>{{ui.dictionary.erp.updating}}</p>',
        '       </div>',
        '       <div class="working small-margin"></div>',
        '       <section class="toolbar" v-show="!ui.loading && profile.roles.indexOf(\'admin\') >= 0 || permissions.owner || permissions.permissionType == \'full\'">',
        '           <button type="submit" class="warning" v-show="!ui.deleting" v-on:click="confirmDeleteErp()">',
        '               <span v-show=" erp.provider != \'seges-contact\'">{{ui.dictionary.erp.delete}}</span>',
        '               <span v-show=" erp.provider == \'seges-contact\'">{{ui.dictionary.erp.seges.delete}}</span>',
        '           </button>',
        '       </section>',
        '   </section>',




        '   <section v-show="ui.pending">',
        '       <div class="working"></div>',
        '   </section>',



        /**
         * ERP connection section
         */
        '   <section v-show="!ui.loading && !ui.pending && ui.section == \'connection\'">',


        '       <section class="form" v-show="(erp.active || erp.deletable) && !erp.deleting && !ui.forbidden">',
        '           <section v-show="erp.failure">',
        '               <p>{{ui.dictionary.erp.authentication}}</p>',
        '           </section>',
        '           <form v-on:submit.prevent="confirmDeleteErp()">',
        '               <div class="input-field" v-show="erp.active && erp.provider != \'seges-contact\'">',
        '                   <input type="text" v-model="ui.dictionary.erp.providers[erp.provider]" disabled="disabled">',
        '                   <label class="filled">{{ui.dictionary.erp.provider}}</label>',
        '               </div>',


                        /**
                         * Seges
                         */
        '               <div class="input-field" v-show="erp.active && erp.provider == \'seges-contact\' && !erp.fileStatus && !ui.uploadingSeges && !ui.uploadingSegesError">',
        '                   <label class="filled">{{ui.dictionary.erp.seges.upload}}</label>',
        '                   <input type="file" v-on:change="processEvent">',
        '                   <div class="line-spacer"></div>',
        '                   <a href="" v-on:click.prevent="showSegesGuide">{{ui.dictionary.erp.seges.instructions}}</a>',
        '                   <div class="line-spacer"></div>',
        '                   <button type="button" class="primary" v-on:click.prevent="uploadSegesFile">{{ui.dictionary.erp.seges.uploadAction}}</button>',
        '               </div>',


        '               <div class="input-field" v-show="erp.active && erp.provider == \'seges-contact\' && !erp.fileStatus && ui.uploadingSeges && !ui.uploadingSegesError">',
        '                   <div class="working"></div>',
        '               </div>',


        '               <div class="input-field" v-show="erp.active && erp.provider == \'seges-contact\' && erp.fileStatus && !ui.uploadingSeges && !ui.uploadingSegesError">',
        '                   <label class="filled">{{ui.dictionary.erp.seges.requestSent}}</label>',
        '               </div>',



                        /**
                         * C5
                         */
        '               <div class="input-field" v-show="erp.active && erp.provider == \'c5\' && !erp.fileStatus && !ui.uploadingC5 && !ui.uploadingC5Error">',
        '                   <label class="filled">{{ui.dictionary.erp.seges.uploadZip}}</label>',
        '                   <input type="file" v-on:change="processEvent">',
        '                   <div class="line-spacer"></div>',
        '                   <button type="button" class="primary" v-on:click.prevent="uploadC5File" v-if="erp.active && upEv">{{ui.dictionary.erp.seges.uploadAction}}</button>',
        '               </div>',

        '               <div class="input-field" v-show="erp.active && erp.provider == \'c5\' && !erp.fileStatus && ui.uploadingC5 && !ui.uploadingC5Error">',
        '                   <div class="working"></div>',
        '               </div>',

        '               <div class="input-field" v-show="erp.active && erp.provider == \'c5\' && erp.fileStatus && !ui.uploadingC5 && !ui.uploadingC5Error">',
        '                   <label class="filled">{{ui.dictionary.erp.c5RequestSent}}</label>',
        '               </div>',


                        /**
                         * Xena Reconnect
                         */
        '               <div v-show="erp.active && erp.provider == \'xena\' && erp.providerObject && erp.providerObject.status == \'authentication_failure\'">',
        '                   <p>{{ui.dictionary.erp.xena.authFailure}}</p>',
        '                   <a class="button primary" v-on:click="gotoXenaLink(buildXenaUrl(), true)">{{ui.dictionary.erp.xena.reconnect}}</a>',
        '               </div>',


        '               <section class="toolbar" v-show="!ui.loading && profile.roles.indexOf(\'admin\') >= 0 || permissions.owner || permissions.permissionType == \'full\'">',
        '                   <button type="submit" class="warning" v-show="!ui.deleting">',
        '                       <span v-show=" erp.provider != \'seges-contact\'">{{ui.dictionary.erp.delete}}</span>',
        '                       <span v-show=" erp.provider == \'seges-contact\'">{{ui.dictionary.erp.seges.delete}}</span>',
        '                   </button>',
        '               </section>',
        '           </form>',
        '       </section>',

        '       <section v-show="!erp.active && erp.deleting && !ui.forbidden">',
        '           <p>{{ui.dictionary.erp.deleting}}</p>',
        '           <div class="working small-margin"></div>',
        '       </section>',

        '       <section v-show="ui.forbidden">',
        '           <p>{{ui.dictionary.erp.forbidden}}</p>',
        '       </section>',


        '       <section class="form" v-show="!erp.active && !erp.deleting && !ui.forbidden">',
        '           <form v-on:submit.prevent="saveErp(erp.token.value)">',
        '               <div class="selector full-width" v-show="permissions.owner || permissions.permissionType == \'full\' || setup">',
        `                   <label :class="{ filled : erp.providerObject.key }">{{ui.dictionary.erp.provider}}</label>`,
        `                   <div
                                data-test-id="bookkeepingSystemDropdownTrigger"
                                class="label"
                                v-on:click.stop="showProvider()"
                            >`,
        '                       <span v-if="erp.providerObject.key && erp.providerObject.key != \'none\'" class="filled">{{ui.dictionary.erp.providers[erp.providerObject.key]}}</span>',
        '                       <span v-show="(!erp.providerObject.key || erp.providerObject.key == \'none\') && !ui.tfourSevenOfficeSelected && !ui.xeroSelected && !ui.dynamicsSelected && !ui.fortnoxSelected">{{ui.dictionary.erp.select}}</span>',
        '                       <span v-show="(!erp.providerObject.key || erp.providerObject.key == \'none\') && ui.xeroSelected && !ui.dynamicsSelected">Xero (beta)</span>',
        '                       <span v-show="(!erp.providerObject.key || erp.providerObject.key == \'none\') && ui.fortnoxSelected">Fortnox</span>',
        '                       <span v-show="(!erp.providerObject.key || erp.providerObject.key == \'none\') && !ui.xeroSelected && ui.dynamicsSelected">{{ui.dictionary.erp.providers.msdynamics}}</span>',
        '                       <span v-show="(!erp.providerObject.key || erp.providerObject.key == \'none\') && ui.tfourSevenOfficeSelected">{{ui.dictionary.erp.providers[\'tfour-seven-office\']}}</span>',
        '                       <i class="cwi-down"></i>',
        `                       <div
                                    data-test-id="bookkeepingSystemDropdown"
                                    class="options"
                                    v-bind:class="{ show : ui.options }"
                                >`,
        `                           <div
                                        data-test-id="bookkeepingSystemDropdownOption"
                                        v-bind:data-test-value="prov.key"
                                        v-for="prov in erp.providers"
                                        v-show="prov.key != \'c5\' || (prov.key == \'c5\' && profile.roles && profile.roles.indexOf(\'c5_provider_role\') >= 0)"
                                        class="option"
                                        v-bind:class="{ selected : prov.key == erp.providerObject.key }"
                                        v-on:click.stop="setProvider(prov); ui.tfourSevenOfficeSelected = false; ui.xeroSelected = false; ui.dynamicsSelected = false; ui.fortnoxSelected = false;"
                                    >`,
        '                               <span>{{ui.dictionary.erp.providers[prov.key]}}</span>',
        '                           </div>',
        `                           <div
                                        data-test-id="bookkeepingSystemDropdownOption"
                                        data-test-value="fortnox"
                                        v-show="profile.roles && profile.roles && profile.roles.indexOf(\'fortnox_role\') >= 0"
                                        class="option"
                                        v-bind:class="{ selected : ui.fortnoxSelected }"
                                        v-on:click.stop="setProvider({}); ui.tfourSevenOfficeSelected = false; ui.fortnoxSelected = true;  ui.dynamicsSelected = false; ui.xeroSelected = false"
                                    >`,
        '                               Fortnox',
        '                           </div>',
        `                           <div
                                        data-test-id="bookkeepingSystemDropdownOption"
                                        data-test-value="tfourSevenOffice"
                                        class="option"
                                        v-bind:class="{ selected : ui.tfourSevenOfficeSelected }"
                                        v-on:click.stop="setProvider({}); ui.tfourSevenOfficeSelected = true; ui.fortnoxSelected = false;  ui.dynamicsSelected = false; ui.xeroSelected = false"
                                    >`,
        '                               {{ui.dictionary.erp.providers[\'tfour-seven-office\']}}',
        '                           </div>',
        `                           <div
                                        data-test-id="bookkeepingSystemDropdownOption"
                                        data-test-value="dynamics"
                                        v-show="profile.roles && profile.roles && profile.roles.indexOf(\'ms_dynamics_provider_role\') >= 0"
                                        class="option"
                                        v-bind:class="{ selected : ui.dynamicsSelected }"
                                        v-on:click.stop="setProvider({}); ui.tfourSevenOfficeSelected = false; ui.dynamicsSelected = true; ui.xeroSelected = false; ui.fortnoxSelected = false;"
                                    >`,
        '                               {{ui.dictionary.erp.providers.msdynamics}}',
        '                           </div>',
        `                           <div
                                        data-test-id="bookkeepingSystemDropdownOption"
                                        data-test-value="xero"
                                        v-show="profile && profile.test"
                                        class="option"
                                        v-bind:class="{ selected : ui.xeroSelected }"
                                        v-on:click.stop="setProvider({}); ui.tfourSevenOfficeSelected = false; ui.xeroSelected = true;  ui.dynamicsSelected = false; ui.fortnoxSelected = false;"
                                    >`,
        '                               Xero (beta)',
        '                           </div>',
        '                       </div>',
        '                   </div>',
        '               </div>',

        '               <div v-show="permissions && permissions.id && !permissions.owner && permissions.permissionType != \'full\' && !setup">',
        '                   {{ui.dictionary.erp.forbidden}}',
        '               </div>',

        '               <div class="input-field" v-show="erp.providerObject.key && erp.providerObject.key != \'none\' && erp.providerObject.key != \'c5\' && erp.providerObject.key != \'dinero\' && erp.providerObject.key != \'xena\' && erp.providerObject.key != \'eg-one\' && erp.providerObject.key != \'exact\' && erp.providerObject.key != \'sageone\' && erp.providerObject.key != \'inventio\' && erp.providerObject.key != \'seges\' && (ui.showEconomicAdvanced || erp.providerObject.key != \'e-conomic\') && (ui.showEconomicAdvanced || erp.providerObject.key != \'reviso\')">',
        `                   <input
                                data-test-id="bookkeepingSystemTokenInput"
                                type="text"
                                v-model="erp.token.value"
                                v-bind:class="{ invalid : !erp.token.valid }"
                                v-on:keyup="validateToken()"
                                v-on:blur="validateToken(true)"
                            >`,
        '                   <label v-bind:class="{ filled: erp.token.value.length > 0 }">{{ui.dictionary.erp.token}}</label>',
        `                   <div
                                data-test-id="bookkeepingSystemTokenValidationWarning"
                                class="warning"
                                v-bind:class="{ show : !erp.token.valid }"
                            >{{ui.dictionary.general.validation.generic}}</div>`,
        '               </div>',


        '               <div v-show="(erp.providerObject.key && erp.providerObject.key != \'none\') || ui.dynamicsSelected || ui.fortnoxSelected || ui.tfourSevenOfficeSelected">',

                            /**
                             * Seges Admin
                             */
        '                   <div v-show="erp.providerObject.key == \'seges\' && profile.roles.indexOf(\'admin\') >= 0">',
        '                       <div class="working" v-show="seges.sending"></div>',

        '                       <div v-show="!seges.sending && seges.sent">',
        '                           <p>{{ui.dictionary.erp.seges.sent}}</p>',
        '                           <p>{{ui.dictionary.erp.seges.vat}}</p>',

        '                           <div class="input-field">',
        '                               <input type="text" v-model="seges.vat.value" v-bind:class="{ invalid : !seges.vat.valid }" v-on:keyup="validateVat()" v-on:blur="validateVat(true)">',
        '                               <label v-bind:class="{ filled: seges.vat.value !== \'\' }">{{ui.dictionary.company.vat}}</label>',
        '                               <div class="warning" v-bind:class="{ show : !seges.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>',
        '                           </div>',

        '                       </div>',
        '                       <button class="primary" v-show="!seges.sending" v-on:click="sendSegesToken()">{{ui.dictionary.erp.seges.send}}</button>',
        '                   </div>',

                            /**
                             * Seges Normal User
                             */
        '                   <div v-show="erp.providerObject.key == \'seges\' && profile.roles.indexOf(\'admin\') < 0">',
        '                       <div class="working" v-show="seges.sending"></div>',

        '                       <div v-show="!seges.sending && seges.sent">',
        '                           <p>{{ui.dictionary.erp.seges.requestSent}}</p>',
        '                       </div>',
        '                       <div v-show="!seges.sending && !seges.sent">',
        '                           <p class="center-text"><i class="cwi-down primary-color animate-bounce"></i> {{ui.dictionary.erp.click}}</p>',
        '                           <div class="center-text">',
        '                               <button class="primary" v-show="!seges.sending" v-on:click="sendSegesRequest()">{{ui.dictionary.erp.get}}</button>',
        '                           </div>',
        '                       </div>',
        '                   </div>',

                            /**
                             * Billy
                             */
        '                   <div v-show="erp.providerObject.key == \'billy\'">',
        '                       <ul>',
        '                           <li>{{ui.dictionary.erp.billy.getKeyLogin}}</li>',
        '                           <li>{{ui.dictionary.erp.billy.getKeySettings}}</li>',
        '                           <li>{{ui.dictionary.erp.billy.getKeyCreate}}</li>',
        '                           <li>{{ui.dictionary.erp.billy.getKeyCopy}}</li>',
        '                           <li>{{ui.dictionary.erp.billy.getKeyPressSave}}</li>',
        '                       </ul>',
        '                       <p class="center-text"><i class="cwi-down primary-color animate-bounce"></i> {{ui.dictionary.erp.billy.getKey}}</p>',
        '                       <div class="center-text"><a class="button" :href="erp.providerObject.url" :target="erp.providerObject.target" v-on:click.prevent="openUrlWindow(erp.providerObject.url)">{{ui.dictionary.erp.billy.linkTo}}</a></div>',
        '                   </div>',

                            /**
                             * Fortnox
                             */
        '                   <div v-show="ui.fortnoxSelected">',
        '                       <div class="input-field">',
        '                           <input type="text" v-model="erp.token.value" v-bind:class="{ invalid : !erp.token.valid }" v-on:keyup="validateToken()" v-on:blur="validateToken(true)">',
        '                           <label v-bind:class="{ filled: erp.token.value.length > 0 }">{{ui.dictionary.erp.token}}</label>',
        '                           <div class="warning" v-bind:class="{ show : !erp.token.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '                       </div>',
        '                       <div class="toolbar">',
        `                           <button
                                        data-test-id="bookkeepingSystemSaveConnectionButton"
                                        type="submit"
                                        class="primary"
                                    >{{ui.dictionary.erp.save}}</button>`,
        '                       </div>',
        '                   </div>',

                            /**
                             * 24SevenOffice
                             */
        '                   <div v-show="ui.tfourSevenOfficeSelected">',
        '                       <div class="input-field">',
        '                           <input type="text" v-model="tfourSevenOffice.client.value" v-bind:class="{ invalid : !tfourSevenOffice.client.valid }" v-on:keyup="validateMinimumLength(tfourSevenOffice.client)" v-on:blur="validateMinimumLength(tfourSevenOffice.client)">',
        '                           <label v-bind:class="{ filled: tfourSevenOffice.client.value.length > 0 }">{{ui.dictionary.erp.tfourSevenOffice.client}}</label>',
        '                           <div class="warning" v-bind:class="{ show : !tfourSevenOffice.client.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '                       </div>',
        '                       <div class="input-field">',
        '                           <input type="text" v-model="tfourSevenOffice.username.value" v-bind:class="{ invalid : !tfourSevenOffice.username.valid }" v-on:keyup="validateMinimumLength(tfourSevenOffice.username)" v-on:blur="validateMinimumLength(tfourSevenOffice.username)">',
        '                           <label v-bind:class="{ filled: tfourSevenOffice.username.value.length > 0 }">{{ui.dictionary.erp.tfourSevenOffice.username}}</label>',
        '                           <div class="warning" v-bind:class="{ show : !tfourSevenOffice.username.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '                       </div>',
        '                       <div class="input-field">',
        '                           <input type="password" v-model="tfourSevenOffice.password.value" v-bind:class="{ invalid : !tfourSevenOffice.password.valid }" v-on:keyup="validateMinimumLength(tfourSevenOffice.password)" v-on:blur="validateMinimumLength(tfourSevenOffice.password)">',
        '                           <label v-bind:class="{ filled: tfourSevenOffice.password.value.length > 0 }">{{ui.dictionary.erp.tfourSevenOffice.password}}</label>',
        '                           <div class="warning" v-bind:class="{ show : !tfourSevenOffice.password.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '                       </div>',
        '                       <div class="toolbar">',
        '                           <div class="working" v-show="ui.working"></div>',
        '                           <button type="submit" class="primary" v-show="!ui.working">{{ui.dictionary.erp.save}}</button>',
        '                       </div>',
        '                   </div>',

                            /**
                             * Dinero
                             */

        '                   <div v-show="erp.providerObject.key == \'dinero\'">',
        '                       <p>{{ui.dictionary.erp.dineroProAccount}}</p>',
        '                   </div>',

                            /**
                             * Inventio
                             */
        '                   <div v-if="erp.providerObject.key == \'inventio\'">',
        '                       <inventio-uploader :company="company.id" :requiresOwnerApproval="requiresOwnerApproval" :showUserInviteForm="showUserInviteForm"></inventio-uploader>',
        '                   </div>',


                            /**
                             * MS Dynamics
                             */
        '                   <div v-if="ui.dynamicsSelected">',
        '                       <ms-dynamics-wizard></ms-dynamics-wizard>',
        '                   </div>',


                            /**
                             * C5
                             */
        '                   <div v-if="erp.providerObject.key == \'c5\'">',
        '                       <div class="input-field" v-show="!erp.active && !erp.fileStatus && !ui.uploadingC5 && !ui.uploadingC5Error">',
        '                           <div class="working" v-show="c5.connecting"></div>',
        '                               <div class="input-field" v-show="!c5.connecting && !erp.fileStatus && !ui.uploadingC5 && !ui.uploadingC5Error">',
        '                                   <label class="filled">{{ui.dictionary.erp.seges.uploadZip}}</label>',
        '                                   <input type="file" v-on:change="processEvent">',
        '                                   <div class="line-spacer"></div>',
        //'                                   <a href="" v-on:click.prevent="openSegesGuide">{{ui.dictionary.erp.seges.instructions}}</a>',
        '                                   <div class="line-spacer"></div>',
        '                                   <div class="invite-area buttons-invite">' +
        '                                       <button type="button" class="primary" v-on:click.prevent="uploadC5File" v-if="erp.active">{{ui.dictionary.erp.seges.uploadAction}}</button>',
        '                                       <button type="button" class="primary" v-on:click.prevent="connectC5()" v-if="!c5.connecting && !erp.active && upEv">{{ui.dictionary.erp.get}}</button>',
        '                                   </div>',
        '                               </div>',
        '                       </div>',
        '                   </div>',


                            /**
                             * Default
                             */
        '                   <div v-show="erp.providerObject.key && erp.providerObject.key != \'none\' && erp.providerObject.key != \'billy\' && erp.providerObject.key != \'seges\' && erp.providerObject.key != \'inventio\' && erp.providerObject.key != \'c5\'">',
        '                       <p class="center-text"><i class="cwi-down primary-color animate-bounce"></i> {{ui.dictionary.erp.click}}</p>',
        '                       <div class="center-text">',
        '                           <a data-test-id="connectButton" class="button primary" v-show="erp.providerObject.key != \'e-conomic\' && erp.providerObject.key != \'xena\' && erp.providerObject.key != \'eg-one\' && erp.providerObject.key != \'exact\' && erp.providerObject.key != \'dinero\'" :href="buildUrl(erp.providerObject.url)" :target="erp.providerObject.target"  v-on:click.prevent="openUrlWindow(erp.providerObject.url)">{{ui.dictionary.erp.get}}</a>',
        '                           <a data-test-id="connectButton" class="button primary" v-show="erp.providerObject.key == \'exact\'" :href="buildUrl(erp.providerObject.url)" target="externalErpFlow" v-on:click="attachWindowFunction()">{{ui.dictionary.erp.get}}</a>',
        '                           <a data-test-id="connectButton" class="button primary" v-show="erp.providerObject.key == \'e-conomic\'" v-on:click="showEconomicConfirmation();">{{ui.dictionary.erp.get}}</a>',
        '                           <a data-test-id="connectButton" class="button primary" v-show="erp.providerObject.key == \'xena\' || erp.providerObject.key == \'eg-one\'" v-on:click="gotoXenaLink(buildUrl(erp.providerObject.url))">{{ui.dictionary.erp.get}}</a>',
        '                           <a data-test-id="connectButton" class="button primary" v-show="erp.providerObject.key == \'dinero\'" target="externalErpFlow" v-on:click="openUrlWindow(addUrlState(erp.providerObject.url))">{{ui.dictionary.erp.get}}</a>',
        '                       </div>',
        '                   </div>',



        '               </div>',
        '               <section class="toolbar" v-show="erp.providerObject.key && erp.providerObject.key != \'none\' && erp.providerObject.key != \'c5\' && erp.providerObject.key != \'dinero\' && erp.providerObject.key != \'xena\' && erp.providerObject.key != \'eg-one\' && erp.providerObject.key != \'exact\' && erp.providerObject.key != \'sageone\' && erp.providerObject.key != \'inventio\' && erp.providerObject.key != \'seges\' && (ui.showEconomicAdvanced || erp.providerObject.key != \'e-conomic\') && (ui.showEconomicAdvanced || erp.providerObject.key != \'reviso\') && (profile.roles.indexOf(\'admin\') >= 0 || permissions.owner || permissions.permissionType == \'full\' || forceSave)">',
        '                    <div class="working" v-show="ui.working"></div><button v-show="!ui.working" type="submit" class="accent">{{ui.dictionary.erp.save}}</button>',
        '               </section>',


        '               <section class="float-right no-margin toolbar advanced-options" v-show="erp.providerObject && erp.providerObject.key == \'e-conomic\' && economicAdmin.active">',
        '                   <a v-on:click="showEconomicManagedAccount()">{{ui.dictionary.erp.managed}}</a>',
        '               </section>',


        '               <section class="toolbar advanced-options" v-show="erp.providerObject.key == \'e-conomic\' || erp.providerObject.key == \'reviso\'">',
        `                   <div v-show="!ui.showEconomicAdvanced">
                                <a
                                    data-test-id="bookkeepingSystemEconomicAdvancedButton"
                                    v-on:click="ui.showEconomicAdvanced = true"
                                >{{ui.dictionary.erp.advanced}}</a>
                            </div>`,
        '                   <div v-show="ui.showEconomicAdvanced"><a v-on:click="ui.showEconomicAdvanced = false">{{ui.dictionary.erp.hideAdvanced}}</a></div>',
        '               </section>',


        '           </form>',
        '       </section>',

        '   </section>',



        /**
         * VAT approval section
         */
        `  <section :class="{ 'half-width' : !setup }" v-if="!ui.loading && ui.section == 'vat_approval'">
            <vat-approval :company="company" :erpObject="newErpObject" :approveReconnect="approveReconnect" :approveVat="approveVat"></vat-appproval>
           </section>`,


        '</article>'
    ].join("\n");

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                deleteConfirm : false,
                options : false,
                working : false,
                forbidden : false,
                showEconomicConfirmation : false,
                showEconomicAdvanced : false,
                showManagedAccount : false,
                approveMismatchingDataConfirm : false,
                forceDefaultEconomicFlow : false,
                uploadingSeges : false,
                uploadingSegesError : false,
                segesFileUploaded : false,
                showSegesGuide : false,
                uploadingC5 : false,
                uploadingC5Error : false,
                c5FileUploaded : false,
                xeroSelected : false,
                dynamicsSelected : false,
                fortnoxSelected : false,
                tfourSevenOfficeSelected : false,
                section : 'connection',
                vatApprovalSection : 'init',
                deleting : false,
                pending : false,
            },
            erp : {
                active : false,
                provider : '',
                providerObject : ErpModel.getErp() || { key : 'none' },
                token : { value : '', valid : true },
                companyID : { value : '', valid : true },
                apiKey : { value : '', valid : true },
                deleting : false,
                check : false,
                interval : 5000,
                providers : [],
                saving : false,
                failure : false,
                deletable : false
            },
            permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
            seges : {
                sending : false,
                sent : false,
                vat : {
                    value : '',
                    valid : true
                }
            },
            c5 : {
                connecting : false,
                connected : false
            },
            tfourSevenOffice : {
                client : { value : '', valid : true },
                username : { value : '', valid : true },
                password : { value : '', valid : true }
            },
            profile : UserModel.profile(),
            company: CompanyModel.getCompany(),
            context : ContextModel.getContext() || false,
            economicAdmin : {
                active: true,
                working: false,
                parent : true,
                userid : null,
                password : null,
                agreement : null,
                parentID : null
            },
            errors : {
                userNotFound : false,
                invalidDataTypeFormat : false,
                invalidPassword : false,
                noApiAccess : false,
                noAdministratorRightToCompany : false
            },
            client : {
                agreement : {
                    value : '',
                    valid : true,
                    error : false
                },
                adding : false
            },
            upEv : null,
            doVatCheck : true,
            newErpObject : {},
            eventAttached: false
        };
    };

    /**
     * Methods
     */
    var methods = {
        /**
         * Initialize view
         */
        init : function() {
            if (this.presetCompany) {
                this.company = this.presetCompany;
            } else {
                this.company = CompanyModel.getCompany();
            }

            /**
             * Set up ERP provider list
             */
            var erpList = Config.get('erpList');
            this.erp.providers = providers[erpList];

            /**
             * Set up Seges
             */
            if (ContextModel.getContext()) {
                this.seges.vat.value = ContextModel.getContext().vat;
            } else if (CompanyModel.getCompany()) {
                this.seges.vat.value = CompanyModel.getCompany().vat;
            }

            /**
             * Event listeners
             */
            EventBus.$on('companyErpChanged', this.bindErpModelToData);
            EventBus.$on('companyUserChanged', this.updatePermissions);
            EventBus.$on('clickAppBody', this.closeOptions);
            document.addEventListener('clickAppBody', this.closeOptions);


            /**
             * Check e-conomic admin type
             */
            this.checkEconomicAccountType();
            EventBus.$on('callInitVatApproval', (erp) => {
                this.initVatApproval(erp);
            });
        },

        makeID : function (length) {
            let result           = '';
            const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for ( let i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

        addUrlState : function (url) {
            let id = this.makeID(32)
            localStorage.setItem('stateID', JSON.stringify(id))
            return url + '&state=' + id
        },

        validateMinimumLength : function (inpObj) {
          if (inpObj.value.length && inpObj.value.length > 2) {
            inpObj.valid = true;
          } else {
            inpObj.valid = false;
          }

          return inpObj.valid;
        },

        buildXenaUrl : function () {
            var found = '';

            this.erp.providers.forEach(function (provider) {
                if (provider.key == 'xena') {
                    found = provider.url;
                }
            });

            return found;
        },

        initVatApproval : function (erp) {
            this.ui.section = 'vat_approval';
            this.ui.vatApprovalSection = 'init';
            this.newErpObject = erp || ErpModel.getErp();
        },

        approveDismiss : function () {
            if (this.completedCallback) {
                this.completedCallback();
            } else if (!this.noredirect) {
                this.$router.push('/account/updating');
            }
        },

        approveReconnect : function () {
            this.ui.section = 'connection';
            this.ui.loading = true;
            this.ui.deleting = true;
            this.deleteErpConnection(true);
            //this.bindErpModelToData();
        },


        approveCheckCompanyInfo : function () {
            this.ui.vatApprovalSection = 'company_info';
        },


        companySettingsSavedCallback : function (reconnect) {
            if (reconnect) {
                this.approveReconnect();
            } else {
                this.approveVat();
            }
        },

        approveVat : function () {
            // Show confirm popup only if Vat number is in mismatch with bookkeeping data and approve popup is not already shown
            if (this.showVatNumberMismatchMessage && !this.ui.approveMismatchingDataConfirm) {
                this.showApproveMismatchingDataConfirm();
            } else {
                ErpModel.approveVat(this.newErpObject.id, this.company.id)
                    .then(function (res) {
                        this.approveDismiss();
                    }.bind(this));
            }
        },


        getSegesImage : function (index) {
            return AssetModel('/assets/img/seges/seges_guide_' + index + '.png').path;
        },

        processEvent : function () {
            this.upEv = event;
        },

        uploadSegesFile : function () {
            if (!this.upEv) {
                return false;
            }

            this.ui.uploadingSeges = true;
            this.ui.uploadingSegesError = false;

            Seges.upload(this.upEv)
                .then(function(res) {
                    if (res) {
                        this.ui.uploadingSeges = false;
                        this.ui.segesFileUploaded = true;
                        this.erp.fileStatus = 'uploaded';
                    } else {
                        this.ui.uploadingSegesError = true;
                    }
                }.bind(this));
        },


        uploadC5File : function () {
            if (!this.upEv) {
                return false;
            }
            this.ui.loading = true;
            this.ui.uploadingC5 = true;
            this.ui.uploadingC5Error = false;
            this.ui.deleting = true;
            C5.upload(this.upEv)
                .then(function(res) {
                    if (res && res.ok) {
                        this.ui.uploadingC5 = false;
                        this.ui.c5FileUploaded = true;
                        this.erp.fileStatus = 'uploaded';
                        this.$router.push('/account/updating');
                    } else {
                        Toast.show(this.ui.dictionary.erp.errorResponse, 'warning');
                        this.ui.uploadingC5 = false;
                    }
                    this.ui.loading = false;
                }.bind(this));
        },

        connectC5 : function () {
            this.c5.connecting = true;
            C5.connect(this.company.id)
                .then(function(res) {
                    if (res.erp) {
                        ErpModel.setErp(res);
                        this.erp.providerObject = res;
                        this.erp.active = true;
                        this.erp.provider = 'c5';
                    }

                    this.c5.connecting = false;
                    this.c5.connected = true;
                    this.upEv = null;

                    if (this.completedCallback) {
                        this.completedCallback();
                    } else if (this.setup) {
                        this.$router.push('/account/updating');
                    }
                }.bind(this));
        },

        getImage : function(file) {
            return new AssetModel(file).path;
        },

        addEconomicManagedAccount : function() {
            this.client.agreement.error = false;
            this.client.adding = true;

            ErpModel.economicClientConnection(this.client.agreement.value, this.presetParentCompany.id, this.presetConnection.id)
                .then(function(res) {
                    if (res.id) {
                        if (this.completedCallback) {
                            this.completedCallback(res);
                        }
                    } else {
                        this.client.agreement.error = true;
                        this.client.adding = false;
                    }
                }.bind(this));
        },

        validateClientAgreement : function(force) {
            if (force || !this.client.agreement.valid) {
                this.client.agreement.valid = this.client.agreement.value.length > 3;
            }

            return this.client.agreement.valid;
        },

        addEconomicAdmin : function() {
            if ( !this.economicAdmin.userid || this.economicAdmin.userid.length === 0
              || !this.economicAdmin.password || this.economicAdmin.password.length === 0
              || !this.economicAdmin.agreement || this.economicAdmin.agreement.length === 0
            ) {
                return false;
            }

            var scope = this;
            this.economicAdmin.working = true;
            scope.errors.userNotFound = false;
            scope.errors.invalidDataTypeFormat = false;
            scope.errors.invalidPassword = false;


            ErpModel.economicAdminConnection(this.economicAdmin.userid, this.economicAdmin.password, this.economicAdmin.agreement)
                .then(function(res) {
                    if (res.status) {
                        ErpModel.setErp(res);
                        scope.erp.providerObject = res;
                        scope.erp.active = true;
                        scope.erp.provider = 'e-conomic-admin-parent';

                        Toast.show(scope.ui.dictionary.erp.saved);

                        if (scope.setup) {
                            scope.$router.push('/account/connections/all');
                        }

                        // Pageview for GA conversions
                        // Track.ga.setPage('erp-connected');
                        // Track.ga.sendPageView();

                        scope.ui.showManagedAccount = false;
                    } else if (res.errors && res.errors[1]) {
                        if (res.errors[1].type == 'ErpConnect_UserNotFound') {
                            scope.errors.userNotFound = true;
                        } else if (res.errors[1].type == 'ErpConnect_InvalidDataTypeFormat') {
                            scope.errors.invalidDataTypeFormat = true;
                        } else if (res.errors[1].type == 'ErpConnect_InvalidPassword') {
                            scope.errors.invalidPassword = true;
                        }
                    }

                    scope.economicAdmin.working = false;
                });
        },


        addEconomicClient : function() {
            if (!this.economicAdmin.agreement || this.economicAdmin.agreement.length === 0) {
                return false;
            }

            var scope = this;
            this.economicAdmin.working = true;
            scope.errors.userNotFound = false;
            scope.errors.invalidDataTypeFormat = false;
            scope.errors.invalidPassword = false;
            scope.errors.noApiAccess = false;
            scope.errors.noAdministratorRightToCompany = false;

            ErpModel.economicClientConnection(this.economicAdmin.agreement)
                .then(function(res) {
                    if (res.status) {
                        ErpModel.setErp(res);
                        scope.erp.providerObject = res;
                        scope.erp.active = true;
                        scope.erp.provider = 'e-conomic-admin-child';

                        Toast.show(scope.ui.dictionary.erp.saved);

                        if (ContextModel.getContext()) {
                            scope.$router.push('/account/updating');
                        }

                        scope.ui.showManagedAccount = false;
                    } else {
                        if (res.errors[1].type == 'ErpConnect_UserNotFound') {
                            scope.errors.userNotFound = true;
                        } else if (res.errors[1].type == 'ErpConnect_InvalidDataTypeFormat') {
                            scope.errors.invalidDataTypeFormat = true;
                        } else if (res.errors[1].type == 'ErpConnect_InvalidPassword') {
                            scope.errors.invalidPassword = true;
                        } else if (res.errors[1].type == 'ErpConnect_NoApiAccess') {
                            scope.errors.noApiAccess = true;
                        } else if (res.errors[1].type == 'ErpConnect_NoAdministratorRightToCompany') {
                            scope.errors.noAdministratorRightToCompany = true;
                        }
                    }

                    scope.economicAdmin.working = false;
                });
        },


        checkEconomicAccountType : function() {
            var scope = this;
            if (ContextModel.getContext()) {
                ErpModel.fromCompany(false)
                    .then(function(res) {
                        if (res.erp && res.erp == 'e-conomic-admin-parent') {
                            scope.economicAdmin.active = true;
                            scope.economicAdmin.parent = false;
                            scope.economicAdmin.parentID = res.id;
                        } else {
                            scope.economicAdmin.active = false;
                        }
                    });
            } else {
                scope.economicAdmin.active = true;
            }
        },


        updatePermissions : function() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.checkEconomicAccountType();
        },



        /**
         * Close options
         */
        closeOptions : function() {
            const contentModal = document.getElementsByClassName('content-modal');
            const options = document.getElementsByClassName('options');
            if (contentModal[0] && options[1]) {
                options[1].style.overflowY = "";
            }
            this.ui.options = false;
        },


        /**
         * Send Seges token
         */
        sendSegesToken : function() {
            if (this.erp.providerObject.key === 'seges') {
                if (!this.validateVat(true)) {
                    return false;
                }

                var scope = this;

                localStorage.setItem('segesCompany', JSON.stringify(this.company));
                localStorage.setItem('segesConnection', JSON.stringify(this.company));
                this.seges.sending = true;

                Seges.sendEmail(this.seges.vat.value, this.company.id)
                    .then(function(res) {
                        if (scope.completedCallback) {
                            scope.completedCallback();
                        }
                        scope.seges.sending = false;
                        scope.seges.sent = true;
                    });
            }
        },


        /**
         * Send Seges Request
         */
        sendSegesRequest : function() {
            var scope = this;
            this.seges.sending = true;

            Seges.sendRequest(this.company.id)
                .then(function(res) {
                    if (res.erp) {
                        ErpModel.setErp(res);
                        scope.erp.providerObject = res;
                        scope.erp.active = true;
                        scope.erp.provider = 'seges-contact';
                    }

                    scope.seges.sending = false;
                    scope.seges.sent = true;

                    if (scope.completedCallback) {
                        scope.completedCallback();
                    } else if (scope.setup) {
                        scope.$router.push('/account/seges-pending');
                    }
                });
        },

        /**
         * Validate VAT
         */
        validateVat : function(force) {
            if (force || !this.seges.vat.valid) {
                this.seges.vat.valid = Validator.vat(this.seges.vat.value);
            }

            return this.seges.vat.valid;
        },


        validateCompanyID : function(force) {
            if (force || !this.erp.companyID.valid) {
                this.erp.companyID.valid = this.erp.companyID.value.length > 3;
            }

            return this.erp.companyID.valid;
        },

        validateApiKey : function(force) {
            if (force || !this.erp.apiKey.valid) {
                this.erp.apiKey.valid = this.erp.apiKey.value.length > 3;
            }

            return this.erp.apiKey.valid;
        },


        saveTfourSevenConnection : function () {
            if (!this.validateMinimumLength(this.tfourSevenOffice.client) || !this.validateMinimumLength(this.tfourSevenOffice.username) || !this.validateMinimumLength(this.tfourSevenOffice.password) ) {
              return false;
            }

            this.ui.working = true;

            ErpModel.createTfourSevenOfficeConnection(this.tfourSevenOffice.client.value, this.tfourSevenOffice.username.value, this.tfourSevenOffice.password.value, this.company.id)
              .then(function(response) {
                if (response.status) {
                  ErpModel.setErp(response);

                  Toast.show(this.ui.dictionary.erp.saved);

                  /**
                   * Pageview for GA conversions
                   */
                  Track.ga.setPage('erp-connected');
                  Track.ga.sendPageView();

                  //Redirect
                  if (this.completedCallback) {
                    this.completedCallback();
                  } else if (!this.noredirect) {
                    this.$router.push('/account/updating');
                  }
                } else {
                  ErpModel.forgetErp();
                  this.ui.working = false;
                  Toast.show(this.ui.dictionary.erp.notsaved, 'warning');
                }

                this.bindErpModelToData();
            }.bind(this));
        },

        /**
         * Save ERP Connection
         */
        saveErp : function(token) {
            if (this.ui.tfourSevenOfficeSelected) {
              this.saveTfourSevenConnection();
              return false;
            } else if ( !this.validateToken(true) && this.erp.providerObject.key != 'dinero' ) {
                return false;
            } else if ( !this.validateCompanyID(true) && !this.validateApiKey(true) && this.erp.providerObject.key == 'dinero') {
                return false;
            }

            /**
             * Country attribute for Exact
             */
            var country = null;

            if (this.erp.providerObject.key == 'exact') {
                country = 'de';
            }

            var scope = this;
            scope.ui.working = true;


            if (this.ui.fortnoxSelected) {
                ErpModel.createFortnoxConnection(token, 'DKK', this.company.id)
                    .then(function(response) {
                        if (response.status) {
                            ErpModel.setErp(response);

                            Toast.show(scope.ui.dictionary.erp.saved);

                            /**
                             * Pageview for GA conversions
                             */
                            Track.ga.setPage('erp-connected');
                            Track.ga.sendPageView();

                            //Redirect
                            if (scope.completedCallback) {
                                scope.completedCallback();
                            } else if (!scope.noredirect) {
                                scope.$router.push('/account/updating');
                            }
                        } else {
                            ErpModel.forgetErp();
                            scope.ui.working = false;
                            Toast.show(scope.ui.dictionary.erp.notsaved, 'warning');

                        }

                        scope.bindErpModelToData();
                    });

                return false;
            }

            if (this.erp.providerObject.key == 'dinero') {
                ErpModel.createDineroConnection(this.erp.companyID.value, this.erp.apiKey.value, 'DKK', this.company.id)
                    .then(function(response) {
                        if (response.status) {
                            ErpModel.setErp(response);

                            Toast.show(scope.ui.dictionary.erp.saved);

                            /**
                             * Pageview for GA conversions
                             */
                            Track.ga.setPage('erp-connected');
                            Track.ga.sendPageView();

                            //Redirect
                            if (scope.completedCallback) {
                                scope.completedCallback();
                            } else if (!scope.noredirect) {
                                scope.$router.push('/account/updating');
                            }
                        } else {
                            ErpModel.forgetErp();
                            scope.ui.working = false;
                            Toast.show(scope.ui.dictionary.erp.notsaved, 'warning');

                        }

                        scope.bindErpModelToData();
                    });

                return false;
            }



            ErpModel.createConnection(this.erp.providerObject.key, this.erp.token.value, country, this.company.id)
                .then(function(response) {
                    if (response.status) {
                        ErpModel.setErp(response);

                        Toast.show(scope.ui.dictionary.erp.saved);

                        /**
                         * Pageview for GA conversions
                         */
                        Track.ga.setPage('erp-connected');
                        Track.ga.sendPageView();

                        //Redirect
                        if (this.doVatCheck && response && (response.vatCheckStatusText == 'mismatch' || response.status == 'erp_vat_mismatch') ) {
                            this.initVatApproval();
                        } else if (scope.completedCallback) {
                            scope.completedCallback();
                        } else if (!scope.noredirect) {
                            scope.$router.push('/account/updating');
                        }
                    } else {
                        ErpModel.forgetErp();
                        scope.ui.working = false;
                        Toast.show(scope.ui.dictionary.erp.notsaved, 'warning');

                    }

                    scope.bindErpModelToData();
                }.bind(this));
        },

        /**
         * Validate Token
         */
        validateToken : function(force) {
            if (force || !this.erp.token.valid) {
                this.erp.token.valid = Validator.minLength(this.erp.token.value, 32);
            }

            return this.erp.token.valid;
        },

        /**
         * Bind the ERP model data to the form
         */
        bindErpModelToData : function() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();

            /**
             * Update Seges
             */
            if (ContextModel.getContext()) {
                this.seges.vat.value = ContextModel.getContext().vat;
            } else if (this.company) {
                this.seges.vat.value = this.company.vat;
            }

            var erp = ErpModel.getErp();

            if (erp == 'loading') {
                this.ui.loading = true;
                this.erp.failure = false;
                this.erp.saving = false;
            } else if (erp == 'forbidden') {
                this.ui.loading = false;
                this.erp.failure = false;
                this.ui.forbidden = true;
            } else if (!erp) {
                this.erp.provider = '';
                this.erp.token.value = '';
                this.erp.active = false;
                this.erp.deleting = false;
                this.ui.forbidden = false;
                this.ui.loading = false;
                this.erp.failure = false;
                clearInterval(this.erp.check);
            } else if (erp.deleting) {
                this.ui.loading = false;
                this.erp.active = false;
                this.erp.deleting = true;
                this.erp.failure = false;
                this.startCheckInterval();
            } else if (erp.status == 'initializing' || erp.status == 'updating') {
                this.erp.provider = erp.erp;
                this.ui.loading = true;
                this.ui.working = false;
                this.ui.forbidden = false;
                this.erp.failure = false;
                this.erp.saving = true;
                this.erp.deletable = true;
                this.startCheckInterval();
            } else if (erp.status == 'authentication_failure') {
                this.erp.provider = erp.erp;
                this.erp.active = true;
                this.ui.loading = false;
                this.ui.forbidden = false;
                this.erp.saving = false;
                this.erp.failure = true;
                clearInterval(this.erp.check);
            } else {
                this.erp.provider = erp.erp;
                this.erp.active = true;
                this.ui.loading = false;
                this.ui.forbidden = false;
                this.erp.saving = false;
                this.erp.failure = false;
                this.erp.fileStatus = erp.fileStatus;
                clearInterval(this.erp.check);
            }


            this.ui.deleting = false;
        },

        /**
         * Confirm the deletion of an ERP
         */
        confirmDeleteErp : function() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.erp.confirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.erp.decline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.general.delete,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteErpConnection(); this.$modal.hide('dialog')}
                    }
                ]
            });
        },

        /**
         * Delete ERP connection
         */
        deleteErpConnection : function(rebind) {
            var scope = this;

            scope.ui.deleteConfirm = false;

            ErpModel.deleteConnection(this.company.id)
                .then(function(res) {
                    scope.erp.active = false;
                    scope.erp.deleting = true;
                    scope.erp.check = false;
                    scope.erp.fileStatus = false;
                    scope.startCheckInterval();
                    //scope.ui.loading = false;

                    if (rebind) {
                        scope.erp.providerObject = {
                            key : 'none'
                        };

                        scope.ui.working = false;
                        //scope.ui.deleting = false;
                    }
                });
        },

        /**
         * Start the ERP check interval
         */
        startCheckInterval : function() {
            var scope = this;

            if (this.erp.check) {
                return false;
            }

            this.erp.check = setInterval(function() {
                ErpModel.fromCompany()
                    .then(function(response) {
                        if (response.status) {
                            ErpModel.setErp(response);
                        } else {
                            ErpModel.forgetErp();
                        }

                        scope.bindErpModelToData();
                    });
            }, this.erp.interval);
        },

        /**
         * Set ERP Provider
         */
        setProvider : function(erp) {
            this.erp.providerObject = erp;
            this.ui.options = false;
        },

        gotoXenaLink : function(url, reconnect) {
            window.redirectToConnect = function(url) {
                window.location.href = url;
            };

            sessionStorage.setItem('xenaCompany', JSON.stringify(this.company));

            if (reconnect) {
                sessionStorage.setItem('xenaReconnectCompany', JSON.stringify(true));
            }

            window.open(url, 'xena', 'menubar=0,status=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',scrollbars=1');
        },

        openUrlWindow : function(url) {
            sessionStorage.setItem('targetCompany', JSON.stringify(this.company));
            this.attachWindowFunction();
            window.open(this.buildUrl(url), 'externalErpFlow', 'menubar=0,status=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',scrollbars=1');
        },

        attachWindowFunction : function() {
            window.completeConnection = function (url, erp) {
                if (erp && erp.vatCheckStatusText == 'mismatch') {
                    this.initVatApproval(erp);
                } else if (this.completedCallback) {
                    this.completedCallback();
                } else if (url && !this.noredirect) {
                    this.$router.push(url);
                } else if (!this.noredirect) {
                    this.$router.push('/account/updating');
                }
            }.bind(this);
        },

        getErpCheckStatus : function () {
            this.ui.pending = true;

            setTimeout(function () {
                var skipConnection = this.presetConnection ? true : false;
                var presetId = this.presetConnection ? this.presetConnection.company.id : null;
                ErpModel.fromCompany(skipConnection, presetId)
                    .then(function (erp) {
                        if (erp && erp.vatCheckStatusText == 'mismatch') {
                            this.initVatApproval(erp);
                        } else if (this.completedCallback) {
                            this.completedCallback();
                        } else if (!this.noredirect) {
                            this.$router.push('/account/updating');
                        }
                        this.ui.pending = false;
                    }.bind(this));
            }.bind(this), 1000);

        },

        showEconomicConfirmation : function () {
            this.$modal.show(economicConfirmation, {
                erpUrl: this.erp.providerObject.url,
                getErpCheckStatus: this.getErpCheckStatus,
                completedCallback: this.completedCallback,
                noredirect: this.noredirect
            }, {
                height: 'auto'
            });
        },

        showEconomicManagedAccount() {
            this.$modal.show(economicManagedAccount, {confirmCallback: () => this.attachSessionListener(this.erp.providerObject.url)}, {height: 'auto'});
        },

        showSegesGuide() {
            this.$modal.show(segesPopup, {}, {height: 'auto', width: '70%', pivotY: 0.2});
        },

        showApproveMismatchingDataConfirm() {
            this.ui.approveMismatchingDataConfirm = true;

            this.$modal.show(approveMismatchingDataModal, {
                confirmCallback: () => {this.approveVat();},
                declineCallback: () => (this.ui.approveMismatchingDataConfirm = false)
            }, {height: 'auto'});
        },

        showProvider() {
            const contentModal = document.getElementsByClassName('content-modal');
            const options = document.getElementsByClassName('options');
            if (contentModal[0] && options[1]) {
                options[1].style.overflowY = "hidden";
            }
            this.ui.options = true;
        }

    };

    return Vue.extend({
        name : 'CompanyErpView',
        template : template,
        data : bindings,
        methods : methods,
        mixins: [companyErpMixin],
        computed: computed,
        props : ['forceSave', 'setup', 'presetCompany', 'presetConnection', 'presetParentCompany', 'completedCallback', 'noredirect', 'requiresOwnerApproval', 'showUserInviteForm'],
        components : {
            'inventio-uploader' : inventioUploader,
            'company-settings' : CompanySettingsView,
            'ms-dynamics-wizard' : msDynamicsWizard,
            'vat-approval' : vatApproval
        },
        created : function() {
            //this.init();
        },
        mounted : function() {
            this.init();

            if (!this.presetCompany) {
                this.bindErpModelToData();
            } else {
                this.ui.loading = false;
            }
        },
        beforeDestroy : function() {
            clearInterval(this.erp.check);
            EventBus.$off('companyErpChanged');
            EventBus.$off('clickAppBody');
            EventBus.$off('companyUserChanged');
            document.removeEventListener('clickAppBody', this.closeOptions);
        }
    });
});
