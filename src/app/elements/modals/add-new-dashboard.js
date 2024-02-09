define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'models/DashboardModel',
    'models/ContextModel',
    'models/UserModel',
    'models/CompanyModel',
    'services/Validator'
], function (Vue, modal, DictionaryModel, DashboardModel, ContextModel, UserModel, CompanyModel, Validator) {
    const template = `
        <modal :title="dictionary.dashboards.add" :close="close">                                        
            <template v-slot:content>
                   <section class="form">
                       
                           <section class="input-field">
                               <input type="text" v-model="fields.name.value" v-bind:class="{ invalid : !fields.name.valid || fields.name.error }" v-on:keyup="validateName(); changes = true;" v-on:blur="validateName(true)">
                               <label v-bind:class="{ filled: fields.name.value }">{{dictionary.dashboards.name}}</label>
                               <div class="warning" v-bind:class="{ show : !fields.name.valid }">{{dictionary.general.validation.generic}}</div>
                               <div class="warning" v-bind:class="{ show : fields.name.error }">{{dictionary.dashboards.exists}}</div>
                           </section>

                           <section class="types" v-if="context && context.permissionType == 'full' && userInfo && (userInfo.owner || userInfo.permissionType == 'full')">
                               <p>{{dictionary.dashboards.type}}</p>
                               <div class="flex-space-between">
                                    <div class="type-choose" :class="{ active : addDashboardFor == 'company' }" v-on:click="addDashboardFor = 'company'">{{company.name}}</div>
                                    <div class="type-choose" :class="{ active : addDashboardFor == 'connection' }" v-on:click="addDashboardFor = 'connection'">{{context.company.name}}</div>
                                </div>
                           </section>
                                                 
                   </section>             
            </template>
            <template v-slot:footer>
                <div class="zero-padding-top zero-padding-bottom buttons-container">
                    <div v-show="!saving" @click.prevent="close"><a href="" class="zero-padding">{{dictionary.dashboards.cancel}}</a></div>
                    <div v-show="!saving" class="zero-padding"><button class="primary" @click="addDashboard" v-handle-enter-press="addDashboard">{{dictionary.dashboards.add}}</button></div>  
                    <span v-show="saving" class="working inline"></span>
                </div> 
            </template>                                                       
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            changes: false,
            saving: false,
            fields : {
                name : { value : '', valid : true, error : false }
            },
            company : CompanyModel.getCompany(),
            context : ContextModel.getContext(),
            userInfo : UserModel.getCompanyUserInfo(),
            addDashboardFor : 'company',
        };
    };

    const methods = {
        validateName : function(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },
        addDashboard() {
            if ( !this.validateName(true) ) {
                return false;
            }

            this.saving = true;
            this.fields.name.error = false;

            var dm = new DashboardModel();
            dm.create({ name : this.fields.name.value }, (this.context && this.addDashboardFor == 'company'))
                .then((res) => {
                    if (res.id) {
                        this.onDashboardAdded(res);
                        this.close();
                    } else {
                        this.fields.name.error = true;
                    }

                    this.saving = false;
                });
        },
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'add-new-dashboard',
        template,
        data,
        methods,
        props: {
            onDashboardAdded: {
                type: Function,
                required: true
            }
        },
        components: {
            modal
        },
        mounted: function() {
            if (this.context && this.context.permissionType === 'full' && !this.userInfo.owner && this.userInfo.permissionType !== 'full') {
                this.addDashboardFor = 'connection';
            } else {
                this.addDashboardFor = 'company';
            }
        },
    });
});
