    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import CompanyModel from 'models/CompanyModel'
    import SharedConnectionModel from 'models/SharedConnectionModel'
    import SeeConnectionModel from 'models/SeeConnectionModel'
    import DictionaryModel from 'models/DictionaryModel'
    import Toast from 'services/Toast'

    const template = `
        <modal class="no-header" :close="close">  
            <template v-slot:content>
                <p>{{ui.dictionary.invitations.vatExists}}</p>
                <p>{{ui.dictionary.invitations.connectExistingCompany}}</p>
                
                <div class="connect-companies">
                       <div class="company"
                            v-for="company in connectCompanyList"
                            :class="{ selected : company.id === chosenCompany.id }"
                            v-on:click="chosenCompany = company">
                           <span v-show="company.name">{{company.name}}</span>
                           <span v-show="!company.name">{{company.vat}}</span>
                       </div>
                   </div>
    
            </template>   
            <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div class="zero-padding"><a v-on:click="close();">{{ui.dictionary.invitations.doNotConnect}}</a></div>
                    <div class="zero-padding"><button class="primary float-right" v-on:click="connectToCompany(chosenCompany)">{{ui.dictionary.invitations.connect}}</button></div>
                </div>
            </template>                                                    
        </modal>
    `;


    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash()
        },
        company : CompanyModel.getCompany(),
        chosenCompany : null
    });

    const methods = {
        connectToCompany(company) {
            var scope = this;
            this.close();

            if (this.addConnectionType == 'see') {
                var cm = new SeeConnectionModel();
            } else if (this.addConnectionType == 'show') {
                var cm = new SharedConnectionModel();
            }

            cm.request(company.id)
                .then(function(res) {
                    if (res.id) {
                        Toast.show(scope.ui.dictionary.invitations.connectedSuccess.replace(':company', company.name));
                    } else {
                        Toast.show(scope.ui.dictionary.connections.alreadyAdded, 'warning');
                    }
                });
        },

        close() {
            this.$emit('close');
        }
    };

    export default Vue.extend({
        name: 'connect-companies',
        template,
        data,
        props: {
            connectCompanyList: {
                type: Array,
                required: true
            },
            addConnectionType: {
                type: String,
                required: true
            },
            currentCompany: {}
        },
        methods,
        components: {
            modal,
        },
        created() {
            this.chosenCompany = this.currentCompany;
        },
    });
