define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'services/EventBus',
    'collections/AnnualReportDataCollection',
    'collections/PresentationTemplateCollection',
    'config/annual-report-accounts',
    'config/annual-report-names',
    'store/presentationMutationTypes',
    'services/NumberFormatter'

], function (Vue, moment, DictionaryModel, EventBus, AnnualReportDataCollection, PresentationTemplateCollection, annualReportAccounts, annualReportNames, presentationMutationTypes, NumberFormatter) {
    var template = [
    '<article v-on:click="ui.yearsOptions = false; openOption = null;">',
    '   <section v-show="ui.loading">',
    '       <div class="working"></div>',
    '   </section>',


    '   <section v-show="!ui.loading && rawReports.length === 0">',
    '       <div class="extra-padded">',
    '           <p>{{ui.dictionary.overview.noPublicData}}</p>',
    '       </div>',
    '   </section>',



    '   <section v-show="!ui.loading && rawReports.length > 0">',

    '       <div style="padding: 0 2rem;" v-show="!isUnderPresentation && !isShowPreview">',
    '           <div v-show="years.length > 1" class="flex-row flex-align-center">',
    '               {{firstPartString(ui.dictionary.annualReport.showYears)}}',
    '               <div class="selector inline">',
    '                   <div data-test-id="openYearsOptions" class="label" v-on:click.stop="ui.yearsOptions = true">',
    '                       <span class="primary-color">{{yearIndex + 1}}</span> <i class="cwi-down primary-color"></i>',
    '                       <div class="options" v-bind:class="{ show : ui.yearsOptions }">',
    '                           <div data-test-id="option" class="option" v-for="(year, index) in years" v-bind:class="{ selected : index == yearIndex }" v-on:click.stop="setYears(index)">',
    '                               <span>{{index + 1}}</span>',
    '                           </div>',
    '                       </div>',
    '                   </div>',
    '               </div>',
    '               {{secondPartString(ui.dictionary.annualReport.showYears)}}',
    '           </div>',
    '       </div>',



    '       <article ref="dynamictable" class="dynamic-table annual-report-table">',
    '           <div class="container with-margin">',

                    /**
                     * Head
                     */
    '               <div class="row head tabular-heading" :style="{ width : tableProps.tableWidth - 17 + \'px\' }">',
    '                   <div class="first-col tabular-heading" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                           <span class="cell-value">&nbsp;</span>',
    '                       </div>',
    '                   </div',
    '                   ><div class="main-cols">',
    '                       <div class="cell"',
    '                            v-for="(period, i) in filterReports(rawReports)"',
    '                            :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                           <span class="cell-value">',
    '                               <span>{{formatPeriod(period.end_date)}}</span>',
    '                           </span>',
    '                       </div>',
    '                   </div>',
    '               </div>',



                    /**
                     * Body
                     */
    '               <div class="body">',
                        /**
                         * First column
                         */
    '                   <div class="first-col" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                       <div class="first-col-container">',


    '                           <div class="row tabular-row" style="height: 60px;">',
    '                               <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                                   <span class="cell-value">&nbsp;</span>',
    '                               </div>',
    '                           </div>',


    '                           <div class="row separator tabular-row">',
    '                               <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                                   <span class="cell-value">{{ui.dictionary.palbal.pal}}</span>',
    '                               </div>',
    '                           </div>',



    '                           <div class="row" :title="palAccount.reference"',
    '                                v-for="(palAccount, index) in palAccounts"',
    '                               :class="palAccount.type"',
    '                               v-show="(hasValues(filterReports(palAccount.accounts)) && !isHiddenGroup(palAccount.group)) || palAccount.type != \'pal\'">',

    '                               <div class="cell tabular-row" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                   <span class="cell-value" :title="getAccountName(palAccount.reference)">',
    '                                       <span v-show="palAccount.type == \'he2\'" class="pointer">',
    '                                           <span v-show="isHiddenGroup(palAccount.group)" @click="removeGroup(palAccount.group)">+ {{getAccountName(palAccount.reference)}}</span>',
    '                                           <span v-show="!isHiddenGroup(palAccount.group)" @click="addGroup(palAccount.group)">&ndash; {{getAccountName(palAccount.reference)}}</span>',
    '                                       </span>',
    '                                       <span v-show="palAccount.type != \'he2\'">{{getAccountName(palAccount.reference)}}</span>',
    '                                   </span>',
    '                               </div>',
    '                           </div>',


    '                           <div class="row separator tabular-row">',
    '                               <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                                   <span class="cell-value">{{ui.dictionary.palbal.bal}}</span>',
    '                               </div>',
    '                           </div>',


    '                           <div class="row"',
    '                                v-for="(balAccount, index) in balAccounts"',
    '                                :class="balAccount.type"',
    '                                v-show="hasValues(filterReports(balAccount.accounts)) && (!isHiddenGroup(balAccount.group) || balAccount.type != \'bal\')">',

    '                               <div class="cell tabular-row" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                   <span class="cell-value" :title="getAccountName(balAccount.reference)">',
    '                                       <span v-show="balAccount.type == \'he3\'" class="pointer">',
    '                                           <span v-show="isHiddenGroup(balAccount.group)" @click="removeGroup(balAccount.group)">+ {{getAccountName(balAccount.reference)}}</span>',
    '                                           <span v-show="!isHiddenGroup(balAccount.group)" @click="addGroup(balAccount.group)">&ndash; {{getAccountName(balAccount.reference)}}</span>',
    '                                       </span>',
    '                                       <span v-show="balAccount.type != \'he3\'">{{getAccountName(balAccount.reference)}}</span>',
    '                                   </span>',
    '                               </div>',
    '                           </div>',


    '                       </div>', //Container
    '                   </div', //First column



                        /**
                         * Main cols
                         */
    '                   ><div class="main-cols"',
    '                        v-on:scroll="handleScroll"',
    '                        v-on:wheel="handleWheelScroll"',
    '                        :style="{ width : tableProps.tableWidth + \'px\', marginLeft : (0 - tableProps.firstCellWidth)  + \'px\', paddingLeft : tableProps.firstCellWidth  + \'px\' }">',

    '                       <div class="main-cols-container">',


    '                           <div class="row tabular-row" style="height: 60px;">',
    '                               <div class="cell" :style="{ width : tableProps.cellWidth + \'px\' }"',
    '                                    v-for="(report, reportIndex) in filterReports(sortReports(rawReports))">',
    '                                   <span class="cell-value">',

    '                                       <div class="selector full-width">',
    '                                           <div class="label" v-on:click.stop="openOption = report.end_date">',
    '                                               <span>{{ui.dictionary.annualReport.download}}</span> <i class="cwi-down"></i>',
    '                                               <div class="options" v-bind:class="{ show : openOption == report.end_date }">',
    '                                                   <div class="option"',
    '                                                        v-show="report.pdf_url"',
    '                                                        v-on:click="selectToDownload(report, reportIndex, report.pdf_url); openOption = null;">',
    '                                                       PDF',
    '                                                   </div>',
    '                                                   <div class="option"',
    '                                                        v-show="report.html_url"',
    '                                                        v-on:click="selectToDownload(report, reportIndex, report.html_url); openOption = null;">',
    '                                                       HTML',
    '                                                   </div>',
    '                                                   <div class="option"',
    '                                                        v-show="report.image_url"',
    '                                                        v-on:click="selectToDownload(report, reportIndex, report.image_url); openOption = null;">',
    '                                                       Image',
    '                                                   </div>',
    '                                               </div>',
    '                                           </div>',
    '                                       </div>',



    '                                   </span>',
    '                               </div>',
    '                           </div>',



    '                           <div class="row separator">',
    '                               <div class="cell tabular-row"',
    '                                   v-for="(period, index) in filterReports(rawReports)"',
    '                                   :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                   <span class="cell-value">&nbsp;</span>',
    '                               </div>',
    '                           </div>',

    '                           <div class="row" :title="palAccount.reference"',
    '                               v-for="(palAccount, index) in palAccounts"',
    '                               :class="palAccount.type"',
    '                               v-show="(hasValues(filterReports(palAccount.accounts)) && !isHiddenGroup(palAccount.group)) || palAccount.type != \'pal\'">',
    '                               <div class="cell tabular-row"',
    '                                   v-for="(report, reportIndex) in filterReports(palAccount.accounts)"',
    '                                   :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                   <span class="cell-value">',
    '                                       <span v-show="report">{{formatNumber(report)}}</span>',
    '                                       <span v-show="!report && palAccount.type != \'pal\'">&nbsp;</span>',
    '                                       <span v-show="!report && palAccount.type == \'pal\'">--</span>',
    '                                   </span>',
    '                               </div>',
    '                           </div>',


    '                           <div class="row separator">',
    '                               <div class="cell tabular-row"',
    '                                    v-for="period in filterReports(rawReports)"',
    '                                    :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                   <span class="cell-value">&nbsp;</span>',
    '                               </div>',
    '                           </div>',


    '                           <div class="row"',
    '                               v-for="(balAccount, index) in balAccounts"',
    '                               :class="balAccount.type"',
    '                               v-show="hasValues(filterReports(balAccount.accounts)) && (!isHiddenGroup(balAccount.group) || balAccount.type != \'bal\')">',
    '                               <div class="cell tabular-row"',
    '                                   v-for="(report, reportIndex) in filterReports(balAccount.accounts)"',
    '                                   :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                   <span class="cell-value">',
    '                                       <span>{{formatNumber(report)}}</span>',
    '                                       <span v-show="!report && balAccount.type != \'bal\'">&nbsp;</span>',
    '                                       <span v-show="!report && balAccount.type == \'bal\'">--</span>',
    '                                   </span>',
    '                               </div>',
    '                           </div>',



    '                       </div>', //Container

    '                   </div>', //Main cols


    '               </div>', //Body

    '           </div>',
    '       </article>',


    '   </section>',
    '</article>'
    ].join('');


    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                yearsOptions : false
            },
            rawReports : [],
            palAccounts : annualReportAccounts.pal,
            balAccounts : annualReportAccounts.bal,
            accountNames : annualReportNames,
            accountFormattedNames : {},
            scrolledDown : false,
            scrolledRight : false,
            tableProps : {
                longestAccountName : 0,
                additionalPadding : 50,
                tableWidth : 0,
                maxCellWidth : 0,
                firstCellWidth : 600,
                cellWidth : 200,
                remainingCellWidth : 0
            },
            years : [],
            yearIndex : 0,
            hiddenGroups : [],
            refresh : 0,
            openOption : null,
            tempNames : {},
            group: 0
        };
    };


    var methods = {
        init : function () {
            EventBus.$on('companyUserChanged', this.loadData);
            if (this.isUnderPresentation) {
                this.loadPresentationData();
            } else {
                this.loadData();
            }
        },

        selectToDownload : function (report, index, url) {
            window.open(url, '_blank');
            this.openOption = null;
            this.refresh++;
        },

        addGroup : function (group) {
            this.hiddenGroups.push(group);
        },

        removeGroup : function (group) {
            var index = this.hiddenGroups.indexOf(group);
            this.hiddenGroups.splice(index, 1);
        },

        isHiddenGroup : function (group) {
            return this.hiddenGroups.indexOf(group) >= 0;
        },

        hasValues : function (accounts) {
            var hasVals = false;
            accounts.forEach(function (account) {
                if (account) {
                    hasVals = true;
                }
            });

            return hasVals;
        },

        filterReports : function (reports) {
            var list = reports.slice().reverse();

            return list.splice(0, this.yearIndex + 1);
        },

        firstPartString : function (string) {
            var newString = string.split(':years');
            return newString[0];
        },

        secondPartString : function (string) {
            var newString = string.split(':years');
            return newString[1];
        },

        setYears : function (index) {
            this.yearIndex = index;

            !this.isShowPreview && this.isUnderEditPresentation  ? this.$store.dispatch('setYearAnnualReports', index) : '';
            this.ui.yearsOptions = false;
            this.calculateTableProperties();
        },

        loadData : function () {
            this.ui.loading = true;

            AnnualReportDataCollection.getAnnualReport()
                .then(this.onDataLoaded);
        },

        loadPresentationData() {
            this.ui.loading = true;
            const { SET_SETTINGS_VALUE } = presentationMutationTypes;
            this.presentationPage.settings.value ? this.$store.dispatch('setAnnualReportSettings', this.presentationPage.settings.value) : '';
            PresentationTemplateCollection.getAnnualReport(this.presentationToken, this.presentationId, this.presentationPage.id)
                .then(this.onDataLoaded);
        },

        onDataLoaded(res) {
            if (res._embedded && res._embedded.items) {
                this.rawReports = this.sortReports(res._embedded.items);
                this.getDates(this.rawReports);
                this.formatAccounts();
            }

            this.calculateTableProperties();
        },

        snakeToCamel : function (s){
            return s.replace(/(\_\w)/g, function(m){return m[1].toUpperCase();});
        },

        formatAccounts : function () {
            this.palAccounts.forEach(account => this.formatAccount(account));

            this.balAccounts.forEach(account => this.formatAccount(account));

            this.ui.loading = false;
        },
        formatAccount(account) {
            //account.reference = this.snakeToCamel(account.reference);
            account.accounts = [];
            account.populated = [];

            if (account.type == 'he2' || account.type == 'he3') {
                this.group++;
            }

            account.group = this.group;

            this.rawReports.forEach((report) => {
                var year = moment(report.end_date).format(this.ui.dictionary.locale.intervals.year);
                if (account.populated.indexOf(year) < 0) {
                    account.populated.push(year);
                }

                if (report._embedded.items.length) {
                    report._embedded.items.forEach((item) => {
                        if (item.name == account.reference) {
                            if (item.value) {
                                account.accounts.push(item.value);
                            }
                        }
                    });
                } else {
                    account.accounts.push(null);
                }

            });

        },
        getDates : function (reports) {
            reports.forEach(function (report) {
                var year = moment(report.end_date).format(this.ui.dictionary.locale.intervals.year);
                this.years.push(year);
            }.bind(this));

            if (this.years.length > 2) {
                this.yearIndex = 2;
            } else if (this.years.length > 1) {
                this.yearIndex = 1;
            } else {
                this.yearIndex = 0;
            }

            !this.isShowPreview && !this.isUnderPresentation ? this.$store.dispatch('setYearAnnualReports', this.yearIndex) : this.yearIndex = Number(this.annualSettings);
        },

        sortReports : function (reports) {
            var list = reports.slice();

            return list.sort(function(a, b) {
                return a.end_date.toLocaleLowerCase()>b.end_date.toLocaleLowerCase()? 1 : (a.end_date.toLocaleLowerCase()<b.end_date.toLocaleLowerCase() ? -1 : 0);
            });
        },

        calculateTableProperties : function() {
            //Reset table properties
            this.tableProps.maxCellWidth = 0;
            this.tableProps.firstCellWidth = 60;
            this.tableProps.cellWidth = 200;
            this.tableProps.remainingCellWidth = 0;

            setTimeout(function() {
                this.tableProps.cellWidth = 200;
                this.tableProps.tableWidth = this.$refs.dynamictable.querySelector('.container').offsetWidth;
                //this.tableProps.tableWidth = 2000;
                this.tableProps.maxCellWidth = Math.round(this.tableProps.tableWidth * 0.35);
                var firstCellWantedWidth = this.tableProps.maxCellWidth + this.tableProps.additionalPadding;

                this.tableProps.firstCellWidth = firstCellWantedWidth > this.tableProps.maxCellWidth ? this.tableProps.maxCellWidth : firstCellWantedWidth;

                this.tableProps.remainingCellWidth = this.tableProps.tableWidth - this.tableProps.firstCellWidth - 17;

                var cols = this.yearIndex + 1;
                var wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / cols) - 1;

                this.tableProps.cellWidth = 200; //wantedCellWidth < this.tableProps.cellWidth ? this.tableProps.cellWidth : wantedCellWidth;
            }.bind(this), 200);
        },

        handleScroll : function(e) {
            this.scrolledDown = e.target.scrollTop > 0;
            this.scrolledRight = e.target.scrollLeft > 0;
            this.$refs.dynamictable.querySelector('.body .first-col .first-col-container').style.top = (0 - e.target.scrollTop) + 'px';
            this.$refs.dynamictable.querySelector('.head .main-cols').style.left = (0 - e.target.scrollLeft) + 'px';
        },

        handleWheelScroll : function(e) {
            if(window.navigator.userAgent.match(/Trident\/7\./)) {
                e.preventDefault();
                this.$refs.dynamictable.querySelector('.body .main-cols').scrollTop += e.deltaY;
            }
        },

        getAccountName : function (reference) {
            if (this.accountNames[reference][this.ui.dictionary.meta.shortcode]) {
                return this.accountNames[reference][this.ui.dictionary.meta.shortcode];
            }

            return this.accountNames[reference].en;
        },

        formatPeriod : function(period) {
            return moment(period).format(this.ui.dictionary.locale.intervals.year);
        },

        formatNumber : function(value) {
            if (value === null) {
                return '--';
            }

            return NumberFormatter.format(value);
        }
    };



    const computed ={
        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        },
        isUnderPresentation() {
            return this.$store.getters.presentationMode;
        },
        isShowPreview() {
            return this.$store.getters.showPreview;
        },
        presentationId() {
            return this.$store.getters.presentationId;
        },
        presentationToken() {
            return this.$store.getters.presentationToken;
        },
        presentationPage() {
            return this.$store.getters.presentationPage;
        },
        annualSettings() {
            return this.$store.getters.annualReportsSettings;
        },
    };

    const watch = {
        presentationInfoFlag : function () {
            this.processReportPageInfo({context: 'annual_report'});
        },
    };

    return Vue.extend({
        template : template,
        props : ['presentationInfoFlag', 'processReportPageInfo'],
        data : bindings,
        methods : methods,
        watch,
        computed,
        mounted : function () {
            this.init();
        }
    });
});
