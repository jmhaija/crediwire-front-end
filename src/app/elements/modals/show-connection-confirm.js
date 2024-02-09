    define([
        'Vue',
        'moment',
        'elements/modals/modal',
        'models/SharedConnectionModel',
        'models/DictionaryModel',
        'models/UserModel',
        'collections/ConnectionStoreCollection',
        'elements/modals/add-new-connection',
        'services/EventBus'
    ], function (Vue, moment, modal, SharedConnectionModel, DictionaryModel, UserModel, ConnectionStoreCollection, addNewConnection, EventBus) {
        const template = `
        <modal :title="ui.dictionary.presentations.getLink" :close="close">                                        
            <template v-slot:content>
               <p class="justify">{{getCompanyName(ui.dictionary.connections.connectConfirmation)}}</p>
            </template>
                            
            <template v-slot:footer>
                <div class="alignment-buttons-footer">
                    <div class="centered"><a href="" v-on:click.prevent="close(); addNewConnectionModal()">{{ui.dictionary.connections.connectConfirmationNegative}}</a></div>
                    <div class="centered zero-padding"><button class="primary" v-on:click="setConnectConfirmation(); close();" v-handle-enter-press="function() { setConnectConfirmation(); close(); }">{{ui.dictionary.connections.connectConfirmationPositive}}</button></div>
                    <!-- <div class="centered"><a href="" v-on:click.prevent="ui.showConnectConfirm = false; ui.newConnectionDialog = true">{{ui.dictionary.connections.connectConfirmationNegative}}</a></div>',-->
                </div>
            </template>                                  
        </modal>
    `;


        const data = function () {
            return {
                ui: {
                    dictionary: DictionaryModel.getHash(),
                },
                currentCompanyToAdd : null,

            };
        };

        const methods = {
            getCompanyName : function (string) {
                let lang = this.ui.dictionary.meta.code;
                this.currentCompanyToAdd = this.name;
                if (this.currentCompanyToAdd && this.currentCompanyToAdd.confirmation && this.currentCompanyToAdd.confirmation[lang]) {
                    return this.currentCompanyToAdd.confirmation[lang];
                } else if (this.currentCompanyToAdd) {
                    return string.replace(':company', this.currentCompanyToAdd.name).replace(':company', this.currentCompanyToAdd.name);
                }

                return string;
            },

            setConnectConfirmation: function() {
                EventBus.$emit('setConnectionConfirm', {company: this.currentCompanyToAdd, confirmed: true, connectionType: this.connectionType});
              //  EventBus.$emit('getCompanyFromConnection', this.name);
            },

            addNewConnectionModal : function () {
                // this.$modal.show(copyLink, {shareLinkInfo: this.shareLinkInfo}, {height: 'auto'});
                this.$modal.show(addNewConnection, {erpConnectionCompleted: this.erpConnectionCompleted, showUserInviteForm: this.showUserInviteForm}, {height: 'auto'});
            },


            close() {
                this.$emit('close');
            },
        };

        return Vue.extend({
            name: 'show-connection-confirm',
            template,
            data,
            methods,
            props: ['name', 'erpConnectionCompleted',  'showUserInviteForm', 'connectionType'],
            components: {
                modal
            },
            mounted: function() {},
        });
    });
