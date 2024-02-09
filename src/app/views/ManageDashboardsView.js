    import Vue from 'Vue'
    import DashboardCollection from 'collections/DashboardCollection'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import ContextModel from 'models/ContextModel'
    import DashboardModel from 'models/DashboardModel'
    import AssetModel from 'models/AssetModel'
    import dashboardEditor from 'elements/dashboard-editor'
    import addNewDashboard from 'elements/modals/add-new-dashboard'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'

    const template = `
        <article class="manage-dashboards connections">

            <nav class="tabs">
               <ul>
                   <li class="active"><a>{{ui.dictionary.overview.dashboardsAdmin}}</a></li>
                   <router-link tag="li" to="/account/kpis" v-show="permissions.owner || permissions.permissionType == 'full' || permissions.kpiDefinitionAccess"><a>{{ui.dictionary.overview.kpisAdmin}}</a></router-link>
               </ul>
            </nav>

            <div v-show="ui.loading" class="dashboard-list"><div class="working"></div></div>

            <section v-show="!ui.loading" class="dashboard-list">
               <div class="toolbar">
                   <div class="add" v-show="permissions.owner || permissions.permissionType == 'full'"><a href="#" v-on:click.prevent="openNewModal()"><i class="cwi-add"></i> {{ui.dictionary.dashboards.add}}</a></div>
               </div>


<!--                /**-->
<!--                 * List of connection/context dashboards-->
<!--                 */-->
               <div v-if="context">
                   <div class="dashboard-heading">{{context.company.name}} {{ui.dictionary.dashboards.dashboards}}</div>
                   <div class="dashboard clickable" v-on:click.stop="openDashboard(dashboard.id)"
                        v-for="dashboard in filterContextDashboards(dashboards)">

                        <div class="edit" :class="{ active : inActiveList(dashboard.id, true) }" v-on:click.stop="toggleActive(dashboard.id, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <div class="edit" v-on:click.stop="openDashboard(dashboard.id)" v-show="dashboard.id != currentDashboard && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' || permissions.kpiDefinitionAccess)">{{ui.dictionary.dashboards.edit}}</div>
                        <div class="edit" v-on:click.stop="closeDashboards()" v-show="dashboard.id == currentDashboard">{{ui.dictionary.dashboards.close}}</div>

                        <span v-show="dashboard.id != currentDashboard"><span class="tooltip" v-on:click.stop="toggleDefaultDashboard(dashboard.id, true)"><i class="cwi-star-off" v-show="!isDefaultDash(dashboard.id)"></i><i class="cwi-star-on active" v-show="isDefaultDash(dashboard.id)"></i> <div class="message right" v-show="!isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{dashboard.name}}</span>
                        <div v-if="dashboard.id == currentDashboard">
                            <dashboard-editor :dashboard="dashboard" :callback="getDashboardList"></dashboard-editor>
                        </div>

                   </div>
               </div>


<!--                /**-->
<!--                 * List of owned dashboards-->
<!--                 */-->
               <div>
                   <div class="dashboard-heading">{{company.name}} {{ui.dictionary.dashboards.dashboards}}</div>
                   <div class="dashboard clickable" v-on:click.stop="openDashboard(dashboard.id)"
                        v-for="dashboard in filterOwnedDashboards(dashboards)">

                        <div class="edit" :class="{ active : inActiveList(dashboard.id) }" v-on:click.stop="toggleActive(dashboard.id)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <div class="edit" v-on:click.stop="openDashboard(dashboard.id)" v-show="dashboard.id != currentDashboard && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' || permissions.kpiDefinitionAccess)">{{ui.dictionary.dashboards.edit}}</div>
                        <div class="edit" v-on:click.stop="closeDashboards()" v-show="dashboard.id == currentDashboard">{{ui.dictionary.dashboards.close}}</div>
                        <div class="edit" :class="{ active : inSharedDashboards(dashboard.id) }" v-show="context" v-on:click.stop="toggleShareDashboard(dashboard)"><div class="working inline" v-show="dashboard.working"></div><span v-show="!dashboard.working">{{ui.dictionary.dashboards.share}}</span></div>

                        <span v-show="dashboard.id != currentDashboard"><span class="tooltip" v-on:click.stop="toggleDefaultDashboard(dashboard.id)"><i class="cwi-star-off" v-show="!isDefaultDash(dashboard.id)"></i><i class="cwi-star-on active" v-show="isDefaultDash(dashboard.id)"></i> <div class="message right" v-show="!isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{dashboard.name}}</span>
                        <div v-if="dashboard.id == currentDashboard">
                            <dashboard-editor :dashboard="dashboard" :callback="getDashboardList" :ignoreContext="true"></dashboard-editor>
                        </div>

                   </div>
               </div>


<!--                /**-->
<!--                 * List of standard dashboards-->
<!--                 */-->
               <div>
                   <div class="dashboard-heading">{{ui.dictionary.dashboards.standard}}</div>
                   <div class="dashboard clickable" v-on:click.stop="openGeneralOverview()">
                        <div class="edit" :class="{ active : inActiveList('_general') }" v-on:click.stop="toggleActive('_general', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <div class="edit" v-on:click.stop="openGeneralOverview()" v-show="!ui.showGeneralOverviewSettings && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' || permissions.kpiDefinitionAccess)">{{ui.dictionary.dashboards.edit}}</div>
                        <div class="edit" v-on:click.stop="closeGeneralOverview()" v-show="ui.showGeneralOverviewSettings">{{ui.dictionary.dashboards.close}}</div>
                        <span><span class="tooltip" v-on:click.stop="toggleDefaultDashboard('_general')"><i class="cwi-star-off" v-show="!isDefaultDash('_general')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_general')"></i> <div class="message right" v-show="!isDefaultDash('_general')">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash('_general')">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{ui.dictionary.dashboards.overview}}</span>

                       <div v-show="ui.showGeneralOverviewSettings">
                           <article class="dashboard-editor">
                               <section class="dnd-kpis">
                                   <div class="available">
                                       <h4 class="clickable" v-show="showToAssetRatio == 'debtToAssetRatio'" v-on:click="switchShowRatio('equityToAssetRatio')">
                                           {{ui.dictionary.kpis.debtToAssetRatio}}
                                           <img :src="getImage('/assets/img/elements/switch-left.png')" class="switch">
                                           {{ui.dictionary.kpis.EquityToAssetRatio}}
                                       </h4>
                                       <h4 class="clickable" v-show="showToAssetRatio == 'equityToAssetRatio'" v-on:click="switchShowRatio('debtToAssetRatio')">
                                           {{ui.dictionary.kpis.debtToAssetRatio}}
                                           <img :src="getImage('/assets/img/elements/switch-right.png')" class="switch">
                                           {{ui.dictionary.kpis.EquityToAssetRatio}}
                                       </h4>
                                   </div>
                               </section>
                           </article>
                       </div>
                   </div>

                   <div class="dashboard">
                        <div class="edit" :class="{ active : inActiveList('_palbal') }" v-on:click="toggleActive('_palbal', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <span><span class="tooltip" v-on:click="toggleDefaultDashboard('_palbal')"><i class="cwi-star-off" v-show="!isDefaultDash('_palbal')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_palbal')"></i> <div class="message right" v-show="!isDefaultDash('_palbal')">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash('_palbal')">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{ui.dictionary.dashboards.balanceSheet}}</span>
                   </div>

                   <div class="dashboard" v-show="profile && profile.roles">
                        <div class="edit" :class="{ active : inActiveList('_budget') || isDefaultBudget }" v-on:click="toggleActive('_budget', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <span><span class="tooltip" v-on:click="toggleDefaultDashboard('_budget')"><i class="cwi-star-off" v-show="!isDefaultDash('_budget')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_budget')"></i> <div class="message right" v-show="!isDefaultDash('_budget')">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash('_budget')">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{ui.dictionary.overview.budget}}</span>
                   </div>

                   <div class="dashboard">
                        <div class="edit" :class="{ active : inActiveList('_invoices') }" v-on:click="toggleActive('_invoices', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <span><span class="tooltip" v-on:click="toggleDefaultDashboard('_invoices')"><i class="cwi-star-off" v-show="!isDefaultDash('_invoices')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_invoices')"></i> <div class="message right" v-show="!isDefaultDash('_invoices')">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash('_invoices')">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{ui.dictionary.invoices.title}}</span>
                   </div>

                   <div class="dashboard">
                        <div class="edit" :class="{ active : inActiveList('_annual_report') }" v-on:click="toggleActive('_annual_report', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <span><span class="tooltip" v-on:click="toggleDefaultDashboard('_annual_report')"><i class="cwi-star-off" v-show="!isDefaultDash('_annual_report')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_annual_report')"></i> <div class="message right" v-show="!isDefaultDash('_annual_report')">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash('_annual_report')">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{ui.dictionary.annualReport.title}}</span>
                   </div>

                   <div class="dashboard">
                        <div class="edit" :class="{ active : inActiveList('_calpalbal') || isDefaultFinancialReport }" v-on:click="toggleActive('_calpalbal', false, true)">&#9679; {{ui.dictionary.dashboards.active}}</div>
                        <span><span class="tooltip" v-on:click="toggleDefaultDashboard('_calpalbal')"><i class="cwi-star-off" v-show="!isDefaultDash('_calpalbal')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_calpalbal')"></i> <div class="message right" v-show="!isDefaultDash('_calpalbal')">{{ui.dictionary.financialReport.title}}</div><div class="message right" v-show="isDefaultDash('_calpalbal')">{{ui.dictionary.financialReport.title}}</div></span> {{ui.dictionary.financialReport.title}}</span>
                   </div>
               </div>


<!--                /**-->
<!--                 * List of inverse-shared dashboards-->
<!--                 */-->

               <div v-if="!context">
                   <div class="dashboard-heading">{{ui.dictionary.dashboards.shared}}</div>
                   <div class="dashboard"
                        v-for="dashboard in filterSharedDashboards(dashboards)">
                        <div class="edit" :class="{ active : inActiveList(dashboard.id) }" v-on:click="toggleActive(dashboard.id)">&#9679; {{ui.dictionary.dashboards.active}}</div>

                        <span v-show="dashboard.id != currentDashboard"><span class="tooltip" v-on:click="toggleDefaultDashboard(dashboard.id)"><i class="cwi-star-off" v-show="!isDefaultDash(dashboard.id)"></i><i class="cwi-star-on active" v-show="isDefaultDash(dashboard.id)"></i> <div class="message right" v-show="!isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.addDefault}}</div><div class="message right" v-show="isDefaultDash(dashboard.id)">{{ui.dictionary.dashboards.removeDefault}}</div></span> {{dashboard.name}} <span class="faded">&rarr; {{dashboard.company.name}}</span></span>
                   </div>
               </div>

            </section>

        </article>
    `;

    /**
     * Data bindings
     */
    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            saving : false,
            showGeneralOverviewSettings : false,
            showToggleActiveConfirm : false
        },
        dashboards : [],
        currentDashboard : null,
        fields : {
            name : { value : '', valid : true, error : false }
        },
        company : CompanyModel.getCompany(),
        context : ContextModel.getContext(),
        userInfo : UserModel.getCompanyUserInfo(),
        sharedDashboards : [],
        addDashboardFor : 'company',
        refreshCount : 0,
        profile : UserModel.profile(),
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        showToAssetRatio : 'debtToAssetRatio',
        currentToggleActive : null
    });

    const methods = {
        init() {
            this.getDashboardList();

            /**
             * Event listeners
             */
            EventBus.$on('companyUserChanged', this.getDashboardList);

            if (this.$route.query.add) {
                this.$modal.show(addNewDashboard, {
                    onDashboardAdded: (addedDashboard) => {
                        this.dashboards.push(addedDashboard);
                        this.getDashboardList();
                    },
                }, {height: 'auto'});

            } else if (this.$route.query.open) {
                this.openDashboard(this.$route.query.open);
            }
        },

        switchShowRatio(ratio) {
            this.showToAssetRatio = ratio;
            this.userInfo.settings.showToAssetRatio = ratio;
            this.saveUserInfo();
        },

        openGeneralOverview() {
            this.closeDashboards();
            this.ui.showGeneralOverviewSettings = true;
        },

        closeGeneralOverview() {
            this.ui.showGeneralOverviewSettings = false;
        },

        setShowEquityToAssetRatio() {
            if (this.userInfo && this.userInfo.settings && this.userInfo.settings.showToAssetRatio) {
                this.showToAssetRatio = this.userInfo.settings.showToAssetRatio;
            } else if (this.ui.dictionary && this.ui.dictionary.meta.code == 'da-DK') {
                this.showToAssetRatio = 'equityToAssetRatio';
            } else {
                this.showToAssetRatio = 'debtToAssetRatio';
            }
        },

        openNewModal() {
            this.$modal.show(addNewDashboard, {
                onDashboardAdded: (addedDashboard) => {
                    this.dashboards.push(addedDashboard);
                    this.getDashboardList();
                },
            }, {height: 'auto'});
        },

        isDefaultDash(id) {
            if (!this.userInfo.settings.defaultDashboard && !this.company.settings.default_dashboard) {
                return false;
            }

            if (this.userInfo.settings.defaultDashboard != id) {
                return this.company.settings.default_dashboard == id;
            }

            return  this.userInfo.settings.defaultDashboard == id; //Not necessry on first glance; strange behavior in IE11, explicit condition seems to fix it
        },

        toggleDefaultDashboard(id, useContext) {
            if (this.userInfo.settings.defaultDashboard && this.userInfo.settings.defaultDashboard == id) {
                this.userInfo.settings.defaultDashboard = null;
                this.saveUserInfo();
            } else {
                this.userInfo.settings.defaultDashboard = id;

                if (!this.inActiveList(id, useContext)) {
                    this.toggleActive(id, useContext);
                } else {
                    this.saveUserInfo();
                }
            }

            this.refreshCount++;
        },

        toggleShareDashboard(dashboard) {
            var scope = this;
            var dm = new DashboardModel(dashboard.id);
            var index = this.inSharedDashboards(dashboard.id, true);
            Vue.set(dashboard, 'working', true);

            if (index !== false && index >= 0) {
                dm.unshare(this.sharedDashboards[index].id)
                    .then(function(res) {
                        scope.sharedDashboards.splice(index, 1);
                        Vue.set(dashboard, 'working', false);
                    });

                return;
            }

            dm.share()
                .then(function(res) {
                    scope.sharedDashboards.push(res);
                    Vue.set(dashboard, 'working', false);
                });
        },


        inSharedDashboards(id, getIndex) {
            var found = false;

            this.sharedDashboards.forEach(function(permission, idx) {
                if (permission.dashboard == id) {
                    if (getIndex) {
                        found = idx;
                    } else {
                        found = true;
                    }
                }
            });

            return found;
        },


        inActiveList(id, useContext) {
            if (useContext
                && this.userInfo.settings.activeDashboards
                && this.userInfo.settings.activeDashboards[this.context.company.id]
                && this.userInfo.settings.activeDashboards[this.context.company.id].indexOf(id) >= 0) {


                return true;

            } else if (!useContext
                       && this.userInfo.settings.activeDashboards
                       && this.userInfo.settings.activeDashboards.company
                       && this.userInfo.settings.activeDashboards.company.indexOf(id) >= 0) {

                return true;
            } else if (
                !useContext
                && this.company.settings
                && this.company.settings.disabled_dashboards
                && this.company.settings.disabled_dashboards.indexOf(id) >= 0) {

                return false;
            } else {

                return false;

            }
        },

        toggleActive(id, useContext, checkFirst) {
            if (checkFirst && this.inActiveList(id)) {
                this.currentToggleActive = id;

                this.$modal.show('dialog', {
                    text: this.ui.dictionary.dashboards.disableConfirm,
                    width: 600,
                    buttons: [
                        {
                            title: this.ui.dictionary.dashboards.keepActive,
                            class: 'highlighted-text',
                        },
                        {
                            title: this.ui.dictionary.dashboards.disable,
                            class: 'warning',
                            default: true,
                            handler: () => { this.toggleActive(this.currentToggleActive); this.$modal.hide('dialog')}
                        }
                    ]
                });

                return false;
            }

            this.ui.showToggleActiveConfirm = false;

            if (this.inActiveList(id, useContext)) {
                this.removeActiveDashboard(id, useContext);
                if (id === '_calpalbal') {
                    this.$store.dispatch('setFinReportActiveTab', false);
                    this.$store.dispatch('setActiveFinReport', this.userInfo.company);
                }
                if (id === '_budget') {
                    this.$store.dispatch('setBudgetActiveTab', false);
                    this.$store.dispatch('setActiveBudget', true);
                }
                if (this.isDefaultDash(id)) {
                    this.toggleDefaultDashboard(id);
                }

            } else {
                this.addActiveDashboard(id, useContext);
                if (id === '_calpalbal') {
                    this.$store.dispatch('setFinReportActiveTab', true);
                    this.$store.dispatch('setActiveFinReport', false);
                } else if (id === '_budget') {
                    this.$store.dispatch('setBudgetActiveTab', true);
                    this.$store.dispatch('setActiveBudget', false);
                } else {
                    this.$store.dispatch('setFinReportActiveTab', false);
                    this.$store.dispatch('setBudgetActiveTab', false);
                }
            }

            this.saveUserInfo();
            Vue.set(this, 'refreshCount', this.refreshCount + 1);
        },


        removeActiveDashboard(id, useContext) {
            if (useContext) {
                var index = this.userInfo.settings.activeDashboards[this.context.company.id].indexOf(id);
                this.userInfo.settings.activeDashboards[this.context.company.id].splice(index, 1);
            } else {
                var index = this.userInfo.settings.activeDashboards.company.indexOf(id);
                this.userInfo.settings.activeDashboards.company.splice(index, 1);
            }
        },


        addActiveDashboard(id, useContext) {
            if (!this.userInfo.settings.activeDashboards
                || Array.isArray(this.userInfo.settings.activeDashboards)
                || !this.userInfo.settings.activeDashboards.company
                ) {

                this.userInfo.settings.activeDashboards = {
                    company : []
                };
            }


            if (useContext
                && this.context
                && !this.userInfo.settings.activeDashboards[this.context.company.id]
                ) {

                 this.userInfo.settings.activeDashboards[this.context.company.id] = [];
            }



            if (useContext) {
                Vue.set(this.userInfo.settings.activeDashboards[this.context.company.id], this.userInfo.settings.activeDashboards[this.context.company.id].length, id);
            } else {
                Vue.set(this.userInfo.settings.activeDashboards.company, this.userInfo.settings.activeDashboards.company.length, id);
            }
        },


        saveUserInfo() {
            var scope = this;
            UserModel.setCompanyUserInfo(this.userInfo);
            UserModel.saveCompanyUserInfo()
                .then(function(res) {
                    scope.userInfo = res;
                });
        },

        filterSharedDashboards(list) {
            var scope = this;

            return list.filter(function(dash) {
                return dash.company.id != scope.company.id;
            });
        },

        filterOwnedDashboards(list) {
            var scope = this;

            return list.filter(function(dash) {
                return dash.company.id == scope.company.id;
            });
        },


        filterContextDashboards(list) {
            var scope = this;

            return list.filter(function(dash) {
                return dash.company.id == scope.context.company.id;
            });
        },

        checkUserInfo() {
            if (!this.userInfo.settings) {
                return false;
            }

            if (!this.userInfo.settings.activeDashboards
                || Array.isArray(this.userInfo.settings.activeDashboards)
                || !this.userInfo.settings.activeDashboards.company
                ) {

                var scope = this;

                //this.userInfo.settings.activeDashboards = ['_general', '_palbal'];
                this.addActiveDashboard('_general');
                this.addActiveDashboard('_palbal');
                this.addActiveDashboard('_invoices');
                this.addActiveDashboard('_annual_report');
                this.addActiveDashboard('_calpalbal');
                this.addActiveDashboard('_budget');

                this.dashboards.forEach(function(dashboard) {
                    scope.addActiveDashboard(dashboard.id, (scope.context && dashboard.company.id == scope.context.company.id));
                });


                this.saveUserInfo();
            }
        },

        getDashboardList() {
            if (!CompanyModel.getCompany() || !UserModel.getCompanyUserInfo().id) {
                return false;
            }

            this.company = CompanyModel.getCompany();
            this.context = ContextModel.getContext();
            this.userInfo = UserModel.getCompanyUserInfo();
            this.setShowEquityToAssetRatio();

            var scope = this;
            scope.ui.loading = true;

            var dashboards = new DashboardCollection(true);
            dashboards.getDashboards(true)
                .then(function(list) {
                    scope.dashboards = list.contents;

                    if (ContextModel.getContext()) {
                        scope.getDashboardPermissions();
                        scope.checkUserInfo();
                        scope.ui.loading = false;
                    } else {
                        scope.checkUserInfo();
                        scope.ui.loading = false;
                    }

                    if (scope.$route.query.open) {
                        scope.openDashboard(scope.$route.query.open);
                    }

                    scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
                });
        },


        getDashboardPermissions() {
            var scope = this;
            var dashboards = new DashboardCollection();

            dashboards.getDashboardPermissions()
                .then(function(res) {
                    if (res.contents) {
                        scope.sharedDashboards = res.contents;
                    }
                });
        },


        openDashboard(id) {
            this.currentDashboard = id;
            this.ui.showGeneralOverviewSettings = false;
        },

        closeDashboards() {
            this.currentDashboard = null;
            this.ui.showGeneralOverviewSettings = false;
        },


        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        addDashboard() {
            if ( !this.validateName(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.saving = true;
            scope.fields.name.error = false;

            var dm = new DashboardModel();
            dm.create({ name : scope.fields.name.value }, (this.context && this.addDashboardFor == 'company'))
                .then(function(res) {
                    if (res.id) {
                        scope.dashboards.push(res);
                        scope.fields.name.value = '';
                        scope.getDashboardList();
                    } else {
                        scope.fields.name.error = true;
                    }

                    scope.ui.saving = false;
                });
        },

        getImage(img) {
            return new AssetModel(img).path;
        }
    };

    const watch = {
      'ui.showToggleActiveConfirm': (val) => {
        if (val) {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.dashboards.disableConfirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.dashboards.keepActive,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.dashboards.disable,
                        class: 'warning',
                        default: true,
                        handler: () => { this.toggleActive(this.currentToggleActive)}
                    }
                ]
            });
        }
      }
    };

    const computed = {
        isActiveFinReport() {
            return this.$store.getters.isActiveDefaultFinReport;
        },

        isActiveBudget() {
            return this.$store.getters.isActiveDefaultBudget;
        },

        isDefaultFinancialReport() {
            if (!this.inActiveList('_calpalbal') && !this.isActiveFinReport && !this.isSetFinancialReport) {
                return true
            } else return !!(!this.inActiveList('_calpalbal') && this.isSetFinancialReport);
        },

        isDefaultBudget() {
            if (!this.inActiveList('_budget') && !this.isActiveBudget && !this.isSetBudget) {
                return true
            } else return !!(!this.inActiveList('_budget') && this.isSetBudget);
        },

        isSetFinancialReport() {
            return this.$store.getters.setFinancialReport;
        },

        isSetBudget() {
            return this.$store.getters.setBudgetTab;
        }

    }

    export default Vue.extend({
        name : 'ManageDashboardsView',
        template,
        computed,
        data,
        methods,
        watch,
        components : {
            'dashboard-editor' : dashboardEditor
        },
        mounted() {
            this.init();
        }
    });
