    import Vue from 'Vue'
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import ErpModel from 'models/ErpModel'
    import SeeConnectionModel from 'models/SeeConnectionModel'
    import ContextModel from 'models/ContextModel'
    import ConnectionCollection from 'collections/ConnectionCollection'
    import datePicker from 'elements/date-picker'
    import warningSettings from 'components/warningSettings.vue'
    import switchWithLabels from 'elements/switch-with-labels'
    import EventBus from 'services/EventBus'
    import AssetModel from 'models/AssetModel'
    import showWarning from 'elements/modals/show-warning'

    const template = `
    <article class="summary manage-dashboards" v-on:click="ui.intervalOptions = false">

       <div class="working" v-show="ui.loading"></div>
       <nav class="tabs" v-show="!ui.loading">
           <ul>
               <li v-on:click="ui.showPortfolio = false" class="clickable" :class="{ active : !ui.showPortfolio }"><a>{{ui.dictionary.summary.all}}</a></li>
               <li v-on:click="ui.showPortfolio = true" class="clickable" :class="{ active : ui.showPortfolio }"><a>{{ui.dictionary.summary.portfolio}}</a></li>
           </ul>
       </nav>
       <div class="tab-content" v-show="!ui.loading">
    
           <div class="right-text faded" v-show="connections.length > 0 && !ui.showPortfolio">{{ui.dictionary.connections.totalConnections}}: {{connections.length}}</div>
           <div class="right-text faded" v-show="portfolio.length > 0 && ui.showPortfolio">{{ui.dictionary.connections.totalConnections}}: {{portfolio.length}}</div>
    
           <div class="graph-bar">
               <div class="float-right">
                   <div class="early-warning-button" v-on:click="createEarlyWarning()"><i class="cwi-warning"></i> {{ui.dictionary.warnings.add}}</div>
               </div>
               {{ui.dictionary.overview.interval}}:
               <div class="selector inline">
                   <div class="label" v-on:click.stop="ui.intervalOptions = true">
                       <span class="primary-color">{{ui.dictionary.overview[interval]}}</span> <i class="cwi-down primary-color"></i>
                       <div class="options" v-bind:class="{ show : ui.intervalOptions }">
                           <div class="option" v-for="int in intervals" v-bind:class="{ selected : interval == int }" v-on:click.stop="setInterval(int)">
                               <span>{{ui.dictionary.overview[int]}}</span>
                           </div>
                       </div>
                   </div>
               </div>
    
              <span style="display: inline-block; margin-left: 3rem;"></span>
              <switch-with-labels v-model="ui.reclassified" :firstValue="true" :secondValue="false" @input="getConnections" style="margin: 19px 1rem 0 0;" v-show="hasReclassRole()">
                   <span slot="label-left" :class="[ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.reclassified}}</span>
                   <span slot="label-right" :class="[!ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.notReclassified}}</span>
              </switch-with-labels>

           </div>
    
           <div class="table-container">
           <table>
               <thead class="tabular-heading">
                   <tr>
                       <td v-on:click="changeSort('name')">{{ui.dictionary.summary.company}} <span v-show="sort.param == 'name' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'name' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('profitMargin')">{{ui.dictionary.summary.profitMargin}} <span v-show="sort.param == 'profitMargin' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'profitMargin' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('currentRatio')">{{ui.dictionary.summary.currentRatio}} <span v-show="sort.param == 'currentRatio' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'currentRatio' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('assetTurnover')">{{ui.dictionary.summary.assetTurnover}} <span v-show="sort.param == 'assetTurnover' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'assetTurnover' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('debtToAssetRatio')">{{ui.dictionary.summary.debtToAssetRatio}} <span v-show="sort.param == 'debtToAssetRatio' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'debtToAssetRatio' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('lastPost')">{{ui.dictionary.summary.lastPost}} <span v-show="sort.param == 'lastPost' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'lastPost' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                       <td v-on:click="changeSort('hasWarnings')" class="right-text"><i class="cwi-warning"></i> <span v-show="sort.param == 'hasWarnings' && sort.direction == 'asc'"><i class="cwi-down"></i></span><span v-show="sort.param == 'hasWarnings' && sort.direction == 'desc'"><i class="cwi-up"></i></span></td>
                   </tr>
              </thead>
               <tbody>
                   <tr v-for="connection in sortConnections(connections)" v-show="portfolioFilter(connection)">
                       <td><span class="tooltip"><i class="cwi-graph clickable" v-on:click="openOverview(connection)"></i><div class="message right">{{ui.dictionary.connections.open}}</div></span>&nbsp;&nbsp;<span v-show="connection.company.name" v-on:click="openOverview(connection)" class="clickable">{{connection.company.name}}</span><span v-show="!connection.company.name" v-on:click="openOverview(connection)" class="clickable">{{connection.company.vat}}</span></td>
                       <td>
                           <div class="current"><span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.self">{{formatNumber(connection.kpi.current.self.profitMargin, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.self">--</span></div>
                           <div class="bench">
                               <div>{{ui.dictionary.summary.previous}}: <span v-if="connection.kpi && connection.kpi.previous && connection.kpi.previous.self">{{formatNumber(connection.kpi.previous.self.profitMargin, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.previous || !connection.kpi.previous.self">--</span></div>
                               <div>{{ui.dictionary.summary.industry}}: <span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.benchmark">{{formatNumber(connection.kpi.current.benchmark.profitMargin, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.benchmark">--</span></div>
                           </div>
                       </td>
                       <td>
                           <div class="current"><span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.self">{{formatNumber(connection.kpi.current.self.currentRatio, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.self">--</span></div>
                           <div class="bench">
                               <div>{{ui.dictionary.summary.previous}}: <span v-if="connection.kpi && connection.kpi.previous && connection.kpi.previous.self">{{formatNumber(connection.kpi.previous.self.currentRatio, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.previous || !connection.kpi.previous.self">--</span></div>
                               <div>{{ui.dictionary.summary.industry}}: <span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.benchmark">{{formatNumber(connection.kpi.current.benchmark.currentRatio, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.benchmark">--</span></div>
                           </div>
                       </td>
                       <td>
                           <div class="current"><span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.self">{{formatNumber(connection.kpi.current.self.assetTurnover, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.self">--</span></div>
                           <div class="bench">
                               <div>{{ui.dictionary.summary.previous}}: <span v-if="connection.kpi && connection.kpi.previous && connection.kpi.previous.self">{{formatNumber(connection.kpi.previous.self.assetTurnover, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.previous || !connection.kpi.previous.self">--</span></div>
                               <div>{{ui.dictionary.summary.industry}}: <span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.benchmark">{{formatNumber(connection.kpi.current.benchmark.assetTurnover, 'x')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.benchmark">--</span></div>
                           </div>
                       </td>
                       <td>
                           <div class="current"><span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.self">{{formatNumber(connection.kpi.current.self.debtToAssetRatio, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.self">--</span></div>
                           <div class="bench">
                               <div>{{ui.dictionary.summary.previous}}: <span v-if="connection.kpi && connection.kpi.previous && connection.kpi.previous.self">{{formatNumber(connection.kpi.previous.self.debtToAssetRatio, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.previous || !connection.kpi.previous.self">--</span></div>
                               <div>{{ui.dictionary.summary.industry}}: <span v-if="connection.kpi && connection.kpi.current && connection.kpi.current.benchmark">{{formatNumber(connection.kpi.current.benchmark.debtToAssetRatio, '%')}}</span><span v-show="!connection.kpi || !connection.kpi.current || !connection.kpi.current.benchmark">--</span></div>
                           </div>
                       </td>
                       <td>
                           <span v-if="connection.kpi && connection.kpi.lastPost">{{formatDate(connection.kpi.lastPost)}}</span><span v-show="!connection.kpi || !connection.kpi.lastPost">--</span>
                       </td>
                       <td>
                           <span class="tooltip" v-show="!inPortfolio(connection)"><i class="cwi-book-full clickable faded" v-on:click="addPortfolio(connection)"></i><div class="message left right-arrow-tooltip">{{ui.dictionary.connections.addPortfolio}}</div></span>
                           <span class="tooltip" v-show="inPortfolio(connection)"><i class="cwi-book-full clickable" v-on:click="removePortfolio(connection)"></i><div class="message left right-arrow-tooltip">{{ui.dictionary.connections.removePortfolio}}</div></span>
                           <span class="tooltip" v-show="connection.warnings.length === 0"><i class="cwi-warning clickable faded" v-on:click="showWarnings(connection.warnings, connection.id)"></i> <div class="message left right-arrow-tooltip">{{ui.dictionary.connections.warnings}}</div></span>
                           <span class="tooltip" v-show="connection.warnings.length > 0"><i class="cwi-warning clickable warn" v-on:click="showWarnings(connection.warnings, connection.id)"></i> <div class="message left right-arrow-tooltip">{{ui.dictionary.connections.warnings}}</div></span>
                       </td>
                   </tr>
               </tbody>
           </table>
           </div>
    
       </div>
    </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            showPortfolio : false,
            loading : true,
            intervalOptions : false,
            reclassified : true
        },
        connections : [],
        portfolio : [],
        sort : {
            param : 'name',
            direction : 'asc'
        },
        currentWarnings : false,
        currentConnection : false,
        intervals : ['quarterly', 'semiannual', 'annual'],
        interval : 'annual',
        profile : UserModel.profile()
    });


    const methods = {
        init() {
            /**
             * Get portfolio
             */
            if (UserModel.getCompanyUserInfo().settings && UserModel.getCompanyUserInfo().settings.portfolio) {
                this.portfolio = UserModel.getCompanyUserInfo().settings.portfolio;
            }

            /**
             * Event listeners
             */
            EventBus.$on('companyUserChanged', this.getConnections);


            this.ui.reclassified = !!(this.erp && this.erp.reclassifiedData && this.hasReclassRole());

            this.getConnections();
        },

        hasReclassRole() {
            return true;
        },

        getImage(img) {
            return new AssetModel(img).path;
        },

        setInterval(interval) {
            this.interval = interval;
            this.ui.intervalOptions = false;
            this.getConnections();
        },

        formatDate(date) {
            return moment(date).format(this.ui.dictionary.locale.displayFormat);
        },


        createEarlyWarning() {
            this.$router.push('/account/warnings?new=1');
        },

        showWarnings(warnings, connection) {
            this.currentWarnings = warnings;
            this.currentConnection = connection;
            this.showWarningModal();
        },

        changeSort(param) {
            if (this.sort.direction === 'asc' && this.sort.param === param) {
                this.sort.direction = 'desc';
            } else {
                this.sort.direction = 'asc';
            }

            this.sort.param = param;
        },

        sortConnections(connections) {
            var scope = this;
            var list = connections.slice();

            //Sort by name
            if (this.sort.param === 'name') {
                if (this.sort.direction === 'desc') {
                    return this.sortByName(list).reverse();
                }

                return this.sortByName(list);
            } else if (this.sort.param === 'lastPost') {
                if (this.sort.direction === 'desc') {
                    return this.sortByLastPost(list).reverse();
                }

                return this.sortByLastPost(list);
            } else if (this.sort.param === 'hasWarnings') {
                if (this.sort.direction === 'desc') {
                    return this.sortByHasWarnings(list).reverse();
                }

                return this.sortByHasWarnings(list);
            } else {
                var sortedList = this.sortByKpi(list, this.sort.param);
                var noValueList = [];

                for(var i = sortedList.length - 1; i >= 0; i--) {
                    if (!sortedList[i].kpi || !sortedList[i].kpi.current || !sortedList[i].kpi.current.self || sortedList[i].kpi.current.self[this.sort.param] === undefined || sortedList[i].kpi.current.self[this.sort.param] === null) {
                        noValueList.push(sortedList[i]);
                        sortedList.splice(i, 1);
                    }
                }

                if (this.sort.direction === 'desc') {
                    sortedList = sortedList.reverse();
                }

                return sortedList.concat(noValueList);
            }
        },

        sortByHasWarnings(list) {
            return list.sort(function(a, b) {
                return b.warnings.length - a.warnings.length;
            });
        },

        sortByName(list) {
            return list.sort(function(a, b) {
                if (a.company.name === null) {
                    if (b.company.name == null) {
                        return 0;
                    }

                    return 1;
                }

                if (b.company.name === null) {
                    if (a.company.name == null) {
                        return 0;
                    }

                    return -1;
                }

                return a.company.name.toLocaleLowerCase()>b.company.name.toLocaleLowerCase()? 1 : (a.company.name.toLocaleLowerCase()<b.company.name.toLocaleLowerCase() ? -1 : 0);
            });
        },


        sortByLastPost(list) {
            return list.sort(function(a, b) {
                if (a.kpi === null || a.kpi.lastPost === null) {
                    if (b.kpi == null || b.kpi.lastPost === null) {
                        return 0;
                    }

                    return 1;
                }


                if (b.kpi === null || b.kpi.lastPost === null) {
                    if (a.kpi == null || a.kpi.lastPost === null) {
                        return 0;
                    }

                    return -1;
                }

                return a.kpi.lastPost - b.kpi.lastPost;
            });
        },


        sortByKpi(list, kpi) {
            return list.sort(function(a, b) {
                if (!a.kpi || !a.kpi.current || !a.kpi.current.self || a.kpi.current.self[kpi] === null ||  a.kpi.current.self[kpi] === undefined) {
                    if (!b.kpi || !b.kpi.current || !b.kpi.current.self ||  b.kpi.current.self[kpi] === null ||  b.kpi.current.self[kpi] === undefined) {
                        return 0;
                    }

                    return 1;
                }


                if (!b.kpi || !b.kpi.current || !b.kpi.current.self ||  b.kpi.current.self[kpi] === null ||  b.kpi.current.self[kpi] === undefined) {
                    if (!a.kpi || !a.kpi.current || !a.kpi.current.self ||  a.kpi.current.self[kpi] === null ||  a.kpi.current.self[kpi] === undefined) {
                        return 0;
                    }

                    return -1;
                }


                return a.kpi.current.self[kpi] > b.kpi.current.self[kpi] ? 1 : (a.kpi.current.self[kpi] < b.kpi.current.self[kpi] ? -1 : 0);
            });
        },

        getConnections() {
            if (!CompanyModel.getCompany()) {
                return false;
            }

            var interval = 'eleven_month';

            if (this.interval === 'quarterly') {
                interval = 'two_month';
            } else if (this.interval === 'semiannual') {
                interval = 'five_month';
            }

            var scope = this;
            scope.ui.loading = true;
            var conn = new ConnectionCollection('see');
            conn.getConnectionData(interval, this.ui.reclassified)
                .then(function(res) {
                    scope.connections = res.contents;
                    scope.ui.loading = false;
                });

        },


        portfolioFilter(connection) {
            if (!this.ui.showPortfolio) {
                return true;
            }

            return this.portfolio.indexOf(connection.id) >= 0;

        },


        formatNumber(value, type) {
            if (isNaN(value)) {
                return '--';
            }

            if (type === '%') {
                value = value * 100;
            }

            if (type === '$') {
                type = ErpModel.getErp().currency;
            }

            if (value > 999999999 || value < -999999999) {
                value = Math.round((value / 1000000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.billions;
            } else if (value > 999999 || value < -999999) {
                value = Math.round((value / 1000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.millions;
            } else if (value > 999 || value < -999) {
                value = Math.round((value / 1000) * 10) / 10 + ' ' + this.ui.dictionary.meta.thousands;
            } else {
                value = Math.round(value * 10) / 10;
            }

            return String(value).replace('.', this.ui.dictionary.meta.decimalSymbol) + ' ' + type;
        },


        openOverview(connection) {
            connection.fromSummary = true;

            if (!connection.permissionType || connection.permissionType === 'limited') {
                var scope = this;
                var cm = new SeeConnectionModel();
                cm.getDashboardPermissions(connection.id)
                    .then(function(res) {
                        if (res.contents) {
                            connection.dashboardPermissions = res.contents;
                        }

                        ContextModel.setContext(connection);
                        EventBus.$emit('contextChanged');
                        scope.setErp();
                        //scope.$router.push('/account/overview');
                    });
            } else {
                ContextModel.setContext(connection);
                EventBus.$emit('contextChanged');
                this.setErp();
                //this.$router.push('/account/overview');
            }
        },

        /**
         * Set ERP
         */
        setErp() {
            var scope = this;

            ErpModel.setErp('loading');
            //document.dispatchEvent(this.events.companyErpChanged);

            ErpModel.fromCompany()
                .then(function(response) {
                    if (response.id) {
                        ErpModel.setErp(response);
                    } else if (response === 'forbidden') {
                        ErpModel.setErp(response);
                    } else {
                        ErpModel.forgetErp();
                    }

                    scope.$router.push('/account/overview');

                    //document.dispatchEvent(scope.events.companyErpChanged);
                });
        },


        addPortfolio(connection) {
            this.portfolio.push(connection.id);

            var ui = UserModel.getCompanyUserInfo();
            ui.settings.portfolio = this.portfolio;
            UserModel.setCompanyUserInfo(ui);
            UserModel.saveCompanyUserInfo();
        },


        removePortfolio(connection, index) {
            var idx = this.portfolio.indexOf(connection.id);

            if (idx >= 0) {
                this.portfolio.splice(idx, 1);
            }

            var ui = UserModel.getCompanyUserInfo();
            ui.settings.portfolio = this.portfolio;
            UserModel.setCompanyUserInfo(ui);
            UserModel.saveCompanyUserInfo();
        },

        inPortfolio(connection) {
            return Array.isArray(this.portfolio) && this.portfolio.indexOf(connection.id) >= 0;


        },

        showWarningModal() {
            this.$modal.show(showWarning, {currentWarnings: this.currentWarnings, currentConnection: this.currentConnection}, {width: '70%', height: 'auto'});
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'date-picker' : datePicker,
            'warning-settings' : warningSettings,
            'switch-with-labels': switchWithLabels
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            //EventBus.$off('companyErpChanged');
            EventBus.$off('companyUserChanged', this.getConnections);
        }
    });
