<template>
    <article class="dashboard-editor warning-editor">
       <section class="form">
           <form v-on:submit.prevent="saveWarning()">
               <div class="input-field">
                   <input type="text" v-model="fields.name.value" v-bind:class="{ invalid : !fields.name.valid }" v-on:keyup="doValidateName()" v-on:blur="validateName(true)">
                   <label v-bind:class="{ filled: fields.name.value }">{{ui.dictionary.warnings.name}}</label>
                   <div class="warning" v-bind:class="{ show : !fields.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
               </div>

               <div class="checkbox-field">
                   <label><input type="checkbox" v-model="fields.all" v-on:change="ui.changes = true"> <i></i> {{ui.dictionary.warnings.include}}</label>
               </div>
           </form>
       </section>

       <section class="rules">
<!--        /**-->
<!--        * Include/exclude connections-->
<!--        *-->
<!--        */-->
           <div class="conditions">
               <div class="title">{{ui.dictionary.warnings.conditions}}</div>
               <div v-show="ui.conditionsLoading" class="working"></div>
               <div v-show="!ui.conditionsLoading">
                   <div class="condition" v-for="(condition, index) in conditions">

                       <span v-show="!condition.id || condition.editMode">
                           <select v-model="condition.kpi" :disabled="condition.saving">
                               <option v-for="kpi in kpis" :value="kpi.id">{{kpi.name}}</option>
                           </select>
                           {{ui.dictionary.warnings.exceeds}}
                           <input type="number" v-model="condition.upper" :disabled="condition.saving"> {{findUnit(condition.kpi)}}
                             {{ui.dictionary.warnings.or}} {{ui.dictionary.warnings.falls}}
                           <input type="number" v-model="condition.lower" :disabled="condition.saving"> {{findUnit(condition.kpi)}}
                           {{ui.dictionary.warnings.last}}
                           <input type="number" v-model="condition.intervalQuantity" :disabled="condition.saving">
                           <select v-model="condition.intervalType" :disabled="condition.saving">
                               <option v-for="interval in intervals" :value="interval">{{ui.dictionary.overview.intervals[interval]}}</option>
                           </select>
                           {{ui.dictionary.warnings.from}}
                           <input type="number" v-model="condition.intervalBackQuantity" :disabled="condition.saving"> {{ui.dictionary.overview.intervals[condition.intervalType]}}
                           {{ui.dictionary.warnings.back}}
                           <span class="save" v-show="(!condition.id || condition.editMode) && condition.saving"><div class="working inline"></div></span>
                           <span class="save" v-show="(!condition.id || condition.editMode) && !condition.saving && condition.intervalQuantity !== null && (condition.upper !== null || condition.lower !== null)"><button class="primary" v-on:click="saveCondition(condition)">{{ui.dictionary.general.go}}</button></span>
                       </span>

                        <span v-show="condition.id && !condition.editMode">
                           <span class="edit-icon" v-on:click="editCondition(condition)"><i class="cwi-pencil"></i></span>
                           {{findKPI(condition.kpi)}}
                           <span v-show="condition.upper !== null"><span class="secondary">{{ui.dictionary.warnings.exceeds}}</span> {{condition.upper}} {{findUnit(condition.kpi)}}</span>
                           <span v-show="condition.upper !== null && condition.lower !== null" class="secondary">{{ui.dictionary.warnings.or}}</span>
                           <span v-show="condition.lower !== null"><span class="secondary">{{ui.dictionary.warnings.falls}}</span> {{condition.lower}} {{findUnit(condition.kpi)}}</span>
                           <span class="secondary">{{ui.dictionary.warnings.last}}</span> {{condition.intervalQuantity}} {{ui.dictionary.overview.intervals[condition.intervalType]}}
                           <span v-show="condition.checkType == 'comparisonPastPeriod'">
                               <span class="secondary">{{ui.dictionary.warnings.from}}</span>
                               {{condition.intervalBackQuantity}} {{ui.dictionary.overview.intervals[condition.intervalBackType]}}
                               <span class="secondary">{{ui.dictionary.warnings.back}}</span>
                           </span>
                       </span>


                       <span class="save" v-show="condition.id && !condition.editMode" v-on:click="deleteCondition(condition, index)"><i class="cwi-close delete"></i></span>
                   </div>

                   <div class="add-condition" v-on:click="addCondition()"><i class="cwi-add"></i> {{ui.dictionary.warnings.addCondition}}</div>
               </div>
           </div>
       </section>

       <section class="buttons">
           <div class="save" v-show="ui.changes === true">
               <button v-show="!ui.saving" class="primary" v-on:click="saveWarning()">{{ui.dictionary.warnings.save}}</button>
               <div v-show="ui.saving" class="working inline save"></div>
           </div>
           <div class="save" v-show="ui.changes === false">
               {{ui.dictionary.warnings.saved}}
           </div>
           <button v-show="!ui.deleting" class="warning" v-on:click="deleteWarning()">{{ui.dictionary.warnings.delete}}</button>
           <div v-show="ui.deleting" class="working"></div>
       </section>
    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import WarningModel from 'models/WarningModel'
    import CompanyModel from 'models/CompanyModel'
    import WarningExceptionModel from 'models/WarningExceptionModel'
    import ConditionModel from 'models/ConditionModel'
    import ErpModel from 'models/ErpModel'
    import ConnectionCollection from 'collections/ConnectionCollection'
    import WarningsCollection from 'collections/WarningsCollection'
    import KpiCollection from 'collections/KpiCollection'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'
    import Toast from 'services/Toast'

    const sortObjectsByProperty = propertyName => (
        (a, b) => (
            (a[propertyName] < b[propertyName])
                ? -1
                : ((a[propertyName] > b[propertyName]) ? 1 : 0)
        )
    );

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            saving : false,
            changes : false,
            deleting : false,
            options: false,
            connectionsLoading : true,
            conditionsLoading : true
        },
        fields : {
            name : { value : '', valid : true, error : false},
            all : true
        },
        connections : false,
        include : false,
        exclude : false,
        conditions : false,
        kpis : false,
        intervals : ['day', 'week', 'month', 'quarter', 'half-year', 'year']
    });

    const methods = {
        init() {
            /**
             * Event listeners
             */
            EventBus.$on('click', this.closeAllOptions);
            document.addEventListener('clickAppBody', this.closeAllOptions);

            if (this.warning) {
                this.fields.name.value = this.warning.name;
                this.fields.all = this.warning.all;
            }

            //this.getConnections();
            //this.getIncludeExclude();
            this.getConditions();
            this.getKpis();
        },

        editCondition(condition) {
            Vue.set(condition, 'editMode', true);
        },


        findKPI(id) {
            var name = null;

            this.kpis.forEach(function(kpi) {
                if (kpi.id == id) {
                    name = kpi.name;
                }
            });

            return name;
        },

        findUnit(id) {
            var unit = null;

            this.kpis.forEach(function(kpi) {
                if (kpi.id == id) {
                    unit = kpi.unit;
                }
            });



            if (unit.type == 'currency' && ErpModel.getErp() && ErpModel.getErp().currency) {
                return ErpModel.getErp().currency;
            } else {
                return unit.label;
            }
        },

        saveCondition(condition) {
            if (condition.lower === '') {
                condition.lower = null;
            }

            if (condition.upper === '') {
                condition.upper = null;
            }

            if (condition.lower === null && condition.upper === null) {
                return false;
            }

            condition.saving = true;

            if (condition.intervalBackQuantity !== null && condition.intervalBackQuantity != '') {
                condition.intervalBackType = condition.intervalType;
                condition.checkType = 'comparisonPastPeriod';
            } else {
                condition.intervalBackQuantity = null;
                condition.intervalBackType = null;
                condition.checkType = null;
            }

            var scope = this;
            var cm = new ConditionModel(this.warning.id);
            this.ui.changes = true;
            this.ui.saving = true;

            if (condition.id) {
                cm.save(condition)
                    .then(function(res) {
                        if (res.id) {
                            condition.editMode = false;
                            scope.ui.changes = false;
                        } else {
                            Toast.show(scope.ui.dictionary.warnings.notSaved, 'error');
                        }

                        scope.ui.saving = false;
                        condition.saving = false;
                    });

                return true;
            }

            cm.create(condition)
                .then(function(res) {
                    if (res.id) {
                        condition.id = res.id;
                        condition.editMode = false;
                        scope.ui.changes = false;
                    } else {
                        Toast.show(scope.ui.dictionary.warnings.notSaved, 'error');
                    }

                    scope.ui.saving = false;
                    condition.saving = false;
                });
        },


        deleteCondition(condition, index) {
            var scope = this;
            var cm = new ConditionModel(this.warning.id);
            this.ui.changes = true;
            this.ui.saving = true;

            this.conditions.splice(index, 1);

            cm.delete(condition.id)
                .then(function(res) {
                    condition.id = res.id;
                    scope.ui.changes = false;
                    scope.ui.saving = false;
                });
        },

        addCondition() {
            this.conditions.push({
                kpi : this.kpis[0].id,
                upper : null,
                lower : null,
                intervalType : 'month',
                intervalQuantity : 1,
                intervalBackType : null,
                intervalBackQuantity : null,
                checkType : null
            });
        },

        getConditions() {
            var scope = this;
            var wc = new WarningsCollection();

            wc.getConditions(this.warning.id)
                .then(function(res) {
                    scope.conditions = res.contents;

                    if (scope.kpis) {
                        scope.ui.conditionsLoading = false;
                    }
                });
        },

        getKpis() {
            var scope = this;
            var kc = new KpiCollection();

            kc.getKpis()
                .then(function(res) {
                    scope.kpis = res.contents.sort(sortObjectsByProperty("name"));

                    if (scope.conditions) {
                        scope.ui.conditionsLoading = false;
                    }
                });
        },

        getConnections() {
            var scope = this;
            scope.ui.connectionsLoading = true;
            var conn = new ConnectionCollection('see');
            conn.getConnections(true)
                .then(function(res) {
                    scope.connections = res.contents;

                    if (scope.include && scope.exclude) {
                        scope.ui.connectionsLoading = false;
                    }
                });
        },


        getIncludeExclude() {
            var scope = this;
            var wc = new WarningsCollection();

            wc.getInclude(this.warning.id)
                .then(function(res) {
                    scope.include = res.contents;

                    if (scope.connections && scope.exclude) {
                        scope.ui.connectionsLoading = false;
                    }
                });


            wc.getExclude(this.warning.id)
                .then(function(res) {
                    scope.exclude = res.contents;

                    if (scope.include && scope.connections) {
                        scope.ui.connectionsLoading = false;
                    }
                });
        },


        filterConnections() {
            this.connections.forEach(function(connection) {
                connection.checked = false;

                if (this.fields.all) {
                    this.exclude.forEach(function(exclude) {
                        if (connection.id == exclude.connection) {
                            connection.checked = true;
                        }
                    }, this);
                } else {
                    this.include.forEach(function(include) {
                        if (connection.id == include.connection) {
                            connection.checked = true;
                        }
                    }, this);
                }
            }, this);
        },


        syncIncludeExclude(connection) {
            var scope = this;
            var type = this.fields.all ? 'exclude' : 'include';
            var obj = { connection : connection.id };
            var wem = new WarningExceptionModel(this.warning.id);

            this.ui.changes = true;
            this.ui.saving = true;

            if (connection.checked) {
                //Create new exception
                if (type == 'include') {
                    wem.createInclude(obj)
                        .then(function() {
                            scope.ui.changes = false;
                            scope.ui.saving = false;
                        });
                    this.include.push(obj);
                } else {
                    wem.createExclude(obj)
                        .then(function() {
                            scope.ui.changes = false;
                            scope.ui.saving = false;
                        });
                    this.exclude.push(obj);
                }
            } else {
                //Delete exception
                this[type].forEach(function(item, index) {
                    if (connection.id == item.connection) {
                        if (type == 'include') {
                            wem.deleteInclude(item.connection)
                                .then(function() {
                                    scope.ui.changes = false;
                                    scope.ui.saving = false;
                                });
                            scope.include.splice(index, 1);
                        } else {
                            wem.deleteExclude(item.connection)
                                .then(function() {
                                    scope.ui.changes = false;
                                    scope.ui.saving = false;
                                });
                            scope.exclude.splice(index, 1);
                        }
                    }
                }, this);
            }
        },


        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        saveWarning() {
            if ( !this.validateName(true) ) {
                return false;
            }

            var scope = this;

            scope.ui.saving = true;
            this.warning.name = this.fields.name.value;
            this.warning.all = this.fields.all;

            var wm = new WarningModel(this.warning.id);
            wm.save(this.warning)
                .then(function(res) {
                    if (res.id) {
                        scope.ui.changes = false;
                    }
                    scope.ui.saving = false;
                });
        },

        deleteWarning(confirmed) {
            if (!confirmed) {
                this.showDeleteConfirmDialog();
                return false;
            }

            var scope = this;

            scope.ui.deleting = true;
            scope.$modal.hide('dialog');

            var wm = new WarningModel(this.warning.id);
            wm.delete()
                .then(function(res) {
                    if (scope.callback) {
                        scope.callback();
                    }
                });
        },

        setAll(val) {
            this.fields.all = val;
            this.ui.changes = true;
            this.saveWarning();
            this.filterConnections();
            this.closeAllOptions();
        },

        closeAllOptions() {
            this.ui.options = false;
        },

        showDeleteConfirmDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.warnings.confirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.warnings.decline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.warnings.delete,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteWarning(true); this.$modal.hide('dialog'); }
                    }
                ]
            });
        },

        doValidateName() {
            this.validateName();
            this.ui.changes = true;
        }
    }

    export default {
        data,
        methods,
        props : {
            warning: {},
            callback: {}
        },
        watch : {
            'ui.connectionsLoading' : function() {
                this.filterConnections();
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('click', this.closeAllOptions);
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        }
    }

</script>
