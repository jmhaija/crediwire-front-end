/* global saveAs */
import Vue from 'Vue'
import moment from 'moment'
import DictionaryModel from 'models/DictionaryModel'
import BudgetModel from 'models/BudgetModel'
import ErpModel from 'models/ErpModel'
import CompanyModel from 'models/CompanyModel'
import ContextModel from 'models/ContextModel'
import UserModel from 'models/UserModel'
import BudgetFileModel from 'models/BudgetFileModel'
import DateRangeModel from 'models/DateRangeModel'
import AssetModel from 'models/AssetModel'
import dateField from 'elements/date-field'
import fileUploader from 'elements/file-uploader'
import startNewBudget from 'elements/start-new-budget'
import renameBudgetModal from 'elements/modals/rename-budget'
import budgetFileNote from 'elements/modals/budget-file-note'
import Toast from 'services/Toast'
import EventBus from 'services/EventBus'
import BalanceView from 'views/BalanceView'
import BudgetListCollection from 'collections/BudgetListCollection'
import BudgetFileCollection from 'collections/BudgetFileCollection'
import CountryCollection from 'collections/CountryCollection'
import budgetMutationTypes from 'store/budgetMutationTypes'
import permissionsMixin from 'mixins/permissionsMixin'
import FileSaver from 'FileSaver'

const template = `
        <article class="manage-dashboards connections">

           <nav class="tabs" v-show="!ui.loading && !ui.updating">
               <ul>
                   <li v-if="hasFullPermissions" :class="{ active : ui.section == 'import' }" @click="ui.section = 'import'"><a>{{ui.dictionary.budget.startNewBudget}}</a></li>
                   <li :class="{ active : ui.section == 'versions' }" @click="ui.section = 'versions'" v-if="!context"><a>{{ui.dictionary.budget.versions}}</a></li>
               </ul>
           </nav>

           <section class="tab-content" v-if="ui.updating && !ui.loading">
               <div v-if="ui.showTrialBalance">
                   <trial-balance :preview="true" :simple="simplePreview" :presetFromDate="earliest_date" :presetToDate="latest_date"></trial-balance>
               </div>
           </section>


           <section class="tab-content" v-show="ui.loading">
               <div class="working"></div>
           </section>

        <div class="tab-content" v-show="ui.section === 'import'">

        <section class="budget-instructions" v-if="budgetRunning">
            <p>{{ui.dictionary.budget.budgetUploadInfo}}</p>
        </section>

            <section class="budget-instructions" v-show="ui.importStep === 1 && !budgetRunning">
                <div class="instruction-container">
                    <div class="instruction-step">
                        <div class="icon">
                            <img :src="getImage('/assets/img/budget/export.png')">
                        </div>
                        <div class="text">
                            {{ui.dictionary.budget.steps.download}}
                        </div>
                    </div
                    ><div class="instruction-step">
                        <div class="icon">
                        <img :src="getImage('/assets/img/budget/review.png')">
                        </div>
                        <div class="text">
                            {{ui.dictionary.budget.steps.review}}
                        </div>
                    </div
                    ><div class="instruction-step">
                        <div class="icon">
                        <img :src="getImage('/assets/img/budget/import.png')">
                        </div>
                        <div class="text">
                            {{ui.dictionary.budget.steps.upload}}
                        </div>
                    </div>
                </div>

                <div class="start-budget">
                    <button class="primary" @click="ui.importStep++">{{ui.dictionary.budget.steps.start}}</button>
                    <div class="links-step" style="padding-top: 10px;" @click="ui.importStep = 3">{{ui.dictionary.budget.steps.goToImport}}</div>
                </div>
            </section>

            <section class="export-budget" v-show="ui.importStep === 2 && !ui.updating && !ui.loading">
                <div class="container">

                   <p>{{ui.dictionary.budget.exportDescription}}</p>

                    <div class="export-field">
                        <div class="select-label flex-row flex-align-center flex-justify-center">
                            <span>{{ui.dictionary.budget.numberOfYears}}</span>
                            <i class="cwi-info" v-tooltip="{content: ui.dictionary.budget.dataFoundationDescription, placement: 'top-center'}"></i>
                        </div>
                        <div>
                            <select v-model="numberOfMonths">
                                <option value="12">{{ui.dictionary.budget.yearOptions[0]}}</option>
                                <option value="24">{{ui.dictionary.budget.yearOptions[1]}}</option>
                                <option value="36">{{ui.dictionary.budget.yearOptions[2]}}</option>
                            </select>
                        </div>
                    </div
                    ><div class="export-field" v-show="showYearSelection">
                        <div class="select-label  flex-row flex-align-center flex-justify-center">
                            <span>{{ui.dictionary.budget.budgetedYears}}</span>
                            <i class="cwi-info" v-tooltip="{content: ui.dictionary.budget.budgetedYearsDescription, placement: 'top-center'}"></i>
                        </div>
                        <div>
                            <select v-model="forecastYears">
                                <option value="0">{{ui.dictionary.budget.currentYear}}</option>
                                <option value="1">{{ui.dictionary.budget.yearOptions[0]}}</option>
                                <option value="2">{{ui.dictionary.budget.yearOptions[1]}}</option>
                                <option value="3">{{ui.dictionary.budget.yearOptions[2]}}</option>
                            </select>
                        </div>
                    </div

                    ><div class="export-field">
                        <div>
                            <div class="select-label">{{ui.dictionary.budget.percent}} (%)</div>
                            <input type="number" v-model="percentage" v-on:change="forceZeroOrAbove()">
                        </div>
                    </div>
                    <div class="export-field">
                        <div>
                            <div class="select-label flex-row flex-align-center flex-justify-center">
                                <span>{{ui.dictionary.budget.bookkeepingValidDate}}</span>
                                <i class="cwi-info" v-tooltip="{content: ui.dictionary.budget.bookkeepingValidDateDescription, placement: 'top-center'}"></i>
                            </div>
                            <date-field class="thin-date-picker" :model="bookkeepingValidDate" :onDateSelect="selectBookkeepingValidDate"></date-field>
                        </div>
                    </div>
                    <div class="export-field">
                        <div class="checkbox-field thin-field">
                        <span>{{ui.dictionary.budget.includeCashbook}}</span>
                        <label class="checkbox-centered">
                            <input type="checkbox" v-model="includeCashbook">
                            <i class="export-checkbox alignment-checkbox" style="margin: 0"></i>
                        </label>
                        </div>
                    </div>
                    <div class="export-field"  v-show="cashflowRole">
                        <div class="checkbox-field thin-field">
                        <span>{{ui.dictionary.budget.cashFlowAnalysis}}</span>
                            <label class="checkbox-centered">
                                <input type="checkbox" v-model="cashflowAnalysis">
                                <i class="export-checkbox alignment-checkbox" style="margin: 0"></i>
                            </label>
                        </div>
                    </div>

                   <button v-show="!ui.exporting" class="primary" v-on:click="exportBudget()">{{ui.dictionary.budget.export}}</button>
                   <div class="line-spacer"></div>
                   <div v-show="ui.exporting" class="working inline"></div>
                </div>

                <div class="start-budget">
                    <div class="links-step" style="padding-top: 10px;" @click="ui.importStep = 3">{{ui.dictionary.budget.steps.goToImport}}</div>
                </div>
            </section>

           <section class="import-budget" v-show="ui.importStep === 3 && !ui.updating && !ui.loading">
               <div class="container">
                   <p>{{ui.dictionary.budget.importDescription}}</p>
                   <div class="input-field">
                        <input class="file-name" type="text" v-model="budgetFileName">
                   </div>
                   <file-uploader :uploadFiles="uploadBudget" :uploadTitle="ui.dictionary.budget.steps.upload"></file-uploader>
                   <div class="save-info">
                        <i class="cwi-info"></i>
                        <span>{{ui.dictionary.budget.budgetNote}}</span>
                    </div>
               </div>

               <div class="start-budget">
                    <div class="links-step" style="padding-top: 10px;" @click="ui.importStep = 2">{{ui.dictionary.budget.steps.goToExoprt}}</div>
                </div>
           </section>
        </div>

           <section v-show="showUpdatingBudget" class="splash">
               <h1>{{ui.dictionary.budget.updatingVersionTitle}}</h1>
               <p>{{ui.dictionary.budget.updatingVersionDescription}}</p>
               <div class="working inline"></div>
           </section>

        <div class="tab-content" v-show="ui.section == 'versions' && (!loadedBudgetFile || !loadedBudgetFile.status || loadedBudgetFile.title || loadedBudgetFile.status == 'completed' || loadedBudgetFile.status == 'created' || loadedBudgetFile.status == 'failed') && !ui.deletingBudgetFile">
           <section class="dashboard-list">
               <div class="dashboard" v-if="context">
                    <div class="edit" style="margin-top:-6px;">
                       <div class="working inline" style="margin-bottom: -10px;" v-show="ui.deletingBudgetFile"></div>
                       <i class="cwi-approve selected-budget-version" v-show="!loadedBudgetFile && !ui.deletingBudgetFile"></i>
                       <button @click="deleteLoadedBudgetFile()" class="primary" v-show="loadedBudgetFile && (loadedBudgetFile.status == 'completed' || loadedBudgetFile.status == 'failed') && !ui.deletingBudgetFile">{{ui.dictionary.budget.selectVersion}}</button>
                   </div>
                    <span>{{ui.dictionary.budget.defaultVersion}}</span>
               </div>
               <div class="dashboard flex-row flex-justify-space-between"
                    v-for="budget in sortBudgetFiles(budgetFiles)"
                    v-show="!budget.deleted">
                    <div>
                        <div class="budget-version-column">
                            <label>{{ui.dictionary.budget.name}}</label>
                            <span>{{budget.name}}</span>
                        </div>
                        <div class="budget-version-column shrunk divider-right edit-name" :class="{'no-edit': permissions.permissionType !== 'full' }">
                            <i class="cwi-pencil" v-if="permissions.permissionType === 'full'" @click="showRenameModal(budget)"></i>
                        </div>
                        <div class="budget-note" v-if="context">
                            <label>{{ui.dictionary.budget.label}}</label>
                            <span>{{budget.note}}</span>
                        </div>
                        <div class="budget-version-column shrunk divider-right edit-name" v-if="context">
                            <i class="cwi-pencil" @click="showAddBudgetNoteModal(budget)"></i>
                        </div>
                        <div class="budget-version-column"><label>{{ui.dictionary.budget.createdDate}}</label>{{formatDate(budget.created)}}</div>
                    </div>
                    <div>
                        <div class="budget-period"><label>{{ui.dictionary.budget.fromDate}}</label>{{formatDate(budget.start_date)}}</div>
                        <div class="budget-period"><label>{{ui.dictionary.budget.toDate}}</label>{{formatDate(budget.end_date)}}</div>
                    </div>
                    <div v-if="context" class="budget-actions edit" v-show="showEditBudget">
                           <div class="working inline" v-show="(isBudgetLoaded(budget) && loadedBudgetFile.status != 'completed' && loadedBudgetFile.status != 'failed') || budget.loading"></div>
                           <i class="cwi-approve selected-budget-version" v-show="isBudgetLoaded(budget) && loadedBudgetFileIsCompleted && !budget.loading"></i>
                           <i class="cwi-close error-budget-version" v-show="isBudgetLoaded(budget) && !loadedBudgetFileIsCompleted && !budget.loading" @click="deleteLoadedBudgetFile()"></i>
                           <button @click="selectLoadedBudgetFile(budget)" class="primary" v-show="showSelectLoadedBudgetFile(budget)">{{ui.dictionary.budget.selectVersion}}</button>
                    </div>
               </div>
           </section>
           <section v-show="budgetFiles.length === 0 && !context" class="splash">
               <h1>{{ui.dictionary.budget.noVersionsTitle}}</h1>
               <p>{{ui.dictionary.budget.noVersionsDescription}}</p>
           </section>
        </div>

        </article>
    `;

const data = function () {
    return {
        ui: {
            dictionary: DictionaryModel.getHash(),
            loading: true,
            uploadError: false,
            working: false,
            updating: false,
            importing: false,
            exporting: false,
            showTrialBalance: false,
            section: this.hasFullPermissions ? 'import' : 'versions',
            confirmDeleteDialog: false,
            deletingBudgetFile: false,
            importStep: 1
        },
        budgetFileName: '',
        upEv: null,
        numberOfMonths: 12,
        forecastYears: 0,
        startDate: moment().format('YYYY-MM-DD'),
        erp: ErpModel.getErp(),
        template: 'v1',
        prefill: false,
        cashflowRole: UserModel.profile().roles?.indexOf('cash_flow_analysis_role') >= 0,
        cashflowAnalysis: UserModel.profile().roles?.indexOf('cash_flow_analysis_role') >= 0,
        includeCashbook: false,
        simplePreview: false,
        earliest_date: null,
        latest_date: null,
        currentBudgetObject: null,
        isIE: window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0,
        percentage: 0,
        bookkeepingValidDate: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
        preBudgetFiles: [],
        budgetFiles: [],
        context: ContextModel.getContext(),
        loadedBudgetFile: BudgetFileModel.getBudgetFile(),
        counter: 0,
        timeoutHandler: null,
        updatingFileStatus: false,
        permissions: ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        budgetRunning: false,
        budgetCompleted: false,
        company : CompanyModel.getCompany(),
        cashflowAnalysisCountryList : [],
        countryCashflowAnalysisWhitelist : [
            'denmark'
        ]
    }
}

const methods = {
    init: function () {
        EventBus.$on('companyUserChanged', this.checkErp);
        this.getStatus();
        this.getBudgetFiles();
        this.checkBudgetFileStatus();

        if (ContextModel.getContext() && this.hasFullPermissions) {
            this.ui.section = 'import'
        }

        EventBus.$on('showManageBudget', res => {
            res && this.hasFullPermissions ? this.ui.section = 'import' : '';
        })

        this.populateCountryList()
    },

    populateCountryList : function() {
      CountryCollection.fetchCountries()
        .then(function (res) {
          if (res && res._embedded && res._embedded.items && res._embedded.items.length > 0) {
            res._embedded.items.forEach( function(country) {
              if (this.countryCashflowAnalysisWhitelist.indexOf(country.reference) >= 0) {
                this.cashflowAnalysisCountryList.push(country.id)
              }
            }.bind(this))
          }
        }.bind(this))
    },

    getImage: function (path) {
        return new AssetModel(path).path;
    },

    uploadBudget(budgetFile) {
        this.$store.dispatch('importBudget', true);
        return BudgetModel.uploadFile({ fileName: this.budgetFileName, file: budgetFile.fileObj })
            .then(res => {
                if (res.budget_process_id) {
                    const { from_date, to_date } = res;
                    this.earliest_date = from_date;
                    this.latest_date = to_date;
                    this.ui.importStep = 1;

                    this.getStatus(moment(from_date).format('YYYY-MM-DD'), moment(to_date).format('YYYY-MM-DD'));

                    if (this.viewBudgetStatusChange) {
                        this.viewBudgetStatusChange(true);
                    }

                    this.getBudgetFiles(true);
                } else if (res.status === 400 && res.body?.errors?.length) {
                    const error = res.body.errors[0];
                    const { type } = error;

                    if (type === 'UnrecognizedTemplate') {
                        Toast.show(this.ui.dictionary.budget.unrecognizedTemplate, 'warning');
                    } else if (type === 'InputValidationFailed') {
                        Toast.show(this.ui.dictionary.budget.inputValidationFailed, 'warning');
                    } else if (type === 'InvalidFileType') {
                        Toast.show(this.ui.dictionary.budget.invalidFileType, 'warning');
                    } else {
                        Toast.show(this.ui.dictionary.budget.importFailure, 'warning')
                    }
                } else {
                    Toast.show(this.ui.dictionary.budget.importFailure, 'warning');
                }
            });
    },

    showBudgetIsLoading(budget) {

    },

    isBudgetLoaded(budget) {
        return this.loadedBudgetFile && this.loadedBudgetFile.budget_file_id === budget.id;
    },

    selectBookkeepingValidDate(value, isValid) {
        this.bookkeepingValidDate = moment(value).format('YYYY-MM-DD');
    },

    forceZeroOrAbove: function () {
        if (this.precentage === NaN || this.precentage < 0) {
            this.precentage = 0;
        }
    },

    checkBudgetFileStatus: function () {
        this.timeoutHandler = setTimeout(function () {
            this.loadedBudgetFile = BudgetFileModel.getBudgetFile();

            if (!this.loadedBudgetFile || !this.loadedBudgetFile.status) {
                this.updatingFileStatus = false;
            } else if (this.loadedBudgetFile && this.loadedBudgetFile.status != 'completed' && this.loadedBudgetFile.status != 'failed') {
                this.updatingFileStatus = true;
                this.checkBudgetFileStatus();
            } else if (this.updatingFileStatus && this.showBudgetData) {
                EventBus.$emit('budgetFileChanged');

                if (this.showBudgetData) {
                    this.showBudgetData();
                }
            }
        }.bind(this), 5000);
    },

    deleteLoadedBudgetFile: function () {
        this.ui.deletingBudgetFile = true;
        this.counter++;

        BudgetFileModel.deleteBudgetFile(this.context?.id)
            .then(function () {
                BudgetFileModel.forgetBudgetFile();
                this.loadedBudgetFile = null;
                this.ui.deletingBudgetFile = false;
                this.counter++;
                EventBus.$emit('budgetFileChanged');

                if (this.showBudgetData) {
                    this.showBudgetData();
                }
            }.bind(this));
    },

    selectLoadedBudgetFile: function (budgetFile) {
        budgetFile.loading = true;
        this.counter++;
        this.loadedBudgetFile = budgetFile;
        this.loadedBudgetFile.status = 'running';

        BudgetFileModel.deleteBudgetFile(this.context?.id)
            .then(function () {
                BudgetFileModel.changeBudgetFile(budgetFile.id, this.context?.id)
                    .then(function (res) {
                        BudgetFileModel.setBudgetFile(res);
                        this.loadedBudgetFile = res;
                        budgetFile.loading = false;
                        this.counter++;
                        EventBus.$emit('budgetFileChanged');
                        this.updatingFileStatus = true;
                        this.checkBudgetFileStatus();
                    }.bind(this));
            }.bind(this));
    },

    userChangeHandler: function () {
        this.checkErp();
        this.getStatus();
    },

    sortBudgetFiles: function (budgets) {
        var list = budgets.slice();

        var newList = list.sort(function (a, b) {
            return a.created.toLocaleLowerCase() > b.created.toLocaleLowerCase() ? 1 : (a.created.toLocaleLowerCase() < b.created.toLocaleLowerCase() ? -1 : 0);
        });

        return newList.reverse();
    },

    deleteBudgetPeriod: function (budget) {
        budget.deleted = true;
        this.ui.confirmDeleteDialog = false;

        BudgetListCollection.deleteBudgetPeriod(budget.id)
            .then(function (res) {
            });
    },

    confirmBudgetDelete: function (budget) {
        this.currentBudgetObject = budget;
        this.showConfirmDeleteDialog(budget);
    },

    getBudgetFiles: function (fromUpload) {
        if (!fromUpload) {
            this.ui.loading = true;
        }

        BudgetFileCollection.getBudgetFiles()
            .then(function (res) {
                if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                    if (!ContextModel.getContext()) {
                        this.budgetFiles = res._embedded.items;
                        this.budgetFiles.forEach(function (budget) {
                            budget.loading = false;
                        });
                    } else {
                        this.preBudgetFiles = res._embedded.items;
                        let previousCall = Promise.resolve();
                        let scope = this;
                        this.preBudgetFiles.forEach(function (budget) {
                            budget.loading = false;
                            previousCall = previousCall.then(() => scope.getBudgetNotes(budget.id));
                        });
                    }

                } else {
                    this.budgetFiles = [];
                    if (this.hasFullPermissions) {
                        this.ui.section = 'import';
                    }
                }

                this.ui.loading = false;
                if (fromUpload) {
                    EventBus.$emit('finishedUploadBudget', true);
                }
            }.bind(this));
    },

    getBudgetNotes(id) {
        BudgetFileCollection.getBudgetNote(id).then((val) => {
            this.preBudgetFiles.forEach((item) => {
                item.id === id ? item.note = val.note : '';
            })
            this.budgetFiles = [...this.preBudgetFiles];
        })

    },

    checkErp: function () {
        this.erp = ErpModel.getErp();
        this.ui.showTrialBalance = false;
        this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();


        if (!this.erp) {
            this.$router.push('/account/connections/all');
            return false;
        }

        this.addFutureYears();

        return true;
    },

    addFutureYears: function () {
        var latestYear = this.erp.financialYears[this.erp.financialYears.length - 1].start;

        for (var i = 1; i <= 3; i++) {
            this.erp.financialYears.push({
                id: null,
                end: null,
                start: moment(latestYear).add(i, 'years').toDate()
            });
        }
    },


    formatDate: function (date) {
        return moment(date).format(this.ui.dictionary.locale.displayFormat);
    },

    getStatus: function (from_date = DateRangeModel.getFromStringPadded(), to_date = DateRangeModel.getToStringPadded()) {
        var scope = this;
        BudgetModel.getStatus()
            .then(function (res) {
                this.budgetRunning = res.status === 'running';
                if ((res.errors && res.errors[0] && res.errors[0].type == 'ResourceNotFound') || (res.status && (res.status == 'completed' || res.status == 'created'))) {
                    this.ui.updating = false;
                    this.$store.dispatch('setBudgetIsUpdating', this.ui.updating);
                    if (this.showBudgetData) {
                        this.showBudgetData(moment(from_date).format('YYYY-MM-DD'), moment(to_date).format('YYYY-MM-DD'));
                    }
                } else if (res.status && res.status == 'failed') {
                    this.ui.updating = false;
                    this.$store.dispatch('setBudgetIsUpdating', this.ui.updating);
                } else if (res.status && res.status !== null) {
                    this.ui.updating = true;
                    this.$store.dispatch('setBudgetIsUpdating', this.ui.updating);
                    if (res.status == 'running') {
                        this.ui.showTrialBalance = true;
                    }

                    setTimeout(function () {
                        this.getStatus();
                    }.bind(this), 20000);
                }

                this.ui.loading = false;
                this.ui.working = false;
                this.ui.importing = false;
                this.ui.exporting = false;
            }.bind(this));
    },

    exportBudget: function () {
        if (!this.startDate) {
            return false;
        }

        this.ui.exporting = true;

        const years = this.numberOfMonths / 12;

        BudgetModel.download({
            date: moment(this.startDate).format('YYYY-MM-DD'),
            precedingYears: years,
            forecastFinYears: this.forecastYears,
            template: this.template,
            percentage: this.percentage,
            cashbook: this.includeCashbook,
            reclassified: true,
            bookkeepingValidDate: this.bookkeepingValidDate,
            cashFlowAnalysis: this.cashflowAnalysis && this.cashflowAnalysisWhitelist
        })
            .then(function (data) {
                this.ui.exporting = false;

                if (!data) {
                    Toast.show(this.ui.dictionary.budget.exportFailure, 'warning');
                    return false;
                }

                var blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                FileSaver.saveAs(blob, this.ui.dictionary.budget.exportFileName);
                this.ui.importStep++;
            }.bind(this));
    },

    showConfirmDeleteDialog(budget) {
        this.$modal.show('dialog', {
            text: this.ui.dictionary.budget.deleteConfirmation,
            width: 600,
            buttons: [
                {
                    title: this.ui.dictionary.budget.declineDelete,
                    class: 'highlighted-text',
                },
                {
                    title: this.ui.dictionary.budget.confirmDelete,
                    class: 'warning',
                    default: true,
                    handler: () => { this.deleteBudgetPeriod(budget); this.$modal.hide('dialog'); }
                }
            ]
        });
    },

    renameBudgetVersion(file, name) {
        BudgetModel.renameFile({ file, name }).then(res => {
            file.name = name;
        });
    },

    addBudgetFileNote(file, name) {
        if (name) {
            BudgetModel.addBudgetFileNote({ file, name }).then(res => {
                file.note = name;
                this.getBudgetNotes(file.id)
            });
        }
    },

    showRenameModal(budget) {
        this.$modal.show(renameBudgetModal, {
            budget,
            renameBudgetVersion: (name) => {
                this.renameBudgetVersion(budget, name)
            },
        }, { height: 'auto' });
    },

    showAddBudgetNoteModal(budget) {
        this.$modal.show(budgetFileNote, {
            budget,
            addBudgetFileNote: (name) => {
                this.addBudgetFileNote(budget, name)
            },
        }, { height: 'auto' });
    },

    showSelectLoadedBudgetFile(budget) {
        const { loadedBudgetFile } = this;
        return (!loadedBudgetFile || loadedBudgetFile.budget_file_id !== budget.id) && !budget.loading && (!loadedBudgetFile || loadedBudgetFile.status === 'completed' || loadedBudgetFile.status == 404)
    }
};

const watch = {
    template(newVal) {
        if (newVal === 'simple') {
            this.includeBookedNumbersWithCashbook = false;
        }
    },
    prefill(newVal) {
        if (newVal) {
            this.includeBookedNumbersWithCashbook = false;
        }
    },
    includeBookedNumbersWithCashbook(newVal) {
        if (newVal) {
            this.prefill = false;
        }
    }
};

const computed = {
    showUpdatingBudget() {
        const { loadedBudgetFile } = this;
        return this.ui.section === 'versions' && ((loadedBudgetFile && loadedBudgetFile.status && !loadedBudgetFile.title && loadedBudgetFile.status !== 'completed' && loadedBudgetFile.status !== 'failed' && loadedBudgetFile.status !== 'created') || this.ui.deletingBudgetFile);
    },
    showEditBudget() {
        const { permissions } = this;
        return permissions && (permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended')
    },
    loadedBudgetFileIsCompleted() {
        const { loadedBudgetFile } = this;
        return loadedBudgetFile.status === 'completed' && loadedBudgetFile.status !== 'failed'
    },
    showYearSelection() {
        return UserModel.profile().roles?.indexOf('budget_role') >= 0
    },
    cashflowAnalysisWhitelist() {
      return !this.company.country || this.cashflowAnalysisCountryList.indexOf(this.company.country) >= 0
    }
};

export default Vue.extend({
    template,
    data,
    methods,
    props: ['viewBudgetStatusChange', 'showBudgetData'],
    components: {
        'date-field': dateField,
        'trial-balance': BalanceView,
        'file-uploader': fileUploader,
        'start-new-budget': startNewBudget,
    },
    mounted: function () {
        this.init();
    },
    watch,
    computed,
    beforeDestroy: function () {
        EventBus.$off('companyUserChanged');
        EventBus.$off('showManageBudget');
    },
    mixins: [permissionsMixin]
});
