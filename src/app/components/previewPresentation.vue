<template>
    <article class="presentation-preview small-presentation-preview" :style="currentPageIndex === 0 ? 'height: 100%; background-image: url(' + getTitleBackground() + '); background-size: cover; background-position: center center; width: 100%;' : 'height: 100%'" ref="reportedPreview">
        <div class="app-loader" style="padding: 0;" v-show="ui.loading"></div>
        <section v-show="!ui.loading" style="height: 100%">

            <div class="go-left added" v-show="currentPageIndex > 0" v-on:click="previousPage()"><i class="cwi-left"></i></div>
            <div v-show="currentPageIndex === 0 && isOpenPreview && pages.length > 1" style="padding: 0"><div class="tooltip-slider-right" id="tooltip-slider-right" style="top: 43vh;">{{ui.dictionary.presentations.clickNavigate}}</div><div class="arrow" style="top: 42.5vh;"></div></div>
            <div class="go-right" :style="currentPageIndex === 0 ? 'top: 39.5vh;' : ''" :class="[ currentPageIndex === 0 ? 'first-right-button' : 'added' ]" v-show="currentPageIndex < pages.length - 1" v-on:click="nextPage()"><i class="cwi-right" :style="currentPageIndex === 0 ? 'padding: 20px;' : ''"></i></div>
            <div class="header-title-report">
                <div class="shared-link">
                    <button v-if="hasTemplatesRole" class="primary" v-on:click="saveAsTemplate(report)" style="margin-top: 0px; margin-right: 10px; padding: 2px 20px; height: 35px;">{{ui.dictionary.presentations.saveAsTemplate}}</button>
                    <button class="secondary" v-on:click="showLinkModal(report)" style="margin-top: 0px; padding: 2px 20px;">{{ui.dictionary.presentations.getLink}}</button>
                </div>
            </div>
            <div class="cover-page preview-cover-page" style="background: " v-if="ui.showCoverPage">
                <div class="main-info small-preview-main-info">
                    <div v-if="company.logo">
                        <img :src="company.logo" class="company-logo">
                    </div>
                    <div v-if="!company.logo">
                        <img :src="getLogo()" class="company-logo">
                    </div>
                    <div :class="{ titleNamePresentation : currentPageIndex === 0 }"><h1 style="margin-top: 1rem; font-size: 2.6vw">{{currentPage.name}}</h1></div>
                    <h2 style="margin-left: 0">{{currentPage.title}}</h2>
                    <div class="dates">{{formatDate(currentPage.start_date)}} - {{formatDate(currentPage.end_date)}}</div>
                    <div class="comment title-comment">{{currentPage.description}}</div>
                    <div class="development-info">{{ui.dictionary.presentations.poweredBy}} <a class="link-powered" href="https://crediwire.com/en/company.html" target="_blank">CrediWire</a> </div>
                </div>
                <div class="table-of-contents small-table-contents">
                    <div class="choose-block">
                        <p class="title-contents-table" style="margin-bottom: 15px;">{{ui.dictionary.presentations.TableContains}}</p>
                        <div class="wrap-contents-presentation">
                            <div v-for="(page, index) in sortPages(pages)">
                                <button class="button-contents" @click="nextPage(index)"><i class="cwi-graph type-slide-icon" v-show="getGraphIcon(page)"></i><i class="cwi-pie-chart type-slide-icon" v-show="getChartIcon(page)"></i> <i class="cwi-table type-slide-icon" v-show="getTableIcon(page)"></i><span style="font-weight: 500;"> {{page.name}}</span></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="dashboard" v-if="ui.showDashboard">
                <h1>{{currentPage.name}}</h1>
                <h2>{{currentPage.title}}</h2>
                <div class="dates">{{formatDate(currentPage.start_date)}} - {{formatDate(currentPage.end_date)}}</div>
                <dashboard :dash="currentDashboard" :presets="true" :presetSeries="presets.series" :presetGraphType="presets.graphType" :presetAverage="presets.average" :presetCashbook="presets.cashbook" :presetInterval="presets.interval" :presetPrevious="presets.previous" :presetSpread="presets.spread" :presetType="presets.type" :presetSection="presets.section" :presetFromDate="presets.from" :presetToDate="presets.to" :presetBudget="presets.budget" :presetReclassified="presets.reclassified" :presentation="true" :presetDrilldown="presets.drilldown"></dashboard>
            </div>


            <div class="dashboard" v-if="ui.showTrialBalance">
                <h1>{{currentPage.name}}</h1>
                <h2>{{currentPage.title}}</h2>
                <balance :key="currentPage.id" :rowsIdsToShow="presets.balanceRowsToShow" :presetBalance="presets.balance" :presetCashbook="presets.cashbook" :presetCompare="presets.compare" :presetInterval="presets.interval" :presetFromDate="presets.from" :presetToDate="presets.to" :presetSection="presets.section" :presentation="true"></balance>
            </div>

            <div class="dashboard" v-if="ui.showInvoices">
                <h1>{{currentPage.name}}</h1>
                <h2>{{currentPage.title}}</h2>
                <invoices :presetFromDate="presets.from" :presetToDate="presets.to" :presetSortParam="presets.sort_param" :presetSortDirection="presets.sort_direction"></invoices>
            </div>

            <div class="dashboard" v-if="ui.showAnnualReport">
                <h1>{{currentPage.name}}</h1>
                <annual-report></annual-report>
            </div>

            <div class="dashboard" v-if="ui.showFinancialReport">
                <h1>{{currentPage.name}}</h1>
                <h2>{{currentPage.title}}</h2>
                <financial-report :previewPresentation="true" :presetFromDate="presets.from" :presetToDate="presets.to" :isBudget="presets.financialReportSource === 'budget'" :presetFinancialReportSource="presets.financialReportSource" :presetCashbook="presets.cashbook" :presetIntervals="presets.interval" :presetBudgetComparison="presets.financialReportSource !== 'budget' && currentPage.budget_included" :presetDeltaType="currentPage.settings.deltaType"></financial-report>
            </div>


            <div class="dashboard" v-if="ui.showFileUploadPage">
                <h1>{{currentPage.name}}</h1>
                <h2>{{currentPage.title}}</h2>
                <div class="flex-column flex-align-center">
                    <button class="primary"
                            @click="getFileRawData({
                                presentationId: report.id,
                                pageId: currentPage.id})"
                    >{{ui.dictionary.annualReport.download}}</button>
                </div>

            </div>

            <div class="presentation-info">
                <report-info class="small-info" :presentation="report" :pages=pages style="margin-left: 80px;"></report-info>
                <div class="items-slide-presentation preview-item-slides">
                    <div class="page-thumb" v-for="(page, index) in sortPages(pages)" :class="{'current-page': currentPageIndex === index}">
                        <report-page :key="page.id"
                                     :page="page">
                        </report-page>
                    </div>
                </div>
            </div>
        </section>
        <presentation-description :description="currentPage.description" v-show="currentPage.description && currentPage.description.length" :preview="true"></presentation-description>
    </article>
</template>

<script>
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import lineChart from 'elements/line-chart'
    import presentationDescription from 'components/presentationDescription.vue'
    import DashboardView from 'views/DashboardView'
    import BalanceView from 'views/BalanceView'
    import InvoicesView from 'views/InvoiceView'
    import AnnualReportView from 'views/AnnualReportView'
    import financialReport from 'elements/financial-report.vue'
    import reportInfo from 'components/reportInfo.vue'
    import reportPage from 'components/reportPage.vue'
    import dashboardMutationTypes from 'store/dashboardMutationTypes'
    import presentationMutationTypes from 'store/presentationMutationTypes'
    import presentationMixin from 'mixins/presentationMixin'
    import easyViewMixin from 'mixins/easyViewMixin'
    import getIconsMixin from 'mixins/getIconsMixin'
    import dateMixin from 'mixins/dateMixin'
    import reportSharingMixin from 'mixins/reportSharingMixin'
    import EventBus from 'services/EventBus'
    import Config from 'services/Config'
    import reportPageTypes from 'constants/reportPageTypes'
    import modal from 'elements/modals/modal'
    import getLinkModal from 'elements/modals/get-link'
    import FileSaver from 'FileSaver'

    let reportGeneratingInterval = null;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : false,
            showCoverPage : false,
            showDashboard : false,
            showTrialBalance : false,
            showGraphs : false,
            daysLoading : false,
            weeksLoading : false,
            monthsLoading : false,
            quartersLoading : false,
            halfyearsLoading : false,
            yearsLoading : false,
            showInvoices : false,
            showAnnualReport: false,
            showFinancialReport: false,
            showFileUploadPage : false,
            refresh: 0,
        },
        shareLink : {
            name : { value : '', valid : true },
            email : { value : '', valid : true },
            comment : { value : '', valid : true }
        },
        domain : Config.get('domain'),
        shareLinkInfo : null,
        currentPageIndex : 0,
        currentPage : null,
        currentDashboard : null,
        presets : {
            average : null,
            cashbook : null,
            interval : null,
            budget : null,
            previous : null,
            spread : null,
            type : null,
            balance : null,
            compare : null,
            section : null,
            from : null,
            to : null,
            graphType : 'line',
            series : [],
            drilldown : false,
            balanceRowsToShow: null,
            reclassified: null,
            presetFinancialReportSource: null,
            file_upload_id: null,
        },
        company : CompanyModel.getCompany(),
        hasTemplatesRole: UserModel.profile().roles.indexOf('template_role') >= 0
    });


    const methods = {
        init() {
            this.showPage(this.currentPageIndex);
            document.onkeydown = function (e) {
                e = e || window.event;

                if (e.keyCode == '37') {
                    this.previousPage();
                } else if (e.keyCode == '39') {
                    this.nextPage();
                }
            }.bind(this);
        },

        getLogo() {
            return new AssetModel('/assets/img/logo/default.png').path;
        },

        nextPage(param) {
            this.$store.dispatch('openReport', false);

            param >= 0 ? this.currentPageIndex = param : this.currentPageIndex++;
            if (this.currentPageIndex < 0) {
                this.currentPageIndex = 1;
            }

            if (this.currentPageIndex >= this.pages.length) {
                this.currentPageIndex = this.pages.length - 1;
                return false;
            }

            if (this.currentPageIndex <= this.pages.length - 1) {
                this.showPage(this.currentPageIndex);
            }
        },

        previousPage() {
            this.$store.dispatch('openReport', false);

            this.currentPageIndex--;
            if (this.currentPageIndex >= 0) {
                this.showPage(this.currentPageIndex);
            } else {
                this.currentPageIndex = 0;
            }
        },

        showPage(index) {
            this.resetPage();

            if (this.isClickedPreview) {
                this.currentPageIndex = 0;
                index = 0;
                this.$store.dispatch('openReport', true);
            }
            this.$store.dispatch('setClickPreview', false);

            this.currentPage = Object.assign({}, this.pages[index]);
            if (this.isShowPreview && this.currentPage.settings && this.currentPage.settings.kpis) {
                this.$store.dispatch('setPreviousType', this.currentPage.settings.kpis);
            }

            this.setPresentationPage(index);

            if (this.currentPage.presentation_upload_id) {
                this.showFileUploadPage(this.currentPage);
            }

            if (this.currentPage.context === 'invoice') {
                this.ui.showInvoices = true;
                this.loadInvoicesPage(this.currentPage);
            }
            if (this.currentPage.settings.graphType) {
                this.checkEasyView(this.currentPage.settings);
            }
            if (this.currentPage.front_page) {
                this.ui.showCoverPage = true;
            } else if (this.currentPage.context === reportPageTypes.ANNUAL_REPORT) {
                if (this.isShowPreview) {
                    this.$store.dispatch('setAnnualReportSettings', this.currentPage.settings.value);
                }
                this.loadAnnualReportData(this.currentPage);
                this.isShowPreview ? this.$store.dispatch('setAnnualReportSettings', this.currentPage.settings.value) : '';
            } else if (this.currentPage.context === reportPageTypes.FINANCIAL_REPORT){
                this.showFinancialReport(this.currentPage);
            } else if (this.currentPage.pseudo_dashboard == '_general' || this.currentPage.dashboard || this.currentPage.dashboard_id || this.currentPage.kpi_drill_down) {
                this.loadDashboardData(this.currentPage);
            } else if (this.currentPage.pseudo_dashboard == '_palbal') {
                this.loadBalanceData(this.currentPage);
            }
        },

        translateSystemKPIs(series) {
            return series.map(serie => this.ui.dictionary.systemKpis[serie] || serie);
        },

        setPresentationPage(index) {
            this.currentPage = Object.assign({}, this.pages[index]);

            this.$store.dispatch('setClickPreview', false);
            this.$store.dispatch('setPresentationPage', this.currentPage);
        },

        formatFromToDateFormats(page) {
            var startFormat = 'YYYY-MM-DD';
            var endFormat = 'YYYY-MM-DD';

            if (page.start_date.length == 8) {
                startFormat = 'YYYY-M-D';
            } else if (page.start_date.length == 9 && page.start_date.substring(6, 7) == '-') {
                startFormat = 'YYYY-M-DD';
            } else if (page.start_date.length == 9) {
                startFormat = 'YYYY-MM-D';
            }

            if (page.end_date.length == 8) {
                endFormat = 'YYYY-M-D';
            } else if (page.end_date.length == 9 && page.end_date.substring(6, 7) == '-') {
                endFormat = 'YYYY-M-DD';
            } else if (page.end_date.length == 9) {
                endFormat = 'YYYY-MM-D';
            }

            return {
                startFormat,
                endFormat
            };
        },

        showFileUploadPage(page) {
          this.ui.showFileUploadPage = true;
          this.presets.uploadId = page.file_upload_id;
        },

        showFinancialReport(page) {
            this.ui.showFinancialReport = true;

            const { startFormat, endFormat } = this.formatFromToDateFormats(page);

            this.presets.cashbook = page.cashbook == 'false' ? false : page.cashbook;
            this.presets.interval = page.intervals;
            this.presets.from = moment(page.start_date, startFormat).format('YYYY-MM-DD');
            this.presets.to = moment(page.end_date, endFormat).format('YYYY-MM-DD');
            this.presets.financialReportSource = page.financial_report_source || null;

        },

        loadDashboardData : function (page) {
            if ( (page.pseudo_dashboard && page.pseudo_dashboard == '_general') || page.kpi_drill_down) {
                this.currentDashboard = this.realtimeDashboard;
            } else {
                this.dashboards.forEach(function (dash) {
                    if (dash.id == page.dashboard || dash.id === page.dashboard_id) {
                        this.currentDashboard = dash;
                    }
                }.bind(this));
            }

            const { startFormat, endFormat } = this.formatFromToDateFormats(page);

            this.presets.average = page.benchmark;
            this.presets.cashbook = page.cashbook === 'false' ? false : page.cashbook;
            this.presets.interval = page.intervals;
            this.presets.previous = page.settings && page.settings.previousEnabled ? page.previous : false;
            this.presets.budget = page.budget;
            this.presets.from = moment(page.start_date, startFormat).format('YYYY-MM-DD');
            this.presets.to = moment(page.end_date, endFormat).format('YYYY-MM-DD');
            this.presets.graphType = page.settings && page.settings.graphType ? page.settings.graphType : [];
            this.presets.series = page.settings && page.settings.series ? page.settings.series : [];
            this.presets.type = page.settings && page.settings.type ? page.settings.type : 'DKK';
            this.presets.drilldown = page.kpi_drill_down ? page.kpi_drill_down : false;
            this.presets.spread = page.spread || null;
            this.presets.reclassified = page.reclassified;
            this.presets.financialReportSource = page.financial_report_source || null;

            if (page.aggregations) {
                this.presets.section = 'kpis';
            } else {
                this.presets.section = 'timeline';
            }

            setTimeout(function () {
                this.ui.showDashboard = true;
            }.bind(this), 100);
        },

        loadInvoicesPage(page) {
            var startFormat = 'YYYY-MM-DD';
            var endFormat = 'YYYY-MM-DD';
            //sortParam
            const { sort_param, sort_direction } = page.settings;
            this.presets = Object.assign(this.presets, {sort_param, sort_direction});

            this.presets.from = moment(page.start_date, startFormat).format('YYYY-MM-DD');
            this.presets.to = moment(page.end_date, endFormat).format('YYYY-MM-DD');
        },

        getFileRawData({presentationId, pageId}) {
            PresentationTemplateCollection.getFileContents({presentationId, pageId, uploadId: this.currentPage.presentation_upload_id})
              .then(data => {
              if (!data) {
                return false;
              }
              const blob = new Blob([data], {
                type : 'application/pdf'
              });

              FileSaver.saveAs(blob, this.currentPage.name + '.pdf');
            });
        },

        resetPage() {
            this.ui.showCoverPage = false;
            this.ui.showDashboard = false;
            this.ui.showTrialBalance = false;
            this.ui.showInvoices = false;
            this.ui.showAnnualReport = false;
            this.ui.showFinancialReport = false;
            this.ui.showFileUploadPage = false;
        },

        getTitleBackground() {
            return new AssetModel('/assets/img/slideshow/reporting_bg.png').path;
        },

        loadBalanceData(page) {
            const { cashbook, balance, intervals: interval, start_date: from, end_date: to, settings } = page;

            const cashbookValue = cashbook === 'false' ? false : page.cashbook;

            this.presets = {
                cashbook: cashbookValue,
                balance,
                interval,
                from: moment(from).format('YYYY-MM-DD'),
                to:  moment(to).format('YYYY-MM-DD'),
                balanceRowsToShow: settings?.balanceRowsToShow || null,
                section: settings?.section || null
            };

            this.ui.showTrialBalance = true;
        },

        loadAnnualReportData() {
            this.presets = {};
            this.ui.showAnnualReport = true;
            EventBus.$emit('companyUserChanged');
        },
    };

    const computed = {
        isShowPreview() {
            return this.$store.getters.showPreview;
        },
        isClickedPreview() {
            return this.$store.getters.clickPreview;
        },
        isKPIs() {
            return this.$store.getters.isKpis;
        },
        isOpenPreview() {
            return this.$store.getters.isOpenReport;
        }
    };

    export default {
        name: 'preview-presentation',
        data,
        methods,
        computed,
        mixins: [easyViewMixin, getIconsMixin, presentationMixin, dateMixin, reportSharingMixin],
        props : ['report', 'pages', 'dashboards', 'realtimeDashboard', 'saveAsTemplate'],
        components : {
            'line-chart' : lineChart,
            'dashboard' : DashboardView,
            'balance' : BalanceView,
            'invoices': InvoicesView,
            'annual-report': AnnualReportView,
            'presentation-description': presentationDescription,
            'financial-report' : financialReport,
            'report-info': reportInfo,
            'report-page': reportPage
        },
        beforeUpdate() {
            this._props.pages.length > 0 && this.currentPageIndex === 0 ? this.init() : '';
            this.isClickedPreview ? this.init() : '';
        }
    }

</script>
