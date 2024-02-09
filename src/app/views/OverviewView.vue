/* global ga, saveAs */

<template>
    <article>
       <section v-show="ui.loading && !ui.forbidden">
           <div class="working"></div>
       </section>
       <nav class="tabs here" v-show="!ui.loading && !ui.forbidden">
           <ul v-show="(tutorial.state.started && !tutorial.state.finished) || (erp && erp.erp !== 'seges-contact' && !ui.firstRunFailed && !ui.firstRunUpdateFailed)">
               <li class="right-spaced" :class="{ active : showGeneralOverview }" v-if="inActiveDashboards('_general')"><a v-on:click="switchToGeneralOverview()"><i class="cwi-star-off" v-show="!isDefaultDash('_general')" v-on:click.stop="toggleDefaultDashboard('_general')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_general')" v-on:click.stop="toggleDefaultDashboard('_general')"></i>{{ui.dictionary.overview.realtime}}</a></li>
               <v-popover :open="showViewPalbalTutorial()" placement="bottom">
                   <li class="right-spaced" data-test-id='showTrialBalance' :class="{ active : showTrialBalance }" v-if="inActiveDashboards('_palbal')"><a v-on:click="switchToTrialBalance()"><i class="cwi-star-off" v-show="!isDefaultDash('_palbal')" v-on:click.stop="toggleDefaultDashboard('_palbal')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_palbal')" v-on:click.stop="toggleDefaultDashboard('_palbal')"></i>{{ui.dictionary.overview.balance}}</a></li>
                   <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
               </v-popover>

               <li data-test-id='showFinancialReport' class="right-spaced" v-if="isFinancialReportAvailable && (inActiveDashboards('_calpalbal') || isDefaultFinancialReport)" :class="{ active : showFinancialReport }"><a v-on:click="switchToCatTrialBalance()"><i class="cwi-star-off" v-show="!isDefaultDash('_calpalbal')" v-on:click.stop="toggleDefaultDashboard('_calpalbal')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_calpalbal')" v-on:click.stop="toggleDefaultDashboard('_calpalbal')"></i>{{ui.dictionary.financialReport.title}}</a></li>

               <li data-test-id='showBudget' class="right-spaced" :class="{ active : showBudget }" v-if="inActiveDashboards('_budget') || isDefaultBudget"><a v-on:click="switchToBudget()"><i class="cwi-star-off" v-show="!isDefaultDash('_budget')" v-on:click.stop="toggleDefaultDashboard('_budget')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_budget')" v-on:click.stop="toggleDefaultDashboard('_budget')"></i>{{ui.dictionary.overview.budget}}</a></li>

               <v-popover :open="showViewInvoicesTutorial()" placement="bottom">
                   <li data-test-id='showInvoices' class="right-spaced" :class="{ active : showInvoices }" v-show="inActiveDashboards('_invoices') && invoicesSupported"><a v-on:click="switchToInvoices()"><i class="cwi-star-off" v-show="!isDefaultDash('_invoices')" v-on:click.stop="toggleDefaultDashboard('_invoices')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_invoices')" v-on:click.stop="toggleDefaultDashboard('_invoices')"></i>{{ui.dictionary.invoices.title}}</a></li>
                   <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
               </v-popover>


               <li v-show="!ui.editingPresentation && context && profile.roles && profile.roles.indexOf('sales_potential_role') >= 0" class="right-spaced" :class="{ active : currentDashboard && currentDashboard === '_sp_company' }"><a v-on:click="switchToSPC()"><i class="cwi-star-off" v-show="!isDefaultDash('_sp_company')" v-on:click.stop="toggleDefaultDashboard('_sp_company')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_sp_company')" v-on:click.stop="toggleDefaultDashboard('_sp_company')"></i>{{ui.dictionary.salesPotential.salesPotentialReport}} <span class="beta-tag">alpha</span></a></li>
               <li v-show="!ui.editingPresentation && context && profile.roles && profile.roles.indexOf('sales_potential_role') >= 0" class="right-spaced" :class="{ active : currentDashboard && currentDashboard === '_sp_company_2' }"><a v-on:click="switchToSPC2()"><i class="cwi-star-off" v-show="!isDefaultDash('_sp_company_2')" v-on:click.stop="toggleDefaultDashboard('_sp_company_2')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_sp_company_2')" v-on:click.stop="toggleDefaultDashboard('_sp_company_2')"></i>{{ui.dictionary.salesPotential.salesPotentialReport2}} <span class="beta-tag">alpha</span></a></li>


               <li class="right-spaced" v-if="inActiveDashboards('_annual_report')" :class="{ active : currentDashboard && currentDashboard === '_annual_report', disabled : !ui.enableAnnualReports }">
                   <small v-show="!ui.enableAnnualReports && (!company.cvrCompanyInfo || company.cvrCompanyInfo.type !== 'Enkeltmandsvirksomhed') && (!context || !context.company.cvrCompanyInfo || context.company.cvrCompanyInfo.type !== 'Enkeltmandsvirksomhed')"><i class="cwi-info warn-color always-on" :title="ui.dictionary.overview.noAnnualReportsExplanation"></i> </small>
                   <small v-show="!ui.enableAnnualReports && ((company.cvrCompanyInfo && company.cvrCompanyInfo.type === 'Enkeltmandsvirksomhed') || (context && context.company && context.company.cvrCompanyInfo && context.company.cvrCompanyInfo.type === 'Enkeltmandsvirksomhed'))"><i class="cwi-info" :title="ui.dictionary.overview.soleProprietorshipExplanation"></i> </small>
                   <a data-test-id="goToAnnualReport" v-on:click="switchToAnnualReport()"><i class="cwi-star-off" v-show="!isDefaultDash('_annual_report') && ui.enableAnnualReports" v-on:click.stop="toggleDefaultDashboard('_annual_report')"></i><i class="cwi-star-on active" v-show="isDefaultDash('_annual_report') && ui.enableAnnualReports" v-on:click.stop="toggleDefaultDashboard('_annual_report')"></i>{{ui.dictionary.annualReport.title}}</a>
               </li>

               <li class="right-spaced right-margin" v-for="dashboard in dashboards" :class="{ active : currentDashboard && dashboard.id == currentDashboard.id }" v-show="inActiveDashboards(dashboard.id, (context && context.company.id == dashboard.company.id))"><a v-on:click="switchToDashboard(dashboard)"><i class="cwi-star-off" v-show="!isDefaultDash(dashboard.id)" v-on:click.stop="toggleDefaultDashboard(dashboard.id)"></i><i class="cwi-star-on active" v-show="isDefaultDash(dashboard.id)" v-on:click.stop="toggleDefaultDashboard(dashboard.id)"></i>{{dashboard.name}}</a></li>
               <li v-show="!ui.editingPresentation && (permissions.owner || permissions.permissionType == 'full')" class="add tooltip" v-on:click="addNewDashboard()">+<div class="message right">{{ui.dictionary.overview.addDashboard}}</div></li>


               <li class="download-report" v-show="erp && erp.fetchData"><div class="working" v-show="ui.reportDownloading"></div><button class="accent" v-show="false" @click="openFinancialAidPackages">{{ui.dictionary.financialAid.packages}}</button></li>

               <li class="right-spaced" v-show="ui.editingPresentation" :class="{ active : showFileUploader }"><a v-on:click="switchToFileUpload">{{ui.dictionary.file.uploadFile}}</a></li>

               <li data-test-id='openMakeClientReport' class="float-right no-margin" :class="{ active : showPresentations}" v-show="profile.roles && profile.roles.indexOf('presentation_role') >= 0 && !ui.editingPresentation || showPresentations"><a v-on:click="switchToPresentations()">{{ui.dictionary.presentations.title}}</a></li>

           </ul>

       </nav>

       <section class="custom-export-bar" v-show="showExport">
           <custom-export :exportDashboardHandler="exportDashboardHandler" :isGeneralDashboard="currentDashboard && currentDashboard.id && showGeneralOverview"></custom-export>
       </section>

       <section class="tab-content" :class="{ extrapadded : ui.editingPresentation }" v-if="!ui.loading && showGeneralOverview && currentDashboard !== '_sp_company' && currentDashboard !== '_sp_company_2' && currentDashboard !== '_annual_report' && currentDashboard !== '_palbal' && currentDashboard !== '_catpalbal' && currentDashboard !== '_budget' && currentDashboard !== '_invoices' && currentDashboard !== '_presentations' && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <div class="mapping-not-updated" v-show="currentMappingIsUpdating"><i class="cwi-info"></i> {{ui.dictionary.overview.mappingNotUpToDate}}</div>
           <div class="mapping-not-updated" v-show="erp && (erp.newUnvalidatedAccount === true) && currentMappingIsValid" ><i class="cwi-info"></i> <span v-tooltip="{content: ui.dictionary.overview.mappingTooltip, placement: 'top-center'}">{{ui.dictionary.overview.mappingNotValidated}}</span></div>
           <div class="mapping-not-updated" v-show="erp && !currentMappingIsValid && !currentMappingIsUpdating"><i class="cwi-info"></i> <span v-tooltip="{content: ui.dictionary.overview.mappingTooltip, placement: 'top-center'}">{{ui.dictionary.overview.currentMappingIsNotValid}}</span></div>
           <dashboard :dash="currentDashboard" :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo" :dashParamInfoFlag="dashParamInfoFlag" :returnDashParams="returnDashParams"></dashboard>
       </section>
       <section class="tab-content" v-if="!ui.loading && showPresentations && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed && profile.roles && profile.roles.indexOf('presentation_role') >= 0">
           <reports></reports>
       </section>
       <section class="tab-content" v-if="!ui.loading && showTrialBalance && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <balance :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo" @sectionChanged="onSectionChanged"></balance>
       </section>
       <section class="tab-content" v-if="!ui.loading && showFinancialReport && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <financial-report :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo"></financial-report>
       </section>
       <section class="tab-content" v-if="!ui.loading && showBudget && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <budget :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo"></budget>
       </section>
       <section class="tab-content" v-if="!ui.loading && showInvoices && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <invoices :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo"></invoices>
       </section>

       <section v-show="ui.forbidden && permissions && permissions.id">{{ui.dictionary.general.forbidden}}</section>

       <section class="tab-content" v-if="!ui.loading && showAnnualReport && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <annual-report :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo"></annual-report>
       </section>

       <section class="tab-content" v-if="!ui.loading && (currentDashboard === '_sp_company' || currentDashboard === '_sp_company_2' ) && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed">
           <div v-if="currentDashboard === '_sp_company'"><sp-company version="1"></sp-company></div>
           <div v-if="currentDashboard === '_sp_company_2'"><sp-company version="2"></sp-company></div>
       </section>

       <section class="tab-content" v-if="!ui.loading && showFileUploader">
           <file-uploader :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="processReportPageInfo" :showUploadButton="false"></file-uploader>
       </section>

       <section v-show="!ui.loading && !ui.forbidden && ui.firstRunUpdateFailed" class="splash">
           <h1>{{ui.dictionary.overview.firstRun.title}}</h1>
           <p>{{ui.dictionary.overview.firstRun.updateFailed}}</p>
       </section>

       <section v-show="!ui.loading && !ui.forbidden && ui.firstRunFailed" class="splash">
           <h1>{{ui.dictionary.overview.firstRun.title}}</h1>
           <p>{{ui.dictionary.overview.firstRun.failed}}</p>
           <button class="primary" v-on:click="gotoCompanyErp()" v-show="permissions.owner || permissions.permissionType === 'full'">{{ui.dictionary.overview.firstRun.connectErp}}</button>
       </section>

       <section class="presentation-editor" v-if="ui.editingPresentation && currentPresentation && !showPresentations">
           <div class="close">
               <i class="cwi-close primary" v-on:click="exitPresentationEditMode(); closeEditRouting()"></i>
           </div>
           <presentation-editor
                :dashboards="dashboards"
                :realtimeDashboard="realtimeDashboard"
                :report="currentPresentation"
                :newPageParams="addPageParams"
                :onAddPage="showAddPageModal"
                :canAddPage="showAddPageButton">
            </presentation-editor>
       </section>

    </article>
</template>

<script>
    import Vue from 'Vue'
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import ContextModel from 'models/ContextModel'
    import UserModel from 'models/UserModel'
    import ErpModel from 'models/ErpModel'
    import CompanyModel from 'models/CompanyModel'
    import DashboardModel from 'models/DashboardModel'
    import DateRangeModel from 'models/DateRangeModel'
    import ExportModel from 'models/ExportModel'
    import DashboardCollection from 'collections/DashboardCollection'
    import AnnualReportDataCollection from 'collections/AnnualReportDataCollection'
    import BalanceDataCollection from 'collections/BalanceDataCollection'
    import DashboardView from 'views/DashboardView'
    import BalanceView from 'views/BalanceView'
    import InvoiceView from 'views/InvoiceView'
    import Validator from 'services/Validator'
    import {abortAllPendingRequests} from 'services/API'
    import Toast from 'services/Toast'
    import EventBus from 'services/EventBus'
    import customExport from 'elements/custom-export'
    import tutorialSlide from 'elements/tutorial-slide'
    import presentationEditor from 'components/presentationEditor.vue'
    import financialReport from 'elements/financial-report.vue'
    import addNewDashboardModal from 'elements/modals/add-new-dashboard'
    import editPageModal from 'elements/modals/edit-page'
    import Tutorial from 'services/Tutorial'
    import SalesPotentialCompanyView from 'views/SalesPotentialCompanyView'
    import AnnualReportView from 'views/AnnualReportView'
    import BudgetView from 'views/BudgetView'
    import ReportsView from 'views/ReportsView'
    import dashboardMutationTypes from 'store/dashboardMutationTypes'
    import presentationMutationTypes from 'store/presentationMutationTypes'
    import reportPageTypes from 'constants/reportPageTypes'
    import permissionsMixin from 'mixins/permissionsMixin'
    import saveTemplate from 'elements/modals/save-template'
    import financialAidPackages from 'elements/modals/financial-aid-packages'
    import inviteFriends from 'elements/modals/invite-friends'
    import companyMutationTypes from 'store/companyMutationTypes'
    import Track from 'services/Track'
    import FileSaver from 'FileSaver'
    import FileUploader from 'elements/reports-file-uploader'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            adminMenu : false,
            erpInitializing : false,
            erpUpdating : false,
            erpCompleted : false,
            forbidden : false,
            saving : false,
            tourStep1 : false,
            tourStep2 : false,
            firstRunFailed : false,
            firstRunUpdateFailed : false,
            enableAnnualReports : true,
            editingPresentation : false,
            reportDownloading : false,
            showFileUpload: false
        },
        balanceSection: 'table',
        dashboards : [],
        realtimeDashboard : {
            id : '_general',
            name : DictionaryModel.getHash().overview.realtime,
            company : null,
            dashboardKpis : []
        },
        publicDashboard : {},
        currentDashboard : null, //JSON.parse(sessionStorage.getItem('currentDashboard')) || null,
        erpCheck : false,
        firstErpLoad : false,
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        fields : {
            name : { value : '', valid : true, error : false }
        },
        page : {
            name : '',
            description : ''
        },
        userInfo : UserModel.getCompanyUserInfo(),
        context : ContextModel.getContext(),
        company : CompanyModel.getCompany(),
        firstLoad : true,
        profile : UserModel.profile(),
        erp: ErpModel.getErp(),
        showEquityToAssetRatio : false,
        tutorial : Tutorial,
        lastAnnualReport : null,
        currentPresentation : null,
        addPageParams : null,
        presentationInfoFlag : 0,
        dashParamInfoFlag : 0,
        defaultDashboards: ['_general', '_palbal', '_invoices', '_calpalbal', '_budget']
    });

    const methods = {

        init() {
            this.buildRealtimeDashboard();
            this.getDashboardList();

            /**
             * Restoring persisted view settings
             */
            this.restorePersistedDashboardSettings();

            EventBus.$on('companyUserChanged', this.changeUserData);
            EventBus.$on('companyErpChanged', this.checkErp);
            EventBus.$on('noCompaniesExist', this.checkCompany);
            EventBus.$on('click', this.closeAllOptions);
            EventBus.$on('editReportPresentation', this.presentationEditMode);
            document.addEventListener('clickAppBody', this.closeAllOptions);
            EventBus.$on('connectionContextClosed', this.exitPresentationEditMode);

            this.checkErp();
            this.getAnnualReports();

            if (this.tutorial.current && this.tutorial.current.name === 'invoiceSorting' && !this.tutorial.state.loading && !this.tutorial.state.finished && this.currentDashboard !== '_invoices') {
                this.currentDashboard = '_invoices';
                this.$router.push('/account/overview/invoices');
            }

        },

        downloadReport(reportSheetType) {
            this.ui.reportDownloading = true;
            var dc = new BalanceDataCollection();

            let now = new moment();
            let toDate = now.format('YYYY-MM-DD');
            let fromDate = now.subtract(3, 'year').format('YYYY-MM-DD');
            let latestDate = this.erp.latestDate;

            if (latestDate && moment(latestDate).unix() < now.unix()) {
                toDate = moment(latestDate).format('YYYY-MM-DD');
                fromDate = moment(latestDate).subtract(3, 'year').format('YYYY-MM-DD');
            }

            const context = ContextModel.getContext();
            const company =  context ? context.company : CompanyModel.getCompany();

            dc.getFinExcelData(fromDate, toDate, 'month', 'end_year_to_date', 'to_date', false, true, reportSheetType)
                .then(function(data) {
                    this.ui.reportDownloading = false;

                    if (!data) {
                        Toast.show(this.ui.dictionary.palbal.export.error , 'warning');
                        return false;
                    }
                    var blob = new Blob([data], {
                        type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    FileSaver.saveAs(blob, this.ui.dictionary.palbal.export.financialReportFileName + '.xlsx');
                    this.ui.reportDownloading = false;
                    saveAs(blob, `${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}_${company.name}.xlsx`);
                    this.showInviteFriendsModal();
                }.bind(this));
        },

        openFinancialAidPackages() {
            this.$modal.show(financialAidPackages, {
                downloadReport : this.downloadReport,
                isMappingValid: Boolean(this?.erp?.currentMappingValidity),
                wasMappingValidationRequested: Boolean(this.erp.mappingValidationRequested),
                company: this.company
            }, {width: '600px', height: 'auto'});
        },

        showInviteFriendsModal() {
            this.$modal.show(inviteFriends, {}, {width: '600px', height: 'auto'});
        },


        exportDashboardHandler() {
            this.dashParamInfoFlag++;
        },

        returnDashParams(params) {
            var em = new ExportModel();

            if (params.isDrillDown) {
                em.getDashboardDrilldownExport(params.drillDownSeriesID, params)
                    .then(function (data) {
                        var blob = new Blob([data], {
                            type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        FileSaver.saveAs(blob, 'export' + '.xlsx');

                        EventBus.$emit('dashboardExportCompleted');
                    });

                return false;
            }

            em.getDashboardExport(this.currentDashboard.id, params)
                .then(function (data) {
                    var blob = new Blob([data], {
                        type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    FileSaver.saveAs(blob, 'export' + '.xlsx');

                    EventBus.$emit('dashboardExportCompleted');
                });
        },

        saveTemplate() {
            return false;
        },

        showAddPageModal() {
            this.$modal.show(editPageModal, {
                saveReportPage: () => {this.presentationInfoFlag++;},
                currentPage: this.page,
                addingPage: true,
                saving: this.ui.saving
            }, {height: 'auto'});
        },

        processReportPageInfo(info) {
            info && info.settings?.type === '$' ? info.settings.type = null : '';
            let pageParams = {};
            if (info.pseudo_dashboard === '_invoices') {
                pageParams = this.getInvoicesPresentationPageParams(info);
            } else if (info.context === reportPageTypes.ANNUAL_REPORT) {
                pageParams = this.getAnnualReportPageParams(info);
            } else if (info.context === reportPageTypes.FINANCIAL_REPORT) {
                pageParams = Object.assign(info, {name: this.page.name});
            } else if (info.context === reportPageTypes.FILE_UPLOAD) {
                pageParams = Object.assign(info, {name: this.page.name});
            } else {
                pageParams = this.getPresentationPageParams(info);
            }
            this.isKPIs && info.pseudo_dashboard !== '_invoices' && info.context !== 'annual_report' && !this.isEasyView ? Object.assign(pageParams.settings, {kpis: pageParams.previous}) : '';
            this.addPageParams = pageParams;
            Vue.nextTick(() => {
                this.page.name = '';
            });
        },

        getInvoicesPresentationPageParams(info) {
            const { start_date, end_date } = info;

            return  {
                name: this.page.name,
                end_date: end_date || DateRangeModel.getToStringPadded(),
                front_page: false,
                number: this.presentationInfoFlag,
                start_date: start_date || DateRangeModel.getFromStringPadded(),
                title: '',
                sort: 'display_name',
                context: info.context,
                invoice_contact_reference: null,
                settings: info.settings
            };
        },

        getAnnualReportPageParams() {
            return {
                name: this.page.name,
                front_page: false,
                number: this.presentationInfoFlag,
                title: "annual-report-page",
                context:"annual_report",
                dashboard: null,
                pseudo_dashboard: '_general',
                kpi_drill_down : null,
            };
        },

        getPresentationPageParams(info) {
            return {
                name : this.page.name,
                aggregations: info.aggregations,
                balance: info.balance,
                benchmark: info.benchmark,
                cashbook : info.cashbook,
                budget: info.budget,
                budget_loaded_file: info.budget_loaded_file,
                compare: info.compare,
                description: this.page.description,
                end_date: DateRangeModel.getToString(),
                front_page: false,
                intervals: info.intervals,
                logo: false,
                number: 1,
                previous: info.previous,
                pseudo_dashboard: info.pseudo_dashboard,
                dashboard : info.dashboard,
                reclassified: info.reclassified,
                start_date: DateRangeModel.getFromString(),
                title: '',
                settings : Object.assign(info.settings, {isEasyView: this.isEasyView}),
                kpi_drill_down : info.kpi_drill_down,
                spread: info.spread,
                entry_department: info.entry_department ? info.entry_department : null
            };
        },

        presentationEditMode() {
            this.ui.editingPresentation = true;
            this.currentDashboard = this.realtimeDashboard;
            this.currentPresentation = JSON.parse(this.getReportPresentation);
            this.$store.dispatch('setPresentationEditMode', true);
        },

        exitPresentationEditMode() {
            this.ui.editingPresentation = false;
            this.currentPresentation = null;
            this.$store.dispatch('setReportPresentation', {
                report: null
            });
            this.currentDashboard = '_presentations';
            this.$store.dispatch('setPresentationEditMode', false);
        },

        closeEditRouting() {
            this.switchToPresentations();
        },

        showViewPalbalTutorial() {
            if (this.tutorial.current && (this.tutorial.current.name === 'viewTrialBalance' || this.tutorial.current.name === 'chooseMenus') && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.switchToTrialBalance();
                return true;
            } else if (this.tutorial.current && (this.tutorial.current.name === 'lineGraphOptions' || this.tutorial.current.name === 'easyview') && !this.tutorial.state.loading && !this.tutorial.state.finished && this.currentDashboard !== '_general') {
                this.switchToGeneralOverview();
            }

            return false;
        },

        showViewInvoicesTutorial() {
            if (this.tutorial.current && (this.tutorial.current.name === 'viewInvoices' || this.tutorial.current.name === 'seeYourInvoices') && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.switchToInvoices();
                return true;
            } else if (this.tutorial.current && (this.tutorial.current.name === 'downloadTrialBalance' || this.tutorial.current.name === 'trialBalance') && !this.tutorial.state.loading && !this.tutorial.state.finished && this.currentDashboard !== '_palbal') {
                this.switchToTrialBalance();
            }  else if (this.tutorial.current && this.tutorial.current.name === 'invoiceSorting' && !this.tutorial.state.loading && !this.tutorial.state.finished && this.currentDashboard !== '_invoices') {
                this.switchToInvoices();
            }


            return false;
        },

        buildRealtimeDashboard() {
            this.setShowEquityToAssetRatio();
            this.realtimeDashboard.dashboardKpis = [];
            //Currency
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_revenue', name : 'revenue', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' } });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_contributionMargin', name : 'contributionMargin', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.contributionMargin });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_fixedCosts', name : 'fixedCosts', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' } });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_exIncomeExpense', name : 'exIncomeExpense', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.exIncomeExpenseMargin });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_profit', name : 'profit', unit : { label : '$', type : 'currency' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.profitBeforeTax });


            //Percentage
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_contributionMarginRatio', name : 'contributionMarginRatio', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' } });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_profitMargin', name : 'profitMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' }, description : DictionaryModel.getHash().kpis.def.profitMargin });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_overheadMargin', name : 'overheadMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png', overheadType : true }, description : DictionaryModel.getHash().kpis.def.overheadMargin });

            if (this.showEquityToAssetRatio) {
                this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_equityToAssetRatio', name : 'EquityToAssetRatio', unit : { label : '%', type : 'percent' }, symbol : 'solvency.png' }, description : DictionaryModel.getHash().kpis.def.EquityToAssetRatio });
            } else {
                this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_debtToAssetRatioTemp', name : 'debtToAssetRatioTemp', unit : { label : '%', type : 'percent' }, symbol : 'solvency.png' }, description : DictionaryModel.getHash().kpis.def.debtToAssetRatio });
            }

            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_exIncomeExpenseMargin', name : 'exIncomeExpenseMargin', unit : { label : '%', type : 'percent' }, symbol : 'profit.png' } });


            //Ratio
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_currentRatio', name : 'currentRatio', unit : { label : 'x', type : 'ratio' }, symbol : 'liquidity.png' }, description : DictionaryModel.getHash().kpis.def.currentRatio });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_quickRatio', name : 'quickRatio', unit : { label : 'x', type : 'ratio' }, symbol : 'liquidity.png' }, description : DictionaryModel.getHash().kpis.def.quickRatio });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_assetTurnover', name : 'assetTurnover', unit : { label : 'x', type : 'ratio' }, symbol : 'activity.png' }, description : DictionaryModel.getHash().kpis.def.assetTurnover });
            this.realtimeDashboard.dashboardKpis.push({ kpi : { id : '_inventoryTurnover', name : 'inventoryTurnover', unit : { label : 'x', type : 'ratio' }, symbol : 'activity.png' }, description : DictionaryModel.getHash().kpis.def.inventoryTurnover });
        },


        setShowEquityToAssetRatio() {
            if (this.userInfo && this.userInfo.settings && this.userInfo.settings.showToAssetRatio && this.userInfo.settings.showToAssetRatio === 'equityToAssetRatio') {
                this.showEquityToAssetRatio = true;
            } else if (this.userInfo && this.userInfo.settings && this.userInfo.settings.showToAssetRatio && this.userInfo.settings.showToAssetRatio === 'debtToAssetRatio') {
                this.showEquityToAssetRatio = false;
            } else if (this.ui.dictionary && this.ui.dictionary.meta.code === 'da-DK') {
                this.showEquityToAssetRatio = true;
            } else {
                this.showEquityToAssetRatio = false;
            }
        },

        switchToPresentations() {
            this.currentDashboard = '_presentations';
            this.$router.push('/account/overview/makeclientreport');
        },

        switchToGeneralOverview() {
            this.currentDashboard = this.realtimeDashboard;
            if ((!this.isRedirectToConnections || this.isRedirectToOverview) && this.userInfo.settings?.activeDashboards?.company.indexOf('_general') >= 0) {
                this.$router.push('/account/overview/generaloverview');
            } else if ((!this.isRedirectToConnections || this.isRedirectToOverview) && this.userInfo.settings?.activeDashboards?.company.indexOf('_general') < 0 && !this.erp) {
                this.$router.push('/account/overview/generaloverview');
            } else if ((!this.isRedirectToConnections || this.isRedirectToOverview) && !this.userInfo.settings.activeDashboards && this.erp && this.erp !== 'loading') {
                this.$router.push('/account/overview/generaloverview');
            } else {
                !this.isRedirectToConnections ? this.$router.push('/account/overview') : '';
            }
        },

        switchToTrialBalance() {
            this.currentDashboard = '_palbal';
            (this.erp || this.isTutorialMode) ? this.$router.push('/account/overview/trialbalance') : this.$router.push('/account/overview/generaloverview');
        },

        switchToCatTrialBalance() {
            this.currentDashboard = '_catpalbal';
            (this.erp || this.isTutorialMode) ? this.$router.push('/account/overview/financialreport') : this.$router.push('/account/overview/generaloverview');
        },

        switchToBudget() {
            this.currentDashboard = '_budget';
            (this.erp || this.isTutorialMode) ? this.$router.push('/account/overview/budget') : this.$router.push('/account/overview/generaloverview');
        },

        switchToInvoices() {
            this.currentDashboard = '_invoices';
            (this.erp || this.isTutorialMode) ? this.$router.push('/account/overview/invoices') : this.$router.push('/account/overview/generaloverview');
        },

        switchToSPC() {
            this.currentDashboard = '_sp_company';
            this.trackDashboard('sales-potential', '/overview/');
            this.$router.push('/account/sales-potential');
        },

        switchToSPC2() {
            this.currentDashboard = '_sp_company_2';
            this.trackDashboard('sales-potential-2', '/overview/');
            this.$router.push('/account/sales-potential-2');
        },

        switchToAnnualReport() {
            if (this.ui.enableAnnualReports) {
                this.currentDashboard = '_annual_report';
                this.$router.push('/account/overview/annualreport');
            }
        },

        switchToDashboard(dashboard) {
            this.currentDashboard = dashboard;
            this.trackDashboard(dashboard.id);
            setTimeout(() => {
                if (this.$route.path !== '/account/overview/generaloverview') {
                    this.$router.push('/account/overview/generaloverview');
                }
            }, 0)
        },

        switchToFileUpload() {
            this.ui.showFileUpload = true;
            this.$router.push('/account/overview/reports-file-upload');
        },

        trackDashboard(name, path = '/account/overview/') {
            Track.ga.setPage(`${path}${name}`);
            Track.ga.sendPageView();
        },

        changeUserData() {
            //sessionStorage.removeItem('currentDashboard');

            this.company = CompanyModel.getCompany();
            this.userInfo = UserModel.getCompanyUserInfo();
            this.buildRealtimeDashboard();

            this.currentDashboard = null;
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.getDashboardList();
            this.erp = ErpModel.getErp();
            this.checkErp();
            this.getAnnualReports();

            if (!this.permissions.settings.activeDashboards
                || Array.isArray(this.permissions.settings.activeDashboards)
                || !this.permissions.settings.activeDashboards.company
            ) {

                var scope = this;

                //this.userInfo.settings.activeDashboards = ['_general', '_palbal'];
                this.addActiveDashboard('_general');
                this.addActiveDashboard('_palbal');
                this.addActiveDashboard('_invoices');
                this.addActiveDashboard('_annual_report');
                this.addActiveDashboard('_calpalbal');
                this.addActiveDashboard('_budget');

                this.dashboards.forEach(function(dashboard) {
                    //scope.userInfo.settings.activeDashboards.push(dashboard.id);
                    scope.addActiveDashboard(dashboard.id, (scope.context && dashboard.company.id == scope.context.company.id));
                });


                this.saveUserInfo();
            }
        },


        addActiveDashboard(id, useContext) {
            if (!this.permissions.settings.activeDashboards
                || Array.isArray(this.permissions.settings.activeDashboards)
                || !this.permissions.settings.activeDashboards.company
            ) {

                this.permissions.settings.activeDashboards = {
                    company : []
                };
            }


            if (useContext
                && this.context
                && !this.permissions.settings.activeDashboards[this.context.company.id]
            ) {

                this.permissions.settings.activeDashboards[this.context.company.id] = [];
            }



            if (useContext) {
                Vue.set(this.permissions.settings.activeDashboards[this.context.company.id], this.permissions.settings.activeDashboards[this.context.company.id].length, id);
            } else {
                Vue.set(this.permissions.settings.activeDashboards.company, this.permissions.settings.activeDashboards.company.length, id);
            }
        },


        isDefaultDash(id) {
            if (!this.userInfo.settings
                || !this.userInfo.settings.defaultDashboard) {
                return false;
            }

            !this.currentDashboard ? this.currentDashboard = this.userInfo.settings.defaultDashboard : '';
            this.userInfo.settings.defaultDashboard === id && this.currentDashboard === id && (!this.tutorial.current || !this.tutorial.current.showNext) ? this.loadDefaultDashboard(id) : '';

            return this.userInfo.settings.defaultDashboard === id;
        },

        loadDefaultDashboard(id) {
            switch (id) {
                case '_palbal':
                    this.switchToTrialBalance();
                    break;
                case '_catpalbal':
                    this.switchToCatTrialBalance();
                    break;
                case '_calpalbal':
                    this.switchToCatTrialBalance();
                    break;
                case '_general':
                    this.switchToGeneralOverview();
                    break;
                case '_budget':
                    this.switchToBudget();
                    break;
                case '_invoices':
                    this.switchToInvoices();
                    break;
            }
        },

        toggleDefaultDashboard(id) {
            if (this.userInfo.settings.defaultDashboard && this.userInfo.settings.defaultDashboard === id) {
                this.userInfo.settings.defaultDashboard = null;
            } else {
                this.userInfo.settings.defaultDashboard = id;
            }

            this.saveUserInfo();
        },


        saveUserInfo() {
            var scope = this;

            UserModel.setCompanyUserInfo(this.userInfo);
            UserModel.saveCompanyUserInfo()
                .then(function(res) {
                    scope.userInfo = res;
                });
        },


        inActiveDashboards(id, useContext) {
            if (!this.userInfo.settings
                || !this.userInfo.settings.activeDashboards
                || Array.isArray(this.userInfo.settings.activeDashboards)
                || !this.userInfo.settings.activeDashboards.company
                || (useContext && !this.userInfo.settings.activeDashboards[this.context.company.id])
            ) {

                return  this.defaultDashboards.indexOf(id) > -1;
            } else if (
                !useContext
                && this.company.settings
                && this.company.settings.disabled_dashboards
                && this.company.settings.disabled_dashboards.indexOf(id) >= 0) {

                return false;
            }

            var ad = this.userInfo.settings.activeDashboards.company;
            if (useContext && this.context && this.userInfo.settings.activeDashboards && this.userInfo.settings.activeDashboards[this.context.company.id]) {
                ad = this.userInfo.settings.activeDashboards[this.context.company.id];
            }

            return ad.indexOf(id) >= 0;
        },


        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        validatePageName(force) {
            if (force || !this.page.name.valid) {
                this.page.name.valid = Validator.minLength(this.page.name, 2);
            }

            return this.page.name.valid;
        },

        addDashboard() {
            if ( !this.validateName(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.saving = true;
            scope.fields.name.error = false;

            var dm = new DashboardModel();
            dm.create({ name : scope.fields.name.value })
                .then(function(res) {
                    if (res.id) {
                        scope.$router.push('/account/dashboards?open='+res.id);
                    } else {
                        scope.fields.name.error = true;
                    }

                    scope.ui.saving = false;
                });
        },

        dashboardAllowed(dash) {
            var found = false;

            if (this.permissions.dashboardPermissions) {
                this.permissions.dashboardPermissions.forEach(function(d) {
                    if (d.dashboard == dash.id) {
                        found = true;
                    }
                });
            }

            return found;
        },

        /**
         * Check that a company exists
         */
        checkCompany() {
            this.$router.push('/account/company-setup');
        },


        getAnnualReports() {
            if (CompanyModel.getCompany().id === this.lastAnnualReport) {
                return false;
            }

            this.lastAnnualReport = CompanyModel.getCompany().id;

            AnnualReportDataCollection.getAnnualReport()
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.ui.enableAnnualReports = true;
                    } else {
                        this.ui.enableAnnualReports = false;
                    }
                }.bind(this));
        },


        /**
         * Check ERP status
         */
        checkErp() {
            //this.getAnnualReports();
            if (this.$route.query.tour) {
                this.ui.loading = false;
                clearInterval(this.erpCheck);
                this.currentDashboard = this.realtimeDashboard;
                this.erp = {
                    erp : 'e-conomic'
                };
                this.ui.tourStep1 = true;
                return false;
            }

            var scope = this;
            scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            var erp = ErpModel.getErp();
            this.erp = erp;

            this.ui.erpInitializing = false;
            this.ui.erpUpdating = false;
            this.ui.erpCompleted = false;
            this.ui.firstRunFailed = false;
            this.ui.firstRunUpdateFailed = false;

            if (erp === false && !ContextModel.getContext()) {
                this.firstErpLoad = true;
                this.ui.loading = true;
            } else if (erp === null && !this.firstErpLoad) {
                this.ui.loading = false;
            } else if (erp && erp.firstTimeFailStatus && erp.firstTimeFailStatus == 'authentication_failure') {
                this.ui.firstRunFailed = true;
            } else if (erp && erp.firstTimeFailStatus && erp.firstTimeFailStatus == 'update_failed' && (!this.tutorial.state.started || this.tutorial.state.finished)) {
                this.ui.firstRunUpdateFailed = true;
            } else if (erp && erp.status == 'initializing') {
                this.ui.erpInitializing = true;
                Toast.show(this.ui.dictionary.overview.erpInitializing);
                this.startCheckInterval();
            } else if (erp && (erp?.status === 'updating')) {
                this.ui.erpUpdating = true;
                this.startCheckInterval();
            } else if (erp && erp.erp == 'seges-contact') {
                this.$router.push('/account/seges-pending');
            } else if (erp && erp.erp == 'e-conomic-admin-parent' && this.$route.query.postlogin) {
                this.$router.push('/account/connections/all');
            } else if (erp && (erp?.status === 'frozen') && !erp.fetchData) {
                this.$router.push('/account/dashboards');
            } else {
                if (this.ui.erpUpdating) {
                    this.ui.erpUpdating = false;
                    this.ui.erpCompleted = true;
                    Toast.show(this.ui.dictionary.overview.erpCompleted);
                } else if (this.ui.erpInitializing) {
                    EventBus.$emit('companyErpUpdated');
                    this.ui.erpInitializing = false;
                    this.ui.erpCompleted = true;
                    Toast.show(this.ui.dictionary.overview.erpCompleted);
                }
                clearInterval(this.erpCheck);
            }
        },

        onSectionChanged(section) {
            this.balanceSection = section;
        },

        /**
         * Start ERP Check interval
         */
        startCheckInterval() {
            var scope = this;

            if (this.erpCheck) {
                return false;
            }

            this.erpCheck = setInterval(function() {
                ErpModel.fromCompany()
                    .then(function(response) {
                        if (response.id) {
                            ErpModel.setErp(response, scope.ui.erpUpdating);
                        } else {
                            ErpModel.forgetErp();
                        }

                        scope.checkErp();
                    });
            }, 10000);
        },


        /**
         * Get list of dashbaords
         */
        getDashboardList() {
            if (!CompanyModel.getCompany() || !UserModel.getCompanyUserInfo().id) {
                return false;
            }

            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.userInfo = UserModel.getCompanyUserInfo();

            var scope = this;
            scope.ui.loading = true;
            scope.ui.forbidden = false;

            var dashboards = new DashboardCollection(true);
            dashboards.getDashboards()
                .then(function(list) {
                    if (!list.errors) {
                        scope.dashboards = list.contents;

                        //If currently selected dashboard (through session) does not exist, remove it
                        if (!scope.inActiveDashboards(scope.currentDashboard, ContextModel.getContext())) {
                            scope.currentDashboard = null;
                        }

                        //Preset requested dashboard
                        if (sessionStorage.getItem('requestDashboard')) {
                            var dashID = JSON.parse(sessionStorage.getItem('requestDashboard'));

                            scope.dashboards.forEach(function(dash) {
                                if (dash.id == dashID || dash.name == dashID) {
                                    scope.currentDashboard = dash;
                                }
                            });

                            sessionStorage.removeItem('requestDashboard');
                        }
                        //Remove query date if it was used
                        sessionStorage.removeItem('useQueryDate');


                        //Set default dashboard
                        var companyDashboards = [];
                        var connectionDashboards = [];

                        if (ContextModel.getContext() && ContextModel.getContext().company) {
                            var id = ContextModel.getContext().company.id;
                            if (scope.userInfo.settings.activeDashboards && scope.userInfo.settings.activeDashboards[id]) {
                                connectionDashboards = scope.userInfo.settings.activeDashboards[id];
                            }
                        }

                        if (scope.userInfo.settings.activeDashboards && scope.userInfo.settings.activeDashboards.company) {
                            companyDashboards = scope.userInfo.settings.activeDashboards.company;
                        }
                        scope.setCurrentDashboard(companyDashboards, connectionDashboards, scope.userInfo.settings.defaultDashboard);

                    } else {
                        scope.ui.forbidden = true;
                    }

                    scope.ui.loading = false;
                });
        },


        findDashboardById(id) {
            var found = false;

            this.dashboards.forEach(function(dashboard) {
                if (dashboard.id == id) {
                    found = dashboard;
                }
            });
            return found;
        },

        getPresetDashboard(id) {
            if (id == '_general' || id == '_palbal' || id == '_invoices') {
                return id;
            }

            return null;
        },

        setCurrentDashboard(companyDashboards, connectionDashboards, defaultDashboard) {
            //Treat undefined same as null / without value
            if (defaultDashboard === undefined || !defaultDashboard) {

                if (this.company.settings && this.company.settings.default_dashboard) {
                    defaultDashboard = this.company.settings.default_dashboard;
                } else {
                    defaultDashboard = null;
                }
            }

            if (this.tutorial.current && this.tutorial.current.name === 'customerFinancialPerformance') {
                this.currentDashboard = this.realtimeDashboard;
                return false;
            }

            //The settings have not been created yet, we can assume that the default dashboard is to be selected.
            if (!this.userInfo.settings.activeDashboards) {
                this.switchToGeneralOverview();

                //No dashboard list at all
            } else if (companyDashboards.length === 0 && connectionDashboards.length === 0) {
                this.$router.push('/account/dashboards');
                return false;

                //The default dashboard is in the active list, use it
            } else if (this.inActiveDashboards(defaultDashboard, ContextModel.getContext())) {
                this.currentDashboard = this.findDashboardById(defaultDashboard) || this.getPresetDashboard(defaultDashboard);

                //The default dashboard is specifically in the company active list (fallback)
            } else if (this.inActiveDashboards(defaultDashboard, false)) {
                this.currentDashboard = this.findDashboardById(defaultDashboard) || this.getPresetDashboard(defaultDashboard);

                //No default dashboard, try to use _general (can be found in either the connection or company lists)
            }
            else if (this.showGeneralOverview) {
                this.switchToGeneralOverview();
            } else if (this.showTrialBalance && (ContextModel.getContext() || this.erp || this.isTutorialMode)) {
                this.switchToTrialBalance();
            } else if (this.showInvoices && (ContextModel.getContext() || this.erp || this.isTutorialMode)) {
                this.switchToInvoices();
            } else if (this.showBudget && (ContextModel.getContext() || this.erp || this.isTutorialMode)) {
                this.switchToBudget();
            } else if (this.showFinancialReport && (ContextModel.getContext() || this.erp || this.isTutorialMode)) {
                this.switchToCatTrialBalance();
            } else if (this.showAnnualReport) {
                this.switchToAnnualReport();
            } else if (this.showPresentations) {
                this.switchToPresentations();
            } else {
                this.switchToGeneralOverview();
            }

            //Nothing found, use the first available dashboard in the active list
            if (this.currentDashboard == null && this.dashboards.length > 0) {
                var found = false;
                this.dashboards.forEach(function(dashboard) {
                    if (connectionDashboards.indexOf(dashboard.id) >= 0 && !found) {
                        found = dashboard;
                    }
                });

                this.dashboards.forEach(function(dashboard) {
                    if (companyDashboards.indexOf(dashboard.id) >= 0 && !found) {
                        found = dashboard;
                    }
                });

                if (found) {
                    this.currentDashboard = found;
                }
            }


            //Convert _general to actual dashboard object
            if (this.currentDashboard === '_general' && this.showGeneralOverview) {
                this.switchToGeneralOverview();
            }
        },


        fallbackDefaultDashboard() {
            var key = 'company';
            if (ContextModel.getContext() && ContextModel.getContext().company) {
                key = ContextModel.getContext().company.id;
            }

            if (this.inActiveDashboards('_general', ContextModel.getContext())) {
                this.currentDashboard = this.realtimeDashboard;
            } else if (this.userInfo.settings.activeDashboards && this.userInfo.settings.activeDashboards[key] && this.userInfo.settings.activeDashboards[key].length > 0) {
                var scope = this;

                this.dashboards.forEach(function(dash) {
                    scope.userInfo.settings.activeDashboards[key].forEach(function(active) {
                        if (active == '_general' && !scope.currentDashboard) {
                            scope.currentDashboard = scope.realtimeDashboard;
                        } else if (active == '_palbal' && !scope.currentDashboard) {
                            scope.currentDashboard = '_palbal';
                        } else if (active == '_invoices' && !scope.currentDashboard) {
                            scope.currentDashboard = '_invoices';
                        } else if (dash.id == active && !scope.currentDashboard) {
                            scope.currentDashboard = dash;
                        }
                    });
                });

                if (scope.currentDashboard === null) {
                    this.$router.push('/account/dashboards');
                }
            } else {
                this.$router.push('/account/dashboards');
            }
        },

        addNewDashboard() {
            this.$modal.show(addNewDashboardModal, {
                onDashboardAdded: (addedDashboard) => {
                    if (addedDashboard.id) {
                        this.$router.push('/account/dashboards?open='+addedDashboard.id);
                    }
                },
            }, {height: 'auto'});
        },

        dashboardAdmin() {
            this.$router.push('/account/dashboards');
        },

        budgetAdmin() {
            this.$router.push('/account/budget');
        },

        kpiAdmin() {
            this.$router.push('/account/kpis');
        },

        closeAllOptions() {
            this.ui.adminMenu = false;
        },

        gotoCompanyErp() {
            this.$router.push('/account/company/erp');
        },

        restorePersistedDashboardSettings() {
            const { RESTORE_DASHBOARD_SETTINGS } = dashboardMutationTypes;
            this.$nextTick(()=>{
                this.$store.commit(RESTORE_DASHBOARD_SETTINGS);
            })
        },

        showSaveTemplateModal() {
            this.$modal.show(saveTemplate, {}, {width: '600px', height: 'auto'});
        },

        isGeneralOverview() {
            if (!this.currentDashboard || this.currentDashboard?.id === '_general') {
                return this.$route.path === '/account/overview/generaloverview'
            }
        }
    };

    export default Vue.extend({
        data,
        methods,
        components : {
            'dashboard' : DashboardView,
            'balance' : BalanceView,
            'invoices' : InvoiceView,
            'custom-export' : customExport,
            'tutorial-slide' : tutorialSlide,
            'sp-company' : SalesPotentialCompanyView,
            'annual-report' : AnnualReportView,
            'budget' : BudgetView,
            'reports' : ReportsView,
            'presentation-editor' : presentationEditor,
            'financial-report' : financialReport,
            'file-uploader' : FileUploader
        },
        computed : {
            currentMappingIsValid() {
                const { erp } = this;
                return erp && erp.currentMappingValidity;
            },
            currentMappingIsUpdating() {
                const { erp } = this;
                return erp && erp.mappingUpToDate === false;
            },
            isDefaultFinancialReport() {
                if (!this.inActiveDashboards('_calpalbal')) {
                    return !this.isActiveFinReport;
                }
            },
            isDefaultBudget() {
                if (!this.inActiveDashboards('_budget')) {
                    return !this.isActiveBudget;
                }
            },
            showAddPageButton() {
                const { currentDashboard } = this;
                return currentDashboard || (currentDashboard === '_palbal' && this.balanceSection === 'table') || currentDashboard === '_invoices' || currentDashboard === '_annual_report' || currentDashboard === '_catpalbal' || currentDashboard === '_budget';
            },
            isUnderEditPresentation() {
                return this.$store.getters.presentationEditMode;
            },
            isEasyView() {
                return this.$store.getters.easyview;
            },
            isKPIs() {
                return this.$store.getters.isKpis;
            },
            showExport() {
                const {ui, currentDashboard, isUnderEditPresentation} = this;
                return !ui.loading && currentDashboard !== '_presentations' && !isUnderEditPresentation && !ui.forbidden && !ui.firstRunFailed && !ui.firstRunUpdateFailed  && (currentDashboard === '_palbal' || currentDashboard === '_catpalbal' || currentDashboard.id);
            },
            showPresentations() {
                if (this.$route.path === '/account/overview/makeclientreport' && this.currentDashboard !== '_presentations') {
                    this.currentDashboard = '_presentations';
                }
                return this.$route.path === '/account/overview/makeclientreport';
            },
            showGeneralOverview() {
                return this.$route.path === '/account/overview/generaloverview';
            },
            showTrialBalance() {
                return this.$route.path === '/account/overview/trialbalance';
            },
            showInvoices() {
                return this.$route.path === '/account/overview/invoices';
            },
            showBudget() {
                return this.$route.path === '/account/overview/budget';
            },
            showFinancialReport() {
                return this.$route.path === '/account/overview/financialreport';
            },
            showAnnualReport() {
                return this.$route.path === '/account/overview/annualreport';
            },
            showFileUploader() {
                return this.$route.path === '/account/overview/reports-file-upload';
            },

            isRedirectToConnections() {
                return this.$store.getters.redirectToConnections;
            },

            isRedirectToOverview() {
                return this.$store.getters.redirectToOverview;
            },

            getReportPresentation() {
                return this.$store.getters.reportPresentation;
            },

            isTutorialMode() {
                return this.tutorial?.state?.started && !this.tutorial?.state?.finished;
            },
            isActiveFinReport() {
                return this.$store.getters.isActiveDefaultFinReport;
            },

            isActiveBudget() {
                return this.$store.getters.isActiveDefaultBudget;
            }

        },
        mounted() {
            this.init();
        },
        beforeUpdate() {
            if (this.showGeneralOverview && !this.currentDashboard.id) {
                this.switchToGeneralOverview();
            }
        },
        beforeDestroy() {
            EventBus.$off('companyUserChanged');
            EventBus.$off('companyErpChanged');
            EventBus.$off('noCompaniesExist');
            EventBus.$off('click');
            document.removeEventListener('clickAppBody', this.closeAllOptions);
            clearInterval(this.erpCheck);
        },
        watch : {
            currentDashboard(cd) {
                if (this.firstLoad) {
                    this.firstLoad = false;
                } else {
                    abortAllPendingRequests();
                }
                cd.id ? this.$store.dispatch('setDashboardId', cd.id) : this.$store.dispatch('setDashboardId', cd);
            }
        },
        mixins: [permissionsMixin]
    });

</script>
