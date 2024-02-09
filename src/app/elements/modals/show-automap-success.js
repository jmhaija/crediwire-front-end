define([
    'Vue',
    'models/DictionaryModel',
    'models/AssetModel',
    'elements/modals/modal',
], function (Vue, DictionaryModel, AssetModel, modal) {
    const template = `
        <modal :close="close" class="no-header">                                        
            <template v-slot:content>
                <div  v-on:click="close()" class="close" style="position: absolute; right: 25px; top: 10px;"><i class="cwi-close"></i></div>
                <p>{{ui.dictionary.accounts.automapSuccess}}</p>  
                <p><a :href="\'tel:\' + ui.dictionary.meta.phone">{{ui.dictionary.meta.phone}}</a> &nbsp; {{ui.dictionary.general.or}} &nbsp; <a :href="\'mailto:\' + ui.dictionary.meta.email">{{ui.dictionary.meta.email}}</a></p>              
            </template>
            
            <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div class="zero-padding"><a href="" v-on:click.prevent="close();">{{ui.dictionary.accounts.lookThrough}}</a></div>
                    <div class="zero-padding"><button class="primary" v-on:click="redirectToUpdating(); close();">{{ui.dictionary.accounts.continue}}</button></div>
                </div>
            </template>                                                       
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash()
            }
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },

    };

    return Vue.extend({
        name: 'show-automap-success',
        data,
        template,
        methods,
        props: {
            redirectToUpdating: {
                type: Function,
                required: true
            }
        },
        components: {
            modal
        },
        created: function () {},
        mounted: function() {}
    });
});
