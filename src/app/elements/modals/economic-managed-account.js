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
                    
                <p class="double-space justify">
                    <ol class="economic-steps">
                        <li v-for="(step, index) in dictionary.erp.economic.admin">
                               <span v-show="index == 0"><a href="https://www.e-conomic.dk/login" target="_blank">{{step}}</a></span>
                               <span v-show="index != 0">{{step}}</span>
                               <div v-show="index == 2" class="center-text"><img :src="getImage('/assets/img/other/e-conomic-administrer.png')"></div>
                        </li>
                    </ol>
                </p>
                
                <p>&nbsp;</p>
                <p class="double-space justify">{{dictionary.erp.economic.confirm}} <a class="underlined" :href="dictionary.meta.tosUrl" target="_blank">{{dictionary.erp.economic.terms}}</a></p>            
            </template>
            
            <template v-slot:footer>
                <div class="zero-padding-top zero-padding-bottom buttons-container">
                    <div class="center-text"><a href="" v-on:click.prevent="close">{{dictionary.erp.economic.cancel}}</a></div>
                    <div class="center-text"><a class="button primary" v-on:click.prevent="close(); confirmCallback();">{{dictionary.erp.economic.ok}}</a></div>
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
        getImage(file) {
            return new AssetModel(file).path;
        }
    };

    return Vue.extend({
        name: 'economic-managed-account',
        data,
        template,
        methods,
        props: {
            confirmCallback: {
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
