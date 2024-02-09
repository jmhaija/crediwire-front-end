    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import SharedConnectionModel from 'models/SharedConnectionModel'
    import Validator from 'services/Validator'

    const template = `
        <article>
           <header class="section-heading">{{ui.dictionary.company.create}}</header>
           <section class="form">
               <p>{{ui.dictionary.company.setup}}</p>
               <section class="toolbar">
                   <button class="primary" v-on:click="gotoCreateCompany()">{{ui.dictionary.company.create}}</button>
               </section>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        }
    });

    const methods = {
        gotoCreateCompany() {
            this.$router.push('/account/create-company');
        }
    };

    export default Vue.extend({
        template,
        data,
        methods
    });
