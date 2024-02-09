define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'elements/date-field',
    'elements/dropdown/templates-dropdown',
    'models/DictionaryModel',
    'models/DateRangeModel',
    'models/UserModel',
    'collections/PresentationTemplateCollection',
    'services/Validator'
], function (Vue, moment, modal, dateField, templatesDropdown, DictionaryModel, DateRangeModel, UserModel, PresentationTemplateCollection, Validator) {
    const template = `
        <modal :title="dictionary.presentations.newReport" :close="close">
            <template v-slot:content>
                <div class="input-field margin-input" style="padding-top: 12px;">
                    <label class="static-label" v-bind:class="{ filled: newReport.name.value.length > 0 }">{{dictionary.presentations.reportName}}:</label>
                    <input data-test-id=\'reportTitle\' type="text" class="grey-input" v-model="newReport.name.value" :placeholder="dictionary.presentations.titleExample" v-bind:class="{ invalid : !newReport.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                    <div class="warning" v-bind:class="{ show : !newReport.name.valid }">{{dictionary.general.validation.generic}}</div>
                </div>

                <div class="input-field margin-input" style="padding-top: 6px;">
                    <label class="static-label" v-bind:class="{ filled: newReport.title.value.length > 0 }">{{dictionary.presentations.subtitle}} ({{dictionary.general.labels.optional}}):</label>
                    <input data-test-id=\'reportSubtitle\' type="text" class="grey-input" v-model="newReport.title.value" :placeholder="dictionary.presentations.subtitleExample" v-bind:class="{ invalid : !newReport.title.valid }">
                    <div class="warning" v-bind:class="{ show : !newReport.title.valid }">{{dictionary.general.validation.generic}}</div>
                </div>

                <div class="input-field periods-date-inputs dates-report-popup">
                    <div>
                        <div class="static-label zero-padding-bottom">{{dictionary.presentations.reportPeriodStart}}:</div>
                        <div class="zero-padding-top"><date-field :onDateSelect="setFromDate" :max="date.toDate" :optional="true" :model="date.fromDate"></date-field></div>
                    </div>
                    <div>
                        <div class="static-label zero-padding-bottom">{{dictionary.presentations.reportPeriodEnd}}:</div>
                        <div class="zero-padding-top"><date-field :onDateSelect="setToDate" :max="date.now" :optional="true" :model="date.toDate"></date-field></div>
                    </div>
                </div>

                <templates-dropdown v-show="templates && templates.length && hasTemplatesRole" :templates="templates" :defaultOption="selectedTemplate" @templateSelected="onTemplateSelected"></templates-dropdown>
            </template>

            <template v-slot:footer>
                <div class="zero-padding-top zero-padding-bottom buttons-container">
                    <div class="working inline" v-show="working"></div>
                    <button data-test-id=\'generateReport\' v-show="!working" class="primary edit-report-popup" :disabled="!newReport.name.value.length" :style="newReport.name.value.length ? 'background-color: #ffa630 !important;' : 'background-color: #cccccc !important;'"
                            v-on:click="addNewReport()" v-handle-enter-press="addNewReport">{{dictionary.presentations.generate}}</button>
                </div>
            </template>
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            newReport: {
                name: {value: '', valid: true},
                title: {value: '', valid: true},
            },
            reportCreateError: false,
            working: false,
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
            hasTemplatesRole: UserModel.profile().roles.indexOf('template_role') >= 0
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },

        validateName(force) {
            if (force || !this.newReport.name.valid) {
                this.newReport.name.valid = Validator.minLength(this.newReport.name.value, 2);
            }

            return this.newReport.name.valid;
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

        setFromDate(value, valid) {
            this.date.fromDate = value;
            this.date.fromValid = valid;
            if (value) {
                this.date.from = moment(value).format('YYYY-MM-DD');
            } else {
                this.date.fromValid = false;
            }
        },

        createTitleSlide(report, cb) {
            PresentationTemplateCollection.addPage({
                id: report.id,
                params: {
                    name : report.name,
                    end_date: this.date.to,
                    front_page: true,
                    number: 1,
                    start_date: this.date.from,
                    title: report.title
                }
            }).then(function (res) {
                    if (res.id) {
                        PresentationTemplateCollection.editPage(report.id, {
                            id : res.id,
                            name : report.name,
                            number : 1,
                            description : report.description
                        }).then(function () {
                            if (cb) {
                                cb(report);
                            }
                        }.bind(this));
                    }
                }.bind(this));
        },

        addNewReport() {
            if (!this.validateName(true) || !this.date.fromValid || !this.date.toValid || (!this.date.from && this.date.to) || (this.date.from && !this.date.to) ) {
                return false;
            }

            const name = this.newReport.name.value;
            const title = this.newReport.title.value;
            const start_date = this.date.from;
            const end_date = this.date.to;
            const lang = this.dictionary.meta.code;

            this.working = true;

            if (this.date.from === null) {
                this.date.from = DateRangeModel.getFromString();
            }

            if (this.date.to === null) {
                this.date.to = DateRangeModel.getToString();
            }

            if (this.selectedTemplate) {
                this.createPresentationFromTemplate({
                    template: this.selectedTemplate,
                    name,
                    title,
                    start_date,
                    end_date,
                    lang
                }).then(() => {
                    this.reloadData();
                    this.close();
                });
                return;
            }

            PresentationTemplateCollection.createPresentation(name, title, start_date, end_date, lang)
                .then((res) => {
                    if (res.id) {
                        this.createTitleSlide(res, this.onCreateCallback);
                        this.reloadData();
                        this.close();
                    } else {
                        this.reportCreateError = true;
                        this.working = false;
                    }
                });
        },

        createPresentationFromTemplate({template, name, title, start_date, end_date, lang}) {
            return PresentationTemplateCollection.getPages(template.id, true).then(pagesData => {
                let pages = [];

                if (pagesData._embedded?.items) {
                    pages = pagesData._embedded.items;
                }

                return PresentationTemplateCollection.createPresentationFromTemplate({
                    name,
                    title,
                    start_date,
                    end_date,
                    lang,
                    pages,
                    callback: this.onCreateCallback
                })
            });

        },

        onTemplateSelected(template) {
            this.selectedTemplate = template;
        }
    };

    return Vue.extend({
        name: 'create-new-report',
        template,
        data,
        methods,
        computed: {
          templates() {
              return this.$store.getters.templates;
          }
        },
        props: {
            onCreateCallback: {
                type: Function,
                required: true
            },
            reloadData: {
                type: Function,
                default: () => {}
            },
            predefinedTemplate: {
                default: null
            }
        },
        components: {
          modal,
          'date-field': dateField,
          'templates-dropdown': templatesDropdown
        },
        created: function () {
            this.selectedTemplate = this.predefinedTemplate;
        },
        mounted: function() {
            this.$store.dispatch('getReportTemplates');
        },
    });
});
