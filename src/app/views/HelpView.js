    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'

    const template = `
        <article class="help">
           <div class="flex-column flex-align-center">
               <h1>{{ui.dictionary.help.contact}}</h1>
               <h2>{{ui.dictionary.profile.email}} : <a href="mailto:info@crediwire.com">info@crediwire.com</a></h2>
               <h2>{{ui.dictionary.profile.phone}} : <a href="tel:+4591540965">+45 9154 0965</a></h2>
           </div>
        </article>
    `;


    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        }
    });

    export default Vue.extend({
        template,
        data
    });
