define([
  'constants/reportPageTypes',
  'models/UserModel',
  'models/ErpModel',
  'models/ContextModel',
  'models/CompanyModel',
  'moment'
], function(reportPageTypes, UserModel, ErpModel, ContextModel, CompanyModel, moment){

  const getFrontPageName = (pages, report) =>
    pages.forEach(page => {
      if (page.front_page) {
        page.name = report.name
      }
    });

  const checkTemplatePagesRestrictions = ({pages, dashboards}) => {
    const restrictedPages = [...pages];
    for (let i = 0; i < restrictedPages.length; i++) {
      const page = restrictedPages[i];

      if (page.context === 'invoices' && !invoicesSupported()) {
        restrictedPages.splice(i, 1);
      }

      if (page.context === reportPageTypes.FINANCIAL_REPORT && !isFinancialReportAvailable()) {
        restrictedPages.splice(i, 1);
      }

      if (page.dashboard_id) {
        const companyId = CompanyModel.getCompany().id;
        const dashboardData = dashboards.find(({id}) => id === page.dashboard_id);

        if (dashboardData?.company?.id !== companyId) {
          restrictedPages.splice(i, 1);
        }

      }

    }

    return restrictedPages;
  };

  const containsCustomDashboard = pages => {
    return pages.find(page => page.dashboard_id)
  };

  const getPagesWithCustomDashboard = pages => {
    return pages.filter(page => page.dashboard_id)
  };

  const findPotentiallyUnsupportedPages = pages => {
      return pages.filter(page => page.context === 'invoices' && !invoicesSupported());
  };


  const isFinancialReportAvailable = () => {
    //TODO: It's the same code as in permissions mixin
    //Need to move to the separate shared helper
    //And later to the vuex getter
    const permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
    const hasFullPermissions = permissions.owner || permissions.permissionType === 'full';
    const hasExtendedPermissions = permissions.permissionType === 'extended';

    return hasFullPermissions
      || hasExtendedPermissions
      || permissions.shareAllDashboards
      || permissions.allowExternalDashboard
  }

  const invoicesSupported = () => {
    const erp = ErpModel.getErp();
    if (erp?.invoiceEnabled) {
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
  };

  const updateStartEndDates = ({start_date, end_date, page}) => {
    if (page.start_date && page.end_date) {
        return Object.assign({}, page, {
          start_date: moment(start_date).format('YYYY-MM-DD'),
          end_date: moment(end_date).format('YYYY-MM-DD')
        })
    }

    return page;
  }

  const getInvoicesPresentationPageParams = page => {
    const { start_date, end_date, name, front_page, number, title, context, settings, sort, invoice_contact_reference } = page;

    return  {
      name,
      end_date:  moment(end_date).format('YYYY-MM-DD'),
      front_page,
      number,
      start_date: moment(start_date).format('YYYY-MM-DD'),
      title,
      sort,
      context,
      invoice_contact_reference,
      settings
    };
  };

  const getAnnualReportPageParams = page => {

    return {
      name: page.name,
      front_page: false,
      number: page.number,
      title: page.title,
      context: page.context,
      dashboard: page.dashboard,
      pseudo_dashboard: page.pseudo_dashboard,
      kpi_drill_down : null,
    };
  };

  const getPresentationPageParams = page => {
    return {
      name : page.name,
      aggregations: page.aggregations,
      balance: page.balance,
      benchmark: page.benchmark,
      cashbook : page.cashbook,
      budget: page.budget,
      budget_loaded_file: page.budget_loaded_file,
      compare: page.compare,
      description: page.description,
      end_date: moment(page.end_date).format('YYYY-MM-DD'),
      front_page: page.front_page,
      intervals: page.intervals,
      dashboard_id: page.dashboard_id,
      logo: false,
      number: page.number,
      previous: page.previous,
      pseudo_dashboard: page.pseudo_dashboard,
      dashboard : page.dashboard || page.dashboard_id,
      reclassified: page.reclassified,
      start_date: moment(page.start_date).format('YYYY-MM-DD'),
      title: '',
      settings : page.settings,
      kpi_drill_down : page.kpi_drill_down,
      spread: page.spread
    };
  };

  const getFrontPageParams = (page, report) => {
    return {
      name: report.name,
      front_page: true,
      title: '',
      number: page.number,
      start_date: moment(page.start_date).format('YYYY-MM-DD'),
      end_date: moment(page.end_date).format('YYYY-MM-DD')
    }
  }

  const getFinReportPageParams = page => {
    return {
      name: page.name,
      start_date:  moment(page.start_date).format('YYYY-MM-DD'),
      end_date: moment(page.end_date).format('YYYY-MM-DD'),
      range_select_from_date: moment(page.start_date).format('YYYY-MM-DD'),
      range_select_to_date : moment(page.end_date).format('YYYY-MM-DD'),
      financial_report_source : page.financial_report_source,
      financial_report_grouping : page.financial_report_grouping,
      intervals : page.intervals,
      settings: page.settings,
      cashbook: page.cashbook,
      context: page.context,
      number: page.number,
      front_page: false,
      kpi_drill_down: null,
      dashboard: null,
      pseudo_dashboard: null
    }
  };

  const getPalBalParams = page => {
    return {
      ...getPresentationPageParams(page),
      settings: {
        balanceRowsToShow: null
      }
    }
  };

  const getReportPageParams = (page, report) => {
    if (page.front_page) {
      return getFrontPageParams(page, report);
    }

    if (page.pseudo_dashboard === '_invoices' || page.context === 'invoice') {
      return getInvoicesPresentationPageParams(page);
    } else if (page.pseudo_dashboard === '_palbal') {
      return getPalBalParams(page);
    } else if (page.context === reportPageTypes.ANNUAL_REPORT) {
      return getAnnualReportPageParams(page);
    } else if (page.context === reportPageTypes.FINANCIAL_REPORT) {
      return getFinReportPageParams(page);
    } else {
      return getPresentationPageParams(page);
    }
  }

  return {getReportPageParams, updateStartEndDates, isFinancialReportAvailable, invoicesSupported, checkTemplatePagesRestrictions, containsCustomDashboard, getPagesWithCustomDashboard, findPotentiallyUnsupportedPages, getFrontPageName};
});
