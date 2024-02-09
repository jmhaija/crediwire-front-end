/* global Event*/

define([

    'Vue',
    'Highcharts',
    'moment',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/InvoiceModel',
    'models/RecipientModel',
    'models/UserModel',
    'models/CompanyModel',
    'collections/RecipientCollection',
    'collections/PresentationTemplateCollection',
    'services/EventBus',
    'services/NumberFormatter',
    'elements/date-field',
    'elements/tutorial-slide',
    'elements/collect-debt',
    'elements/likvido-notification',
    'services/Tutorial',
    'models/AssetModel',
    'constants/userRoles',
    'constants/invoicesSortParams',
    'mixins/contextMixin'
], function(Vue, Highcharts, moment, DictionaryModel, ErpModel, InvoiceModel, RecipientModel, UserModel, CompanyModel, RecipientCollection, PresentationTemplateCollection, EventBus, NumberFormatter, dateField, tutorialSlide, collectDebt, likvidoNotification, Tutorial, AssetModel, userRoles, invoicesSortParams, contextMixin) {
    var template = [
    '<article class="invoices" ref="chartarea">',

    '   <section v-if="invoicesSupported">',

    '   <section v-show="ui.loading">',
    '       <div class="working"></div>',
    '   </section>',
    '   <section v-if="!ui.loading && ui.section == \'collect\'">',
    '       <div>',
    '           <button class="primary" v-on:click="ui.section = \'invoices\'"><i class="cwi-left" style="font-size: 0.7rem;"></i> {{ui.dictionary.invoices.backToInvoices}}</button>',
    '       </div>',
    '       <collect-debt :recipients="recipients"></collect-debt>',
    '   </section>',

    '   <section v-show="!ui.loading && ui.section == \'invoices\'">',
            /**
             * No ERP
             */
    '       <div v-show="ui.noErp" class="extra-padded">',
    '           <p>{{ui.dictionary.overview.noErp}}</p>',
    '       </div>',

            /**
             * Non supported ERP
             */
    '       <div v-show="!erpSupported()" class="extra-padded splash">',
    '           <p>{{ui.dictionary.invoices.notAvailable}}</p>',
    '       </div>',


        /**
         * Date filter
         */
    '   <div class="date-filters" v-show="showDateFilter">',
    '       <span class="filter-toggle" v-on:click="ui.showDatepicker = true;"><i class="cwi-calendar"></i> {{ui.dictionary.invoices.filterByDate}}</span>',
    '   </div>',
    '   <div class="date-filters" v-if="ui.showDatepicker && erpSupported()">',
    '       <div><date-field :onDateSelect="setFromDate" :max="date.toDate" :optional="true"></date-field></div>',
    '       <div>&#8594;</div>',
    '       <div><date-field :onDateSelect="setToDate" :optional="true"></date-field></div>',
    '       <div><button class="primary" v-on:click="getDataWithDates()">Go</button></div>',
    '       <div class="close"><i class="cwi-close" v-on:click="ui.showDatepicker = false; removeDates(); loadData(false, false, true);"></i></div>',
    '   </div>',

            /**
             * Summary
             */
    '       <div class="summary" v-show="!ui.noErp && erpSupported()">',
    '           <h2>{{ui.dictionary.invoices.summary}}</h2>',

    '           <div v-show="ui.noData">',
    '               <p>{{ui.dictionary.invoices.noData}}</p>',
    '           </div>',

    '           <div class="pie-chart-container" v-show="!ui.noData && invoices.unpaid && invoices.unpaid > 0">',
    '               <div id="pie-chart"></div>',
    '               <div style="margin-left: 56px; margin-bottom: 40px;" v-show="showCollectDebtButton">',
    '                   <button class="accent" v-on:click="collectDebt()">{{ui.dictionary.invoices.collectDebt}}</button>',
    '               </div>',
    '           </div>',

    '           <div class="summary-labels" v-show="!ui.noData">',
     '               <div class="label high">',
    '                   <label>{{ui.dictionary.invoices.outstanding}}</label>',
    '                   <div class="value">{{localeFormat(invoices.unpaid)}}</div>',
    '               </div>',
    '               <div class="label high">',
    '                   <label>{{ui.dictionary.invoices.overdue15}}</label>',
    '                   <div class="value">{{localeFormat(invoices.overdue_15_days)}}</div>',
    '               </div>',
    '               <div class="label medium">',
    '                   <label>{{ui.dictionary.invoices.overdue}}</label>',
    '                   <div class="value">{{localeFormat(invoices.overdue - invoices.overdue_15_days)}}</div>',
    '               </div>',
    '               <div class="label low">',
    '                   <label>{{ui.dictionary.invoices.unpaid}}</label>',
    '                   <div class="value">{{localeFormat(invoices.unpaid - invoices.overdue)}}</div>',
    '               </div>',
    '           </div>',
            /**
             * Details
             */
    '       </div><div class="details" v-if="!ui.noErp && erpSupported()">',

    '           <div class="float-right no-margin" v-show="!ui.noData"><h2>{{totalItems}} {{ui.dictionary.invoices.totalRecipients}}</h2></div>',

    '           <h2>{{ui.dictionary.invoices.details}}</h2>',

    '           <div v-show="ui.noData">',
    '               <p>{{ui.dictionary.invoices.noData}}</p>',
    '           </div>',


    '           <v-popover :open="showInvoiceSortingTutorial()" placement="top" class="blocker">',
    '           <div class="recip-table" v-show="!ui.noData">',
    '               <div class="row headings">',
    '                   <div class="cell" :title="ui.dictionary.invoices.name" v-on:click="changeSortBy(\'name\')"><span v-show="sort.param == \'name\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.name}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.total" v-on:click="changeSortBy(\'total_invoiced\')"><span v-show="sort.param == \'total_invoiced\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.total}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.notDue" v-on:click="changeSortBy(\'unpaid\')"><span v-show="sort.param == \'unpaid\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.notDue}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.overdue" v-on:click="changeSortBy(\'overdue\')"><span v-show="sort.param == \'overdue\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.overdue}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.overdue15" v-on:click="changeSortBy(\'overdue_15_days\')"><span v-show="sort.param == \'overdue_15_days\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.overdue15}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.outstanding" v-on:click="changeSortBy(\'outstanding\')"><span v-show="sort.param == \'outstanding\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.outstanding}}</div',
    '                   ><div class="cell" :title="ui.dictionary.invoices.percent" v-on:click="changeSortBy(\'percent\')"><span v-show="sort.param == \'percent\'"><i :class="{ \'cwi-down\' : sort.direction == \'asc\', \'cwi-up\' : sort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.percent}} &nbsp; <i class="cwi-info" v-show="mappingValidated" :title="ui.dictionary.invoices.mappingValidated"></i><i class="cwi-info" v-show="!mappingValidated" :title="ui.dictionary.invoices.mappingNotValidated""></i> </div>',
    '               </div>',

    '               <div class="table-body" v-on:scroll="handleScroll">',
    '                   <div class="no-data" v-show="!recipients.length">{{ui.dictionary.invoices.noInvoicesToDisplay}}</div>',
    '                   <div class="row" :class="{ opened : recipient.showDetails }" v-for="(recipient, index) in sortRecipients(recipients)">',
    '                       <div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)">',
    '                           <span class="plus-minus">',
    '                               <span v-show="!recipient.showDetails && recipient.unpaid && recipient.unpaid !== 0">+</span>',
    '                               <span v-show="recipient.showDetails && recipient.unpaid && recipient.unpaid !== 0">&ndash;</span>',
    '                        </span>',
    '                           {{getRecipientName(recipient)}}',
    '                       </div',
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)" :title="localeFormat(recipient.total_invoiced)">{{formatNumber(recipient.total_invoiced)}}</div',
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)" :title="localeFormat(recipient.unpaid - recipient.overdue)">{{formatNumber(recipient.unpaid - recipient.overdue)}}</div', //Unpaid = Unpaid - Overdue
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)" :title="localeFormat(recipient.overdue - recipient.overdue_15_days)">{{formatNumber(recipient.overdue - recipient.overdue_15_days)}}</div', //Overdue = Overdue - Overdue_15_days
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)" :title="localeFormat(recipient.overdue_15_days)">{{formatNumber(recipient.overdue_15_days)}}</div', //Overdue_15_days
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)" :title="localeFormat(recipient.unpaid)">{{formatNumber(recipient.unpaid)}}</div',
    '                       ><div class="cell" :class="{ hoverable : recipient.unpaid !== 0 }" v-on:click="toggleDetails(recipient)">{{getPercent(recipient)}}%</div>',

    '                       <div class="recip-details" v-show="recipient.showDetails">',
    '                           <div class="working" v-show="!recipient.details"></div>',
    '                           <div v-show="recipient.details && recipient.details == \'none\'">{{ui.dictionary.invoices.noUnpaid}}</div>',

    '                           <div v-if="recipient.details && recipient.details != \'none\'">',
    //'                               <div class="float-right no-margin"><button class="accent" v-on:click="collectDebt(recipient)">Collect Debt</button></div>',
    '                               <h3>{{ui.dictionary.invoices.unpaidInvoices}}</h3>',
    '                               <div class="detail-headings">',
    '                                   <div class="detail-cell" v-on:click.stop="changeInvoiceSortBy(invoicesSortParams.INVOICE_NUMBER)"><span v-show="invoiceSort.param == invoicesSortParams.INVOICE_NUMBER"><i :class="{ \'cwi-down\' : invoiceSort.direction == \'asc\', \'cwi-up\' : invoiceSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.number}}</div',
    '                                   ><div class="detail-cell" v-on:click.stop="changeInvoiceSortBy(invoicesSortParams.DATE)"><span v-show="invoiceSort.param == invoicesSortParams.DATE"><i :class="{ \'cwi-down\' : invoiceSort.direction == \'asc\', \'cwi-up\' : invoiceSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.dateIssued}}</div',
    '                                   ><div class="detail-cell" v-on:click.stop="changeInvoiceSortBy(invoicesSortParams.DUE_DATE)"><span v-show="invoiceSort.param == invoicesSortParams.DUE_DATE"><i :class="{ \'cwi-down\' : invoiceSort.direction == \'asc\', \'cwi-up\' : invoiceSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.dateDue}}</div',
    '                                   ><div class="detail-cell" v-on:click.stop="changeInvoiceSortBy(invoicesSortParams.GROSS_AMOUNT)"><span v-show="invoiceSort.param == invoicesSortParams.GROSS_AMOUNT"><i :class="{ \'cwi-down\' : invoiceSort.direction == \'asc\', \'cwi-up\' : invoiceSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.amount}}</div',
    '                                   ><div class="detail-cell" v-on:click.stop="changeInvoiceSortBy(invoicesSortParams.REMAINDER)"><span v-show="invoiceSort.param == invoicesSortParams.REMAINDER"><i :class="{ \'cwi-down\' : invoiceSort.direction == \'asc\', \'cwi-up\' : invoiceSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.unpaid}}</div>',
    '                             </div>',
    '                               <div v-for="invoice in sortInvoices(recipient.details.invoices)">',
    '                                   <div class="detail-cell">{{invoice.invoice_number}}</div',
    '                                   ><div class="detail-cell">{{formatDate(invoice.date)}}</div',
    '                                   ><div class="detail-cell">{{formatDate(invoice.due_date)}}</div',
    '                                   ><div class="detail-cell" :title="localeFormat(invoice.gross_amount)">{{formatNumber(invoice.gross_amount, invoice.currency)}}</div',
    '                                   ><div class="detail-cell" :title="localeFormat(invoice.remainder)">{{formatNumber(invoice.remainder, invoice.currency)}}</div>',
    '                               </div>',
    '                           </div>',


    '                           <div v-if="recipient.transactions && recipient.transactions != \'none\' && recipient.transactions.length > 0">',
    '                               <h3 class="margin">{{ui.dictionary.invoices.transactions}}</h3>',
    '                               <div class="detail-headings">',
    '                                   <div class="detail-cell three" v-on:click.stop="changeTransactionSortBy(\'date\')"><span v-show="transactionSort.param == \'date\'"><i :class="{ \'cwi-down\' : transactionSort.direction == \'asc\', \'cwi-up\' : transactionSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.date}}</div',
    '                                   ><div class="detail-cell three" v-on:click.stop="changeTransactionSortBy(\'amount\')"><span v-show="transactionSort.param == \'amount\'"><i :class="{ \'cwi-down\' : transactionSort.direction == \'asc\', \'cwi-up\' : transactionSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.amount}}</div',
    '                                   ><div class="detail-cell three" v-on:click.stop="changeTransactionSortBy(\'remainder\')"><span v-show="transactionSort.param == \'remainder\'"><i :class="{ \'cwi-down\' : transactionSort.direction == \'asc\', \'cwi-up\' : transactionSort.direction == \'desc\'}"></i></span> {{ui.dictionary.invoices.unpaid}}</div>',
    '                             </div>',
    '                               <div v-for="transaction in sortTransactions(recipient.transactions)">',
    '                                   <div class="detail-cell three">{{formatDate(transaction.date)}}</div',
    '                                   ><div class="detail-cell three" :title="localeFormat(transaction.amount)">{{formatNumber(transaction.amount, null)}}</div',
    '                                   ><div class="detail-cell three" :title="localeFormat(transaction.remainder)">{{formatNumber(transaction.remainder, null)}}</div>',
    '                               </div>',
    '                           </div>',
    '                       </div>',

    '                   </div>',


    '                   <div class="center-text">',
    '                       <div class="line-spacer"></div>',
    '                       <div class="working inline" v-show="ui.loadingMoreRecipients"></div>',
    '                       <div v-show="!ui.loadingMoreRecipients && currentPage < totalPages">',
    '                           <button v-on:click="loadRecipientPage(date.from, date.to, currentPage + 1)">{{ui.dictionary.invoices.loadMore}}</button>',
    '                       </div>',
    '                   </div>',

    '               </div>',
    '           <div class="float-right likvido-container" style="margin-top: 40px;" v-if="showCollectDebtButton">',
    '               <button class="accent" v-on:click="collectDebt()">{{ui.dictionary.invoices.collectDebt}}</button>',
    '               <likvido-notification ref="likvidonotification" :isUnderTutorial="isUnderTutorial" :isInContext="isInContext"></likvido-notification>',
    '           </div>',
    '           </div>',
    '               <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
    '           </v-popover>',
    '       </div>',
    '   </section>',

    '   </section>',
    '   <section v-if="!invoicesSupported">',
    '       <section class="splash">',
    '           <h1>{{ui.dictionary.invoices.notSupported}}</h1>',
    '           <p>{{parseErpProvider(ui.dictionary.invoices.notSupportedDescription)}}</p>',
    '       </section>',
    '   </section>',
    '</article>'
    ].join('');

    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                loadingSummary : true,
                loadingDetails : true,
                noErp : false,
                noData : false,
                showDatepicker : false,
                loadingMoreRecipients : false,
                section : 'invoices',
                likvidoNotification : true
            },
            invoices : {},
            recipients : [],
            chartObject : null,
            invoicesSortParams,
            chartOptions : {
                chart : {
                    animation: false,
                    spacing: [0, 0, 0, 0],
                    width: (window.innerWidth > 1650 || window.innerWidth < 1200) ? 280 : (window.innerWidth > 1470 ? 240 : 180)
                },
                credits : {
                    enabled : false
                },
                legend : {
                    enabled : false
                },
                plotOptions : {
                    pie : {
                        dataLabels : {
                            enabled : false
                        }
                    },
                },
                series : [
                    {
                        type : 'pie',
                        name : DictionaryModel.getHash().invoices.title,
                        data : [{
                            name : DictionaryModel.getHash().invoices.unpaid,
                            y : 0,
                            color : '#d0edff'
                        }, {
                            name : DictionaryModel.getHash().invoices.overdue,
                            y : 0,
                            color : '#99d7ff'
                        }, {
                            name : DictionaryModel.getHash().invoices.overdue15,
                            y : 0,
                            color : '#2fabff'
                        }],
                        innerSize : '75%',
                        tooltip : {
                            pointFormat : '{point.y}'
                        }
                    }
                ],
                title : null
            },
            sort : {
                param : 'name',
                direction : 'asc'
            },
            invoiceSort : {
                param : 'invoice_number',
                direction : 'desc'
            },
            transactionSort : {
                param : 'date',
                direction : 'desc'
            },
            date : {
                fromDate : null,
                from : null,
                fromValid : true,
                toDate : null,
                to : null,
                toValid : true,
                now : new Date()
            },
            lastRequestWithDates : false,
            totalInvoiced : 0,
            totalRevenue : 0,
            totalUsed : 'invoiced',
            mappingValidated : false,
            profile : UserModel.profile(),
            erp: ErpModel.getErp(),
            tutorial : Tutorial,
            tutorialReady : false,
            currentPage : 1,
            totalPages : 1,
            totalItems : 0,
            currentRecipient : null,
            company : CompanyModel.getCompany()
        };
    };

    var methods = {
        init : function() {

            if (!this.invoicesSupported) {
                return false;
            }

            EventBus.$on('click', this.closeAllOptions);
            EventBus.$on('companyErpChanged', this.loadData);
            document.addEventListener('clickAppBody', this.closeAllOptions);

            setTimeout(function() {
                this.tutorialReady = true;
            }.bind(this), 1000);

            if (this.presetSortParam) {
                this.sort.param = this.presetSortParam;
            }

            if (this.presetSortDirection) {
                this.sort.direction = this.presetSortDirection;
            }

            if (this.isUnderPresentation) {
                this.sort.param = this.presentationPage.settings.sort_param;
                this.sort.direction = this.presentationPage.settings.sort_direction;
                this.loadPresentationData();
            } else {
                this.loadData(this.presetFromDate, this.presetToDate);
            }

            this.$watch(vm => [vm.presetFromDate, vm.presetToDate].join(), () => {
                this.loadData(this.presetFromDate, this.presetToDate);
            })
        },

        parseErpProvider : function (string) {
            return string.replace(':provider', this.ui.dictionary.erp.providers[this.erp.erp]);
        },


        getLikvidoImage : function() {
            return new AssetModel('/assets/img/other/likvido.png').path;
        },

        collectDebt : function (recipient) {
            this.currentRecipient = recipient;
            this.ui.section = 'collect';
        },

        removeDates : function () {
            this.date.fromDate = null;
            this.date.from = null;
            this.date.fromValid = null;
            this.date.toDate = null;
            this.date.to = null;
            this.date.toValid = null;
        },

        erpSupported : function () {
            return !this.erp || (this.erp && this.erp.erp && this.erp.erp != 'seges' && this.erp.erp != 'inventio');
        },

        handleScroll : function(e) {
            var t = e.target;
            var enoughToLoad = (t.offsetHeight + t.scrollTop) >= t.scrollHeight;

            if (enoughToLoad && !this.ui.loadingMoreRecipients && this.currentPage < this.totalPages) {
                this.loadRecipientPage(this.date.from, this.date.to, this.currentPage + 1);
            }
        },

        showInvoiceSortingTutorial : function() {
            return this.tutorial.current && this.tutorial.current.name == 'invoiceSorting' && !this.tutorial.state.loading && !this.tutorial.state.finished && this.tutorialReady;
        },

        getPercent : function(recipient) {
            var percent = 0;

            if (this.erp && !this.erp.currentMappingValidity) {
                this.totalUsed = 'invoiced';
                this.mappingValidated = false;
                percent = this.roundPercent(recipient.total_invoiced / this.totalInvoiced * 100);
            } else if (this.totalRevenue && this.totalRevenue > this.totalInvoiced) {
                this.totalUsed = 'revenue';
                this.mappingValidated = true;
                percent = this.roundPercent(recipient.total_invoiced / this.totalRevenue * 100);
            } else {
                this.totalUsed = 'invoiced';
                this.mappingValidated = true;
                percent = this.roundPercent(recipient.total_invoiced / this.totalInvoiced * 100);
            }

            if (isNaN(percent)) {
                return 0;
            }

            return percent;
        },


        getRecipientName : function(recipient) {
            if (recipient.display_name) {
                return recipient.display_name;
            } else if (recipient.vat_number) {
                return recipient.vat_number;
            } else {
                return this.ui.dictionary.invoices.empty;
            }
        },

        formatDate : function(string) {
            if (string) {
                return moment(string).format(this.ui.dictionary.locale.displayFormat);
            } else {
                return '--';
            }
        },

        roundPercent : function(val) {
            return Math.round(val * 10) / 10;
        },

        getDataWithDates : function() {
            if (!this.date.fromValid || !this.date.toValid || (!this.date.fromDate && !this.date.toDate)) {
                return false;
            }

            this.lastRequestWithDates = true;
            this.loadData(this.date.from, this.date.to);
        },

        setFromDate : function(value, valid) {
            this.date.fromDate = value;
            this.date.fromValid = valid;
            if (value) {
                this.date.from = moment(value).format('YYYY-MM-DD');
            }
        },


        setToDate : function(value, valid) {
            this.date.toDate = value;
            this.date.toValid = valid;
            if (value) {
                this.date.to = moment(value).format('YYYY-MM-DD');
            }
        },


        changeSortBy : function(param) {
            if (this.sort.param == param && this.sort.direction == 'asc') {
                this.sort.direction = 'desc';
            } else if (this.sort.param == param && this.sort.direction == 'desc') {
                this.sort.direction = 'asc';
            } else {
                this.sort.param = param;
                this.sort.direction = 'asc';
            }

            if (this.currentPage < this.totalPages) {
                this.loadRecipientPage(this.date.from, this.date.to, 1);
            }
        },


        changeInvoiceSortBy : function(param) {
            if (this.invoiceSort.param == param && this.invoiceSort.direction == 'asc') {
                this.invoiceSort.direction = 'desc';
            } else if (this.invoiceSort.param == param && this.invoiceSort.direction == 'desc') {
                this.invoiceSort.direction = 'asc';
            } else {
                this.invoiceSort.param = param;
                this.invoiceSort.direction = 'asc';
            }
        },

        changeTransactionSortBy : function(param) {
            if (this.transactionSort.param == param && this.transactionSort.direction == 'asc') {
                this.transactionSort.direction = 'desc';
            } else if (this.transactionSort.param == param && this.transactionSort.direction == 'desc') {
                this.transactionSort.direction = 'asc';
            } else {
                this.transactionSort.param = param;
                this.transactionSort.direction = 'asc';
            }
        },


        sortInvoices : function(invoices) {
            if (!invoices || !invoices.slice) {
                return invoices;
            }

            var list = invoices.slice();

            if (this.invoiceSort.direction == 'desc') {
                return this.sortInvoicesByParam(list, this.invoiceSort.param).reverse();
            }

            return this.sortInvoicesByParam(list, this.invoiceSort.param);
        },

        sortTransactions : function(transactions) {
            if (!transactions || !transactions.slice) {
                return transactions;
            }

            var list = transactions.slice();

            if (this.transactionSort.direction == 'desc') {
                return this.sortTransactionsByParam(list, this.transactionSort.param).reverse();
            }

            return this.sortTransactionsByParam(list, this.transactionSort.param);
        },


        sortInvoicesByParam : function(list, param) {
            return list.sort(function(a, b) {
                return a[param] - b[param];
            });
        },

        sortTransactionsByParam : function(list, param) {
            return list.sort(function(a, b) {
                return a[param] - b[param];
            });
        },


        sortRecipients : function(recipients) {
            if (!recipients || !recipients.slice) {
                return recipients;
            }

            var list = recipients.slice();

            if (this.sort.param == 'name') {
                if (this.sort.direction == 'desc') {
                    return this.sortByName(list).reverse();
                }

                return this.sortByName(list);
            } else {
                if (this.sort.direction == 'desc') {
                    return this.sortByParam(list, this.sort.param).reverse();
                }

                return this.sortByParam(list, this.sort.param);
            }
        },


        sortByName : function(list) {
            return list.sort(function(a, b) {
                if (!a.name && !b.name) {
                    return 0;
                } else if (!a.name) {
                    return 1;
                } else if (!b.name) {
                    return -1;
                }

                return a.name.toLocaleLowerCase()>b.name.toLocaleLowerCase()? 1 : (a.name.toLocaleLowerCase()<b.name.toLocaleLowerCase() ? -1 : 0);
            });
        },


        sortByParam : function(list, param) {
            if (param == 'outstanding') {
                return list.sort(function(a, b) {
                    return (a.unpaid) - (b.unpaid);
                });
            } else if (param == 'unpaid') {
                return list.sort(function(a, b) {
                    return (a.unpaid - a.overdue) - (b.unpaid - b.overdue);
                });
            } else if (param == 'overdue') {
                return list.sort(function(a, b) {
                    return (a.overdue- a.overdue_15_days) - (b.overdue - b.overdue_15_days);
                });
            } else if (param == 'overdue_15_days') {
                return list.sort(function(a, b) {
                     return a.overdue_15_days - b.overdue_15_days;
                });
            } else if (param == 'percent') {
                return list.sort(function(a, b) {
                    return a.total_invoiced - b.total_invoiced;
                });
            } else {
                return list.sort(function(a, b) {
                    return a[param] - b[param];
                });
            }
        },


        toggleDetails : function(recipient) {
            if (!recipient.unpaid ||  recipient.unpaid === 0) {
                return false;
            }

            if (recipient.showDetails) {
                this.hideDetails(recipient.id);
            } else {
                this.showDetails(recipient.id);
            }
        },

        showDetails : function(id) {
            var target = {};

            this.recipients.forEach(function(recipient) {
                if (recipient.id == id) {
                    target = recipient;
                }
            });

            Vue.set(target, 'showDetails', true);

            if (!target.details) {
                var scope = this;

                var from = false;
                var to = false;

                if (this.lastRequestWithDates) {
                    from = this.date.from;
                    to = this.date.to;
                }

                if (!this.isUnderPresentation) {
                    var recipModel = new RecipientModel(id, target.reference);
                    recipModel.getUnpaid(from, to)
                        .then(function(res) {
                            if (res.invoices) {
                                Vue.set(target, 'details', res);
                            } else {
                                Vue.set(target, 'details', 'none');
                            }
                        });


                    recipModel.getUnhandledTransactions(from, to)
                        .then(function(res) {
                            if (res.items) {
                                Vue.set(target, 'transactions', res.items);
                            } else {
                                Vue.set(target, 'transactions', 'none');
                            }
                        });
                } else {
                    PresentationTemplateCollection.getInvoiceRecipientUnpaid(this.presentationToken, this.presentationId, this.presentationPage.id, id)
                        .then(res => {
                            if (res.invoices) {
                                Vue.set(target, 'details', res);
                            } else {
                                Vue.set(target, 'details', 'none');
                            }
                        });

                    PresentationTemplateCollection.getUninvoicedTransaction(this.presentationToken, this.presentationId, this.presentationPage.id, target.reference)
                        .then(res => {
                            if (res.items) {
                                Vue.set(target, 'transactions', res.items);
                            } else {
                                Vue.set(target, 'transactions', 'none');
                            }
                        });


                }
            }
        },

        hideDetails : function(id) {
            var target = {};

            this.recipients.forEach(function(recipient) {
                if (recipient.id == id) {
                    target = recipient;
                }
            });

            Vue.set(target, 'showDetails', false);
        },

        loadData : function(from, to, purgeLRWD) {
            this.erp = ErpModel.getErp();

            if (!this.erpSupported()) {
                this.ui.loading = false;
                return false;
            }

            if (this.invoices.overdue && !this.lastRequestWithDates && !this.isUnderPreview) {
                return false;
            }

            if (purgeLRWD) {
                this.lastRequestWithDates = false;
            }

            if (!this.tutorial.state.started && !ErpModel.getErp()) {
                this.ui.noErp = true;
                this.ui.loadingSummary = false,
                this.ui.loadingDetails = false,
                this.ui.loading = false;
                return false;
            }

            this.ui.loadingSummary = true;
            this.ui.loadingDetails = true;
            this.ui.loading = true;
            this.ui.noData = false;
            this.chartOptions.series[0].data[0].y = 0;
            this.chartOptions.series[0].data[1].y = 0;
            this.chartOptions.series[0].data[2].y = 0;

            if (!from && !to) {
                this.requestedWithDates = false;
            }

            const invoice = new InvoiceModel();
            invoice.getSummary(from ,to, (this.tutorial.state.started && !this.tutorial.state.finished) )
                .then((res) => {
                    //console.log(JSON.stringify(res));
                    if (res.invoices) {
                        this.invoices = res.invoices;
                        this.chartOptions.series[0].data[0].y = (res.invoices.unpaid - res.invoices.overdue) >= 0 ? (res.invoices.unpaid - res.invoices.overdue) : 0;
                        this.chartOptions.series[0].data[1].y = (res.invoices.overdue - res.invoices.overdue_15_days) >= 0 ? (res.invoices.overdue - res.invoices.overdue_15_days) : 0;
                        this.chartOptions.series[0].data[2].y = res.invoices.overdue_15_days >= 0 ? res.invoices.overdue_15_days : 0;
                        this.chartOptions.series[0].tooltip.pointFormatter = () => {
                            return this.formatNumber(this.y);
                        };

                    } else {
                        this.ui.noData = true;
                    }

                    this.ui.loadingSummary = false;

                    if (!this.ui.loadingDetails) {
                        if (res.invoices) {
                            setTimeout(() => {
                                this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#pie-chart'), this.chartOptions);
                                this.ui.loading = false;
                            }, 500);

                            setTimeout(() => {
                                window.dispatchEvent(new Event('resize'));
                            }, 1000);
                        } else {
                            this.ui.loading = false;
                        }
                    }
                });


            const recipients = new RecipientCollection();
            recipients.getSummary(from, to, 1, this.sort, (this.tutorial.state.started && !this.tutorial.state.finished) )
                .then((res) => {
                    if (res.items) {
                        this.recipients = res.items;
                        this.totalInvoiced = res.total_invoiced;
                        this.totalRevenue = res.total_revenue;
                        this.currentPage = 1;
                        this.totalPages = res.last_page;
                        this.totalItems = res.total_items;
                    } else {
                        this.ui.noData = true;
                    }

                    this.ui.loadingDetails = false;

                    if (!this.ui.loadingSummary) {
                        if (res.items) {
                            setTimeout(() => {
                                this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#pie-chart'), this.chartOptions);
                                this.ui.loading = false;
                            }, 500);
                        } else {
                            this.ui.loading = false;
                        }
                    }
                });
        },

        setupPieChartOptions(invoices) {
            this.chartOptions.series[0].data[0].y = (invoices.unpaid - invoices.overdue) >= 0 ? (invoices.unpaid - invoices.overdue) : 0;
            this.chartOptions.series[0].data[1].y = (invoices.overdue - invoices.overdue_15_days) >= 0 ? (invoices.overdue - invoices.overdue_15_days) : 0;
            this.chartOptions.series[0].data[2].y = invoices.overdue_15_days >= 0 ? invoices.overdue_15_days : 0;
            var scope = this;
            this.chartOptions.series[0].tooltip.pointFormatter = function() {
               return scope.formatNumber(this.y);
           };
        },

        loadPresentationData() {
            this.onDataStartedLoading();
            this.resetSeries();

            const startDate = this.presentationPage.start_date ? moment(this.presentationPage.start_date).format('YYYY-MM-DD') : null;
            const endDate = this.presentationPage.end_date ? moment(this.presentationPage.end_date).format('YYYY-MM-DD') : null;

            PresentationTemplateCollection.getInvoiceSummary(this.presentationToken, this.presentationId, this.presentationPage.id, startDate, endDate)
                .then(res => {
                    if (res.invoices) {
                        this.invoices = res.invoices;
                        this.ui.loadingSummary = false;
                       this.setupPieChartOptions(res.invoices);
                    } else {
                        this.ui.noData = true;
                    }
                        if (!this.ui.loadingDetails) {
                            if (res.invoices) {
                                setTimeout(function() {
                                    this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#pie-chart'), this.chartOptions);
                                    this.ui.loading = false;
                                }.bind(this), 500);

                                setTimeout(function() {
                                    window.dispatchEvent(new Event('resize'));
                                }, 1000);
                            } else {
                                this.ui.loading = false;
                            }
                        }
                }
                );

            PresentationTemplateCollection.getInvoiceContactSummary(this.presentationToken, this.presentationId, this.presentationPage.id, 1, this.sort, startDate, endDate)
                .then(res => {
                    if (res.items) {
                        this.recipients = res.items;
                        this.totalInvoiced = res.total_invoiced;
                        this.totalRevenue = res.total_revenue;
                        this.currentPage = 1;
                        this.totalPages = res.last_page;
                        this.totalItems = res.total_items;
                    } else {
                        this.ui.noData = true;
                    }
                    this.ui.loadingDetails = false;
                    this.ui.loading = false;

                    if (!this.ui.loadingSummary) {
                        if (res.items) {
                            setTimeout(() => {
                                this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#pie-chart'), this.chartOptions);
                                this.ui.loading = false;
                            }, 500);
                        } else {
                            this.ui.loading = false;
                        }
                    }
                });

        },

        onDataStartedLoading() {
            this.ui.loadingSummary = true;
            this.ui.loadingDetails = true;
            this.ui.loading = true;
            this.ui.noData = false;
        },

        resetSeries() {
            this.chartOptions.series[0].data[0].y = 0;
            this.chartOptions.series[0].data[1].y = 0;
            this.chartOptions.series[0].data[2].y = 0;
        },

        loadRecipientPage : function(from, to, page) {
            if (page == 1) {
                this.recipients = [];
            }

            this.ui.loadingMoreRecipients = true;

            if (!this.isUnderPresentation) {
                var recipients = new RecipientCollection();
                recipients.getSummary(from, to, page, this.sort)
                    .then(function(res) {
                        if (res.items) {
                            this.recipients = this.recipients.concat(res.items);
                            this.currentPage = page;
                            this.totalPages = res.last_page;

                            if (page == 1) {
                                this.totalInvoiced = res.total_invoiced;
                                this.totalRevenue = res.total_revenue;
                                this.totalItems = res.total_items;
                            }
                        }

                        this.ui.loadingMoreRecipients = false;
                    }.bind(this));
            } else {
                PresentationTemplateCollection.getInvoiceContactSummary(this.presentationToken, this.presentationId, this.presentationPage.id, page, this.sort)
                    .then(res => {
                        if (res.items) {
                            this.recipients = this.recipients.concat(res.items);
                            this.currentPage = page;
                            this.totalPages = res.last_page;

                            if (page == 1) {
                                this.totalInvoiced = res.total_invoiced;
                                this.totalRevenue = res.total_revenue;
                                this.totalItems = res.total_items;
                            }
                        }

                        this.ui.loadingMoreRecipients = false;
                    });
            }


        },

        formatNumber : function(value, currency) {
            if (value === 0 && !this.presentation) {
                //return '0.00' + ' ' + (currency || ErpModel.getErp().currency);
                return '0.00' + ' ' + (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : '');
            } else if (this.presentation && value === 0) {
                return '0.00' + ' ' + this.presentation.toUpperCase();
            } else if (!this.presentation){
                return NumberFormatter.abbreviate(value, true) + ' ' + (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : '');
            } else {
                //return NumberFormatter.abbreviate(value) + ' ' + (currency || ErpModel.getErp().currency);
                return NumberFormatter.abbreviate(value, true) + ' ' + this.presentation.toUpperCase();
            }
        },

        localeFormat : function(value) {
            if (!this.presentation) {
                return NumberFormatter.format(value) + ' ' + (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : '');
            } else {
                return NumberFormatter.format(value) + ' ' + this.presentation.toUpperCase();
            }
        },

        closeAllOptions : function() {
            return false;
        }
    };

    const computed = {
        showDateFilter() {
            return !this.ui.showDatepicker && this.erpSupported() && !this.isUnderPreview && !this.isUnderPresentation;
        },
        hasCollectorsRole() {
            return this.profile.roles && this.profile.roles.indexOf(userRoles.DEBT_COLLECTION_ROLE) >= 0;
        },
        hasCompanyUserRole() {
            return this.profile.roles && this.profile.roles.indexOf(userRoles.COMPANY_USER_ROLE) >= 0;
        },
        gotRecipients() {
            return !!this.recipients.length;
        },
        showNotification() {
            return this.$store.getters.likvidoNotification && !this.isUnderTutorial && !this.isUnderEditPresentation && !this.isUnderPresentation;
        },
        isUnderTutorial() {
            return this.tutorial.state.started && !this.tutorial.state.finished;
        },
        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        },
        isUnderPreview() {
          return this.$store.getters.showPreview;
        },
        isUnderPresentation() {
          return this.$store.getters.presentationMode;
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
        showCollectDebtButton() {
            return (this.hasCollectorsRole || this.hasCompanyUserRole) && !this.isInContext && !this.isUnderEditPresentation && !this.isUnderPresentation;
        },
        invoicesSupported() {
            const { erp, isUnderPresentation } = this;
            if (erp?.invoiceEnabled) {
                return true
            }
            if (isUnderPresentation) {
                return true
            }
            // These ERPs don't support financial reports
            const erpsWithNoFinancialReportSupport = [
                'seges',
                'dinero',
                'eg-one',
                'fortnox',
                'tripletex',
                'xena'
            ]
            if (erpsWithNoFinancialReportSupport.indexOf(erp?.erp) >= 0) {
                return false
            }
            return true
        }
    };

    return {
        template : template,
        data : bindings,
        computed,
        methods : methods,
        props : ['presentationInfoFlag', 'processReportPageInfo', 'presentation', 'presetFromDate', 'presetToDate', 'presetSortParam', 'presetSortDirection'],
        components : {
            'date-field' : dateField,
            'tutorial-slide' : tutorialSlide,
            'collect-debt' : collectDebt,
            'likvido-notification': likvidoNotification
        },
        mixins: [contextMixin],
        created : function() {
            this.init();
        },
        beforeDestroy : function() {
            EventBus.$off('click');
            EventBus.$off('companyErpChanged');
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        },
        watch : {
            presentationInfoFlag : function () {
                const { param: sort_param, direction: sort_direction } = this.sort;

                this.processReportPageInfo({
                    aggregations : false,
                    balance : null,
                    benchmark : null,
                    budget : null,
                    budget_loaded_file : null,
                    compare : null,
                    pseudo_dashboard : '_invoices',
                    start_date: this.date.from || null,
                    end_date: this.date.to || null,
                    context: 'invoice',
                    settings: {
                        sort_param,
                        sort_direction,
                        filter_start_date: this.date.from,
                        filter_end_date: this.date.to,
                    }

                });
            },
            gotRecipients(val) {
                if (val && this.showNotification && !this.isUnderTutorial && !this.isUnderEditPresentation) {
                    // Dirty one to make sure if data is loaded and notification is already rendered, need to find something better later
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.$refs.likvidonotification.$el.scrollIntoView(true);
                        });
                    }, 1000);
                }
            }
        }
    };
});
