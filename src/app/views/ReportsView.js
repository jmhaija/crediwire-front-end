    import Vue from 'Vue'
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import DateRangeModel from 'models/DateRangeModel'
    import UserModel from 'models/UserModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import Validator from 'services/Validator'
    import Toast from 'services/Toast'
    import EventBus from 'services/EventBus'
    import dateField from 'elements/date-field'
    import dropdown from 'elements/dropdown'
    import createNewReport from 'elements/modals/create-new-report'
    import getLinkModal from 'elements/modals/get-link'
    import switchWithLabels from 'elements/switch-with-labels'
    import Config from 'services/Config'
    import SortingService from 'services/SortingService'
    import reportSharingMixin from 'mixins/reportSharingMixin'

    'use strict';
    const template = `
        <article class="reporting manage-dashboards manage-kpis" ref="reports">
            <section v-show="ui.loading">
                <div class="working"></div>
            </section>
            
            <section v-show="!ui.loading">
                <switch-with-labels v-model="ui.section" :firstValue="'REPORTS'" :secondValue="'TEMPLATES'" v-show="hasTemplatesRole">
                    <span slot="label-left" :class="[ui.section === 'REPORTS' ? 'primary-color' : 'faded']">{{ui.dictionary.presentations.reports}}</span>
                    <span slot="label-right" :class="[ui.section === 'TEMPLATES' ? 'primary-color' : 'faded']">{{ui.dictionary.presentations.templates}}</span>
                </switch-with-labels>
                
                <section class="reports-list" v-show="ui.section === 'REPORTS'">
                     <!--
                        New report button
                     -->
                    <div class="float-right"><button data-test-id=\'addNewReport\' class="primary" v-on:click="function() {showNewReport()}">{{ui.dictionary.presentations.add}} <i class="cwi-add plus-report"></i></button></div>
                
                    <!--
                        Reporting intro
                     -->
                    <h3>{{ui.dictionary.presentations.title}}</h3>
                    <p>{{ui.dictionary.presentations.description}}</p>
                    
                    <!--
                    * Reports
                    -->
                    <div class="list-section dashboard-list">
                        <h3>{{ui.dictionary.presentations.reports}}</h3>
                        <dropdown v-bind:options="sortOptions" v-bind:defaultOption="defaultSortOption" v-on:optionSelected="onOptionSelected"></dropdown>
                        <p v-show="reports.length === 0">{{ui.dictionary.presentations.noReports}}</p>
                        <div v-for="(report, index) in reportsToShow" class="dashboard" v-bind:class="{ firstReport : index === 0 }">
                            <div class="edit">                               
                                <span class="primary-color" v-on:click="showLinkModal(report)">{{ui.dictionary.presentations.getLink}}</span>
                                 &nbsp;&nbsp;&nbsp;&nbsp;
                                <span v-on:click="showDeleteDialog(report)">{{ui.dictionary.presentations.delete}}</span>
                            </div>
                            <span class="budget-version-column name-presentation" style="color: #2fabff;"><span class="clickable" v-tooltip="{content: report.name, placement: \'bottom-left\'}" v-on:click="editReport(report)">{{report.name}}</span></span>
                            <span class="budget-version-column reporting-info"><label class="label-created-report">{{ui.dictionary.presentations.created}}: </label><span class="date-report-created">{{formatDate(report.created)}}</span></span>
                        
                        </div>
                    </div>
                </section>
                
                <section class="templates-list" v-show="ui.section === 'TEMPLATES'">
                    <!--
                    * Templates
                    -->
                    <div class="list-section dashboard-list">
                        <h3>{{ui.dictionary.presentations.templates}}</h3>
                        <dropdown v-bind:options="sortOptions" v-bind:defaultOption="defaultSortOption" v-on:optionSelected="onOptionSelected"></dropdown>
                        <p v-show="templates.length === 0">{{ui.dictionary.presentations.noTemplates}}</p>
                        <div v-for="template in templates" class="dashboard">
                            <div class="edit">
                                <span v-on:click="confirmTemplateDelete(template)">{{ui.dictionary.presentations.delete}}</span>
                            </div>
                            <span class="budget-version-column clickable" @click="function() {showNewReport(template)}"><label>{{ui.dictionary.presentations.name}}</label><span>{{template.name}}</span></span>
                            <span class="budget-version-column"><label>{{ui.dictionary.presentations.created}}</label>{{formatDate(template.created)}}</span>
                        </div>
                    </div>
                </section>
            </section>
        </article>`;

    const sections = { REPORTS: 'REPORTS', TEMPLATES: 'TEMPLATES' };
    const { REPORTS, TEMPLATES } = sections;

    const data = function () {
        const defaultSortOption = (({ CREATED }) => (CREATED))(SortingService.getSortOptions());
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                loading: true,
                reportCreateError: false,
                working: false,
                showCopied: false,
                section: REPORTS
            },
            reports: [],
            newReport: {
                name: {value: '', valid: true},
                title: {value: '', valid: true}
            },
            shareLink: {
                name: {value: '', valid: true},
                email: {value: '', valid: true},
                comment: {value: '', valid: true}
            },
            selectedReport: null,
            selectedTemplate: null,
            date: {
                fromDate: DateRangeModel.getFromDate(),
                from: null,
                fromValid: true,
                toDate: DateRangeModel.getToDate(),
                to: null,
                toValid: true,
                now: new Date()
            },
            shareLinkInfo: null,
            domain: Config.get('domain'),
            sortOptions: (({ BY_NAME, CREATED }) => ([BY_NAME, CREATED]))(SortingService.getSortOptions()),
            defaultSortOption,
            totalReports: null,
            reportsLimit: 50,
            currentPage: 0,
            previousRequestedPage: null,
            totalPages: 1,
            selectedSorting: {
                selectedOption: defaultSortOption,
                selectedSortDirection : SortingService.sortDirections.ASC
            },
            hasTemplatesRole: UserModel.profile().roles.indexOf('template_role') >= 0
        };
    };

    const methods = {
        init()  {
            document.addEventListener('scroll', this.watchScroll);
        },
        onOptionSelected(selectedSortConfig) {
            const {selectedOption: selectedSortOption, selectedSortDirection} = selectedSortConfig;
            this.selectedSorting = {...selectedSortConfig};
            this.reports = SortingService.sortingMethods[selectedSortOption.id](this.reports, selectedSortDirection);
        },
        copyLink() {
            var query = '#reportLink';
            var i = this.$refs.reports.querySelector(query);

            i.select();

            try {
                document.execCommand('copy');
                i.blur();
                this.ui.showCopied = true;

                setTimeout(() => {
                    this.ui.showCopied = false;
                }, 4000);
            }
            catch (err) {
                alert(this.ui.dictionary.invitations.copyFail);
            }
        },

        setFromDate(value, valid) {
            this.date.fromDate = value;
            this.date.fromValid = valid;
            if (value) {
                this.date.from = moment(value).format('YYYY-MM-DD');
            } else {
                this.date.fromValid = false;
            }
        },

        setToDate(value, valid) {
            this.date.toDate = value;
            this.date.toValid = valid;
            if (value) {
                this.date.to = moment(value).format('YYYY-MM-DD');
            } else {
                this.date.toValid = false;
            }
        },

        getPresentationList() {
            return new Promise((resolve, reject) => {
                PresentationTemplateCollection.getPresentationList()
                    .then(reports => {
                        this.reports = SortingService.sortingMethods[this.defaultSortOption.id]([...reports]);
                        this.totalReports = reports.length;
                        //this.currentPage = res.page;
                        //this.totalPages = res.page_count;
                        this.ui.loading = false;
                        resolve(reports)
                    })
                    .catch((err => {
                        this.getPresentationList();
                        reject(err)
                }));
            });
        },

        formatDate(date) {
            return moment(date).format(this.ui.dictionary.locale.displayFormat);
        },


        validateLinkEmail(force) {
            if (force || !this.shareLink.email.valid) {
                this.shareLink.email.valid = Validator.email(this.shareLink.email.value);
            }

            return this.shareLink.email.valid;
        },

        confirmTemplateDelete(template) {
            this.selectedTemplate = template;
            this.showDeleteTemplateConfirmDialog();
        },

        showDeleteTemplateConfirmDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.presentations.deleteTemplateConfirmation,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.presentations.deleteCancel,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.presentations.deleteConfirm,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteTemplate(this.selectedTemplate); this.$modal.hide('dialog')}
                    }
                ]
            });
        },

        showDeleteDialog(report) {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.presentations.deleteReportConfirmation,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.presentations.deleteCancel,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.presentations.deleteConfirm,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteReport(report); this.$modal.hide('dialog')}
                    }
                ]
            });
        },

        deleteTemplate(template) {
            this.$store.dispatch('deleteReportTemplate', template.id);
        },

        deleteReport(report) {
            let index = 0;
            this.reports.forEach(function (rep, idx) {
                if (rep.id === report.id) {
                    index = idx;
                }
            });

            this.reports.splice(index, 1);

            PresentationTemplateCollection.deleteReport(report.id)
                .then(() => {});
        },

        createTitleSlide(report) {
            PresentationTemplateCollection.addPage({
                id:  report.id,
                params: {
                    name : report.name,
                    end_date: this.date.to,
                    front_page: true,
                    number: 1,
                    start_date: this.date.from,
                    title: report.title
                },
            }).then(function (res) {
                    if (res.id) {
                        PresentationTemplateCollection.editPage(report.id, {
                            id : res.id,
                            name : report.name,
                            number : 1,
                            description : report.description
                        }).then(function () {
                            this.editReport(report);
                        }.bind(this));
                    }
                }.bind(this));
        },

        editReport(report) {
            this.$router.push('/account/overview/generaloverview');

            let from = moment(moment(report.start_date).format('YYYY-MM-DD')).toDate();
            let to = moment(moment(report.end_date).format('YYYY-MM-DD')).toDate();
            DateRangeModel.setFromDate(from);
            DateRangeModel.setToDate(to);
            if (report.language !== this.ui.dictionary.meta.code) {
                this.changeLanguage(report.language);
            }
            this.$store.dispatch('setReportPresentation', {
                report: JSON.stringify(report)
            });

            this.$store.dispatch('setPresentationId', report.id);

            EventBus.$emit('editReportPresentation');
        },

        editTemplate() {

        },

        changeLanguage(lang) {
            let user = UserModel.profile();
            user.language = lang;
            UserModel.construct(user);
            UserModel.save()
                .then((res) => {res.success ? this.changeDictionary(res.contents.language) : ''; });
        },

        changeDictionary(language) {
            var scope = this;
            DictionaryModel.setLanguage(language);
            return DictionaryModel.fetchDictionary(true)
                .then(function(dict) {
                    DictionaryModel.setHash(dict);
                    scope.ui.dictionary = dict;
                    EventBus.$emit('uiLanguageChanged');
                });
        },

        watchScroll() {
            if (this.scrolledToBottom()) {
               this.reportsLimit += 50;
            }
        },
        scrolledToBottom() {
            return (window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight - (window.innerHeight / 2));
        },
        showNewReport(selectedTemplate) {
            this.$modal.show(createNewReport, {
                onCreateCallback: (report) => {
                    // And go to the newly created report
                    this.editReport(report);
                },
                reloadData: () => {
                    // Create new report - reload reports list
                    this.getPresentationList();
                },
                predefinedTemplate: selectedTemplate
            }, {height: 'auto'});
        },
        getTemplates() {
            this.ui.loading = true;

            this.$store.dispatch('getReportTemplates').then(() => {
                this.ui.loading = false;
            });
        }
    };

    const computed = {
        reportsToShow() {
            const limit = this.reportsLimit <= this.totalReports ? this.reportsLimit : this.totalReports;
            return this.reports.slice(0, limit);
        },
        templates() {
            return this.$store.getters.sortedTemplates(this.selectedSorting);
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        computed,
        mixins: [reportSharingMixin],
        components : {
            'date-field' : dateField,
            'dropdown' : dropdown,
            'switch-with-labels' : switchWithLabels
        },
        mounted() {
            this.init();
        },
        watch: {
            'ui.section': {
                immediate: true,
                handler: function(val) {
                    if (val === REPORTS) {
                        this.getPresentationList()
                    } else {
                         this.getTemplates();
                    }
                 }
            }
        }
    });
