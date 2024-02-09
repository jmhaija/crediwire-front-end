define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel',
], function (Vue, moment, modal, DictionaryModel) {
    const template = `
        <modal :title="ui.dictionary.presentations.saveTemplate" :close="close">  
            <template v-slot:content>
                <section class="form">
                    <span class="add-page-explanation">{{ui.dictionary.presentations.saveTemplateDescription}}</span>
                </section>
            </template>   
            <template v-slot:footer>
                <div class="close zero-padding single-footer-btn" v-show="!ui.saving"><button class="primary" type="submit" @click="saveTemplate();">{{ui.dictionary.presentations.saveTemplate}}</button></div>
            </template>                                                    
        </modal>
    `;


    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                saving: false
            }
        };
    };

    const methods = {
        saveTemplate() {
            return false;
        },

        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'show-template',
        template,
        data,
        methods,
        components: {
            modal,
        },
        created: function () {},
        mounted: function() {}
    });
});
