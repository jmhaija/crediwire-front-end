    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import ErpModel from 'models/ErpModel'
    import EventBus from 'services/EventBus'

    const template = `
        <article>
           <header class="section-heading">{{ui.dictionary.company.deleteCompany}}</header>
           <p>{{ui.dictionary.company.deleteCompanyDescription}}</p>
           <button class="warning" v-on:click="showDeleteDialog()">{{ui.dictionary.company.deleteCompany}}</button>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        }
    });

    const methods = {
        showDeleteDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.company.deleteCompanyConfirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.company.deleteCompanyDecline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.company.deleteCompanyAccept,
                        class: 'warning',
                        default: true,
                        handler: () => { this.$modal.hide('dialog'); this.deleteErp(); }
                    }
                ]
            });
        },
        deleteErp() {
            this.ui.showConfirmation = false;
            this.showDeletingDialog();

            //Check ERP
            if (ErpModel.getErp() && ErpModel.getErp().id) {
                ErpModel.deleteConnection()
                    .then(function() {
                        setTimeout(function() {
                            this.deleteCompany();
                        }.bind(this), 10000);
                    }.bind(this));
            } else {
                this.deleteCompany();
            }
        },

        deleteCompany() {
            CompanyModel.deleteCompany()
                .then(function(res) {
                    if (res) {
                        this.postDeletion();
                    }
                }.bind(this));
        },

        postDeletion() {
            EventBus.$emit('companyDeleted');
            setTimeout(() => {
                this.$modal.hide('dialog');
            }, 500);
        },

        showDeletingDialog() {
            this.$modal.show('dialog',{
                text: this.ui.dictionary.company.deletingCompany,
                width: 600,
                buttons: [{}]
            });
        },
    };

    export default Vue.extend({
        template,
        data,
        methods
    });
