define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'services/Validator'
], function (Vue, modal, DictionaryModel, Validator) {
    const template = `
        <modal :close="close" :title="dictionary.warnings.add">                                    
            <template v-slot:content>
                <section class="input-field">
                    <input type="text" v-model="fields.name.value" v-bind:class="{ invalid : !fields.name.valid || fields.name.error }" v-on:keyup="validateName();" v-on:blur="validateName(true)">
                    <label v-bind:class="{ filled: fields.name.value }">{{dictionary.warnings.name}}</label>
                    <div class="warning" v-bind:class="{ show : !fields.name.valid }">{{dictionary.general.validation.generic}}</div>
                    <div class="warning" v-bind:class="{ show : fields.name.error }">{{dictionary.warnings.exists}}</div>
                </section>             
            </template>
               
            <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div v-show="!saving" class="zero-padding"><a href="" v-on:click.prevent="close">{{dictionary.warnings.cancel}}</a></div>
                    <div v-show="!saving" class="zero-padding"><button class="primary" @click="addWarning(); close()" v-handle-enter-press="function() {addWarning(); close();}">{{dictionary.warnings.add}}</button></div>
                    <span v-show="saving" class="working inline"></span>
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
        validateName : function(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'add-new-notification',
        template,
        data,
        methods,
        props: {
            fields: {
                type: Object,
                required: true
            },
            addWarning: {
                type: Function,
                required: true
            },
            saving: {
                type: Boolean,
                required: true
            }
        },
        components: {
            modal,
        },
        mounted: function() {},
    });
});
