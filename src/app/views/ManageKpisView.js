    import Vue from 'Vue'
    import KpiCollection from 'collections/KpiCollection'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import ContextModel from 'models/ContextModel'
    import KpiModel from 'models/KpiModel'
    import kpiEditor from 'elements/kpi-editor'
    import addNewKpiModal from 'elements/modals/add-new-kpi'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'

    const template = `
        <article class="manage-dashboards manage-kpis">

            <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/dashboards"><a>{{ui.dictionary.overview.dashboardsAdmin}}</a></router-link>
                   <li class="active"><a>{{ui.dictionary.overview.kpisAdmin}}</a></li>
               </ul>
            </nav>

            <div v-show="ui.loading" class="dashboard-list"><div class="working"></div></div>

            <section v-show="!ui.loading" class="dashboard-list">
               <div class="toolbar">
                   <div class="add" v-show="permissions.owner || permissions.permissionType == 'full' || permissions.kpiDefinitionAccess"><a href="#" v-on:click.prevent="showAddNewKpiModal();"><i class="cwi-add"></i> {{ui.dictionary.customKpis.add}}</a></div>
               </div>
               <div class="dashboard clickable"
                    v-for="kpi in kpis" v-on:click="openKpi(kpi.id)">
                    <div class="edit" v-show="kpi.id != currentKpi">{{ui.dictionary.customKpis.edit}}</div>
                    <div class="edit" v-on:click.stop="closeKpis()" v-show="kpi.id == currentKpi"><i class="cwi-close"></i></div>
                    <span v-show="kpi.id != currentKpi">{{kpi.name}}</span>
                    <div v-if="kpi.id == currentKpi">
                       <kpi-editor :kpi="kpi" :callback="closeKpis"></kpi-editor>
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
        kpis : [],
        currentKpi : null,
        fields : {
            name : { value : '', valid : true, error : false }
        },
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo()
    });


    const methods = {
        init() {
            this.getKpiList();

            /**
             * Event listeners
             */
            EventBus.$on('companyUserChanged', this.getKpiList);
        },

        getKpiList() {
            if (!CompanyModel.getCompany() || !UserModel.getCompanyUserInfo().id) {
                return false;
            }

            var scope = this;
            scope.ui.loading = true;
            scope.closeKpis();
            scope.$modal.hide(addNewKpiModal);

            var kpis = new KpiCollection();
            kpis.getKpis(true)
                .then(function(list) {
                    scope.kpis = list.contents;
                    scope.ui.loading = false;
                });
        },

        openKpi(id) {
            this.currentKpi = id;
        },

        closeKpis(reload) {
            this.currentKpi = null;

            if (reload) {
                this.getKpiList();
            }
        },

        showAddNewKpiModal() {
            this.$modal.show(addNewKpiModal, {
                addKpi: this.addKpi
            },{height: 'auto', adaptive: true, width: '70%', pivotY: 0.2, classes: 'add-new-kpi'});
        },

        addKpi(kpi) {
            this.kpis.push(kpi);
            EventBus.$emit('closeKPI', kpi);
        },
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'kpi-editor' : kpiEditor
        },
        created() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('companyUserChanged');
        }
    });
