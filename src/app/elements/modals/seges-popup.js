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
                
                   <div>
                       <h3>{{dictionary.erp.seges.guide.title}}</h3>
                       <p>{{dictionary.erp.seges.guide.steps[0]}}</p>
                       <p>{{dictionary.erp.seges.guide.steps[1]}}</p>
                       <p><img :src="getSegesImage(1)"></p>
                       <p>{{dictionary.erp.seges.guide.steps[2]}}</p>
                       <p>{{dictionary.erp.seges.guide.steps[3]}}</p>
                       <p><img :src="getSegesImage(2)"></p>
                       <p>{{dictionary.erp.seges.guide.steps[4]}}</p>
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
        getSegesImage : function (index) {
            return AssetModel('/assets/img/seges/seges_guide_' + index + '.png').path;
        },
    };

    return Vue.extend({
        name: 'seges-popup',
        data,
        template,
        methods,
        props: {},
        components: {
            modal
        },
        created: function () {},
        mounted: function() {},
    });
});
