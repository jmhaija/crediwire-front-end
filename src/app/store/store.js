define([
    'models/UserModel',
    'constants/ui/cashbook',
    'constants/ui/intervals',
    'constants/currencies',
    'constants/session',
    'collections/CollectDebtsCollection',
    'collections/InvitationCollection',
    'collections/PresentationTemplateCollection',
    'collections/DashboardCollection',
    'collections/CountryCollection',
    'store/dashboardMutationTypes',
    'store/budgetMutationTypes',
    'store/invoicesMutationTypes',
    'store/notificationsMutationTypes',
    'store/uiMutationTypes',
    'store/presentationMutationTypes',
    'store/connectionsMutationTypes',
    'store/sessionMutationTypes',
    'store/companyMutationTypes',
    'helpers/reportHelpers',
    'services/SortingService'
    ],
    function(UserModel, cashbookStates, intervals, currencies,  sessionConstants, CollectDebtsCollection, InvitationCollection, PresentationTemplateCollection, DashboardCollection, CountryCollection, dashboardMutationTypes, budgetMutationTypes, invoicesMutationTypes, notificationsMutationTypes, uiMutationTypes, presentationMutationTypes, connectionsMutationTypes, sessionMutationTypes, companyMutationTypes, reportHelpers, SortingService) {
    const {
        SET_CASHBOOK_STATE,
        SET_BUDGET_STATE,
        RESTORE_DASHBOARD_SETTINGS,
        SET_AVERAGE_STATE,
        SET_FLOATING_AVERAGE,
        SET_FLOATING_AVERAGE_POINT_SPREAD,
        SET_PREVIOUS_STATE,
        SET_PREVIOUS_TYPE,
        SET_INTERVAL,
        SET_EASYVIEW,
        SET_KPIS,
        SET_DASHBOARD_ID,
        SET_DATE_FROM,
        SET_DATE_TO,
        SET_PERIODS_DATA
    } = dashboardMutationTypes;

    const { SET_UNPAID_INVOICES, TOGGLE_INVOICES, TOGGLE_INVOICE, SET_CASES } = invoicesMutationTypes;

    const { SET_LIKVIDO_NOTIFICATION } = notificationsMutationTypes;

    const { SET_OVERLAY } = uiMutationTypes;

    const { SET_PRESENTATION_EDIT_MODE, SET_PRESENTATION_MODE, SET_PRESENTATION_ID, SET_PRESENTATION_TOKEN, SET_PRESENTATION_PAGE, SET_YEAR_ANNUAL_REPORTS, SET_SHOW_PREVIEW, SET_SETTINGS_VALUE, SET_CLICK_PREVIEW, SET_OPEN_REPORT, SET_REPORT_PRESENTATION, SET_FINALIZE_COUNTDOWN, SET_TEMPLATES, SET_SAVE_REPORT_PAGE } = presentationMutationTypes;

    const { SET_UPDATE_BUDGET, SET_IMPORT_BUDGET, SET_BUDGET_PREVIOUS_YEAR_DATE } = budgetMutationTypes;

    const { SET_KEEP_ALIVE_START_TIME, UPDATE_KEEP_ALIVE_COUNTDOWN } = sessionMutationTypes;

    const { CASHBOOK, CASHBOOK_DISABLED, ONLY_CASHBOOK, ONLY_CASHBOOK_DISABLED } = cashbookStates;

    const { SET_INVITATIONS, SET_LAST_CONNECTION_TYPE, SET_LAST_CONNECTION_VIEW } = connectionsMutationTypes;

    const { KEEP_ALIVE_SHOW_COUNTDOWN_TIME, SESSION_HEARTBEAT_TIMEOUT } = sessionConstants;

    const { SET_COMPANY, SET_REDIRECT_TO_CONNECTIONS, SET_REDIRECT_TO_OVERVIEW, SET_SELECT_COMPANY, SET_ACTIVE_FINANCIAL_REPORT, SET_ACTIVE_BUDGET, SET_FINANCIAL_REPORT_TAB, SET_BUDGET_TAB, SET_INVITATION_COMPANY, SET_WIDGET_PUBLIC_KEY } = companyMutationTypes;

    const SET_COUNTRIES = 'SET_COUNTRIES';

    const checkFAPointsSpreadVal = val => ((val > 50) ? 50 : (val < 1) ? 1 : (isNaN(val)) ? 3 : val);

    let keepAliveInterval = null;
    let heartBeatTimeout = null;

    let finalizeInterval = null;

    return {
       state: {
           dashboard: {
               cashbook: CASHBOOK_DISABLED,
               budget: false,
               average: false,
               floatingAverage: false,
               floatingAveragePointSpread: 3,
               previous: false,
               easyview: false,
               previousType: 'year',
               interval: 'quarter',
               dateFrom: null,
               dateTo: null,
               dataIsLoad: false,
               isKpis: false,
               id: null,
               isDefaultFinReport: false,
               isDefaultBudget: false,
               setFinancialReportTab: true,
               setBudgetTab: true
           },
           dashboardPreview: {
               cashbook: CASHBOOK_DISABLED,
               budget: false,
               average: false,
               floatingAverage: false,
               floatingAveragePointSpread: 3,
               previous: false,
               easyview: false,
               previousType: 'period',
               interval: 'quarter',
               isKpis: false,
               id: null,
           },
           invoices: {
               unpaidInvoices: [],
               cases: []
           },
           notifications: {
               likvido: false
           },
           ui: {
               overlay: false
           },
           isUpdateBudget: false,
           presentation: {
               presentationMode: false,
               presentationEditMode: false,
               presentationId: null,
               presentationToken: null,
               presentationPage: null,
               annualReportsYear: null,
               annualReportsSettings: null,
               showPreview: false,
               clickPreview: false,
               isOpenReport: false,
               reportPresentation: null,
               finalizeCountdown: null,
               savePage: false
           },
           templates: [],
           connections: {
               invitations: [],
               lastConnectionType: '',
               lastConnectionView: ''
           },
           session: {
               keepAliveCountdown: null,
               keepAliveStartTime: null,
           },
           company: {
               company: null,
               redirectToConnections: false,
               redirectToOverview: false,
               selectCompany: false,
               fromInvitationLink: false,
               relevantWidgetPublicKey: null
           },
           budget: {
               isImport: false
           },
           budgetPreviousYear: null,
           countries: []
       },

       mutations: {
           [SET_CASHBOOK_STATE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.cashbook = payload;
               } else {
                   state.dashboard.cashbook = payload;
               }
           },
           [SET_BUDGET_STATE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.budget = payload;
               } else {
                   state.dashboard.budget = payload;
               }
           },
           [SET_AVERAGE_STATE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.average = payload;
               } else {
                   state.dashboard.average = payload;
               }
           },
           [SET_FLOATING_AVERAGE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.floatingAverage = payload;
               } else {
                   state.dashboard.floatingAverage = payload;
               }
           },
           [SET_FLOATING_AVERAGE_POINT_SPREAD]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.floatingAveragePointSpread = parseInt(checkFAPointsSpreadVal(payload));
               } else {
                   state.dashboard.floatingAveragePointSpread = parseInt(checkFAPointsSpreadVal(payload));
               }
           },
           [SET_PREVIOUS_STATE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.previous = payload;
               } else {
                   state.dashboard.previous = payload;
               }
           },
           [SET_PREVIOUS_TYPE]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.previousType = payload;
               } else {
                   state.dashboard.previousType = payload;
               }
           },
           [SET_INTERVAL]: (state, payload) => {
               if (state.presentation.showPreview && payload) {
                   state.dashboardPreview.interval = payload;
               } else if (payload){
                   state.dashboard.interval = payload;
               }
           },
           [RESTORE_DASHBOARD_SETTINGS]: () => {},
           //**
           // Here go invoices mutations
           //*//
           [SET_UNPAID_INVOICES]: (state, payload) => {
               if (payload && payload.length) {
                   state.invoices.unpaidInvoices = payload.map(invoice => {
                       invoice.collectDebt = false;
                       return invoice;
                   });
               }
           },
           [TOGGLE_INVOICES]: (state, {invoices, value}) => {
               const unpaidInvoices = state.invoices.unpaidInvoices;
               invoices.forEach((i) => {
                   unpaidInvoices.find(ui => ui.id === i.id).collectDebt = value;
               });
               state.invoices.unpaidInvoices = [...unpaidInvoices];
           },
           [TOGGLE_INVOICE]: (state, {invoice, value}) => {
               const unpaidInvoices = state.invoices.unpaidInvoices;
               const invoiceToToggle = unpaidInvoices.find(ui => ui.id === invoice.id);

               invoiceToToggle.collectDebt = value;

               state.invoices.unpaidInvoices = [...unpaidInvoices];
           },
           [SET_CASES]: (state, payload) => {
               state.invoices.cases = payload;
           },
           [SET_LIKVIDO_NOTIFICATION]: (state, payload) => {
               state.notifications.likvido = payload;
           },
           [SET_OVERLAY]: (state, payload) => {
               state.ui.overlay = payload;
           },
           [SET_EASYVIEW]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.easyview = payload;
               } else {
                   state.dashboard.easyview = payload;
               }
           },
           [SET_PRESENTATION_EDIT_MODE]: (state, payload) => {
               state.presentation.presentationEditMode = payload;
           },
           [SET_PRESENTATION_MODE]: (state, payload) => {
               state.presentation.presentationMode = payload;
           },
           [SET_PRESENTATION_ID]: (state, payload) => {
               state.presentation.presentationId = payload;
           },
           [SET_PRESENTATION_TOKEN]: (state, payload) => {
               state.presentation.presentationToken = payload;
           },
           [SET_PRESENTATION_PAGE]: (state, payload) => {
               state.presentation.presentationPage = Object.assign({}, payload);
           },
           [SET_YEAR_ANNUAL_REPORTS]: (state, payload) => {
               state.presentation.annualReportsYear = payload;
           },
           [SET_SETTINGS_VALUE]: (state, payload) => {
               state.presentation.annualReportsSettings = payload;
           },
           [SET_SHOW_PREVIEW]: (state, payload) => {
               state.presentation.showPreview = payload;
           },
           [SET_CLICK_PREVIEW]: (state, payload) => {
               state.presentation.clickPreview = payload;
           },
           [SET_OPEN_REPORT]: (state, payload) => {
               state.presentation.isOpenReport = payload;
           },
           [SET_KPIS]: (state, payload) => {
               if (state.presentation.showPreview) {
                   state.dashboardPreview.isKpis = payload;
               } else {
                   state.dashboard.isKpis = payload;
               }
           },
           [SET_DASHBOARD_ID]: (state, payload) => {
               state.dashboard.id = payload;
           },
           [SET_INVITATIONS]: (state, payload) => {
               state.connections.invitations = payload;
           },
           [SET_DATE_FROM] : (state, payload) => {
               state.dashboard.dateFrom = payload;
           },
           [SET_DATE_TO] : (state, payload) => {
               state.dashboard.dateTo = payload;
           },
           [SET_UPDATE_BUDGET]: (state, payload) => {
               state.isUpdateBudget = payload;
           },
           [SET_PERIODS_DATA]: (state, payload) => {
               state.dashboard.dataIsLoad = payload;
           },
           [UPDATE_KEEP_ALIVE_COUNTDOWN]: (state, payload) => {
               state.session.keepAliveCountdown = payload;
           },
           [SET_KEEP_ALIVE_START_TIME]: (state) => {
               state.session.keepAliveStartTime = new Date();
           },
           [SET_COMPANY]: (state, payload) => {
               state.company.company = payload;
           },
           [SET_REDIRECT_TO_CONNECTIONS]: (state, payload) => {
               state.company.redirectToConnections = payload;
           },
           [SET_REDIRECT_TO_OVERVIEW]: (state, payload) => {
               state.company.redirectToOverview = payload;
           },
           [SET_LAST_CONNECTION_TYPE]: (state, payload) => {
               state.connections.lastConnectionType = payload;
           },
           [SET_LAST_CONNECTION_VIEW]: (state, payload) => {
               state.connections.lastConnectionView = payload;
           },
           [SET_REPORT_PRESENTATION]: (state, payload) => {
               state.presentation.reportPresentation = payload;
           },
           [SET_FINALIZE_COUNTDOWN]: (state, payload) => {
               state.presentation.finalizeCountdown = payload;
           },
           [SET_SELECT_COMPANY]: (state, payload) => {
               state.company.selectCompany = payload;
           },
           [SET_ACTIVE_FINANCIAL_REPORT]: (state, payload) => {
               state.dashboard.isDefaultFinReport = payload;
           },
           [SET_ACTIVE_BUDGET]: (state, payload) => {
               state.dashboard.isDefaultBudget = payload;
           },
           [SET_FINANCIAL_REPORT_TAB]: (state, payload) => {
               state.dashboard.setFinancialReportTab = payload;
           },
           [SET_BUDGET_TAB]: (state, payload) => {
               state.dashboard.setBudgetTab = payload;
           },
           [SET_TEMPLATES]: (state, payload = []) => {
               state.templates = [...payload];
           },
           [SET_IMPORT_BUDGET]: (state, payload) => {
               state.budget.isImport = payload;
           },
           [SET_BUDGET_PREVIOUS_YEAR_DATE]: (state, payload) => {
               state.budgetPreviousYear = payload;
           },
           [SET_INVITATION_COMPANY]: (state, payload) => {
               state.company.fromInvitationLink = payload;
           },
           [SET_WIDGET_PUBLIC_KEY]: (state, payload) => {
               state.company.relevantWidgetPublicKey = payload;
           },
           [SET_COUNTRIES]: (state, payload) => {
               state.countries = payload;
           },
           [SET_SAVE_REPORT_PAGE]: (state, payload) => {
               state.presentation.savePage = payload;
           }
       },
       actions: {
           setBudget: ({commit, state}, value) => {
               commit(SET_BUDGET_STATE, value);
           },
           toggleDashboardBudget: ({commit, state}) => {
               if (state.presentation.showPreview) {
                   commit(SET_BUDGET_STATE, !state.dashboardPreview.budget);
               } else {
                   commit(SET_BUDGET_STATE, !state.dashboard.budget);
               }
           },
           setDashboardCashbook: ({commit, state}, value) => {
               commit(SET_CASHBOOK_STATE, value);
           },
           toggleDashboardCashbook: ({commit, state}) => {
               let cashbookStateToSet = null;

               if (state.presentation.showPreview) {
                   switch (state.dashboardPreview.cashbook) {
                       case CASHBOOK:
                           cashbookStateToSet = CASHBOOK_DISABLED;
                           break;
                       case CASHBOOK_DISABLED:
                           cashbookStateToSet = CASHBOOK;
                           break;
                       case ONLY_CASHBOOK:
                           cashbookStateToSet = ONLY_CASHBOOK_DISABLED;
                           break;
                       case ONLY_CASHBOOK_DISABLED:
                           cashbookStateToSet = ONLY_CASHBOOK;
                   }

                   commit(SET_CASHBOOK_STATE, cashbookStateToSet);
               } else {
                   switch (state.dashboard.cashbook) {
                       case CASHBOOK:
                           cashbookStateToSet = CASHBOOK_DISABLED;
                           break;
                       case CASHBOOK_DISABLED:
                           cashbookStateToSet = CASHBOOK;
                           break;
                       case ONLY_CASHBOOK:
                           cashbookStateToSet = ONLY_CASHBOOK_DISABLED;
                           break;
                       case ONLY_CASHBOOK_DISABLED:
                           cashbookStateToSet = ONLY_CASHBOOK;
                   }

                   commit(SET_CASHBOOK_STATE, cashbookStateToSet);
               }

           },
           setEasyView: ({commit, state}, value) => {
               commit(SET_EASYVIEW, value);
           },
           toggleEasyView: ({commit, state}) => {
               if (state.presentation.showPreview) {
                   commit(SET_EASYVIEW, !state.dashboardPreview.easyview);
               } else {
                   commit(SET_EASYVIEW, !state.dashboard.easyview);
               }
           },
           setDashboardAverage: ({commit}, value) => {
               commit(SET_AVERAGE_STATE, value)
           },
           toggleDashboardAverage: ({commit, state}) => {
               if (state.presentation.showPreview) {
                   commit(SET_AVERAGE_STATE, !state.dashboardPreview.average);
               } else {
                   commit(SET_AVERAGE_STATE, !state.dashboard.average);
               }
           },
           setFloatingAverage: ({commit, state}, value) => {
               commit(SET_FLOATING_AVERAGE, value);
           },
           toggleDashboardFloatingAverage: ({commit, state}) => {
               if (state.presentation.showPreview) {
                   commit(SET_FLOATING_AVERAGE, !state.dashboardPreview.floatingAverage);
               } else {
                   commit(SET_FLOATING_AVERAGE, !state.dashboard.floatingAverage);
               }
           },
           setFloatingAveragePointSpread: ({commit, state}, value) => {
               commit(SET_FLOATING_AVERAGE_POINT_SPREAD, value);
           },
           setPreviousState: ({commit, state}, value) => {
               commit(SET_PREVIOUS_STATE, value);
           },
           setPreviousType: ({commit, state}, value) => {
               commit(SET_PREVIOUS_TYPE, value);
           },
           togglePrevious: ({commit, state}) => {
               if (state.presentation.showPreview) {
                   commit(SET_PREVIOUS_STATE, !state.dashboardPreview.previous);
               } else {
                   commit(SET_PREVIOUS_STATE, !state.dashboard.previous);
               }
           },
           setKpis: ({commit, state}, value) => {
               commit(SET_KPIS, value);
           },
           setInterval: ({commit, state}, interval) => {
               commit(SET_INTERVAL, interval);
           },
           //**
           // Here go invoices actions
           //*//
           setUnpaidInvoices: ({commit}, value) => {
               commit(SET_UNPAID_INVOICES, invoices);
           },
           getUnpaidInvoices: ({commit, state}) => {
               CollectDebtsCollection.getUnpaidInvoices().then((res) => {
                   if (response && response.invoices && response.invoices.length) {
                       const invoices = res.invoices.map(invoice => {
                           invoice.collectDebt = false;
                           return invoice;
                       });
                       commit(SET_UNPAID_INVOICES, invoices);
                   }
               })
           },

           getCases: ({commit, state}) => {
               const { SET_CASES } = invoicesMutationTypes;
               CollectDebtsCollection.getCases().then((res) => {
                   if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                       commit(SET_CASES, res._embedded.items);
                   }
               });
           },


           getUnpaidInvoices: ({commit, state}) => {
               CollectDebtsCollection.getUnpaidInvoices().then(response => {
                   if (response && response.invoices && response.invoices.length) {
                       const invoices = response.invoices.map(invoice => {
                           invoice.collectDebt = false;
                           return invoice;
                       });

                       commit(SET_UNPAID_INVOICES, invoices);
                   }
               });
           },

           getInvitations: ({commit, state}, includeAdmin = false) => {
               var ic = new InvitationCollection(includeAdmin);

               return ic.getInvitations(includeAdmin)
                   .then(function(res) {
                       if (res.contents) {
                           commit(SET_INVITATIONS, res.contents);
                       }
                   });
           },
           createInvitation: ({commit, state}, linkOnly = false) => {

           },
           startKeepAliveTimeout({commit, state}) {
              if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
              }

              if (heartBeatTimeout) {
                  clearTimeout(heartBeatTimeout);
              }

              commit(SET_KEEP_ALIVE_START_TIME);

              const commitTimeoutValue = () => {
                  const timeDiff = new Date().getTime() - state.session.keepAliveStartTime.getTime();
                  commit(UPDATE_KEEP_ALIVE_COUNTDOWN, timeDiff);
              };

              const setKeepAliveTimeoutInterval = (cb, interval) => {
                  return setInterval(cb, interval);
              };

               commitTimeoutValue();

                //update interval every minute
              keepAliveInterval = setKeepAliveTimeoutInterval(() => {
                  //when interval is more then 58 mins start to check it every second
                  if (state.session.keepAliveCountdown >= (KEEP_ALIVE_SHOW_COUNTDOWN_TIME - 15000)) {
                      commitTimeoutValue();
                      clearInterval(keepAliveInterval);
                      keepAliveInterval = setKeepAliveTimeoutInterval(commitTimeoutValue, 1000);
                  }
                  commitTimeoutValue();
              }, 1000 * 10);

               heartBeatTimeout = setTimeout(() => {
                UserModel.fromSession().then(() => console.info('session is updated'));
               }, SESSION_HEARTBEAT_TIMEOUT);
           },
           getCompany: ({state}) => state.company.company,

           setCompany: ({commit, state}, company) => {
               commit(SET_COMPANY, company)
           },
           setLastConnectionType: ({commit, state}, { type }) => {
               commit(SET_LAST_CONNECTION_TYPE, type);
           },
           setLastConnectionView: ({commit, state}, { type }) => {
               commit(SET_LAST_CONNECTION_VIEW, type);
           },
           setReportPresentation: ({commit, state}, { report }) => {
               commit(SET_REPORT_PRESENTATION, report);
           },
           setPresentationPage: ({commit}, value) => {
               commit(SET_PRESENTATION_PAGE, value)
           },
           setClickPreview: ({commit}, value) => {
               commit(SET_CLICK_PREVIEW, value)
           },
           setShowPreview: ({commit}, value) => {
               commit(SET_SHOW_PREVIEW, value)
           },
           openReport: ({commit}, value) => {
               commit(SET_OPEN_REPORT, value)
           },
           setAnnualReportSettings: ({commit}, value) => {
               commit(SET_SETTINGS_VALUE, value)
           },
           setPresentationMode: ({commit}, value) => {
               commit(SET_PRESENTATION_MODE, value)
           },
           setPresentationEditMode: ({commit}, value) => {
               commit(SET_PRESENTATION_EDIT_MODE, value)
           },
           setPresentationId: ({commit}, value) => {
               commit(SET_PRESENTATION_ID, value)
           },
           setPresentationToken: ({commit}, value) => {
               commit(SET_PRESENTATION_TOKEN, value)
           },
           setRedirectToConnections: ({commit}, value) => {
               commit(SET_REDIRECT_TO_CONNECTIONS, value)
           },
           setRedirectToOverview: ({commit}, value) => {
               commit(SET_REDIRECT_TO_OVERVIEW, value)
           },
           setBudgetIsUpdating: ({commit}, value) => {
               commit(SET_UPDATE_BUDGET, value)
           },
           setDashboardId: ({commit}, value) => {
               commit(SET_DASHBOARD_ID, value)
           },
           setYearAnnualReports: ({commit}, value) => {
               commit(SET_YEAR_ANNUAL_REPORTS, value)
           },
           setDateFrom: ({commit}, value) => {
               commit(SET_DATE_FROM, value)
           },
           setDateTo: ({commit}, value) => {
               commit(SET_DATE_TO, value)
           },
           setPeriodsData: ({commit}, value) => {
               commit(SET_PERIODS_DATA, value)
           },
           dismissLikvidoNotification: ({commit, state}) => {

               const profile = UserModel.profile();
               profile.settings.sawLikvidoNotification = true;
               UserModel.save();

               commit(SET_LIKVIDO_NOTIFICATION, false);
               commit(SET_OVERLAY, false)
           },
           setLikvidoNotification: ({commit}, value) => {
               commit(SET_LIKVIDO_NOTIFICATION, value)
           },
           setOverlay: ({commit}, value) => {
               commit(SET_OVERLAY, value)
           },
           runFinalizeCountDown: ({commit, state}, value) => {
               if (finalizeInterval) {
                   clearInterval(finalizeInterval);
               }

               commit(SET_FINALIZE_COUNTDOWN, 5);

               finalizeInterval = setInterval(() => {
                   if (state.presentation.finalizeCountdown === 0) {
                       clearInterval(finalizeInterval);
                       commit(SET_FINALIZE_COUNTDOWN, null);
                   } else {
                       commit(SET_FINALIZE_COUNTDOWN, state.presentation.finalizeCountdown - 1);
                   }
               }, 1000)
           },
           breakFinalizeCountDown: ({commit}) => {
               if (finalizeInterval) {
                   clearInterval(finalizeInterval);
               }

               commit(SET_FINALIZE_COUNTDOWN, null);
           },
           finishFinalizeCountDown: ({commit}) => {
               if (finalizeInterval) {
                   clearInterval(finalizeInterval);
               }

               commit(SET_FINALIZE_COUNTDOWN, 0);

               setTimeout(() => {
                   commit(SET_FINALIZE_COUNTDOWN, null);
               }, 1000);

           },
           selectCompany: ({commit}, value) => {
               commit(SET_SELECT_COMPANY, value);
           },
           setActiveFinReport: ({commit}, value) => {
               commit(SET_ACTIVE_FINANCIAL_REPORT, value);
           },
           setActiveBudget: ({commit}, value) => {
               commit(SET_ACTIVE_BUDGET, value);
           },
           setFinReportActiveTab: ({commit}, value) => {
               commit(SET_FINANCIAL_REPORT_TAB, value);
           },
           setBudgetActiveTab: ({commit}, value) => {
               commit(SET_BUDGET_TAB, value);
           },
           getReportTemplates: ({commit}) => {
               PresentationTemplateCollection.getTemplateList().then( templates => {
                   commit(SET_TEMPLATES, templates);
               });
           },
           deleteReportTemplate: ({commit, state}, idToDelete) => {
               const {templates} = state;

               const filteredTemplates = templates.filter(template => template.id !== idToDelete);
               commit(SET_TEMPLATES, filteredTemplates);

               //TODO: Add delete Error handling
               PresentationTemplateCollection.deleteTemplate(idToDelete).then(() => {});
           },
           addReportTemplate: ({commit, state}, {templateToAdd, pages = []}) => {
               const {templates} = state;

               let pagesToSave = [];

               DashboardCollection().getDashboards().then(dashboardsData => {
                   pagesToSave = reportHelpers.checkTemplatePagesRestrictions({
                       pages,
                       dashboards: dashboardsData.contents
                   });

                   PresentationTemplateCollection.createTemplate(templateToAdd, pagesToSave)
                     .then(createdTemplate => {
                         commit(SET_TEMPLATES, templates.concat(createdTemplate));
                     });
               });

           },

           fetchCountries: ({commit, state}, value) => {
               if (!state.countries.length) {
                   CountryCollection.fetchCountries().then(res => {
                       if (res?._embedded?.items.length > 0) {
                           commit(SET_COUNTRIES, res._embedded.items);
                       }
                   })
               }
           },

           importBudget: ({commit}, value) => {
               commit(SET_IMPORT_BUDGET, value);
           },

           setPreviousYearBudgetDate: ({commit}, value) => {
               commit(SET_BUDGET_PREVIOUS_YEAR_DATE, value);
           },

           setCompanyFromInvitationLink: ({commit}, value) => {
               commit(SET_INVITATION_COMPANY, value);
           },

           setWidgetPublicKey: ({commit}, value) => {
               commit(SET_WIDGET_PUBLIC_KEY, value);
           },

           saveReportPage: ({commit}, value) => {
               commit(SET_SAVE_REPORT_PAGE, value);
           }
       },
       getters: {
            getUnpaidInvoicesOrganizedByCompany: state => recipients => {
               var companies = {};
               state.invoices.unpaidInvoices.forEach( invoice => {
                   recipients.forEach( recip => {
                       if (recip.reference === invoice.contact_reference) {
                           if (!companies[recip.display_name]) {
                               companies[recip.display_name] = { open : false, invoices : [], total : 0, hasDKK : false, selectAll : false };
                           }

                           companies[recip.display_name].invoices.push(invoice);

                           if (invoice.currency === currencies.DKK) {
                               companies[recip.display_name].total += Number(invoice.remainder);
                               companies[recip.display_name].hasDKK = true;
                           }

                           const company = companies[recip.display_name];
                           const companyInvoices =  company.invoices;
                           const allInvoicesToBeCollected = companyInvoices.filter((invoice) => invoice.collectDebt === true).length === companyInvoices.length;

                           if (allInvoicesToBeCollected) {
                               company.selectAll = true;
                           }
                       }
                   });
                });

                return companies;
            },
            dashboard: state => state.dashboard,
            easyview: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.easyview;
                } else {
                    return state.dashboard.easyview;
                }
            },

            budget: state =>  {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.budget;
                } else {
                    return state.dashboard.budget;
                }
            },

            cashbook: state =>  {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.cashbook;
                } else {
                    return state.dashboard.cashbook;
                }
            },
            average: state =>  {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.average;
                } else {
                    return state.dashboard.average;
                }
            },
            previousType: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.previousType;
                } else {
                    return state.dashboard.previousType;
                }
            },
            previous: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.previous;
                } else {
                    return state.dashboard.previous;
                }
            },
            interval: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.interval;
                } else {
                    return state.dashboard.interval;
                }
            },
            floatingAverage: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.floatingAverage;
                } else {
                    return state.dashboard.floatingAverage;
                }
            },
            floatingAveragePointSpread: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.floatingAveragePointSpread;
                } else {
                    return state.dashboard.floatingAveragePointSpread;
                }
            },
            isKpis: state => {
                if (state.presentation.showPreview) {
                    return state.dashboardPreview.isKpis;
                } else {
                    return state.dashboard.isKpis;
                }
            },
            dateFrom: state => state.dashboard.dateFrom,
            dateTo: state => state.dashboard.dateTo,
            annualReportsYear: state => state.presentation.annualReportsYear,
            annualReportsSettings: state => state.presentation.annualReportsSettings,
            showPreview: state => state.presentation.showPreview,
            clickPreview: state => state.presentation.clickPreview,
            isOpenReport: state => state.presentation.isOpenReport,
            getNumberOfDebtsToCollect: state => state.invoices.unpaidInvoices.filter((invoice) => invoice.collectDebt).length,
            caseNumbers: state => state.invoices.cases.map(invoice => invoice.invoice_reference),
            getInvoicesWithCases: (state, getters) => invoices => {
                const caseNumbers = getters.caseNumbers;

                return invoices.filter((invoice) => {
                    return caseNumbers.indexOf(invoice.invoice_reference) >= 0;
                });
            },
            getInvoicesWithoutCases: (state, getters) => invoices => {
                const caseNumbers = getters.caseNumbers;

                return invoices.filter((invoice) => {
                    return caseNumbers.indexOf(invoice.invoice_reference) < 0;
                });
            },
            getInvitationsVatList: (state) => {
                return state.connections.invitations.map(invitation => invitation.vat);
            },
            getDisabledIntervals: (state) => {
                return state.company.company.settings.disabled_intervals || [];
            },
            reportPresentation: state => state.presentation.reportPresentation,
            lastConnectionType: state => state.connections.lastConnectionType,
            lastConnectionView: state => state.connections.lastConnectionView,
            presentationId: state => state.presentation.presentationId,
            presentationToken: state => state.presentation.presentationToken,
            presentationPage: state => state.presentation.presentationPage,
            presentationEditMode: state => state.presentation.presentationEditMode,
            presentationMode: state => state.presentation.presentationMode,
            likvidoNotification: state => state.notifications.likvido,
            redirectToConnections: state => state.company.redirectToConnections,
            redirectToOverview: state => state.company.redirectToOverview,
            isUpdateBudget: state => state.isUpdateBudget,
            showOverlay: state => state.ui.overlay,
            finReportIsLoaded: state => state.dashboard.dataIsLoad,
            keepAliveCountdown: state => state.session.keepAliveCountdown,
            finalizeCountDown: state => state.presentation.finalizeCountdown,
            selectCompany: state => state.company.selectCompany,
            isActiveDefaultFinReport: state => state.dashboard.isDefaultFinReport,
            isActiveDefaultBudget: state => state.dashboard.isDefaultBudget,
            setFinancialReport: state => state.dashboard.setFinancialReportTab,
            setBudgetTab: state => state.dashboard.setBudgetTab,
            templates: state => state.templates,
            sortedTemplates: state => (sortingConfig) => {
               const {selectedOption: selectedSortOption, selectedSortDirection} = sortingConfig;
               return SortingService.sortingMethods[selectedSortOption.id](state.templates, selectedSortDirection);
            },
           isImportBudget: state => state.budget.isImport,
           budgetPreviousYear: state => state.budgetPreviousYear,
           isInvitationLinkCompany: state => state.company.fromInvitationLink,
           getWidgetPublicKey: state => state.company.relevantWidgetPublicKey,
           countries: state => state.countries,
           countryReferenceByID: (state, getters) => id => getters.countries.find( country => country.id === id ),
           isSavePresentationPage: state => state.presentation.savePage
        }
   };
});
