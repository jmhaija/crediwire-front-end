define([
    
    'Vue',
    'models/DictionaryModel',
    'collections/IndustryCollection'
    
], function(Vue, DictionaryModel, IndustyCollection) {
    var template = [
    '<article class="industry-code top">',
    '   <div class="working" v-show="ui.loading"></div>',
    '   <div v-show="!ui.loading && ui.error">',
    '       <div class="warn-color">{{ui.dictionary.industry.error}}</div>',
    '   </div>',
    '   <div v-show="!ui.loading && !ui.error">',
    '       <p><i class="cwi-info"></i> {{ui.dictionary.industry.description}}</p>',
    '       <label>{{ui.dictionary.industry.select}}</label>',
    '       <div class="container" v-show="!selected">',
    '           <div class="filter">',
    '               <div class="input-field" v-show="section == \'section\'">',
    '                   <input type="text" v-model="filter" :placeholder="ui.dictionary.industry.search">',
    '               </div>',
    '               <div class="breadcrumb" v-show="section != \'section\'">',
    '                    <span><a href="" v-on:click.prevent="gotoHome()"><i class="cwi-home"></i></a></span',
    '                   ><span v-if="trail.section" :title="trail.section.text"> &nbsp;&#10095; <a href="" v-on:click.prevent="gotoSection()">{{trail.section.text}}</a></span',
    '                   ><span v-if="trail.mainGroup" :title="trail.mainGroup.text"> &nbsp;&#10095; <a href="" v-on:click.prevent="gotoMainGroup()">{{trail.mainGroup.text}}</a></span',
    '                   ><span v-if="trail.group" :title="trail.group.text"> &nbsp;&#10095; <a href="" v-on:click.prevent="gotoGroup()">{{trail.group.text}}</a></span',
    '                   ><span v-if="trail.subGroup" :title="trail.subGroup.text"> &nbsp;&#10095; {{trail.subGroup.text}}</span>',
    '               </div>',
    '           </div>',
    '           <div class="list" :class="{ left : ui.list.left, right: ui.list.right, hidden : ui.list.hide }">',
    `               <div
                        class="code"
                        v-for="code in getCodes(codes)"
                        :class="{ selected : selected && selected.id == code.id }"
                    >`,
    `                   <span
                            data-test-id="setupCompanyIndustryDropdownOptionCheckbox"
                            class="check tooltip"
                            v-on:click="select(code)"
                            v-show="section != \'section\' || filter"
                        ><i class="cwi-approve"></i><div class="message right">{{ui.dictionary.industry.select}}</div></span`,
    `                   ><span
                            data-test-id="setupCompanyIndustryDropdownOption"
                            class="text"
                            :title="code.text"
                            v-on:click="drilldown(code)"
                        >{{code.text}}</span`,
    '                   ><span class="arrow" v-show="section != \'code\' && !filter"><i class="cwi-right" v-on:click="drilldown(code)"></i></span>',
    '               </div>',
    '           </div>',
    '       </div>',
    '       <div class="selected-code-display" v-show="selected"><span class="float-right no-margin" v-on:click="selected = null"><i class="cwi-close"></i></span><span>{{getSelectString()}}</span></div>',
    '       <p v-show="selected"><i class="cwi-info"></i> {{ui.dictionary.industry.confirmSelection}}</p>',
    `       <button
                data-test-id="selectIndustryButton"
                class="full-width"
                :class="{ primary : selected, disabled : !selected }"
                v-on:click="submitCode()"
            >{{ui.dictionary.industry.select}}</button>`,
    '   </div>',
    '</article>'
    ].join('');
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                error : false,
                list : {
                    left : false,
                    right: false,
                    hide : false
                }
            },
            codes : [],
            filter: '',
            selected: null,
            section: 'section',
            trail : {
                section: null,
                mainGroup: null,
                group: null,
                subGroup: null
            },
            listCount : 0,
            direction : null
        };
    };
    
    var methods = {
        init : function() {
            var scope = this;
            var ic = new IndustyCollection();
            
            ic.getIndustryCodes()
                .then(function(res) {
                    if (res.success) {
                        scope.codes = res.contents;
                    } else {
                        scope.ui.error = true;
                    }
                    
                    scope.ui.loading = false;
                });
        },
        
        gotoHome : function() {
            this.direction = 'up';
            
            this.animateToRight();
            this.section = 'section';
            this.trail.section = null;
            this.trail.mainGroup = null;
            this.trail.group = null;
            this.trail.subGroup = null;
        },
        
        gotoSection : function() {
            this.direction = 'up';
            
            this.animateToRight();
            this.section = 'mainGroup';
            this.trail.mainGroup = null;
            this.trail.group = null;
            this.trail.subGroup = null;
        },
        
        gotoMainGroup : function() {
            this.direction = 'up';
            
            this.animateToRight();
            this.section = 'group';
            this.trail.group = null;
            this.trail.subGroup = null;
        },
        
        gotoGroup : function() {
            this.direction = 'up';
            
            this.animateToRight();
            this.section = 'subGroup';
            this.trail.subGroup = null;
        },
        
        getSelectString : function() {
            if (!this.selected) {
                return this.ui.dictionary.industry.select;
            }
            
            return this.ui.dictionary.industry.selectCode.replace(':code', this.selected.text);
        },
        
        getCodes : function(codes) {
            var scope = this;
            this.listCount = 0;
            
            var list = codes.filter(function(code) {
                if (scope.filter) {
                    return (code.text.toLowerCase().indexOf(scope.filter.toLowerCase()) >= 0 || code.code.toLowerCase().indexOf(scope.filter.toLowerCase()) >= 0) && code.type != 'section';
                } else {
                    var prevSection = scope.getPreviousSection(scope.section);
                    return code.type == scope.section && (!scope.trail[prevSection] || !scope.trail[prevSection].id || scope.trail[prevSection].id == code[prevSection]);
                }
            });
            
            this.listCount = list.length;
            return list;
        },
        
        getPreviousSection : function(section) {
            var prevSection = null;
            
            switch(section) {
                case 'code':
                    prevSection = 'subGroup';
                    break;
                case 'subGroup':
                    prevSection = 'group';
                    break;
                case 'group':
                    prevSection = 'mainGroup';
                    break;
                case 'mainGroup':
                    prevSection = 'section';
            }
            
            return prevSection;
        },
        
        drilldown : function(code) {
            this.direction = 'down';
            
            if (code.type == 'code' || this.filter) {
                this.select(code);
                return true;
            }
            
            if (this.filter) {
                return false;
            }
            
            this.animateToLeft();
            switch(code.type) {
                case 'section':
                    this.section = 'mainGroup';
                    break;
                case 'mainGroup':
                    this.section = 'group';
                    break;
                case 'group':
                    this.section = 'subGroup';
                    break;
                case 'subGroup':
                    this.section = "code";
            }
            
            this.trail[code.type] = code;
        },
        
        animateToLeft : function() {
            this.ui.list.left = true;
            this.ui.list.hide = true;
            
            setTimeout(function() {
                this.ui.list.left = false;
                this.ui.list.right = true;
            }.bind(this), 150);
            
            setTimeout(function() {
                this.ui.list.hide = false;
                this.ui.list.right = false;
            }.bind(this), 300);
        },
        
        animateToRight : function() {
            this.ui.list.right = true;
            this.ui.list.hide = true;
            
            setTimeout(function() {
                this.ui.list.right = false;
                this.ui.list.left = true;
            }.bind(this), 150);
            
            setTimeout(function() {
                this.ui.list.hide = false;
                this.ui.list.left = false;
            }.bind(this), 300);
        },
        
        goBack : function() {
            this.direction = 'up';
            var prevSection = this.getPreviousSection(this.section);
            this.trail[this.section] = null;
            this.section = prevSection;
        },
        
        select : function(code) {
            if (this.selected && this.selected.id == code.id) {
                this.selected = null;
            } else {
                this.selected = code;
            }
        },
        
        submitCode : function() {
            if (!this.selected) {
                return false;
            }
            
            this.callback(this.selected);
        },
        
        closeAll : function() {
            this.selected = null;
            this.section = 'section';
            this.trail = {
                section: null,
                mainGroup: null,
                group: null,
                subGroup: null
            };
            this.filter = '';
            
            if (this.callback) {
                this.callback(false);
            }
        }
    };
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['callback'],
        mounted : function() {
            this.init();
        },
        watch : {
            listCount : function(val) {
                if (val === 1 && !this.trail.subGroup && !this.filter && this.direction == 'down') {
                    var list = this.getCodes(this.codes);
                    this.drilldown(list[0]);
                }
            }
        }
    });
});