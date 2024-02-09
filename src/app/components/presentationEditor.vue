<template>
    <article class="report-editor flex-column" ref="reporteditor">
        <div class="flex-row">
            <section class="modal" @click.prevent.stop.self="closePreview" :class="{ show : ui.showPreview }">
                <div class="popup scrollable preview-presentation-popup" style="width: 90%; max-width: 100%; margin-left: -43%; top: 20px; height: 97vh; max-height: 100vh; padding: 0" v-show="ui.showPreview">
                    <div class="back-to-edit" v-on:click="ui.showPreview = false"><i class="cwi-left" style="position: relative; top: 3px;"></i> {{ui.dictionary.presentations.BackEditing}}</div>
                    <preview-presentation :report="report" :pages="sortPages(pages)" :dashboards="dashboards" :realtimeDashboard="realtimeDashboard" :saveAsTemplate="function() {showSaveAsTemplateDialog(report)}"></preview-presentation>
                </div>
            </section>
            <report-info :presentation="report" :onTitleClick="function() {onReportTitleClick(report)}" :pages=pages>
                <span class="preview"></span>
            </report-info>
            <div class="items-slide">
                <draggable v-slot="slotProps" @item-dropped="itemDropped">
                    <div class="page-thumb page-thumb-editor" v-on="slotProps.dragEvents(page)" v-for="(page, index) in sortPages(pages)">
                        <report-page :key="page.id"
                                     :page="page"
                                     :onTitleClick="onTitleClick"
                                     :canDelete="!report.generating"
                                     :onDeleteClick="deletePage">
                        </report-page>
                    </div>
                </draggable>
            </div>

            <!--       <div v-if="ui.reportIsGenerating" class="working add-forbidden"></div>-->
            <div class="add-page" v-show="canAddPage">
                <i class="cwi-add" v-on:click="addPage"></i>
            </div>
        </div>
        <div class="flex-row flex-justify-end action-buttons">
            <button class="bordered border-primary" v-on:click="openPreview()">{{ui.dictionary.presentations.preview}}</button>
            <button class="primary" v-if="hasTemplatesRole" @click="showSaveAsTemplateDialog(report)">{{ui.dictionary.presentations.saveAsTemplate}}</button>
            <button class="secondary" v-on:click="showLinkModal(report)">{{ui.dictionary.presentations.getLink}}</button>
        </div>
    </article>
</template>

<script>
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import DateRangeModel from 'models/DateRangeModel'
    import UserModel from 'models/UserModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import previewPresentation from 'components/previewPresentation.vue'
    import dateField from 'elements/date-field'
    import reportPage from 'components/reportPage.vue'
    import editPresentationModal from 'elements/modals/edit-presentation'
    import editPageModal from 'elements/modals/edit-page'
    import addNewReportTemplateModal from 'elements/modals/add-new-report-template'
    import draggable from 'elements/draggable'
    import reportInfo from 'components/reportInfo.vue'
    import presentationMixin from 'mixins/presentationMixin'
    import reportSharingMixin from 'mixins/reportSharingMixin'
    import permissionsMixin from 'mixins/permissionsMixin'
    import reportHelpers from 'helpers/reportHelpers'
    import reportPageTypes from 'constants/reportPageTypes'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'

    let reportGeneratingInterval = null;

    const findIndexById = (dataArray, id) => {
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].id === id) {
                return i;
            }
        }
    };

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            saving : false,
            showPreview : false,
            reportIsGenerating : false,
            reportIsFinalized : false
        },
        pageInfo: {},
        pages : [],
        currentPage : null,
        refresh: 0,
        date: {
            fromDate: DateRangeModel.getFromDate(),
            from: null,
            fromValid: true,
            toDate: DateRangeModel.getToDate(),
            to: null,
            toValid: true,
            now: new Date()
        },
        draggedPage: null,
        delayedActions: [],
        hasTemplatesRole: UserModel.profile().roles.indexOf('template_role') >= 0,
        company: CompanyModel.getCompany(),
        context: ContextModel.getContext(),
        isNotRelevantDashboard: false
    });

    const methods = {
        init() {
            this.getPages();
            this.date.from = this.report.start_date;
            this.date.to = this.report.end_date;
        },

        onTitleClick(page) {
            if (!page.front_page) {
                if (this.report.finalized) {
                    this.showUnlockDialog(this.report, () => {
                        this.editMetaData(page)
                    })
                } else {
                    this.editMetaData(page);
                }
            } else {
                if (this.report.finalized) {
                    this.showUnlockDialog(this.report, () => {
                        this.showPresentationModal()
                    })
                } else {
                    this.showPresentationModal();
                }
            }
        },

        itemDropped({droppedItem, item }) {
            this.recalculatePageNumbers(item, droppedItem);
        },

        recalculatePageNumbers(pageToReplace, droppedPage) {
            if (!pageToReplace.front_page) {
                const droppedPageIdx = findIndexById(this.pages, droppedPage.id);
                const pageToReplaceIdx = findIndexById(this.pages, pageToReplace.id);
                this.pages.splice(pageToReplaceIdx, 0, this.pages.splice(droppedPageIdx, 1)[0]);
                this.adjustPageNumbers(false);
            }
        },
        savePresentation(date) {

            let editInfo = {
                title: this.report.title,
                name: this.report.name,
                created: this.report.created,
                end_date: date.to,
                start_date: date.from,
                expire_at: this.report.expire_at,
                id: this.report.id,
                language: this.report.language
            };

            this.pages.forEach((item) => {
                if (item.front_page) {
                    this.pageInfo.id = item.id;
                    this.pageInfo.title = editInfo.title;
                    this.pageInfo.start_date = moment(editInfo.start_date).format('YYYY-MM-DD');
                    this.pageInfo.end_date = moment(editInfo.end_date).format('YYYY-MM-DD');
                    this.pageInfo.name = editInfo.name;
                    this.pageInfo.number = item.number;
                    this.pageInfo.front_page = item.front_page;
                    this.updateReport(editInfo);
                    this.updatePage(this.pageInfo);
                }
            });
        },

        updateReport(editInfo) {
            PresentationTemplateCollection.editReport(this.report.id, editInfo)
                .then(() => {});
        },

        updatePage(page) {
            PresentationTemplateCollection.editPage(this.report.id, page, true)
                .then(() => {
                    this.init();
                });
        },

        moveLeft(page) {
            this.currentPage = page;
            page.number += 1;
            this.saveReportPage(page);
        },

        moveRight(page) {
            this.currentPage = page;
            page.number -= 1;
            this.saveReportPage(page);
        },

        saveReportPage(page) {
            this.ui.saving = true;

            return PresentationTemplateCollection.editPage(this.report.id, page)
                .then(function () {
                    this.ui.saving = false;
                    this.$modal.hide(editPageModal);
                    this.currentPage = null;
                    this.adjustPageNumbers();
                    this.refresh++;
                }.bind(this));
        },

        adjustPageNumbers(shouldSort = true) {
            var pageList = shouldSort ? this.sortPages(this.pages) : this.pages;

            pageList.forEach(function (page, index) {
                var shouldBe = index + 1;

                if (page.number !== shouldBe) {
                    page.number = shouldBe;
                    this.saveReportPage(page);
                }
            }.bind(this));

            this.refresh++;
        },

        editMetaData(info) {
            let allPages = this.sortPages(this.pages);
            allPages.forEach((page, index) => {
                let correctPage = index + 1;
                if (page.number !== correctPage) {
                    page.number = correctPage;
                }
            });
            this.currentPage = info;
            this.showPageEditModal(this.currentPage);
        },


        getPages() {
            PresentationTemplateCollection.getPages(this.report.id)
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.pages = this.sortPages(res._embedded.items);
                    }
                }.bind(this));
        },

        createNewPage(params, skipFinalizedCheck = false) {
            const isUploadingFile = params.context === reportPageTypes.FILE_UPLOAD;
            params.number = this.pages.length + 1;
            params.context === 'annual_report' ? params.settings = {value : JSON.stringify(this.annualReportYear)} : '';

            if (JSON.parse(sessionStorage.getItem('dash-section')) === "kpis") {
                params.cashbook = 'both';
                params.benchmark = true;
            }

            PresentationTemplateCollection.addPage({
              id: this.report.id,
              params,
              isUploadingFile
            }).then(function (res) {
                    params.id = isUploadingFile ? res?.body?.presentation_page_id : res.id;
                    this.pages.push(params);
                }.bind(this));
        },

        addPage() {
            if (this.report.finalized) {
                this.showUnlockDialog(this.report, () => {
                    this.onAddPage()
                })
            } else {
                this.onAddPage();
            }
        },

        deletePage(page, skipFinalizedCheck = false) {
            //TODO: Delete later - one of possible variants how to prevent page delete during report generating
            //const { reportIsGenerating } = this.ui;

            // if (reportIsGenerating) {
            //     this.showGeneratingDialog()
            //     return;
            // }

            if(!skipFinalizedCheck && this.report.finalized) {
                this.showUnlockDialog(this.report, () => {this.deletePage(page, true)})
            } else {
                this.pages = this.pages.filter(currentPage => (currentPage.id !== page.id));

                PresentationTemplateCollection.deletePage(this.report.id, page.id)
                    .then(function () {
                        this.refresh++;
                        this.adjustPageNumbers();
                    }.bind(this));
            }
        },

        showGeneratingDialog() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.presentations.reportIsGenerating,
                width: 600,
                buttons: [
                    {
                        title: 'OK',
                        class: 'highlighted-text',
                    },
                ]
            });
        },

        onReportTitleClick(report) {
            if(this.report.finalized) {
                this.showUnlockDialog(report, () => {
                    this.showPresentationModal()
                })
            } else {
                this.showPresentationModal()
            }
        },

        openPreview() {
            this.ui.showPreview = true;
            this.getPages();
            this.$store.dispatch('setClickPreview', true);
        },

        closePreview() {
            if (this.ui.showPreview) {
                this.ui.showPreview = false;
            }
        },

        showPresentationModal() {
            this.$modal.show(editPresentationModal, {savePresentation: this.savePresentation, presentation: this.report, setReportFinalization: this.setReportFinalization}, {height: 'auto'});
        },

        showPageEditModal() {
            this.$modal.show(editPageModal, {
                saveReportPage: this.saveReportPage,
                currentPage: this.currentPage,
                pagesLength: this.pages.length,
                saving: this.ui.saving
            }, {height: 'auto'});
        },

        showUnlockDialog(report, cb = (() => {})) {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.presentations.reportIsFinalized,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.presentations.cancel,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.presentations.unlock,
                        class: 'warning',
                        default: true,
                        handler: () => {
                            this.setReportFinalization(report, false);
                            this.$modal.hide('dialog');
                            cb();
                        }
                    }
                ]
            });
        },

        showSaveAsTemplateDialog(report) {
            this.$modal.show(addNewReportTemplateModal, {
                addReportTemplate: this.saveAsTemplate,
                report
            }, {height: 'auto'});
        },

        saveAsTemplate(report) {
            PresentationTemplateCollection.getPages(this.report.id).then((pagesData) => {

                let pages = pagesData._embedded?.items || [];

                const pagesWithCustomDashboard = reportHelpers.getPagesWithCustomDashboard(pages);

                const filteredDashboards = this.getDashboardsByCompanyId(pagesWithCustomDashboard);

                const filteredPageToSave = this.filterPageToSaveTemplate(pages, filteredDashboards);

                filteredPageToSave.length ? pages = filteredPageToSave : '';

                if (pagesWithCustomDashboard.length && this.isNotRelevantDashboard) {
                    this.showCustomDashboardDialog(filteredDashboards);
                }

                const saveTemplate = () => this.$store.dispatch('addReportTemplate',
                    {
                        templateToAdd: report,
                        pages
                    })

                const potentiallyUnsupportedPages = reportHelpers.findPotentiallyUnsupportedPages(pages);

                if (potentiallyUnsupportedPages.length) {
                    this.showPotentiallyUnsupportedPagesDialog(potentiallyUnsupportedPages);
                }

                saveTemplate().then(()  => {
                    this.$modal.show('dialog', {
                        text: this.ui.dictionary.presentations.savedAsTemplate,
                        width: 600,
                        buttons: [
                            {
                                title: this.ui.dictionary.presentations.ok,
                                class: 'highlighted-text',
                                default: true
                            }
                        ]
                    })
                });
            })
        },

        showCustomDashboardDialog(customDashboards) {
            const customDashboardsNamesList = customDashboards.map(dash => dash.name).join(", ");

            this.$modal.show('dialog', {
                text: `${this.ui.dictionary.presentations.saveSelfDashboard}\n ${customDashboardsNamesList} ${this.ui.dictionary.presentations.saveSelfDashboardInfo}`,
                width: 600,
                buttons: [
                    {
                        title: 'OK',
                        class: 'warning',
                        default: true,
                    }
                ]
            });
        },

        showPotentiallyUnsupportedPagesDialog(unsupportedPages) {
            const unsupportedPagesList = unsupportedPages.map(page => `${page.name}`).concat(', ');

            this.$modal.show('dialog', {
                text: `Following potentially unsupported pages are used in the template:\n ${unsupportedPagesList} so these pages may not be available`,
                width: 600,
                buttons: [
                    {
                        title: 'OK',
                        class: 'warning',
                        default: true,
                    }
                ]
            });
        },

        getDashboardsByCompanyId(pages) {
            return this.dashboards.filter((item) => {
                return pages.some((page) => {
                    return item.id === page.dashboard_id;
                })
            });
        },

        filterPageToSaveTemplate(page, filteredDash) {
            if (filteredDash && page.length) {
                let result = page.filter((item) => {
                    return filteredDash.some((dashb) => {
                        if (this.context) {
                            return (!item.dashboard_id || (item.dashboard_id === dashb.id && dashb.company.id === this.company.id));
                        }
                    })
                });
                this.isNotRelevantDashboard = !!result.length;

                return result;
            }
        }
    };

    const computed = {
        annualReportYear() {
            return this.$store.getters.annualReportsYear;
        },
        isEasyView() {
            return this.$store.getters.easyview;
        },
        finalizeCountDown() {
            return this.$store.getters.finalizeCountDown;
        }
    };

    export default {
        name: 'presentation-editor',
        data,
        methods,
        computed,
        mixins: [presentationMixin, reportSharingMixin, permissionsMixin],
        props : ['report', 'newPageParams', 'dashboards', 'realtimeDashboard', 'onAddPage', 'canAddPage', 'exitReportsEdit'],
        components : {
            'preview-presentation' : previewPresentation,
            'date-field' : dateField,
            'report-page' : reportPage,
            'report-info': reportInfo,
            draggable
        },
        mounted() {
            this.init();
        },
        beforeUpdate() {
            if (!this.ui.showPreview) {
                this.$store.dispatch('setShowPreview', false);
                document.body.style.overflow = '';
            } else {
                this.$store.dispatch('setShowPreview', true);
                document.body.style.overflow = 'hidden';
            }
        },
        beforeDestroy() {
            clearInterval(reportGeneratingInterval);
        },
        watch : {
            'newPageParams' : function (p) {
                this.createNewPage(p);
            }
        }
    }
</script>
