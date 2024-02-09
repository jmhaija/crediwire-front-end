    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'

    const template = `
        <article class="lone-component">
           <header class="main-heading center-text">CrediWire</header>
           <section class="message-bar center-text">
               <div class="normal">{{ui.dictionary.invitations.invitationExpired}}</div>
           </section>
           <section class="center-text">
               <button class="primary" v-on:click="gotoRegister()">{{ui.dictionary.invitations.registerAnyway}}</button>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false
        }
    });


    const methods = {

        gotoRegister() {
            this.$router.push('/register');
        }
    };


    export default Vue.extend({
        template,
        data,
        methods
    });
