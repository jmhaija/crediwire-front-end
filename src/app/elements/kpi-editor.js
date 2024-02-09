define([
    
    'Vue',
    'models/DictionaryModel',
    'models/AssetModel',
    'models/UnitModel',
    'models/ErpModel',
    'models/KpiModel',
    'collections/AccountCollection',
    'collections/UnitCollection',
    'elements/math-formula',
    'services/Validator',
    'elements/modals/modal'
], function(Vue, DictionaryModel, AssetModel, UnitModel, ErpModel, KpiModel, AccountCollection, UnitCollection, mathFormula, Validator, modal) {
    
    var template = [
    '<article class="dashboard-editor">',
        '<div v-show="!ui.showSettings">',
        '   <section class="name" v-on:click="ui.showSettings = true"><i class="cwi-settings-gear"></i> {{kpiCopy.name}} <span v-show="kpiTypes.length > 0">({{findUnitById(kpiCopy.unit).label}})</span></section>',
        
        '   <section class="equals">=</section>',
        
        '   <section class="formula" :class="{ error : ui.formulaError }"><math-formula :numerator="numerator" :denominator="denominator" :isPercent="isPercent" :easyview="easyview" :inDenom="inDenom" :init="ui.initialize"></math-formula></section>',
        
        '   <section class="evToggle"><div class="onoff-selector" :class="{ active : easyview }" v-on:click="easyview = !easyview">&#9679; &nbsp; {{ui.dictionary.overview.easyview}}</div></section>',
        
        '   <section class="operations">',
        '       <div class="delete">',
        '           <button class="warning" v-on:click="remove()">{{ui.dictionary.customKpis.del}}</button>',
        '       </div>',
        '       <div class="group">',
        '           <button v-on:click="insert(\'+\', \'o\')">+</button>',
        '           <button v-on:click="insert(\'-\', \'o\')">&ndash;</button>',
        '           <button v-on:click="insert(\'*\', \'o\')">×</button>',
        '           <button v-on:click="insert(\'/\', \'o\')">/</button>',
        '       </div>',
        '       <div class="group">',
        '           <button v-on:click="insert(\'(\', \'s\')">(</button>',
        '           <button v-on:click="insert(\')\', \'e\')">)</button>',
        '       </div>',
        '       <div class="group">',
        '           <button v-on:click="addDenom()">x/y</button>',
        '           <button v-on:click="togglePercent()">%</button>',
        '       </div>',
        '   </section>',
        
        '   <section class="inserts">',
        '       <div class="numberpad">',
        
        '           <div class="legend" v-show="!easyview">',
        '               <div v-show="!ui.showLegend" class="clickable"><a v-on:click="ui.showLegend = true">+ {{ui.dictionary.customKpis.showLegend}}</a></div>',
        '               <div v-show="ui.showLegend" class="clickable"><a v-on:click="ui.showLegend = false">&ndash; {{ui.dictionary.customKpis.hideLegend}}</a></div>',
        '               <div class="container" v-show="ui.showLegend">',
        
        '                   <div class="title">{{ui.dictionary.customKpis.aggregate}}</div>',
        
        '                   <div class="item"><span style="color: blue;">&#9679;</span> &nbsp; {{ui.dictionary.customKpis.aggregates.sum}}</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.aggregates.sumDefinition}}</div>',
        '                   <div class="item"><span style="color: orange;">&#9679;</span> &nbsp; {{ui.dictionary.customKpis.aggregates.avg}}</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.aggregates.avgDefinition}}</div>',
        '                   <div class="item"><span style="color: violet;">&#9679;</span> &nbsp; {{ui.dictionary.customKpis.aggregates.ult}}</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.aggregates.ultDefinition}}</div>',
        '                   <div class="item"><span style="color: brown;">&#9679;</span> &nbsp; {{ui.dictionary.customKpis.aggregates.ultcur}}</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.aggregates.ultcurDefinition}}</div>',
        
        '                   <div class="title extra">{{ui.dictionary.customKpis.type}}</div>',
        
        '                   <div class="item">{{ui.dictionary.customKpis.types.ba}} ({{ui.dictionary.customKpis.normal}})</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.types.baDefinition}}</div>',
        '                   <div class="item" style="text-decoration: underline;">{{ui.dictionary.customKpis.types.ch}} ({{ui.dictionary.customKpis.underlined}})</div>',
        '                   <div class="definition">{{ui.dictionary.customKpis.types.chDefinition}}</div>',
        
        '               </div>',
        '           </div>',
        
        '           <div class="row">',
        '               <button v-on:click="insert(\'7\', \'n\')">7</button>',
        '               <button v-on:click="insert(\'8\', \'n\')">8</button>',
        '               <button v-on:click="insert(\'9\', \'n\')">9</button>',
        '           </div>',
        '           <div class="row">',
        '               <button v-on:click="insert(\'4\', \'n\')">4</button>',
        '               <button v-on:click="insert(\'5\', \'n\')">5</button>',
        '               <button v-on:click="insert(\'6\', \'n\')">6</button>',
        '           </div>',
        '           <div class="row">',
        '               <button v-on:click="insert(\'1\', \'n\')">1</button>',
        '               <button v-on:click="insert(\'2\', \'n\')">2</button>',
        '               <button v-on:click="insert(\'3\', \'n\')">3</button>',
        '           </div>',
        '           <div class="row">',
        '               <button v-on:click="insert(\'.\', \'d\')">.</button>',
        '               <button v-on:click="insert(\'0\', \'n\')">0</button>',
        '               <button v-on:click="insert(\'~\', \'i\')">-</button>',
        '           </div>',
        '       </div><div class="variables">',
        '           <div class="working" v-show="ui.loading"></div>',
        
        '           <div class="filter" v-show="!ui.loading">',
        '               <input type="search" v-model="accountFilter" :placeholder="ui.dictionary.customKpis.filter">',
        '           </div>',
        
        '           <nav class="tabs" v-show="!ui.loading">',
        '               <ul>',
        '                   <li :class="{ active : varSection == \'mapped\' }"><a v-on:click="varSection = \'mapped\'">{{ui.dictionary.customKpis.mapped}}</a></li>',
        '                   <li :class="{ active : varSection == \'account\' }" v-show="!easyview"><a v-on:click="varSection = \'account\'">{{ui.dictionary.customKpis.account}}</a></li>',
        '                   <li :class="{ active : varSection == \'static\' }"><a v-on:click="varSection = \'static\'">{{ui.dictionary.customKpis.static}}</a></li>',
        '               </ul>',
        '           </nav>',
        
        '           <div class="container" v-show="!ui.loading">',
        
        '               <div v-show="varSection == \'mapped\'">',
        '                   <div v-for="account in filterAccounts(vars.mapping)"',
        '                        class="account"',
        '                        :class="{ levelOne : account.level == 1 && accountFilter.length === 0, levelTwo : account.level == 2 && accountFilter.length === 0}"',
        '                        v-show="accountFilter.length > 0 || account.level == 0 || (showMapping[account.parentAcct] && (account.parentAcct.grandparent === null || showMapping[account.grandparent]) )">',
        '                       <div class="insert">',
        '                           <select v-model="aggregate[account.type]" v-show="!easyview"><option v-for="a in aggregates" :value="a">{{ui.dictionary.customKpis.aggregates[a]}}</option></select>',
        '                           <select v-model="type[account.type]" v-show="!easyview"><option v-for="t in types" :value="t">{{ui.dictionary.customKpis.types[t]}}</option></select>',
        '                           <a v-on:click="insert(account.symbol+\'|\'+aggregate[account.type]+\'|\'+type[account.type], \'v\')">{{ui.dictionary.customKpis.insert}}</a>',
        '                       </div>',
        '                       <span class="clickable" v-show="account.hasChildren && accountFilter.length === 0" v-on:click="toggleMappingVisbility(account.title)">',
        '                           <span v-show="!showMapping[account.title]">+</span>',
        '                           <span v-show="showMapping[account.title]">&ndash;</span>',
        '                           {{account.title}}',
        '                       </span>',
        '                       <span v-show="!account.hasChildren || accountFilter.length > 0">',
        '                           {{account.title}}',
        '                       </span>',
        '                   </div>',
        '               </div>',
        
        '               <div v-show="varSection == \'account\' && !easyview">',
        '                   <div v-for="account in filterAccounts(vars.accounts)"',
        '                        class="account">',
        '                       <div class="insert">',
        '                           <select v-model="aggregate[account.type]" v-show="!easyview"><option v-for="a in aggregates" :value="a">{{ui.dictionary.customKpis.aggregates[a]}}</option></select>',
        '                           <select v-model="type[account.type]" v-show="!easyview"><option v-for="t in types" :value="t">{{ui.dictionary.customKpis.types[t]}}</option></select>',
        '                           <a v-on:click="insert(account.symbol+\'|\'+aggregate[account.type]+\'|\'+type[account.type], \'v\')">{{ui.dictionary.customKpis.insert}}</a>',
        '                       </div>',
        '                       {{account.title}}',
        '                   </div>',
        '               </div>',
        
        '               <div v-show="varSection == \'static\'">',
        '                   <div v-for="account in filterAccounts(vars.static)"',
        '                        class="account">',
        '                       <div class="insert"><a v-on:click="insert(account.symbol, \'v\')">{{ui.dictionary.customKpis.insert}}</a></div>',
        '                       <span class="tooltip"><i class="cwi-info"></i><div class="message right">{{account.desc}}</div></span> {{account.title}}',
        '                   </div>',
        '               </div>',
        '           </div>',
        '       </div>',
        
        '   </section>',
        
        '</div>',
        
        
        '<div v-show="ui.showSettings" class="settings">',
        '   <section class="back">',
        '       <a v-on:click="ui.showSettings = false"><i class="cwi-left"></i> {{ui.dictionary.customKpis.builder}}</a>',
        '   </section>',
        '   <section class="name-field">',
        '       <div class="input-field">',
        '           <input type="text" v-model="kpiCopy.name" v-bind:class="{ invalid : !validation.name }" v-on:keyup="validateName()" v-on:blur="validateName(true)">',
        '           <label v-bind:class="{ filled: kpiCopy.name.length > 0 }">{{ui.dictionary.customKpis.name}}</label>',
        '           <div class="warning" v-bind:class="{ show : !validation.name }">{{ui.dictionary.general.validation.generic}}</div>',
        '           <div class="warning" v-bind:class="{ show : nameError }">{{ui.dictionary.customKpis.kpiExists}}</div>',
        '       </div>',
        '   </section><section class="description-field">',
        '       <div class="input-field">',
        '           <input type="text" v-model="kpiCopy.description">',
        '           <label v-bind:class="{ filled: kpiCopy.description !== null && kpiCopy.description.length > 0 }">{{ui.dictionary.customKpis.description}}</label>',
        '       </div>',
        '   </section>',
        '   <section class="inverse">',
        '       <div class="checkbox-field">',
        '           <label><input type="checkbox" v-model="kpiCopy.inverse"> <i></i> {{ui.dictionary.customKpis.inverse}}</label>',
        '       </div>',
        '   </section>',
        
        '   <section class="units">',
        '       <h4>{{ui.dictionary.customKpis.unit}}</h4>',
        '       <div class="container">',
        '           <div class="radio-field">',
        '               <label><input type="radio" v-model="kpiCopy.unit" :value="findUnitByType(\'currency\').id"> <i></i> {{findUnitByType(\'currency\').label}}</label>',
        '           </div>',
        '           <div class="radio-field">',
        '               <label><input type="radio" v-model="kpiCopy.unit" :value="findUnitByType(\'percent\').id"> <i></i> {{findUnitByType(\'percent\').label}}</label>',
        '           </div>',
        '           <div class="radio-field">',
        '               <label><input type="radio" v-model="kpiCopy.unit" :value="findUnitByType(\'ratio\').id"> <i></i> {{findUnitByType(\'ratio\').label}}</label>',
        '           </div>',
    
        '           <hr>',
        
        '           <div v-for="unit in filterUnits(kpiTypes)" class="radio-field">',
        '               <div class="delete-unit tooltip" v-show="kpiCopy.unit != unit.id" v-on:click="deleteUnit(unit.id)"><i class="cwi-close"></i> <div class="message left">{{ui.dictionary.customKpis.delete}} {{unit.label}}</div></div>',
        '               <label><input type="radio" v-model="kpiCopy.unit" :value="unit.id"> <i></i> {{unit.label}}</label>',
        '           </div>',
        '           <div class="input-field" v-show="!ui.creatingUnit">',
        '               <form v-on:submit.prevent="createNewUnit(newUnit.value, \'custom\')">',
        '                   <div class="create-field">',
        '                       <input type="text" v-model="newUnit.value" v-bind:class="{ invalid : !newUnit.valid }" v-on:keyup="validateUnit()" v-on:blur="validateUnit(true)">',
        '                       <label v-bind:class="{ filled: newUnit.value.length > 0 }">{{ui.dictionary.customKpis.newUnit}}</label>',
        '                       <div class="warning" v-bind:class="{ show : !newUnit.valid }">{{ui.dictionary.general.validation.generic}}</div>',
        '                       <div class="warning" v-bind:class="{ show : newUnit.error }">{{ui.dictionary.customKpis.newUnitError}}</div>',
        '                   </div><div class="submit-button">',
        '                       <button class="primary" type="submit">{{ui.dictionary.general.go}}</button>',
        '                   </div>',
        '               </form>',
        '           </div>',
        '           <div class="working" v-show="ui.creatingUnit"></div>',
        '       </div>',
        '   </section><section class="images">',
        '       <h4>{{ui.dictionary.customKpis.image}}</h4>',
        '       <div :class="{ active : kpiCopy.symbol == \'activity.png\'}" v-on:click="setSymbol(\'activity.png\')"><div class="container"><img :src="getImage(\'/assets/img/easyview/gear_orange_high.svg\')"></div></div>',
        '       <div :class="{ active : kpiCopy.symbol == \'liquidity.png\'}" v-on:click="setSymbol(\'liquidity.png\')"><div class="container"><img :src="getImage(\'/assets/img/easyview/scale_equal_black.svg\')"></div></div>',
        '       <div :class="{ active : kpiCopy.symbol == \'profit.png\'}" v-on:click="setSymbol(\'profit.png\')"><div class="container"><img :src="getImage(\'/assets/img/easyview/pig_orange_high.svg\')"></div></div>',
        '       <div :class="{ active : kpiCopy.symbol == \'solvency.png\'}" v-on:click="setSymbol(\'solvency.png\')"><div class="container"><img :src="getImage(\'/assets/img/easyview/factory_orange_high.svg\')"></div></div>',
        '   </section>',
        '</div>',
        
        
        '<section class="toolbar">',
        '    <div class="save">',
        '        <button class="primary" v-on:click="saveKpi()" v-show="!ui.saving">{{ui.dictionary.customKpis.save}}</button>',
        '        <span class="working" v-show="ui.saving"></span>',
        '    </div>',
        '    <button class="warning" v-show="kpi && !ui.deletingKpi" v-on:click="deleteKpi()">{{ui.dictionary.customKpis.delete}}</button>',
        '    <div class="working" v-show="ui.deletingKpi"></div>',
        '</section>',
        
    '</article>'
    ].join('');
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                showSettings : false,
                loading : true,
                initialize : false,
                creatingUnit : false,
                deletingKpi : false,
                saving : false,
                formulaError : false,
                showLegend : false
            },
            validation : {
                name : true
            },
            nextO : 'nsvi',
            onDecimal : false,
            blockDecimal : false,
            onOp : false,
            openPar : 0,
            numerator : [],
            denominator : [],
            easyview : true,
            lastType : null,
            kpiType : null,
            kpiTypes : [],
            isPercent : false,
            inDenom : false,
            mappingIdMap : {},
            mappingNameMap : {},
            mappingChildrenTracker : {},
            mappingLastParent : null,
            mappingLastTopLevel : null,
            mappingLastSubCat : null,
            accountIdMap : {},
            accountNameMap : {},
            varSection : 'mapped',
            vars : {
                mapping : [],
                accounts: [],
                static : []
            },
            type : {
                pal : 'ch',
                bal : 'ba'
            },
            aggregate : {
                pal : 'sum',
                bal : 'ultcur'
            },
            aggregates: ['sum', 'avg', 'ult', 'ultcur'],
            types: ['ba', 'ch'],
            showMapping : [],
            kpiCopy : {
                denominator : '',
                description : '',
                inverse : false,
                name : 'myKPI',
                numerator : '',
                percentageMultiplier : false,
                symbol : null,
                unit : null
            },
            newUnit : { value : '', valid : true, error : false },
            unitToBeDeleted : null,
            nameError : false,
            accountFilter : ''
        };
    };
    
    
    var methods = {
        init : function() {
            if (this.kpi) {
                this.kpiCopy = this.kpi;
                this.kpiCopy.inverse = !this.kpi.expectPositive;
                
                if (this.kpiCopy.unit.id) {
                    this.kpiCopy.unit = this.kpiCopy.unit.id;
                }
                
                this.isPercent = this.kpiCopy.percentageMultiplier;
                
                this.numerator = !this.kpi.numerator || this.kpi.numerator == '' ? [] : this.kpi.numerator.split(' ');
                this.denominator = !this.kpi.denominator || this.kpi.denominator == '' ? [] : this.kpi.denominator.split(' ');
                
                var lastEl = this.numerator[this.numerator.length - 1];
                
                if (this.denominator.length > 0) {
                    this.inDenom = true;
                    lastEl = this.denominator[this.denominator.length - 1];
                }
                
                this.whatsNext(this.getType(lastEl));
            } else {
                this.ui.initialize = true;
            }
            
            this.getAccounts();
            this.getUnits();
        },
        
        
        setSymbol : function(image) {
            if (this.kpiCopy.symbol == image) {
                this.kpiCopy.symbol = null
            } else {
                this.kpiCopy.symbol = image;
            }
        },
        
        toggleMappingVisbility : function(title) {
            this.showMapping[title] = !this.showMapping[title];
            this.varSection = 'account';
            this.varSection = 'mapped';
        },
        
        
        
        getAccounts : function() {
            var scope = this;
            var accounts = new AccountCollection(true);
            accounts.getAccounts()
                .then(function(res) {
                    if (res.success) {
                        scope.formatAccounts(res.data);
                        scope.ui.loading = false;
                    }
                });
        },
        
        
        getUnits : function() {
            var scope = this;
            var units = new UnitCollection();
            units.getUnits()
                .then(function(res) {
                    if (res.contents && res.contents.length > 0) {
                        scope.kpiTypes = res.contents;
                        
                        //If not unit in KPI assign one
                        if (!scope.kpiCopy.unit) {
                            scope.kpiTypes.forEach(function(unit) {
                                if (unit.type == 'currency') {
                                    scope.kpiCopy.unit = unit.id;
                                }
                            });
                        }
                        
                        scope.createFirstUnits(true);
                    } else if (res.contents) {
                        
                        //Create units
                        scope.createFirstUnits();
                        
                    }
                });
        },
        
        
        filterUnits : function(list) {
            return list.filter(function(item) {
                return item.type == 'custom';
            });
        },
        
        createFirstUnits : function(doCheck) {
            var currencySymbol = this.ui.dictionary.meta.currency;
            
            if (ErpModel.getErp() && ErpModel.getErp().currency) {
                currencySymbol = ErpModel.getErp().currency;
            }
            
            if (!doCheck || !this.findUnitByType('currency')) {
                this.createNewUnit(currencySymbol, 'currency');
            }
            
            if (!doCheck || !this.findUnitByType('percent')) {
                 this.createNewUnit('%', 'percent');
            }
            
            if (!doCheck || !this.findUnitByType('ratio')) {
                 this.createNewUnit('x', 'ratio');
            }
        },
        
        
        createNewUnit : function(label, type) {
            if (label.length === 0) {
                return false;
            }
            
            this.ui.creatingUnit = true;
            this.newUnit.error = false;
            this.newUnit.valid = true;
            
            var scope = this;
            var um = new UnitModel();
            um.create({
                label : label,
                type : type
            }).then(function(unit) {
                if (unit.id) {
                    scope.kpiTypes.push(unit);
                    scope.newUnit.value = '';
                    
                    if (unit.type == 'currency') {
                        scope.kpiCopy.unit = unit.id;
                    }
                    
                } else {
                    scope.newUnit.error = true;    
                }
                
                scope.ui.creatingUnit = false;
            });
        },
        
        
        deleteUnit : function(id, confirm) {
            if (!confirm) {
                this.unitToBeDeleted = id;
                this.showConfirmDeleteUnitDialog();
                return false;
            }
            
            var index = this.findUnitIndexById(id);
            this.kpiTypes.splice(index, 1);
            this.$modal.hide('dialog');

            var um = new UnitModel(id);
            um.delete();
        },
        
        
        formatAccounts : function(accounts) {
            var scope = this;
            
            //Populate mapping variables
            for (var m = 0; m < accounts.map.length; m++) {
                var showSymbol = '$' + accounts.map[m].reference;
            
                scope.mappingIdMap[showSymbol] = '$' + accounts.map[m].shortId;
                scope.mappingNameMap[accounts.map[m].shortId] = showSymbol;
    
                var hasChildren = false;
                if ((accounts.map[m + 1] !== undefined && accounts.map[m].parentZero === null && accounts.map[m + 1].parentZero == accounts.map[m].reference) ||
                    (accounts.map[m + 1] !== undefined && accounts.map[m].parentOne === null && accounts.map[m + 1].parentOne == accounts.map[m].reference)) {

                    hasChildren = true;
                    scope.mappingChildrenTracker[m] = '';
                    scope.mappingLastParent = m;
                    if (accounts.map[m].level == 0) {
                        scope.mappingLastTopLevel = m;
                    }
                }
    
                if (scope.mappingChildrenTracker[scope.mappingLastParent] !== undefined) {
                    scope.mappingChildrenTracker[scope.mappingLastParent] = scope.mappingChildrenTracker[scope.mappingLastParent] + ' ' + scope.ui.dictionary.kpiCategories[accounts.map[m].reference];
    
                    if (accounts.map[m].level == 2) {
                        scope.mappingChildrenTracker[scope.mappingLastTopLevel] = '_sub_' + (scope.mappingChildrenTracker[scope.mappingLastTopLevel] + ' ' + scope.ui.dictionary.kpiCategories[accounts.map[m].reference]).replace('_sub_', '');
                    }
                }
    
                var mapObject = {
                    title: scope.ui.dictionary.kpiCategories[accounts.map[m].reference],
                    desc: '',
                    symbol: showSymbol,
                    level: accounts.map[m].level,
                    parentAcct: accounts.map[m].parentOne ? scope.ui.dictionary.kpiCategories[accounts.map[m].parentOne] : scope.ui.dictionary.kpiCategories[accounts.map[m].parentZero],
                    grandparent: scope.ui.dictionary.kpiCategories[accounts.map[m].parentZero],
                    hasChildren: hasChildren,
                    childrenBlob: '',
                    type: accounts.map[m].type
                };
    
                scope.vars.mapping.push(mapObject);
            }
            
            
            //Populate keyword search (children blob)
            for (var key in scope.mappingChildrenTracker) {
                var value = scope.mappingChildrenTracker[key];
                
                scope.vars.mapping[key].childrenBlob = value;

                if (value.indexOf('_sub_') === 0) {
                    scope.mappingLastSubCat = key;
                } else if (scope.mappingLastSubCat !== null) {
                    scope.vars.mapping[scope.mappingLastSubCat].childrenBlob = (scope.vars.mapping[scope.mappingLastSubCat].childrenBlob + value).replace('_sub_', '');
                }
            }
            
            
            //Populate account variables
            for (var a = 0; a < accounts.chartOfAccounts.length; a++) {
                if (accounts.chartOfAccounts[a].type == 'pal' || accounts.chartOfAccounts[a].type == 'bal') {
                    showSymbol = '#' + (accounts.chartOfAccounts[a].number ? accounts.chartOfAccounts[a].number : accounts.chartOfAccounts[a].name.substr(0, 5));
    
                    scope.accountIdMap[showSymbol] = '#' + accounts.chartOfAccounts[a].shortId;
                    scope.accountNameMap[accounts.chartOfAccounts[a].shortId] = showSymbol;
    
                    scope.vars.accounts.push({
                        title: accounts.chartOfAccounts[a].name,
                        desc: '',
                        symbol: showSymbol,
                        type: accounts.chartOfAccounts[a].type
                    });
                }
            }
            
            
            //Populate static variables
            scope.vars.static = [
                {
                    title: scope.ui.dictionary.staticVariables.days,
                    desc: scope.ui.dictionary.staticVariables.definitions.days,
                    symbol: '@days'
                },
                {
                    title: scope.ui.dictionary.staticVariables.weeks,
                    desc: scope.ui.dictionary.staticVariables.definitions.weeks,
                    symbol: '@weeks'
                },
                {
                    title: scope.ui.dictionary.staticVariables.months,
                    desc: scope.ui.dictionary.staticVariables.definitions.months,
                    symbol: '@months'
                },
                {
                    title: scope.ui.dictionary.staticVariables.years,
                    desc: scope.ui.dictionary.staticVariables.definitions.years,
                    symbol: '@years'
                },
                {
                    title: scope.ui.dictionary.staticVariables.daysCurrent,
                    desc: scope.ui.dictionary.staticVariables.definitions.daysCurrent,
                    symbol: '@daysCurrent'
                },
                {
                    title: scope.ui.dictionary.staticVariables.weeksCurrent,
                    desc: scope.ui.dictionary.staticVariables.definitions.weeksCurrent,
                    symbol: '@weeksCurrent'
                },
                {
                    title: scope.ui.dictionary.staticVariables.monthsCurrent,
                    desc: scope.ui.dictionary.staticVariables.definitions.monthsCurrent,
                    symbol: '@monthsCurrent'
                },
                {
                    title: scope.ui.dictionary.staticVariables.yearsCurrent,
                    desc: scope.ui.dictionary.staticVariables.definitions.yearsCurrent,
                    symbol: '@yearsCurrent'
                },
            ];
            
            
            scope.convertShortIds();
        },
        
        
        
        convertShortIds : function() {
            var scope = this;
            
            this.numerator.forEach(function (item, index, obj) {
                if (item.indexOf('#') === 0) {
                    var idIndex = item.substring(1, item.indexOf('|'));
                    var repStr = scope.accountNameMap[idIndex];

                    scope.numerator[index] = item.replace('#' + idIndex, repStr);
                } else if (item.indexOf('$') === 0) {
                    var idIndex = item.substring(1, item.indexOf('|'));
                    var repStr = scope.mappingNameMap[idIndex];

                    scope.numerator[index] = item.replace('$' + idIndex, repStr);
                }
            });


            this.denominator.forEach(function (item, index, obj) {
                if (item.indexOf('#') === 0) {
                    var idIndex = item.substring(1, item.indexOf('|'));
                    var repStr = scope.accountNameMap[idIndex];

                    scope.denominator[index] = item.replace('#' + idIndex, repStr);
                } else if (item.indexOf('$') === 0) {
                    var idIndex = item.substring(1, item.indexOf('|'));
                    var repStr = scope.mappingNameMap[idIndex];

                    scope.denominator[index] = item.replace('$' + idIndex, repStr);
                }
            });
            
            this.ui.initialize = true;
        },
        
        
        
        validateName : function(force) {
            this.nameError = false;
            
            if (force || !this.validation.name) {
                this.validation.name = Validator.minLength(this.kpiCopy.name, 2);
            }
            
            return this.validation.name;
        },
        
        
        validateUnit : function(force) {
            if (force || !this.newUnit.valid) {
                this.newUnit.valid = Validator.minLength(this.newUnit.value, 2);
            }
            
            return this.newUnit.valid;
        },
        
        
        getType : function(el) {
            if (el === undefined) {
                return false;
            } else if (el.indexOf('@') === 0 || el.indexOf('#') === 0 || el.indexOf('$') === 0) {
                return 'v';
            } else if (el == '+' || el == '-' || el == '*' || el == '/') {
                return 'o';
            } else if (el == '(') {
                return 's';
            } else if (el == ')') {
                return 'e';
            } else if (el == '.') {
                return 'd';
            } else if (el == '~') {
                return 'i';
            } else {
                return 'n';
            }
        },
        
        remove : function() {
            this.ui.formulaError = false;
            var lastEl;
            var delEl;

            //Handle element deletion
            if (this.inDenom && this.denominator.length === 0) {
                this.inDenom = false;
                lastEl = this.numerator[this.numerator.length - 1];
            } else if (this.inDenom) {
                delEl = this.denominator.pop();
                lastEl = this.denominator[this.denominator.length - 1];
            } else if (this.numerator.length === 0) {
                return false;
            } else {
                delEl = this.numerator.pop();
                lastEl = this.numerator[this.numerator.length - 1];
            }

            //Determine what the last element is
            if (lastEl === undefined) {
                this.nextO = 'nvsi';
            } else {
                this.whatsNext(this.getType(lastEl));
            }

            //Handle paranthesis
            if (this.getType(delEl) == 'e') {
                this.openPar++;
            } else if (this.getType(delEl) == 's') {
                this.openPar--;
            }

            
            //Handle decimals
            if (this.getType(delEl) == 'd') {
                this.blockDecimal = false;
            }

            //Determine if the last character was an operator
            if (this.getType(lastEl) == 'o' || this.getType(lastEl) == 'i') {
                this.onOp = true;
            } else {
                this.onOp = false;
            }

        },
        
        insert : function(value, type) {
            this.ui.formulaError = false;
            
            //Next object type not allowed
            if ((this.nextO.indexOf(type) < 0) ||
                (this.onDecimal && type != 'n') ||
                (this.blockDecimal && type == 'd') ||
                (this.openPar === 0 && type == 'e')
            ) {
                return false;
            }
            
            
            //Handle decimal input
            if (type == 'd') {
                this.onDecimal = true;
                this.blockDecimal = true;
            } else if (type == 'n') {
                this.onDecimal = false;
            } else if (type != 'n') {
                this.blockDecimal = false;
            } else {
                this.onDecimal = false;
            }
            
            
            //Handle parenthesis input
            if (type == 's') {
                this.openPar++;
            } else if (type == 'e') {
                this.openPar--;
            }
            
            
            //Determine if last button was an operator
            if (type == 'o' || type == 'i') {
                this.onOp = true;
            } else {
                this.onOp = false;
            }
            
            
            //Determine what insertion types are allowed next
            this.whatsNext(type);
            
            
            //Insert in numerator or denominator as appropriate
            if (this.inDenom) {
                this.denominator.push(value);
            } else {
                this.numerator.push(value);
            }
        },
        
        
        whatsNext : function(type) {
            if (type == 'n') {
                this.nextO = 'node';
            } else if (type == 'v') {
                this.nextO = 'oe';
            } else if (type == 'o') {
                this.nextO = 'nsvi';
            } else if (type == 's') {
                this.nextO = 'nvsi';
            } else if (type == 'e') {
                this.nextO = 'oe';
            } else if (type == 'd') {
                this.nextO = 'n';
            } else if (type == 'i') {
                this.nextO = 'nv';
            }
        },
        
        addDenom : function() {
            if (this.numerator.length === 0 || this.openPar > 0) {
                return false;
            }

            this.inDenom = true;
            this.nextO = 'nvsi';

            this.onDecimal = false;
            this.blockDecimal = false;
        },
        
        togglePercent : function() {
            if (this.isPercent) {
                this.kpiType = this.lastType;
                this.isPercent = false;
            } else {
                var percentUnit = this.findUnitByLabel('%');
                this.lastType = this.kpiType;
                this.kpiType = percentUnit ? percentUnit : this.kpiTypes[1];
                this.isPercent = true;
            }
        },
        
        
        findUnitIndexById : function (id) {
            var count = 0;

            while (count < this.kpiTypes.length) {
                if (id == this.kpiTypes[count].id) {
                    return count;
                }

                count++;
            }

            return false;
        },
        
        
        findUnitByLabel : function(label) {
            var count = 0;

            while (count < this.kpiTypes.length) {
                if (label == this.kpiTypes[count].label) {
                    return this.kpiTypes[count];
                }

                count++;
            }

            return false;
        },
        
        
        findUnitById : function(id) {
            var count = 0;

            while (count < this.kpiTypes.length) {
                if (id == this.kpiTypes[count].id) {
                    return this.kpiTypes[count];
                }

                count++;
            }

            return false;
        },
        
        
        findUnitByType : function(type) {
            var count = 0;

            while (count < this.kpiTypes.length) {
                if (type == this.kpiTypes[count].type) {
                    return this.kpiTypes[count];
                }

                count++;
            }

            return false;
        },
        
        
        getImage : function(img) {
            return new AssetModel(img).path;
        },
        
        
        saveKpi : function() {
            this.nameError = false;
            
            if (!this.validateName()) {
                this.ui.showSettings = true;
                return false;
            }
            
            if (this.numerator.length === 0 || this.openPar > 0 || this.onOp) {
                this.ui.showSettings = false;
                this.ui.formulaError = true;
                return false;
            }
            
            
            var scope = this;
            this.ui.saving = true;
            
            
            var saveNumerator = [];
            var saveDenominator = [];

            scope.numerator.forEach(function (item) {
                item = item.split('~').join(' -');
                if (item.indexOf('#') === 0) {
                    var idIndex = item.substr(0, item.indexOf('|'));
                    var repStr = scope.accountIdMap[idIndex];
                    saveNumerator.push(item.replace(idIndex, repStr));
                } else if (item.indexOf('$') === 0) {
                    var idIndex = item.substr(0, item.indexOf('|'));
                    var repStr = scope.mappingIdMap[idIndex];
                    saveNumerator.push(item.replace(idIndex, repStr));
                } else {
                    saveNumerator.push(item);
                }
            });

            scope.denominator.forEach(function (item) {
                item = item.split('~').join(' -');
                if (item.indexOf('#') === 0) {
                    var idIndex = item.substr(0, item.indexOf('|'));
                    var repStr = scope.accountIdMap[idIndex];
                    saveDenominator.push(item.replace(idIndex, repStr));
                } else if (item.indexOf('$') === 0) {
                    var idIndex = item.substr(0, item.indexOf('|'));
                    var repStr = scope.mappingIdMap[idIndex];
                    saveDenominator.push(item.replace(idIndex, repStr));
                } else {
                    saveDenominator.push(item);
                }
            });

            
            this.kpiCopy.numerator = saveNumerator.join(' ');
            this.kpiCopy.denominator = saveDenominator.join(' ');
            this.kpiCopy.percentageMultiplier = this.isPercent;
            this.kpiCopy.expectPositive = !this.kpiCopy.inverse;
            //this.kpiCopy.unit = this.kpiCopy.unit.id;
            
            if (this.kpiCopy.id) {
                
                var km = new KpiModel(this.kpiCopy.id);
                km.save(this.kpiCopy)
                    .then(function(res) {
                        if (res.id) {
                            scope.callback();
                        }
                    });
                    
            } else {
                
                var km = new KpiModel();
                km.create(this.kpiCopy)
                    .then(function(res) {
                        if (res.id) {
                            scope.callback(res);
                        } else {
                            scope.ui.saving = false;
                            scope.ui.showSettings = true;
                            scope.nameError = true;
                        }
                    });
            }
        },
        
        
        deleteKpi : function(confirm) {
            if (!confirm) {
                this.showDeleteKpiDialog();
                return false;
            }
            
            var scope = this;
            scope.ui.deletingKpi = true;
            scope.$modal.hide('dialog');
            var km = new KpiModel(this.kpiCopy.id);
            km.delete()
                .then(function(res) {
                    scope.callback(true);
                });
        },

        showDeleteKpiDialog : function () {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.customKpis.confirmDeleteKpi,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.customKpis.declineDelete,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.customKpis.confirmDelete,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteKpi(true); this.$modal.hide('dialog')}
                    }
                ]
            });
        },
        
        filterAccounts : function(accounts) {
            if (this.accountFilter.length > 0) {
                return accounts.filter(function(account) {
                    var searchStrings = this.accountFilter.split(' ');
                    var found = false;
                    
                    for (var i = 0; i < searchStrings.length; i++) {
                        if (searchStrings[i].length > 0 && account.title !== null && account.title !== undefined && account.title.length > 0) {
                            if (account.title.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                                found = true;
                            }
                        }
                    }
                    
                    return found;
                }, this);
            }
            
            return accounts;
        },

        showConfirmDeleteUnitDialog : function () {
            document.getElementById('modals-container').style.display = "none";
            this.$modal.show('dialog', {
                text: this.ui.dictionary.customKpis.confirmDeleteUnit,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.customKpis.declineDelete,
                        class: 'highlighted-text',
                        handler: () => {document.getElementById('modals-container').style.display = "block"}
                    },
                    {
                        title: this.ui.dictionary.customKpis.confirmDelete,
                        class: 'warning',
                        handler: () => { this.deleteUnit(this.unitToBeDeleted, true); this.$modal.hide('dialog'); document.getElementById('modals-container').style.display = "block";}
                    }
                ]
            });
        }
    };

    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['kpi', 'callback'],
        components : {
            'math-formula' : mathFormula
        },
        mounted : function() {
            this.init();
        },
        watch : {
            'kpiCopy.unit' : function(u) {
                var unit = this.findUnitById(u);
                if (unit.type == 'percent' && !this.isPercent) {
                    this.isPercent = true;
                } 
            }
        }
    });
});
