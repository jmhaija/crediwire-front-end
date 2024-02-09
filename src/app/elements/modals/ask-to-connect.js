define([
    'Vue',
    'models/DictionaryModel',
    'elements/modals/modal'
], function (Vue, DictionaryModel, modal) {
    const template = `
        <modal :close="close" class="no-header">                                        
            <template v-slot:content>
               <div>{{ui.dictionary.company.companyAlreadyCreated}}</div>
                   <div v-for="company in existingCompanies" class="existing-company">
                      <div class="float-right no-margin">
                         <button class="primary" @click="connectToCompany(company)">{{ui.dictionary.company.userInvitation.requestToBecomeUser}}</button>
                      </div>
                        {{company.name}}
                    </div>
            </template>     
            
            <template v-slot:footer>
                <div class="close zero-padding single-footer-btn">
                    <button v-on:click="requestCompanyCreation(company.name.value, company.vat.value); close();">
                        {{ui.dictionary.company.userInvitation.createCompanyAnyway}}
                    </button>
<!--                    <div><a href="" v-on:click.prevent="ui.showConnectConfirm = false;">{{ui.dictionary.connections.connectConfirmationNegative}}</a></div>-->
                </div>
            </template>                                                  
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
            }
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'ask-to-connect',
        template,
        data,
        methods,
        props: {
            company: {},
            existingCompanies: {},
            requestCompanyCreation: {
                type: Function,
                required: true
            },
            connectToCompany: {
                type: Function,
                required: true
            }
        },
        components: {
            modal,
        },
        created: function () {},
        mounted: function() {}
    });
});
