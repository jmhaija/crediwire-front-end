define([
    
    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/UserModel',
    'models/CompanyModel',
    'models/ContextModel',
    'models/ErpModel',
    'models/DateRangeModel',
    'collections/DashboardCollection',
    'views/DashboardView',
    'views/BalanceView'
    
],function(Vue, moment, DictionaryModel, UserModel, CompanyModel, ContextModel, ErpModel, DateRangeModel, DashboardCollection, DashboardView, BalanceView) {
    /**
     * View template
     */
    var template = [
        '<article ref="exportarea">',
        '   <div class="app-loader" v-show="ui.loading"></div>',
        
        '   <div v-show="!ui.loading">',
        '       <div v-for="message in messages">',
        '           <tt>{{message}}</tt>',
        '       </div>',
        '       <div v-for="error in errors">',
        '           <tt>{{error}}</tt>',
        '       </div>',
        '   </div>',
        
        '   <div id="export-state" v-show="false">',
        '       {{state}}',
        '   </div>',
        
        '   <div v-show="!ui.loading" id="draw-area" style="display: inline-block;">',
        '       <section class="export-container" v-if="currentDashboard && currentDashboard != \'_palbal\'">',
        '           <h1>{{currentCompany.name}} : {{currentDashboard.name}}</h1>',
        '           <dashboard :dash="currentDashboard" :presets="true" :presetType="params.type" :presetSeries="params.series" :presetSection="params.show" :presetInterval="params.interval" :presetCashbook="params.cashbook" :presetAverage="params.average" :presetPrevious="params.previous" :presetEasyview="params.easyview" :presetSpread="params.spread"></dashboard>',
        '       </section>',
        '       <section class="export-container" v-if="currentDashboard && currentDashboard == \'_palbal\'">',
        '           <h1>{{currentCompany.name}} : {{ui.dictionary.dashboards.balanceSheet}}</h1>',
        '           <balance :presets="true" :presetInterval="params.interval" :presetCashbook="params.cashbook" :presetBalance="params.balance" :presetCompare="params.compare"></balance>',
        '       </section>',
        '   </div>',
        '</article>'
    ].join("\n");
    
    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : false
            },
            messages : [],
            errors : [],
            state : {
                status : 'loading'
            },
            currentCompany : false,
            currentDashboard : false,
            params : {
                show : 'timeline',
                interval : 'month',
                cashbook : false,
                average : false,
                previous : false,
                easyview : false,
                spread : false,
                series : false,
                type : false,
                balance : false,
                compare : false
            },
            realtimeDashboard : {
                id : '_general',
                name : DictionaryModel.getHash().overview.realtime,
                company : null,
                dashboardKpis : [
                    { kpi : { name : 'revenue', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' } },
                    { kpi : { name : 'contributionMargin', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.contributionMargin },
                    { kpi : { name : 'fixedCosts', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' } },
                    { kpi : { name : 'profit', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.profitBeforeTax },
                    { kpi : { name : 'exIncomeExpense', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.exIncomeExpenseMargin },
                    
                    { kpi : { name : 'contributionMarginRatio', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' } },
                    { kpi : { name : 'profitMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.profitMargin },
                    { kpi : { name : 'overheadMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png', overheadType : true }, description : DictionaryModel.getHash().kpis.def.overheadMargin },
                    { kpi : { name : 'debtToAssetRatio', unit : { label : '%', type : 'percent' }, symbol : 'solvency.png' }, description : DictionaryModel.getHash().kpis.def.debtToAssetRatio },
                    { kpi : { name : 'exIncomeExpenseMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' } },
                    
                    { kpi : { name : 'currentRatio', unit : { label : 'x', type : 'ratio' }, symbol : 'liquidity.png' }, description : DictionaryModel.getHash().kpis.def.currentRatio },
                    { kpi : { name : 'quickRatio', unit : { label : 'x', type : 'ratio' }, symbol : 'liquidity.png' }, description : DictionaryModel.getHash().kpis.def.quickRatio },
                    { kpi : { name : 'assetTurnover', unit : { label : 'x', type : 'ratio' }, symbol : 'activity.png' }, description : DictionaryModel.getHash().kpis.def.assetTurnover },
                    { kpi : { name : 'inventoryTurnover', unit : { label : 'x', type : 'ratio' }, symbol : 'activity.png' }, description : DictionaryModel.getHash().kpis.def.inventoryTurnover }
                ]
            },
        };
    };
    
    /**
     * Methods
     */
    var methods = {
        init : function() {
            var scope = this;
            
            /**
            console.log = function(message) {
                scope.messages.push(message);
            };
            
            console.error = function(error) {
                scope.errors.push(error);
            };
            */
            
            this.setCompany();
            this.setParams();
        },
        
        
        setParams : function() {
            if (this.$route.query.show) {
                this.params.show = this.$route.query.show;
            }
            
            if (this.$route.query.interval) {
                this.params.interval = this.$route.query.interval;
            }
            
            if (this.$route.query.cashbook == 1) {
                this.params.cashbook = true;
            }
            
            if (this.$route.query.average == 1) {
                this.params.average = true;
            }
            
            if (this.$route.query.previous) {
                this.params.previous = this.$route.query.previous;
            }
            
            if (this.$route.query.easyview == 1) {
                this.params.easyview = true;
            }
            
            if (this.$route.query.spread) {
                this.params.spread = this.$route.query.spread;
            }
            
            if (this.$route.query.series) {
                this.params.series = this.$route.query.series.split(',');
            }
            
            if (this.$route.query.type) {
                this.params.type = this.$route.query.type;
            }
            
            if (this.$route.query.balance) {
                this.params.balance = this.$route.query.balance;
            }
            
            if (this.$route.query.compare) {
                this.params.compare = this.$route.query.compare;
            }
        },
        
        setCompany : function() {
            if (!this.$route.query.company) {
                console.error('Company parameter must be included.');
                scope.setReadyStatus('error');
                return false;
            }
            
            var scope = this;
            
            CompanyModel.fromID(this.$route.query.company)
                .then(function(res) {
                    if (res.id) {
                        CompanyModel.setCompany(res, this.$store);
                        
                        //Check for connection
                        if (scope.$route.query.connection) {
                            ContextModel.fromID(res.id, scope.$route.query.connection)
                                .then(function(conn) {
                                    if (conn.id) {
                                        ContextModel.setContext(conn);
                                        scope.currentCompany = conn.company;
                                        scope.getErp();
                                    } else {
                                        console.error('Connection not found or ID is invalid.');
                                        scope.setReadyStatus('error');
                                    }
                                });
                        } else {
                            scope.currentCompany = res;
                            scope.getErp();
                        }
                    } else {
                        console.error('Company not found or ID is invalid.');
                        scope.setReadyStatus('error');
                    }
                });
        },
        
        getErp : function() {
            var scope = this;
            
            ErpModel.fromCompany()
                .then(function(response) {
                    if (response.id) {
                        ErpModel.setErp(response);
                        scope.setDate();
                        scope.getDashboardList();
                    } else {
                        console.error('ERP not connected.');
                        ErpModel.forgetErp();
                        scope.setReadyStatus('error');
                    }
                });
        },
        
        
        setDate : function() {
            if (this.$route.query.from && this.$route.query.to) {
                var fromQuery = decodeURIComponent(this.$route.query.from);
                var toQuery = decodeURIComponent(this.$route.query.to);
                
                var fromDate = moment(fromQuery, 'YYYY-MM-DD');
                var toDate = moment(toQuery, 'YYYY-MM-DD');
                
                if (fromDate.isValid()
                    && toDate.isValid()
                    && fromDate.unix() < toDate.unix()) {
                
                    sessionStorage.setItem('useQueryDate', JSON.stringify(true));
                    DateRangeModel.setFromDate(fromDate.toDate());
                    DateRangeModel.setToDate(toDate.toDate());
                }
            }
        },
        
        getDashboardList : function() {
            var scope = this;
            
            var dashboards = new DashboardCollection(true);
            dashboards.getDashboards()
                .then(function(list) {
                    var found = false;
                    
                    list.contents.forEach(function(dash) {
                        if (dash.id == scope.$route.query.dashboard) {
                            found = dash;
                        }
                    });
                    
                    if (found) {
                        scope.currentDashboard = found;
                        scope.setReadyStatus('ready');
                    } else if (scope.$route.query.dashboard == '_general') {
                        scope.currentDashboard = scope.realtimeDashboard;
                        scope.setReadyStatus('ready');
                    } else if (scope.$route.query.dashboard == '_palbal') {
                        scope.currentDashboard = '_palbal';
                        scope.setReadyStatus('ready');
                    } else {
                        console.error('Dashboard ID not found for this company.');
                        scope.setReadyStatus('error');
                    }
                });
        },
        
        
        setReadyStatus : function(status) {
            var scope = this;
            
            setTimeout(function() {
                scope.state.status = status;
                scope.state.height = scope.$el.querySelector('#draw-area').offsetHeight;
                scope.state.width = scope.$el.querySelector('#draw-area').offsetWidth;
                window.status = 'ready';
            }, 5000);
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'dashboard' : DashboardView,
            'balance' : BalanceView
        },
        created : function() {
            this.init();
        },
        beforeRouteLeave : function(to, from, next) {
            next(false);
        }
    });
});
