   import Vue from 'Vue'
   import DictionaryModel from 'models/DictionaryModel'

    const template = `
        <article class="lone-component">
           <div class="float-right"><router-link to="/language?back=unsupported">{{ui.dictionary.meta.lang}}</router-link></div>
           <header class="main-heading">CrediWire</header>
           <section class="message-bar">
               <div class="normal">{{ui.dictionary.general.errors.unsupported}}</div>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false
        }
    });


    export default Vue.extend({
        template,
        data
    });
