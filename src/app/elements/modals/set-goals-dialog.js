define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel'
], function (Vue, modal, DictionaryModel) {
    const template = `
        <modal :title="title" :close="close">
            <template v-slot:content>
               <div class="goal-form">
                   <div class="goal-input">
                       <label>{{dictionary.stats.sent}}</label>
                       <input type="number" v-model="currentDepartmentObj.goals.invitations.value" min="0" max="999999" step="1">
                   </div>
                   <div class="goal-input">
                       <label>{{dictionary.stats.converted}}</label>
                       <input type="number" v-model="currentDepartmentObj.goals.conversions.value" min="0" max="999999" step="1">
                   </div>
                   <div class="goal-input">
                       <label>{{dictionary.stats.logins}}</label>
                       <input type="number" v-model="currentDepartmentObj.goals.logins.value" min="0" max="999999" step="1">
                   </div>     
               </div>     
            </template>                                         
            <template v-slot:footer>
                <div class="buttons-container zero-padding-bottom zero-padding-top right-aligned">
                    <button class="primary" v-on:click="setGoals(currentDepartmentObj.id, currentDepartmentObj.goals); close();"
                            v-handle-enter-press="function() { setGoals(currentDepartmentObj.id, currentDepartmentObj.goals); close(); }">{{dictionary.stats.setGoals}}</button>
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
        }
    };

    const computed = {
        title() {
            return  `${this.dictionary.stats.setGoals}: ${!this.currentDepartment ? this.dictionary.stats.noDepartment : this.currentDepartment}`;
        }
    };

    return Vue.extend({
        name: 'set-goals',
        template,
        data,
        methods,
        computed,
        props: {
            currentDepartment: {
                required: true
            },
            currentDepartmentObj: {
                type: Object,
                required: true
            },
            setGoals: {
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
