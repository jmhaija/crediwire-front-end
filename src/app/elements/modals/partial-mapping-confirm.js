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
                <p>{{dictionary.accounts.partialMappingConfirm}}</p>                
            </template>
            
            <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div><a href="" v-on:click.prevent="close">{{dictionary.accounts.partialMappingNo}}</a></div>
                    <div><button class="warning" v-on:click="saveMapping(true, true); close();">{{dictionary.accounts.partialMappingYes}}</button></div>
                </div>
            </template>                                                       
        </modal>
    `;

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },

    };

    return Vue.extend({
        name: 'partial-mapping-confirm',
        data,
        template,
        methods,
        props: {
            saveMapping: {
                type: Function,
                required: true
            }
        },
        components: {
            modal
        },
        mounted: function() {},
    });
});
