define([
    
    'Vue',
    'models/DictionaryModel',
    'models/KpiModel',
    'elements/drilldown-labels'
    
], function(Vue, DictionaryModel, KpiModel, drilldownLabels) {
    var template = [
    '<article>',
    '   <section class="drilldown" :class="{ show : ui.showDrilldown }">',
    '       <div class="trigger" v-show="!ui.showDrilldown" v-on:click="getDrilldownData(kpi.kpi)">{{ui.dictionary.drilldown.show}}</div>',
    '       <div class="trigger" v-show="ui.showDrilldown" v-on:click="ui.showDrilldown = false;">{{ui.dictionary.drilldown.hide}}</div>',
    '       <div class="drilldown-container">',
    '           <div class="center-text" v-show="!drilldown.current">',
    '               <div class="working inline"></div>',
    '           </div>',
    
    '           <div v-if="drilldown.current && drilldown[currentType].self && drilldown[currentType].self.aggregation && drilldown[currentType].self.aggregation.mappings">',
    '               <div v-for="(dd, index) in drilldown[currentType].self.aggregation.mappings">',
    '                   <div class="dd-name" :class="{ first : index == 0 }">{{translateKpi(dd.name)}}</div>',
    '                   <drilldown-labels :current="drilldown[currentType].self.aggregation.mappings[index].value" :previous="drilldown[previousType].self.aggregation.mappings[index].value" :average="false" :label="kpi.kpi.unit.label"></drilldown-labels>',
    '               </div>',
    '           </div>',
    
    '           <div class="center-text faded" v-if="drilldown.current && (!drilldown.current.self || !drilldown.current.self.aggregation || !drilldown.current.self.aggregation.mappings)">',
    '               <em>{{ui.dictionary.drilldown.noData}}</em>',
    '           </div>',
    '       </div>',
    '   </section>',
    '</article>'
    ].join('');
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                showDrilldown : false
            },
            tooltip : false,
            colors : {
                current : {},
                previous : {},
                average : {}
            },
            drilldown : {}
        };
    };
    
    
    var methods = {
        getDrilldownData : function(kpi) {
            var scope = this;
            
            scope.ui.showDrilldown = true;
            
            if (this.drilldown.current) {
                return false;
            }
            
            var km = new KpiModel(kpi.id);
            km.getData()
                .then(function(res) {
                    if (res.contents) {
                        scope.drilldown = res.contents;
                    } else {
                        scope.drilldown = {
                            current : {}
                        };
                    }
                });
        },
        
        translateKpi : function(key) {
            if (this.easyview && this.ui.dictionary.kpis.easyview[key]) {
                return this.ui.dictionary.kpis.easyview[key];
            } else if (this.ui.dictionary.systemKpis[key]) {
                return this.ui.dictionary.systemKpis[key];
            } else if (this.ui.dictionary.kpis[key]) {
                return this.ui.dictionary.kpis[key];
            }
            
            return key;
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['kpi', 'currentType', 'previousType'],
        components : {
            'drilldown-labels' : drilldownLabels
        }
    });
});
