    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyUserModel from 'models/CompanyUserModel'
    import EventBus from 'services/EventBus'
    import modal from 'elements/modals/modal'

    const template = `
        <article>
           <div class="working" v-show="ui.deleting"></div>
    
           <div v-show="!ui.deleting">
               <header class="section-heading">{{ui.dictionary.company.leave}}</header>
               <p>{{ui.dictionary.company.leaveDescription}}</p>
               <button class="warning" v-on:click="showConfirmationDialog();">{{ui.dictionary.company.leave}}</button>
           </div>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            deleting : false
        }
    });

    const methods = {
        leaveCompany() {
            this.ui.deleting = true;
            var um = new CompanyUserModel();
            um.deleteSelf()
                .then(function() {
                    EventBus.$emit('companyDeleted');
                    this.$router.push('/');
                }.bind(this));
        },

        showConfirmationDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.company.leaveConfirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.company.leaveDecline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.company.leaveAccept,
                        class: 'warning',
                        handler: () => { this.leaveCompany(); this.$modal.hide('dialog')}
                    }
                ]
            })
        }
    };

    export default Vue.extend({
        template,
        data,
        methods
    });
