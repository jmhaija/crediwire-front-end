define([
    
    'Vue',
    'models/DictionaryModel',
    'collections/WarningsCollection',
    'collections/KpiCollection'
    
], function(Vue, DictionaryModel, WarningsCollection, KpiCollection) {
    var template = [
    '<article>',
    '   <div v-show="ui.loading" class="working"></div>',
    '   <div v-if="!ui.loading">',
    '       <div v-for="condition in filterConditions(conditions)">',
    '           <span class="blame"><span class="value">{{condition.blameValue}} <i class="cwi-warning"></i></span></span>',
    '           {{findKPI(condition.kpi)}}',
    '           <span v-show="condition.upper !== null"><span class="secondary">{{ui.dictionary.warnings.exceeds}}</span> {{condition.upper}}</span>',
    '           <span v-show="condition.upper !== null && condition.lower !== null" class="secondary">{{ui.dictionary.warnings.or}}</span>',
    '           <span v-show="condition.lower !== null"><span class="secondary">{{ui.dictionary.warnings.falls}}</span> {{condition.lower}}</span>',
    '           <span class="secondary">{{ui.dictionary.warnings.last}}</span> {{condition.intervalQuantity}} {{ui.dictionary.overview.intervals[condition.intervalType]}}',
    '       </div>',
    '   </div>',
    '</article>'
    ].join('');
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true
            },
            conditions : false,
            kpis : false
        };
    };
    
    
    var methods = {
        init : function() {
            this.getConditions();
            this.getKpis();
        },
        
        
        getConditions : function() {
            var scope = this;
            var wc = new WarningsCollection();
            
            wc.getConditions(this.warnId)
                .then(function(res) {
                    scope.conditions = res.contents;
                    
                    if (scope.kpis) {
                        scope.ui.loading = false;
                    }
                });
        },
        
        
        getKpis : function() {
            var scope = this;
            var kc = new KpiCollection();
            
            kc.getKpis()
                .then(function(res) {
                    scope.kpis = res.contents;
                    
                    if (scope.conditions) {
                        scope.ui.loading = false;
                    }
                });
        },
        
        filterConditions : function(conditions) {
            var scope = this;
            
            return conditions.filter(function(condition) {
                var found = false;
                
                scope.values.forEach(function(val) {
                    if (val.condition == condition.id) {
                        condition.blameValue = val.value;
                        found = true;
                    }
                });
                
                return found;
            });
        },
        
        findKPI : function(id) {
            var name = null;
            
            this.kpis.forEach(function(kpi) {
                if (kpi.id == id) {
                    name = kpi.name;
                }
            });
            
            return name;
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['warnId', 'values'],
        mounted : function() {
            this.init();
        }
    });
});

