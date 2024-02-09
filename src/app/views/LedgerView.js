/* global saveAs */

define([

    'Vue',
    'FileSaver',
    'moment',
    'models/DictionaryModel',
    'collections/LedgerEntryCollection',
    'services/NumberFormatter',
    'models/DateRangeModel',
    'elements/date-field',
    'services/Toast'

], function (Vue, FileSaver, moment, DictionaryModel, LedgerEntryCollection, NumberFormatter, DateRangeModel, dateField, Toast) {
    var template = [
    '<article class="ledger" v-on:click="closeMenus()">',
    '   <div class="open-icon tooltip" :class="{longTitleTransaction : account.name.length > 65}"><h1>{{account.name}}</h1><div class="message right white-message tooltip-transaction" v-show="account.name.length > 65">{{account.name}}</div></div>',
    '       <section v-show="ui.loading">',
    '       <div class="working"></div>',
    '   </section>',
    '   <section>{{ui.dictionary.ledger.journalEntriesNotIncluded}}</section>',
    '   <section v-show="!ui.loading">',

    '       <div class="entry-count">',
    '           {{ui.dictionary.ledger.totalEntries}}: {{totalEntries}}',
    '       </div>',

    '       <div class="ledger-toolbar">',
    '           {{ui.dictionary.ledger.showing}}',
    '           <div class="inline-field">',
    '               <date-field :model="fromDate" :onDateSelect="selectFromDate"></date-field>',
    '           </div>',
    '           {{ui.dictionary.ledger.to}}',
    '           <div class="inline-field">',
    '               <date-field :model="toDate" :onDateSelect="selectToDate"></date-field>',
    '           </div>',

    '           {{ui.dictionary.ledger.values}}',

    '           <span class="clickable" v-show="min === null" v-on:click="min = 0">{{ui.dictionary.ledger.any}}</span>',
    '           <span v-show="min !== null"><input type="number" v-model="min"></span>',

    '           {{ui.dictionary.ledger.and}}',

    '           <span class="clickable" v-show="max === null" v-on:click="max = 0">{{ui.dictionary.ledger.any}}</span>',
    '           <span v-show="max !== null"><input type="number" v-model="max"></span>',

    '           <button class="primary" v-on:click="page = 1; getAccountEntries(account);">{{ui.dictionary.general.go}}</button>',
    '           <button v-on:click="resetFilters()">{{ui.dictionary.ledger.clear}}</button>',


    '           <div class="export-menu">',
    '               <i class="cwi-save export" v-on:click.stop="ui.exportOptions = true" v-if="!isUnderEditPresentation"></i>',
    '               <div class="selector inline" v-if="!isUnderEditPresentation">',
    '                   <div class="label" v-on:click.stop="ui.exportOptions = true">',
    '                       <span>{{ui.dictionary.palbal.export.action}}</span> <i class="cwi-down"></i>',
    '                       <div class="options" v-bind:class="{ show : ui.exportOptions }">',
    '                           <div class="option" v-on:click.stop="exportToExcel(account)">',
    '                               <img class="export-type-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACu0lEQVRoQ+2ZMWzTQBSG/2dolIFIjIWhQqpEUCLROLCwkTGFIsIAatkAtdAJUalb1IhsSI2YWqgETBTUgUY0qGPYGGgLhQVYYKEwVgpDhVCMnoOPq+uE2EnrM/ItSZw7+//e+987yyYEfFDA9SME8DuDYQb+1wxQYirdv+9XXSci3SCkANLfF9cOdRu4YwslC8kIfvYkNE3TAUMnkG4AA0SI2cW+K651fD37OV2dMD4Zj+3viQ4QaaZQgsHRTRAo0k5k9xQgWUj2avWIbtSNFAvm6MJAPxG5gpbB9hTgeD5ttBNVN3P60n1upou5BvD2Ra6sOy1uGk2VAFh4JVd21BoCuPGEVwuFGXAT5VZz12+vir+Hyjnz+9L5xaZLrDnKZMBXgMunRjCZnRDRyi8W8PzNkvgdix7A8q0KYtHGBnxneRqPX81vi66vAKyEBR4+2Lid+bq5gcHSkBDIcAzJ4+P3T7g4M7zDGr4X8ckjJ/DgypwQdvXhKFa+rJpQDGcN67idwHcAFnR3ZBqZY6dNba8/r+DaozEUcwWc0xvZYFuxvZyG7xZiUfZo35yfMKF41LZ+IFs6Y34qC8DCbmTGcD0z+kd0rWXhyiBKZIAFccdZGH8qCrpV4coAStSABSC3TKsrXZoZbmofnqMMgNwyNza/iUzcq85htnrf0f98UAkLya2UizX/bEoUMYvMls6CoZQtYnkzsyLOewODya1VSYDt3edvy7RvcNxaqx9e7mDwtQbivUexMP5EiLL7Xd7Mals100r2/cBXANkm7HEWKA/7Bsc3cnxDp+Q+0LTN/OMPJbqQV/HKtNFOAHytgU6EW2tDAIcohs+F3FjLs4UMrFculFNO12qagcA/3HWiDdTj9XatEagXHO1CAQjOKyYXULsy1fPbll1R4+GkIYCHoHV1SZiBrobTw8l+Ay2Al0BP3OV8AAAAAElFTkSuQmCC">',
    '                               <span>{{ui.dictionary.palbal.export.excel}}</span>',
    '                           </div>',
    '                       </div>',
    '                   </div>',
    '               </div>',
    '           </div>',

    '       </div>',

    '       <div v-show="ui.exportError" class="export-error-bar">',
    '           <i class="cwi-warning"></i> {{ui.dictionary.ledger.exportError}}',
    '       </div>',

    '       <div class="ledger-table">',
    '           <div class="ledger-header tabular-heading">',
    '               <div class="cell sortable" v-on:click="sortBy(\'reference\')">',
    '                   {{ui.dictionary.ledger.reference}}',
    '                   <span v-show="sort.param == \'reference\'">',
    '                       <span v-show="sort.order == \'asc\'"><i class="cwi-down"></i></span>',
    '                       <span v-show="sort.order == \'desc\'"><i class="cwi-up"></i></span>',
    '                   </span>',
    '               </div',
    '               ><div class="cell sortable" v-on:click="sortBy(\'date\')">',
    '                   {{ui.dictionary.ledger.date}}',
    '                   <span v-show="sort.param == \'date\'">',
    '                       <span v-show="sort.order == \'asc\'"><i class="cwi-down"></i></span>',
    '                       <span v-show="sort.order == \'desc\'"><i class="cwi-up"></i></span>',
    '                   </span>',
    '               </div',
    '               ><div class="cell">',
    '                   {{ui.dictionary.ledger.debit}}',
    '               </div',
    '               ><div class="cell">',
    '                   {{ui.dictionary.ledger.credit}}',
    '               </div',
    '               ><div class="cell">',
    '                   {{ui.dictionary.ledger.text}}',
    '               </div>',
    '           </div>',
    '           <div class="ledger-body" v-on:scroll="handleScroll">',
    '               <div class="row"',
    '                    v-for="(entry, index) in sortEntries(entries)"',
    '                    :class="{ \'tabular-row\' : index % 2 != 0, \'tabular-altrow\' : index % 2 == 0 }">',

    '                   <div class="cell">',
    '                       {{entry.reference}}',
    '                   </div',
    '                   ><div class="cell">',
    '                       {{formatDate(entry.date)}}',
    '                   </div',
    '                   ><div class="cell">',
    '                       <span v-show="entry.amount < 0">&nbsp;</span>',
    '                       <span v-show="entry.amount >= 0">{{formatAmount(entry.amount)}}</span>',
    '                   </div',
    '                   ><div class="cell">',
    '                       <span v-show="entry.amount >= 0">&nbsp;</span>',
    '                       <span v-show="entry.amount < 0">{{formatAmount(entry.amount)}}</span>',
    '                   </div',
    '                   ><div class="cell">',
    '                       <span v-show="entry.text">{{entry.text}}</span>',
    '                       <span v-show="!entry.text">&nbsp;</span>',
    '                   </div>',
    '               </div>',


    '               <div class="center-text">',
    '                   <div class="line-spacer"></div>',
    '                   <div class="working inline" v-show="ui.loadingMoreEntries"></div>',
    '                   <div v-show="!ui.loadingMoreEntries && page < pageCount">',
    '                       <button v-on:click="getMoreAccountEntries()">{{ui.dictionary.invoices.loadMore}}</button>',
    '                   </div>',
    '               </div>',


    '           </div>',
    '       </div>',




    '   </section>',
    '</article>',
    ].join('');

    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : false,
                loadingMoreEntries : false,
                exportOptions : false,
                exportError : false
            },
            entries : [],
            fromDate : DateRangeModel.getFromDate(),
            toDate : DateRangeModel.getToDate(),
            min : null,
            max : null,
            page : 1,
            pageCount : 1,
            sort : {
                param : 'date',
                order : 'asc'
            },
            totalEntries : 0
        };
    };

    var methods = {
        sortEntries : function (entries) {
            var list = entries.slice();
            var param = this.sort.param;

            var sortedList = list.sort(function(a, b) {
                if (this.sort.param == 'reference' && !isNaN(a.reference)) {
                    var an = parseInt(a.reference);
                    var ab = parseInt(b.reference);

                    return an - ab;
                }
                return a[param].toLocaleLowerCase()>b[param].toLocaleLowerCase()? 1 : (a[param].toLocaleLowerCase()<b[param].toLocaleLowerCase() ? -1 : 0);
            }.bind(this));

            if (this.sort.order == 'desc') {
                return sortedList.reverse();
            }

            return sortedList;
        },

        closeMenus : function () {
            this.ui.exportOptions = false;
        },

        sortBy : function (param) {
            if (this.sort.param == param) {
                if (this.sort.order == 'asc') {
                    this.sort.order = 'desc';
                } else {
                    this.sort.order = 'asc';
                }
            } else {
                this.sort.param = param;
                this.sort.order = 'asc';
            }

            if (this.pageCount > 1 && this.page < this.pageCount) {
                this.getAccountEntries(this.account);
            }
        },

        getAccountEntries : function (account, append) {
            if (append) {
                this.ui.loadingMoreEntries = true;
            } else {
                this.ui.loading = true;
            }

            var fromDate = moment(this.fromDate).format('YYYY-MM-DD');
            var toDate = moment(this.toDate).format('YYYY-MM-DD');

            if (this.min && this.max && this.min > this.max) {
                var temp = this.min;
                this.min = this.max;
                this.max = temp;
            }

            LedgerEntryCollection.getLedgerEntries(account.id, this.sort, fromDate, toDate, this.min, this.max, this.page)
                .then(function (res) {
                    this.pageCount = res.page_count;
                    this.totalEntries = res.total_items;

                    if (res._embedded && res._embedded.items) {
                        if (append) {
                            this.entries = this.entries.concat(res._embedded.items);
                        } else {
                            this.entries = res._embedded.items;
                        }
                    }

                    this.ui.loading = false;
                    this.ui.loadingMoreEntries = false;
                }.bind(this));
        },

        exportToExcel : function (account) {
            var fromDate = moment(this.fromDate).format('YYYY-MM-DD');
            var toDate = moment(this.toDate).format('YYYY-MM-DD');

            if (this.min && this.max && this.min > this.max) {
                var temp = this.min;
                this.min = this.max;
                this.max = temp;
            }

            this.ui.exportError = false;

            LedgerEntryCollection.getExcelData(account.id, this.sort, fromDate, toDate, this.min, this.max)
                .then(function(data) {
                    if (!data) {
                        this.ui.exportError = true;
                        return false;
                    }
                    var blob = new Blob([data], {
                        type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    FileSaver.saveAs(blob, account.name + '.xlsx');
                }.bind(this));

            this.ui.exportOptions = false;
        },

        getMoreAccountEntries : function () {
            this.page++;
            this.getAccountEntries(this.account, true);
        },

        handleScroll : function(e) {
            var t = e.target;
            var enoughToLoad = t.offsetHeight + t.scrollTop == t.scrollHeight;

            if (enoughToLoad && !this.ui.loadingMoreEntries&& this.page < this.pageCount) {
                this.getMoreAccountEntries();
            }
        },

        selectFromDate : function(value, valid) {
            if (!valid) {
                this.fromDate = null;
                return false;
            }

            this.fromDate = value;
        },

        selectToDate : function(value, valid) {
            if (!valid) {
                this.toDate = null;
                return false;
            }

            this.toDate = value;
        },

        resetFilters : function () {
            this.fromDate = DateRangeModel.getFromDate();
            this.toDate = DateRangeModel.getToDate();
            this.min = null;
            this.max = null;
        },

        formatDate : function (date) {
            return moment(date).format(this.ui.dictionary.locale.displayFormat);
        },

        formatAmount : function (amount) {
            return NumberFormatter.format(Math.abs(amount));
        }
    };

    const computed = {
        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        }
    }


    return Vue.extend({
        template : template,
        data : bindings,
        computed,
        methods : methods,
        props : ['account'],
        components : {
            'date-field' : dateField
        },
        watch : {
            'account' : function (a) {
                this.getAccountEntries(a);
            }
        },
        mounted : function () {
            this.getAccountEntries(this.account);
        }
    });
});
