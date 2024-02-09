define([
    'Vue',
    'elements/modals/modal',
    'models/CompanyUserInvitationModel',
    'models/SeeConnectionModel',
    'models/DictionaryModel'
], function (Vue, modal, CompanyUserInvitationModel, SeeConnectionModel, DictionaryModel) {
    const template = `
        <modal :title="ui.dictionary.connections.selectDepartment" :close="close">
           <template v-slot:content>
               <div class="department-list">
                   <div class="department radio-field" v-for="dept in departments">
                       <label><input type="radio" v-model="chosenDepartment" v-bind:value="dept.id"> <i></i> {{dept.name}} <span v-show="dept.short_name">{{dept.short_name}}</span></label>
                   </div>
                   <div class="department radio-field">
                       <label><input type="radio" v-model="chosenDepartment" v-bind:value="null"> <i></i> {{ui.dictionary.connections.noDepartment}}</label>
                   </div>
               </div>
           </template>                                         
           <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div class="zero-padding"><a href="" v-on:click.prevent="close()">{{ui.dictionary.customKpis.cancel}}</a></div>
                    <div class="zero-padding"><button class="primary" v-on:click="selectNewDepartment(chosenDepartment)">{{ui.dictionary.general.ok}}</button></div>
               </div>
           </template>                                                                 
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash()
            },
            chosenDepartment : null
        };
    };

    const methods = {
        selectNewDepartment : function (dept) {
            this.connection.department = dept;
            let sc = new SeeConnectionModel();

            sc.changeDepartment(this.connection.id, dept)
                .then(function (res) {
                });

            this.close();
        },

        close() {
            this.$emit('close');
        }

    };

    return Vue.extend({
        name: 'show-departaments',
        template,
        data,
        methods,
        props: {
            departments: {},
            connection: {}
        },
        components: {
            modal
        },
        created: function () {},
        mounted: function() {
            this.chosenDepartment = this.connection.department;
        },
    });
});
