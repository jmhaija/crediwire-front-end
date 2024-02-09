define([
    
    'Vue',
    'models/DictionaryModel',
    'models/BrowserModel',
    'models/DashboardKpiModel',
    'models/DashboardModel',
    'models/AssetModel',
    'collections/DashboardKpiCollection',
    'collections/KpiCollection',
    'elements/kpi-editor',
    'services/Validator',
    'elements/modals/modal',
    'elements/modals/add-new-kpi',
    'services/EventBus'
], function(Vue, DictionaryModel, BrowserModel, DashboardKpiModel, DashboardModel, AssetModel, DashboardKpiCollection, KpiCollection, kpiEditor, Validator, modal, addNewKpiModal, EventBus) {
    /**
     * View template
     */
    var template = [
        '<article class="dashboard-editor">',
        '   <section class="form">',
        '       <form v-on:submit.prevent="saveDashboard()">',
        '           <div class="input-field">',
        '               <input type="text" v-model="fields.name.value" v-bind:class="{ invalid : !fields.name.valid }" v-on:keyup="validateName(); ui.changes = true;" v-on:blur="validateName(true)">',
        '               <label v-bind:class="{ filled: fields.name.value }">{{ui.dictionary.dashboards.name}}</label>',
        '               <div class="warning" v-bind:class="{ show : !fields.name.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '           </div>',
        '       </form>',
        '   </section>',
        '   <section class="dnd-kpis">',
        '       <div class="available">',
        '           <div class="new"><a v-on:click="showKpiModal()"><i class="cwi-add"></i> {{ui.dictionary.customKpis.add}}</a></div>',
        '           <h4 class="clickable" v-show="ui.showCustomKpis" v-on:click="ui.showCustomKpis = false;">{{ui.dictionary.dashboards.custom}} <img :src="getImage(\'/assets/img/elements/switch-left.png\')" class="switch"> {{ui.dictionary.dashboards.system}}</h4>',
        '           <h4 class="clickable" v-show="!ui.showCustomKpis" v-on:click="ui.showCustomKpis = true;">{{ui.dictionary.dashboards.custom}} <img :src="getImage(\'/assets/img/elements/switch-right.png\')" class="switch"> {{ui.dictionary.dashboards.system}}</h4>',
        '           <div v-show="ui.loadingKpis" class="working"></div>',
        
                    /**
                     * Available KPIs dropzone
                     */
        '           <div class="kpi-container dropzone" :class="{ active : dragging.dkDragging }"',
        '                v-on:drop="drop($event, false)"',
        '                v-on:dragover="dragOver"',
        '                v-on:dragenter="dragEnter()">',
        
                        /**
                         * KPIs
                         */
        '               <div class="kpi" v-for="kpi in filterKpis(listKpis())"',
        '                    :class="{ selected : kpi.selected }"',
        '                    v-on:dragstart="dragStart($event, kpi); dragging.kpiDragging = true;"',
        '                    v-on:dragend="dragging.kpiDragging = false;"',
        '                    v-on:click="selectKpi(kpi);"',
        '                    draggable="draggable">',
        '               {{translateSystemKpi(kpi.name)}}</div>',
        '           </div>',
        
        '       </div><div class="transfer">',
        '           <div><button v-on:click="drop(false, true)"><i class="cwi-right"></i></button></div>',
        '           <div><button v-on:click="drop(false, false)"><i class="cwi-left"></i></button></div>',
        
        '       </div><div class="in-dashboard">',
        '           <h4>{{ui.dictionary.dashboards.inDashboard}}</h4>',
        '           <div v-show="ui.loadingDashKpis" class="working"></div>',
        
                    /**
                     * Dashboard KPI dropzone
                     */
        '           <div class="kpi-container dropzone" :class="{ active : dragging.kpiDragging }"',
        '                v-on:drop="drop($event, true)"',
        '                v-on:dragover="dragOver"',
        '                v-on:dragenter="dragEnter()">',
        
                        /**
                         * Dashboard KPIs
                         */
        '               <div class="kpi" v-for="dk in orderbyOrder(listDashboardKpis())"',
        '                    :class="{ selected : dk.selected }"',
        '                    v-on:dragstart="dragStart($event, dk); dragging.dkDragging = true;"',
        '                    v-on:dragend="dragging.dkDragging = false;"',
        '                    v-on:click="selectKpi(dk);"',
        '                    draggable="draggable">',
        '                   {{translateSystemKpi(dk.name)}}',
        '               </div>',
        '           </div>',
        
        '       </div>',
        
        
        '   </section>',
        '   <section class="buttons">',
        '       <div class="save" v-show="ui.changes === true">',
        '           <button v-show="!ui.saving" class="primary" v-on:click="saveDashboard()">{{ui.dictionary.dashboards.save}}</button></div>',
        '           <div v-show="ui.saving" class="working inline save"></div>',
        '       </div>',
        '       <div class="save" v-show="ui.changes === false">',
        '           {{ui.dictionary.dashboards.saved}}',
        '       </div>',
        '       <button v-show="!ui.deleting" class="warning" v-on:click="deleteDashboard()">{{ui.dictionary.dashboards.delete}}</button>',
        '       <div v-show="ui.deleting" class="working"></div>',
        '   </section>',
        '</article>'
    ].join('');
    
    
    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loadingDashKpis : true,
                loadingKpis : true,
                saving : false,
                deleting : false,
                changes : null,
                showCustomKpis : true,
            },
            fields : {
                name : { value : null, valid : true }
            },
            dashboardKpis : [],
            availableKpis : [],
            dragging : {
                dkDragging : false,
                kpiDragging : false
            }
        };
    };
    
    
    /**
     * Methods
     */
    var methods = {
        init : function(dashboard) {
            if (dashboard) {
                this.fields.name.value = dashboard.name;
                this.getDashboardKpis();
            } else {
                this.ui.loadingDashKpis = false;
            }
            
            this.getAvailableKpis();
        },
        
        
        translateSystemKpi : function(name) {
            return this.ui.dictionary.systemKpis[name] || name;
        },
        
        addKpi : function(kpi) {
            if (kpi) {
                this.availableKpis.push(kpi);
                this.ui.showCustomKpis = true;
            }

            EventBus.$emit('closeKPI', kpi);
        },
        
        validateName : function(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }
            
            return this.fields.name.valid;
        },
        
        
        getDashboardKpis : function() {
            var scope = this;
            var kpis = DashboardKpiCollection(this.dashboard.id);
            
            kpis.getKpis(this.ignoreContext)
                .then(function(res) {
                    scope.dashboardKpis = res.contents;
                    scope.ui.loadingDashKpis = false;
                    scope.setOrder();
                });
        },
        
        
        getAvailableKpis : function() {
            var scope = this;
            var kpis = KpiCollection();
            
            kpis.getKpis(false, this.ignoreContext)
                .then(function(res) {
                    scope.availableKpis = res.contents;
                    scope.ui.loadingKpis = false;
                    scope.setOrder();
                });
        },
        
        
        setOrder : function() {
            var scope = this;
            
            if (scope.ui.loadingKpis || scope.ui.loadingDashKpis) {
                return false;
            }
            
            this.availableKpis.filter(function(kpi) {
                scope.dashboardKpis.forEach(function(dk) {
                    if (dk.kpi == kpi.id) {
                        kpi.order = dk.order;
                    }
                });
            });
        },
        
        
        saveDashboard : function() {
            if ( !this.validateName(true) ) {
                return false;
            }
            
            var scope = this;
            
            scope.ui.saving = true;
            this.dashboard.name = this.fields.name.value;
            
            var dm = new DashboardModel(this.dashboard.id);
            dm.save(this.dashboard, this.ignoreContext)
                .then(function(res) {
                    if (res.id) {
                        scope.ui.changes = false;
                    }
                    scope.ui.saving = false;
                });
        },
        
        
        deleteDashboard : function(confirmed) {
            if (!confirmed) {
                this.showDeleteDashboardDialog();
                return false;
            }
            
            var scope = this;
            
            scope.ui.deleting = true;
            scope.$modal.hide('dialog');

            var dm = new DashboardModel(this.dashboard.id);
            dm.delete(this.ignoreContext)
                .then(function(res) {
                    if (scope.callback) {
                        scope.callback();
                    }
                });
        },

        showDeleteDashboardDialog : function () {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.dashboards.confirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.dashboards.decline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.dashboards.delete,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteDashboard(true); this.$modal.hide('dialog')}
                    }
                ]
            });
        },
        
        
        listDashboardKpis : function() {
            var scope = this;
            var order = 1;
            
            if (!this.availableKpis) {
                return false;
            }
            
            return this.availableKpis.filter(function(kpi) {
                var found = false;
                
                scope.dashboardKpis.forEach(function(dk) {
                    if (dk.kpi == kpi.id) {
                        //kpi.order = dk.order;
                        dk.order = kpi.order;
                        found = true;
                    }
                });
                
                return found;
            });
        },
        
        
        listKpis : function() {
            var scope = this;
            
            if (!this.availableKpis) {
                return false;
            }
            
            return this.availableKpis.filter(function(kpi) {
                var found = false;
                
                scope.dashboardKpis.forEach(function(dk) {
                    if (dk.kpi == kpi.id) {
                        found = true;
                    }
                });
                
                return !found;
            });
        },
        
        
        orderbyOrder : function(list) {
            var scope = this;
            
            if (!list) {
                return false;
            }
            
            return list.sort(function(a, b) {
                if (a.order === undefined) {
                    a.order = 0;
                }
                
                if (b.order === undefined) {
                    b.order = 0;
                }
                
                return a.order - b.order;
            });
        },
        
        
        filterKpis : function(list) {
            var scope = this;
            
            if (!list) {
                return false;
            }
            
            return list.filter(function(item) {
                return item.system != scope.ui.showCustomKpis;
            });
        },
        
        selectKpi : function(kpi) {
            if (!kpi.selected) {
                Vue.set(kpi, 'selected', true);
            } else {
                Vue.set(kpi, 'selected', false);
            }
        },
        
        
        dragStart : function(event, kpi) {
            Vue.set(kpi, 'selected', true);
            
            //Oh Firefox, you're so picky...
            if (BrowserModel.browser.firefox && event) {
                event.dataTransfer.setData('text/plain', null);
            }
        },
        
        drop : function(event, inDashKpi) {
            //...some special instructions just for you.
            if (BrowserModel.browser.firefox && event) {
                event.preventDefault();
            }
            
            
            var scope = this;
            
            /**
             * Update KPI order
             */
            if (inDashKpi && this.dragging.dkDragging) {
                
                var position = Math.round(event.target.offsetTop / event.target.offsetHeight - 10);
                
                if (position < 0) {
                    position = scope.dashboardKpis.length + 1;
                }
                
                
                scope.listDashboardKpis().forEach(function(dk, idx) {
                    if (dk.selected) {
                        scope.dashboardKpis[idx].order = position;
                        dk.order = position;
                        dk.selected = false;
                        
                        scope.updateOrder(scope.dashboardKpis[idx]);
                    }
                });
            
            /**
             * Drag into dashboard
             */
            } else if (inDashKpi) {
                
                scope.availableKpis.forEach(function(kpi) {
                    if (kpi.selected) {
                        //Push into collection
                        var newDashKpi = {
                            id : null,
                            dashboard : scope.dashboard.id,
                            kpi : kpi.id
                        };
                        
                        scope.dashboardKpis.push(newDashKpi);
                        kpi.selected = false;
                        
                        //Create
                        scope.createDashboardKpi({
                            dashboard : scope.dashboard.id,
                            kpi : kpi.id,
                            order : 0
                        }).then(function(res) {
                            newDashKpi.id = res.id;
                        });
                    }
                });
            
            /**
             * Drag out of dashboard
             */
            } else {
                
                scope.listDashboardKpis().forEach(function(dk) {
                    if (dk.selected) {
                        for (var i = scope.dashboardKpis.length - 1; i >= 0; i--) {
                            if (scope.dashboardKpis[i].kpi == dk.id) {
                                //Delete
                                scope.deleteDashboardKpi(scope.dashboardKpis[i]);
                                
                                //Remove from collection
                                scope.dashboardKpis.splice(i, 1);
                                dk.selected = false;
                            }
                        }
                    }
                });
                
               
                
            }
        },
        
        
        dragOver : function(ev) {
            ev.preventDefault();
        },
        
        
        dragEnter : function() {},
        
        
        updateOrder : function(dk) {
            var scope = this;
            
            scope.ui.changes = true;
            scope.ui.saving = true;
            
            var dkm = new DashboardKpiModel(this.dashboard.id);
            dkm.update(dk)
                .then(function(res) {
                    scope.ui.changes = false;
                    scope.ui.saving = false;
                });
        },
        
        createDashboardKpi : function(dk) {
            var scope = this;
            
            scope.ui.changes = true;
            scope.ui.saving = true;
            
            var dkm = new DashboardKpiModel(this.dashboard.id);
            return dkm.create(dk, this.ignoreContext)
                .then(function(res) {
                    scope.ui.changes = false;
                    scope.ui.saving = false;
                    return res;
                });
        },
        
        
        deleteDashboardKpi : function(dk, d) {
            var scope = this;
            
            scope.ui.changes = true;
            scope.ui.saving = true;
            
            var dkm = new DashboardKpiModel(this.dashboard.id, dk.id);
            dkm.delete(this.ignoreContext)
                .then(function(res) {
                    scope.ui.changes = false;
                    scope.ui.saving = false;
                });
        },
        
        getImage : function(img) {
            return new AssetModel(img).path;
        },

        showKpiModal : function () {
            this.$modal.show(addNewKpiModal, {
                addKpi: this.addKpi, close: this.close
            },{height: 'auto', adaptive: true, width: '70%', pivotY: 0.2, classes: 'add-new-kpi'});
        }
    };
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['dashboard', 'callback', 'ignoreContext'],
        components : {
            'kpi-editor' : kpiEditor
        },
        watch : {
            dashboard : function(dashboard) {
                this.init(dashboard);
            }
        },
        mounted : function() {
            this.init(this.dashboard);
        }
    });
});
