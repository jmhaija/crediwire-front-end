<template>
    <article class="presentation-preview small-report-presentation-preview" :style="pageIndex === 0 ? 'height: 100vh; background-image: url(' + getTitleBackground() + '); background-size: cover; background-position: center center; width: 100%;' : 'height: 100%; margin-top: 6%;'" ref="reportedPreview">
       <div class="app-loader" v-show="ui.loading"></div>
       <section v-show="!ui.loading">

           <div class="go-left" style="top: 35vh;" v-show="pageIndex > 0" v-on:click="getPreviousPage()"><i class="cwi-left"></i></div>
           <div v-if="pageIndex === 0 && isOpenPreview"><div class="tooltip-slider-right" id="tooltip-slider-right">{{ui.dictionary.presentations.clickNavigate}}</div><div class="arrow"></div></div><div class="go-right" :class="[ pageIndex === 0 ? 'first-right-button' : '' ]" :style="pageIndex === 0 ? 'top: 45vh;' : 'top: 35vh;'" v-show="pageIndex < pagesInfo.length - 1" v-on:click="getNextPage()"><i class="cwi-right" style="padding: 20px;"></i></div>

           <div class="cover-page" style="display: flex;" v-if="ui.showCoverPage">
               <div class="main-info small-main-info-presentation" style="margin-top: 125px;">
                  <div v-if="presentation.logo">
                       <img :src="presentation.logo" class="company-logo">
                   </div>
                  <div v-if="!presentation.logo">
                      <img :src="getLogo()" class="company-logo">
                  </div>
                  <h1>{{currentPage.name}}</h1>
                  <h2>{{currentPage.title}}</h2>
                  <div class="dates">{{formatDate(currentPage.start_date)}} - {{formatDate(currentPage.end_date)}}</div>
                  <div class="comment title-comment">{{currentPage.description}}</div>
                  <div class="development-info" style="bottom: 32px;">{{ui.dictionary.presentations.navigationInstructions}}</div>
               </div>
               <div class="table-of-contents small-report-table-contents">
                   <div class="choose-block" style="max-height: 68vh;">
                    <p class="title-contents-table" style="margin-bottom: 32px;">{{ui.dictionary.presentations.TableContains}}</p>
                        <div class="wrap-contents-presentation">
                            <div v-for="(page, index) in sortPages(pagesInfo)">
                               <button class="button-contents" :style="index === 0 ? 'pointer-events: none; margin-top: 0.5rem;' : 'margin-top: 0.5rem;'" @click="getNextPage(index)"><i class="cwi-graph type-slide-icon" v-show="getGraphIcon(page)"></i><i class="cwi-pie-chart type-slide-icon" v-show="getChartIcon(page)"></i> <i class="cwi-table type-slide-icon" v-show="getTableIcon(page)"></i><span style="font-weight: 500;"> {{page.name}}</span></button>
                            </div>
                        </div>
                   </div>
               </div>
           </div>

           <div class="dashboard" v-if="ui.showDashboard">
               <h1>{{currentPage.name}}</h1>
               <h2>{{currentPage.title}}</h2>
               <div class="dates">{{formatDate(currentPage.start_date)}} - {{formatDate(currentPage.end_date)}}</div>
               <dashboard :dash="currentDashboard" :presets="true" :presetSeries="presets.series" :presetGraphType="presets.graphType" :presetAverage="presets.average" :presetCashbook="presets.cashbook" :presetInterval="presets.interval" :presetPrevious="presets.previous" :presetSpread="presets.spread" :presetType="presets.type" :presetBudget="presets.budget" :presetSection="presets.section" :presetFromDate="presets.from" :presetToDate="presets.to" :presentation="true" :presentationData="data" :presetDrilldown="presets.drilldown" :presetCurrency="currency" :presetReclassified="presets.reclassified"></dashboard>
               <presentation-description :class="{stick: isHide}" :description="currentPage.description" v-show="currentPage.description && currentPage.description.length" :preview="false"></presentation-description>
           </div>


           <div class="dashboard" v-if="ui.showTrialBalance">
               <h1>{{currentPage.name}}</h1>
               <h2>{{currentPage.title}}</h2>
               <balance :presetData="data" :rowsIdsToShow="presets.balanceRowsToShow" :presetBalance="presets.balance" :presetCashbook="presets.cashbook" :presetCompare="presets.compare" :presetInterval="presets.interval" :presetFromDate="presets.from" :presetToDate="presets.to" :presetSection="presets.section" :presentation="true"></balance>
               <presentation-description :class="{stick: isHide}" :description="currentPage.description" v-show="currentPage.description && currentPage.description.length" :preview="false"></presentation-description>
           </div>


           <div class="dashboard" v-if="ui.showInvoices">
               <h1>{{currentPage.name}}</h1>
               <h2>{{currentPage.title}}</h2>
               <invoices :presentation="currency"></invoices>
               <presentation-description :class="{stick: isHide}" :description="currentPage.description" v-show="currentPage.description && currentPage.description.length" :preview="false"></presentation-description>
           </div>

           <div class="dashboard" v-if="ui.showAnnualReport">
               <h1>{{currentPage.name}}</h1>
               <annual-report></annual-report>
               <presentation-description :class="{stick: isHide}" :description="currentPage.description" v-show="currentPage.description && currentPage.description.length" :preview="false"></presentation-description>
           </div>

           <div class="dashboard" v-if="ui.showFinancialReport">
               <h1>{{currentPage.name}}</h1>
               <h2>{{currentPage.title}}</h2>
               <financial-report :isBudget="currentPage.financial_report_source === 'budget'"></financial-report>
               <div class="comment">{{currentPage.description}}</div>
           </div>

           <div class="dashboard" v-if="ui.showFileUpload">
               <h1>{{currentPage.name}}</h1>
               <h2>{{currentPage.title}}</h2>
               <div class="flex-column flex-align-center">
                   <button class="primary" @click="getFileRawData({
                        presentationId: presentationInfo.id,
                        pageId: currentPage.id
                    })">{{ui.dictionary.annualReport.download}}</button>
               </div>
               <div class="comment">{{currentPage.description}}</div>
           </div>

           <div class="presentation-editor info-presentation" :class="{collapsePresentationInfo : isHide}">
            <span class="show-hide-icon" v-html="isHide? '+' : '-'" @click="toggleCollapse()">-</span>
            <div :class="{collapseMainInfo : isHide}">
                <div class="info small-info" style="margin-left: 80px; bottom: 29px;">
                    <div class="open-icon tooltip"><span class="report-name" v-on:click="ui.showPresentationInfo = true">{{presentationInfo.name}}</span><div class="message right white-message" style="top: 0 !important;">{{presentationInfo.name}}</div></div>
                    <span class="created">{{formatDate(presentationInfo.created)}}</span>
                    <span class="pages">{{ui.dictionary.presentations.pages}}: <span class="page-number">{{pagesInfo.length}}</span></span>
                </div>
                <div class="items-slide-presentation">
                    <div v-for="(page, index) in sortPages(pagesInfo)" class="page-thumb">
                       <span class="icon" :style="pageIndex === index ? 'border: 1px solid #2fabff; pointer-events: none;' : 'border: none; cursor: pointer;'" @click="getNextPage(index, true)">
                           <span class="delete"></span>
                           <span class="title-page" v-show="page.front_page">{{ui.dictionary.presentations.titlePage}}</span>
                           <span class="icon-image" v-show="getGraphIcon(page, true)"><i class="cwi-graph"></i></span>
                           <span class="icon-image" v-show="getChartIcon(page, true)"><i class="cwi-pie-chart"></i></span>
                           <span class="icon-image" v-show="getTableIcon(page, true)"><i class="cwi-table"></i></span>
                       </span>
                    <span class="name page-name text-overflow" :title="page.name">{{page.name}}</span>
                    </div>
                </div>
            </div>
        </div>
        </section>
    </article>
</template>

<script>
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import BalanceView from 'views/BalanceView'
    import DashboardView from 'views/DashboardView'
    import InvoiceView from 'views/InvoiceView'
    import AnnualReportView from 'views/AnnualReportView'
    import financialReport from 'elements/financial-report.vue'
    import presentationDescription from 'components/presentationDescription.vue'
    import easyViewMixin from 'mixins/easyViewMixin'
    import getIconsMixin from 'mixins/getIconsMixin'
    import FileSaver from 'FileSaver'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            showCoverPage : false,
            showDashboard : false,
            showTrialBalance : false,
            showInvoices: false,
            showAnnualReport: false,
            showFinancialReport: false,
            showFileUpload : false
        },
        idShowPresentationItems: null,
        isTablePresentation: false,
        pageIndex : -1,
        presentationInfo : null,
        pagesInfo : [],
        data : null,
        currentPage : null,
        presets : {
            average : null,
            cashbook : null,
            interval : null,
            previous : null,
            budget : null,
            spread : null,
            type : null,
            balance : null,
            compare : null,
            section : null,
            from : null,
            to : null,
            series : [],
            graphType : 'line',
            drilldown : false,
            currency: null,
            balanceRowsToShow: [],
            reclassified: null
        },
        currentDashboard : {},
        newBal: [],
        newPal: [],
        newKeyPal: [],
        newKeyBal: [],
        isGoNext: false,
        isHide: false
    });


    const methods = {
        init() {
            sessionStorage.clear();
            this.getPresentationInfo();
            this.getPagesInfo();
            this.getCurrency();
            this.setPresentationMode();

            this.$store.dispatch('openReport', true);

            document.onkeydown = function (e) {
                e = e || window.event;

                if (e.keyCode == '37' && this.isGoNext) {
                    this.getPreviousPage();
                } else if (e.keyCode == '39' && this.pagesInfo[this.pageIndex + 1] && this.isGoNext) {
                    this.getNextPage();
                }
            }.bind(this);
        },

        setPresentationMode() {
            this.$store.dispatch('setPresentationMode', true);

            this.$store.dispatch('setPresentationId', this.presentation.presentation.id);

            this.$store.dispatch('setPresentationToken', this.presentation.token.value);
        },

        getLogo() {
            return new AssetModel('/assets/img/logo/default.png').path;
        },

        sortPages(pages) {
            var list = pages.slice();
            var sortedList = list.sort(function (a, b) {
                return b.number - a.number;
            });

            return sortedList.reverse();
        },

        formatDate(string) {
            if (string) {
                return moment(string).format(this.ui.dictionary.locale.displayFormat);
            } else {
                return '--';
            }
        },

        getCurrency() {
            this.currency = this.presentation.currency;
            if (this.currency) {
                this.currency = this.currency.toUpperCase();
            }
        },

        getPresentationInfo() {
            PresentationTemplateCollection.getPresentationInfo(this.presentation.token.value, this.presentation.presentation.id)
                .then(function (res) {
                    if (res.id) {
                        this.presentationInfo = res;
                        if (!this.presentationInfo.finalized) {
                            this.showLockedDialog();
                        }
                    }
                }.bind(this));
        },

        getPagesInfo() {
            PresentationTemplateCollection.getPagesInfo(this.presentation.token.value, this.presentation.presentation.id)
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.pagesInfo = this.sortPages(res._embedded.items);
                        this.getNextPage();
                    }
                }.bind(this));
        },

        getPreviousPage() {
            this.presets = {
                average : null,
                cashbook : null,
                interval : null,
                previous : null,
                budget : null,
                spread : null,
                type : null,
                balance : null,
                compare : null,
                section : null,
                from : null,
                to : null,
                series : [],
                graphType : 'line'
            };

            this.ui.showCoverPage = false;
            this.ui.showDashboard = false;
            this.ui.showTrialBalance = false;
            this.ui.showAnnualReport = false;
            this.ui.showInvoices = false;
            this.ui.showFinancialReport = false;
            this.ui.showFileUpload = false;

            this.ui.loading = true;
            this.isGoNext = false;
            if (this.pageIndex > 0 && this.pagesInfo[this.pageIndex - 1]) {
                this.pageIndex--;
            }
            var page = this.pagesInfo[this.pageIndex];

            this.$store.dispatch('setPresentationPage', page);

            this.currentPage = page;
            if (this.currentPage.settings.graphType) {
                this.checkEasyView(this.currentPage.settings);
            }

            if (this.currentPage.settings && this.currentPage.settings.kpis) {
                this.$store.dispatch('setPreviousType', this.currentPage.settings.kpis);
            }

            this.presets.average = page.benchmark;
            this.presets.cashbook = page.cashbook == 'false' ? false : page.cashbook;
            this.presets.interval = page.intervals;
            this.presets.previous = page.settings && page.settings.previousEnabled ? page.previous : false;
            this.presets.budget = page.budget;
            this.presets.from = moment(page.start_date).format('YYYY-MM-DD');
            this.presets.to = moment(page.end_date).format('YYYY-MM-DD');
            this.presets.balance = page.balance;
            this.presets.section = this.getPresetsSection(page);
            this.presets.series = page.settings && page.settings.series ? page.settings.series : [];
            this.presets.graphType = page.settings && page.settings.graphType ? page.settings.graphType : 'line';
            this.presets.type = page.settings && page.settings.type ? page.settings.type : 'DKK';
            this.presets.drilldown = page.kpi_drill_down ? page.kpi_drill_down : false;
            this.presets.balanceRowsToShow = (page.settings && page.settings.balanceRowsToShow) || null;
            this.presets.spread = page.spread || null;
            this.presets.reclassified = page.reclassified;
            this.$store.dispatch('openReport', false);

            if (page.number === 0) {
                page.number = 1;
            }

            if (page.number == 1) {
                this.ui.showCoverPage = true;
                this.ui.loading = false;
                this.isGoNext = true;
                return false;
            }

            if (page.presentation_upload_id) {
                this.showFileUpload()
            } else if (page.context === 'invoice') {
                this.showInvoices();
            } else if (page.context === 'annual_report') {
                this.showAnnualReport();
            } else if (page.context === 'financial_report') {
                this.showFinancialReport();
            }else {
                PresentationTemplateCollection.getData(this.presentation.token.value, this.presentation.presentation.id, page.id)
                    .then(function (res) {
                        if (res) {
                            this.data = res;
                            this.isGoNext = true;
                        }
                        if ((page.pseudo_dashboard && page.pseudo_dashboard == '_general') || page.dashboard_id || page.kpi_drill_down) {
                            this.showDashboard(page, page.pseudo_dashboard == '_general');
                        } else if (page.pseudo_dashboard && page.pseudo_dashboard == '_palbal') {
                            this.showTrialBalance();
                        }
                    }.bind(this));
            }
        },

        getNextPage(paramIndex, navigation) {
            this.presets = {
                average : null,
                cashbook : null,
                interval : null,
                previous : null,
                budget : null,
                spread : null,
                type : null,
                balance : null,
                compare : null,
                section : null,
                from : null,
                to : null,
                series : [],
                graphType : 'line'
            };

            this.ui.showCoverPage = false;
            this.ui.showDashboard = false;
            this.ui.showTrialBalance = false;
            this.ui.showInvoices = false;
            this.ui.showAnnualReport = false;
            this.ui.showFinancialReport = false;
            this.ui.showFileUpload = false;

            this.ui.loading = true;
            this.isGoNext = false;
            if (paramIndex && paramIndex > 0 ) {
                this.pageIndex = paramIndex;
            } else if (paramIndex === 0 && navigation) {
                this.pageIndex = paramIndex;
            } else if (this.pagesInfo[this.pageIndex + 1]) {
                this.pageIndex++;
            }

            var page = this.pagesInfo[this.pageIndex];

            this.$store.dispatch('setPresentationPage', page);

            this.currentPage = page;
            if (this.currentPage.settings.graphType) {
                this.checkEasyView(this.currentPage.settings);
            }

            if (this.currentPage.settings && this.currentPage.settings.kpis) {
                this.$store.dispatch('setPreviousType', this.currentPage.settings.kpis);
            }

            this.presets.average = page.benchmark;
            this.presets.cashbook = page.cashbook == 'false' ? false : page.cashbook;
            this.presets.interval = page.intervals;
            this.presets.previous = page.settings && page.settings.previousEnabled ? page.previous : false;
            this.presets.budget = page.budget;
            this.presets.from = moment(page.start_date).format('YYYY-MM-DD');
            this.presets.to = moment(page.end_date).format('YYYY-MM-DD');
            this.presets.balance = page.balance;
            this.presets.section = this.getPresetsSection(page);
            this.presets.series = page.settings && page.settings.series ? page.settings.series : [];
            this.presets.graphType = page.settings && page.settings.graphType ? page.settings.graphType : 'line';
            this.presets.type = page.settings && page.settings.type ? page.settings.type : 'DKK';
            this.presets.drilldown = page.kpi_drill_down ? page.kpi_drill_down : false;
            this.presets.balanceRowsToShow = (page.settings && page.settings.balanceRowsToShow) || null;
            this.presets.spread = page.spread || null;
            this.presets.reclassified = page.reclassified;

            if (page.number === 0) {
                page.number = 1;
            }

            if (page.number === 1) {
                this.isGoNext = false;
                this.ui.showCoverPage = true;
                this.ui.loading = false;
                this.isGoNext = true;
                return false;
            }

            if (page.presentation_upload_id) {
              this.showFileUpload()
            } else if (page.context === 'invoice') {
                this.showInvoices();
            } else if (page.context === 'annual_report') {
                this.showAnnualReport();
            } else if (page.context === 'financial_report') {
                this.showFinancialReport();
            } else {
                PresentationTemplateCollection.getData(this.presentation.token.value, this.presentation.presentation.id, page.id)
                    .then(function (res) {
                        this.isGoNext = false;
                        if (res) {
                            this.data = res;
                            this.isGoNext = true;
                        }
                        if ((page.pseudo_dashboard && page.pseudo_dashboard == '_general') || page.dashboard_id || page.kpi_drill_down) {
                            this.showDashboard(page, page.pseudo_dashboard == '_general');
                        } else if (page.pseudo_dashboard && page.pseudo_dashboard == '_palbal') {
                            this.showTrialBalance();
                        }
                    }.bind(this));
            }

        },

        getPresetsSection(page) {
            if (page.aggregations) {
                return 'kpis'
            } else if (page.settings.section) {
                return page.settings.section
            } else {
                return 'timeline'
            }
        },

        getTitleBackground() {
            return new AssetModel('/assets/img/slideshow/reporting_bg.png').path;
        },

        showDashboard(page, isGeneral) {
            if (isGeneral) {
                this.currentDashboard = {
                    "id":"_general",
                    "name":"General Overview",
                    "company":null,
                    "dashboardKpis":[
                        {
                            "kpi":{
                                "id":"_revenue",
                                "name":"revenue",
                                "unit":{
                                    "label":"$",
                                    "type":"currency"
                                },
                                "symbol":"profit.png"
                            }
                        },
                        {
                            "kpi":{
                                "id":"_contributionMargin",
                                "name":"contributionMargin",
                                "unit":{
                                    "label":"$",
                                    "type":"currency"
                                },
                                "symbol":"profit.png"
                            },
                            "description": null
                        },
                        {
                            "kpi":{
                                "id":"_fixedCosts",
                                "name":"fixedCosts",
                                "unit":{
                                    "label":"$",
                                    "type":"currency"
                                },
                                "symbol":"profit.png"
                            }
                        },
                        {
                            "kpi":{
                                "id":"_exIncomeExpense",
                                "name":"exIncomeExpense",
                                "unit":{
                                    "label":"$",
                                    "type":"currency"
                                },
                                "symbol":"profit.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_profit",
                                "name":"profit",
                                "unit":{
                                    "label":"$",
                                    "type":"currency"
                                },
                                "symbol":"profit.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_contributionMarginRatio",
                                "name":"contributionMarginRatio",
                                "unit":{
                                    "label":"%",
                                    "type":"percent"
                                },
                                "symbol":"profit.png"
                            }
                        },
                        {
                            "kpi":{
                                "id":"_profitMargin",
                                "name":"profitMargin",
                                "unit":{
                                    "label":"%",
                                    "type":"percent"
                                },
                                "symbol":"profit.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_overheadMargin",
                                "name":"overheadMargin",
                                "unit":{
                                    "label":"%",
                                    "type":"percent"
                                },
                                "symbol":"profit.png",
                                "overheadType":true
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_debtToAssetRatioTemp",
                                "name":"debtToAssetRatioTemp",
                                "unit":{
                                    "label":"%",
                                    "type":"percent"
                                },
                                "symbol":"solvency.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_exIncomeExpenseMargin",
                                "name":"exIncomeExpenseMargin",
                                "unit":{
                                    "label":"%",
                                    "type":"percent"
                                },
                                "symbol":"profit.png"
                            }
                        },
                        {
                            "kpi":{
                                "id":"_currentRatio",
                                "name":"currentRatio",
                                "unit":{
                                    "label":"x",
                                    "type":"ratio"
                                },
                                "symbol":"liquidity.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_quickRatio",
                                "name":"quickRatio",
                                "unit":{
                                    "label":"x",
                                    "type":"ratio"
                                },
                                "symbol":"liquidity.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_assetTurnover",
                                "name":"assetTurnover",
                                "unit":{
                                    "label":"x",
                                    "type":"ratio"
                                },
                                "symbol":"activity.png"
                            },
                            "description":null
                        },
                        {
                            "kpi":{
                                "id":"_inventoryTurnover",
                                "name":"inventoryTurnover",
                                "unit":{
                                    "label":"x",
                                    "type":"ratio"
                                },
                                "symbol":"activity.png"
                            },
                            "description":null
                        }
                    ]
                };
            }
            if (!isGeneral) {
                this.currentDashboard = {
                    "id": page.dashboard_id,
                    "name": "custom",
                    "company": null,
                    "dashboardKpis": []
                };
                var dashKpis = page.dashboard_kpis ? page.dashboard_kpis : [];
                var map = {};
                dashKpis.forEach(function(dashKpi, index) {
                    map[dashKpi.kpi.name] = dashKpi;
                }, this);

                var series = this.presets.series;
                series.forEach(function(seriesSingle, index) {
                    var dashKpi = map.hasOwnProperty(seriesSingle) ? map[seriesSingle] : null;
                    if (dashKpi) {
                        this.presets.type = dashKpi.kpi.unit.label;
                        if (dashKpi.kpi.unit.type === 'currency') {
                            this.presets.type = this.currency;
                        }
                        this.currentDashboard.dashboardKpis.push(dashKpi);
                    }
                }, this);
            }
            this.isGoNext = false;
            setTimeout(function () {
                this.ui.showDashboard = true;
                this.ui.loading = false;
                this.isGoNext = true;
            }.bind(this), 100);
        },

        showTrialBalance() {
            this.isGoNext = false;
            setTimeout(function () {
                this.ui.showTrialBalance = true;
                this.ui.loading = false;
                this.isGoNext = true;
            }.bind(this), 100);
        },
        showFileUpload() {
          this.isGoNext = false;
          setTimeout(() => {
            this.ui.showFileUpload = true;
            this.ui.loading = false;
            this.isGoNext = true;
          }, 100);
        },
        showInvoices() {
            this.isGoNext = false;
            setTimeout(() => {
                this.ui.showInvoices = true;
                this.ui.loading = false;
                this.isGoNext = true;
            }, 100);
        },
        showAnnualReport() {
            this.isGoNext = false;
            setTimeout(() => {
                this.ui.showAnnualReport = true;
                this.ui.loading = false;
                this.isGoNext = true;
            }, 100);
        },
        showFinancialReport() {
            this.isGoNext = false;
            setTimeout(() => {
                this.ui.showFinancialReport = true;
                this.ui.loading = false;
                this.isGoNext = true;
            }, 100);
        },
        toggleCollapse() {
            this.isHide = !this.isHide;
        },
        showLockedDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.presentations.reportIsNotFinalized,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.presentations.ok,
                        class: 'highlighted-text',
                    }
                ]
            });
        },
      getFileRawData({presentationId, pageId}) {
        PresentationTemplateCollection.getFileContents({presentationId, pageId, fromPresentation: true, token: this.presentation.token.value})
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
    };

    const computed = {
        isOpenPreview() {
            return this.$store.getters.isOpenReport;
        }
    };

    export default {
        name: 'report-presentation',
        data,
        methods,
        computed,
        mixins: [easyViewMixin, getIconsMixin],
        props : ['presentation'],
        components : {
            'balance' : BalanceView,
            'dashboard' : DashboardView,
            'invoices' : InvoiceView,
            'annual-report' : AnnualReportView,
            'presentation-description': presentationDescription,
            'financial-report' : financialReport
        },
        mounted() {
            this.init();
        }
    }

</script>
