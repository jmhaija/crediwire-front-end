define([
    
    'Vue',
    'models/DictionaryModel',
    'models/ErpModel',
    'services/Config'
    
], function(Vue, DictionaryModel, ErpModel, Config) {
    var template = [
    '<article class="kpi-labels">',
    '   <div class="value-container">',
    '       <div class="value" :style="{ borderColor : colors.current }">',
    '           <div v-if="current" class="number">{{formatNumber(current)}}</div>',
    '           <div v-if="!current" class="number">--</div>',
    '           <div class="label">{{ui.dictionary.kpis.current}}</div>',
    '       </div>',
    '   </div>',
    '   <div class="value-container">',
    '       <div class="value" :style="{ borderColor : colors.previous }">',
    '           <div v-if="previous" class="number">{{formatNumber(previous)}}</div>',
    '           <div v-if="!previous" class="number">--</div>',
    '           <div class="label">{{ui.dictionary.kpis.previous}}</div>',
    '       </div>',
    '   </div>',
    '   <div class="value-container">',
    '       <div class="value" :style="{ borderColor : colors.average }">',
    '           <div v-if="average" class="number">{{formatNumber(average)}}</div>',
    '           <div v-if="!average" class="number">--</div>',
    '           <div class="label">{{ui.dictionary.kpis.average}}</div>',
    '       </div>',
    '   </div>',
    '</article>'
    ].join('');
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash()
            },
            colors : {
                current : '#eeeeee',
                previous : '#eeeeee',
                average : '#eeeeee'
            }
        };
    };
    
    var methods = {
        determineColors : function() {
            this.colors = {
                current : '#eeeeee',
                previous : '#eeeeee',
                average : '#eeeeee'
            };
            var benchmark = null;
            
            if (this.average) {
                benchmark = this.average;
                
                this.colors.average = Config.get('environment') == 'test' ? '#ffd297' : '#c0f4e1';
                if (this.average < 0) {
                    this.colors.average  = '#ffcec9';
                }
            }
            
            
            if (this.previous) {
                if (benchmark === null) {
                    benchmark = this.previous;
                }
                
                this.colors.previous = Config.get('environment') == 'test' ? '#ffa630' : '#8eecca';
                if (this.previous < 0 || this.previous < benchmark) {
                    this.colors.previous = '#fb9d94';
                }
            }
            
            if (this.current) {
                if (benchmark === null) {
                    benchmark = 0;
                }
                
                this.colors.current = Config.get('environment') == 'test' ? '#2fabff' : '#52cd9f';
                if (this.current < 0 || this.current < benchmark) {
                    this.colors.current = '#EC7063';
                }
            }
        },
        
        formatNumber : function(value) {
            if (value > 999999999 || value < -999999999) {
                value = Math.round((value / 1000000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.billions;
            } else if (value > 999999 || value < -999999) {
                value = Math.round((value / 1000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.millions;
            } else if (value > 999 || value < -999) {
                value = Math.round((value / 1000) * 10) / 10 + ' ' + this.ui.dictionary.meta.thousands;
            } else {
                value = Math.round(value * 10) / 10;
            }
                    
            return String(value).replace('.', this.ui.dictionary.meta.decimalSymbol);
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['current', 'previous', 'average', 'label'],
        watch : {
            current : function(value) {
                this.determineColors();
            }
        },
        created : function() {
            this.determineColors();
        }
    });
});
