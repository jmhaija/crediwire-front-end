    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import WarningModel from 'models/WarningModel'
    import WarningsCollection from 'collections/WarningsCollection'
    import warningEditor from 'components/warningEditor.vue'
    import addNewNotificationModal from 'elements/modals/add-new-notification'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'

    const template = `
    <article class="early-warnings manage-dashboards">

       <section v-show="ui.loading"><div class="working"></div></section>

       <section class="splash" v-show="!ui.loading && warnings.length === 0">
           <h1>{{ui.dictionary.warnings.splash.title}}</h1>
           <p>{{ui.dictionary.warnings.splash.text}}</p>
           <button class="primary" v-on:click.prevent="showNewNotificationModal" v-show="permissions.owner || permissions.permissionType == 'full'">{{ui.dictionary.warnings.splash.action}}</button>
       </section>

       <section v-show="!ui.loading && warnings.length > 0" class="dashboard-list">

           <div class="float-right">
               <div class="tooltip" v-show="!permissions.subscribeAllAlert"><div class="message left right-arrow-tooltip">{{ui.dictionary.warnings.subscribeHint}}</div><button class="primary" v-on:click="subsribeToAlerts()">{{ui.dictionary.warnings.subscribe}}</button></div>
               <div v-show="permissions.subscribeAllAlert"><button v-on:click="unsubscribeFromAlerts()">{{ui.dictionary.warnings.unsubscribe}}</button></div>
           </div>
           <div>&nbsp;</div>
           <div class="toolbar">
               <div class="add" v-show="permissions.owner || permissions.permissionType == 'full'"><a href="#" v-on:click.prevent="showNewNotificationModal"><i class="cwi-add"></i> {{ui.dictionary.warnings.add}}</a></div>
           </div>
           <div class="dashboard"
                v-for="warning in warnings">
                <div class="edit" v-on:click="openWarning(warning.id)" v-show="warning.id != currentWarning">{{ui.dictionary.warnings.edit}}</div>
                <div class="edit" v-on:click="closeWarnings()" v-show="warning.id == currentWarning"><i class="cwi-close"></i></div>
                <span v-show="warning.id != currentWarning">{{warning.name}}</span>
                <div v-if="warning.id == currentWarning">
                   <warning-editor :warning="warning" :callback="getWarnings"></warning-editor>
                </div>
           </div>

       </section>

    </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            saving : false
        },
        warnings : [],
        currentWarning : null,
        fields : {
            name : { value : '', valid : true, error : false},
            all : true
        },
        permissions : UserModel.getCompanyUserInfo()
    });


    const methods = {
        init() {
            this.getWarnings();

            /**
             * Event listeners
             */
            EventBus.$on('companyUserChanged', this.getWarnings);
            EventBus.$on('companyUserChanged', this.updatePermissions);

            if (this.$route.query && this.$route.query.new) {
                this.showNewNotificationModal();
            }
        },

        showNewNotificationModal() {
          this.$modal.show(addNewNotificationModal, {
              fields: this.fields,
              addWarning: this.addWarning,
              saving: this.ui.saving
          }, {height: 'auto'});
        },

        subsribeToAlerts() {
            Vue.set(this.permissions, 'subscribeAllAlert', true);
            this.saveCompanyUserInfo();
        },

        unsubscribeFromAlerts() {
            Vue.set(this.permissions, 'subscribeAllAlert', false);
            this.saveCompanyUserInfo();
        },

        saveCompanyUserInfo() {
            UserModel.setCompanyUserInfo(this.permissions);
            UserModel.saveCompanyUserInfo();
        },

        updatePermissions() {
            this.permissions = UserModel.getCompanyUserInfo();
        },

        getWarnings() {
            if (!CompanyModel.getCompany() || !UserModel.getCompanyUserInfo().id) {
                return false;
            }

            var wc = new WarningsCollection();
            var scope = this;

            this.ui.loading = true;
            wc.getWarnings()
                .then(function(response) {
                    if (response.contents) {
                        scope.warnings = response.contents;
                    }

                    scope.ui.loading = false;
                });
        },

        openWarning(id) {
            this.currentWarning = id;
        },

        closeWarnings() {
            this.currentWarning = null;
        },

        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        addWarning() {
            if ( !this.validateName(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.saving = true;
            scope.fields.name.error = false;

            var wm = new WarningModel();
            wm.create({ name : scope.fields.name.value, all : scope.fields.all })
                .then(function(res) {
                    if (res.id) {
                        scope.warnings.push(res);
                        scope.fields.name.value = '';
                        scope.currentWarning = res.id;
                    } else {
                        scope.fields.name.error = true;
                    }

                    scope.ui.saving = false;
                });
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'warning-editor' : warningEditor
        },
        created() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('companyUserChanged', this.getWarnings);
            EventBus.$off('companyUserChanged');
        }
    });
