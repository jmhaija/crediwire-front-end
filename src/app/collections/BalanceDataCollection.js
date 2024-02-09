define([

    'q',
    'moment',
    'models/DateRangeModel',
    'models/CompanyModel',
    'models/ContextModel',
    'models/BudgetFileModel',
    'services/API',
    'models/EntryDepartmentModel'

], function(q, moment, DateRangeModel, CompanyModel, ContextModel, BudgetFileModel, API, EntryDepartmentModel) {
    const subtractYear = ({date, numberOfYears}) => moment(date).subtract(numberOfYears, 'year');
    const formatMomentDate = ({date, format}) => moment(date).format(format);


    return function() {
        var requestData = function(url, p) {
            url = url + '&page=' + p;

            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        };

        var combinePromises = function(promises, interval) {
            var response = promises.shift();

            return q.allSettled(promises)
                .then(function(responses) {
                    responses.forEach(function(additionalResp, responseKey) {
                        response[interval] = response[interval].concat(additionalResp.value[interval]);
                    });

                    return response;
                });
        };


        var combineAggregatePromises = function (promises) {
            var response = promises.shift();

            return q.allSettled(promises)
                .then(function(responses) {
                    responses.forEach(function(additionalResp, responseKey) {
                        response._embedded.items = response._embedded.items.concat(additionalResp.value._embedded.items);
                    });

                    return response;
                });
        };


        var fetchFinData = function(date_from, date_to, granularity, comparison, balance, cashbook, isReclassified, reportSheetType) {
            var fromDate = date_from || DateRangeModel.getFromStringPadded();
            var toDate = date_to || DateRangeModel.getToStringPadded();
            var dataSize = 100;

            //Build URL
            var url = `/beta/company/${CompanyModel.getCompany().id}`

            if (ContextModel.getContext()) {
                url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}`
            }

            url = `${url}/data-export/${(isReclassified ? 'reclassified' : 'bookkeeping')}/category?date_from=${fromDate}&date_to=${toDate}&page_size=${dataSize}&granularity=${granularity}&comparison=${comparison}&balance=${balance}&include_journal=${cashbook}`

            if (reportSheetType === 'vf') {
                url = `${url}&report_sheet=1`
            } else if (reportSheetType === 'erst') {
                url = `${url}&erst_report_sheet=1`
            } else if (reportSheetType === 'ef') {
                url = `${url}&sole_trader_erst_report_sheet=1`
            } else if (reportSheetType === 'pf') {
                url = `${url}&paid_erst_report_sheet=true`
            }

            if (EntryDepartmentModel.getEntryDepartment()) {
                url = url + '&department_id=' + EntryDepartmentModel.getEntryDepartment().id
            }

            return API.retrieve(url, true)
                .then(function(data) {
                    if (!data.body || data.status == 404) {
                        return false;
                    } else {
                        return data.body;
                    }
                }, function(err) {
                    return err;
                });
        };


        var fetchPreviousData = function(interval, cashbook, balance, compare, excelFormat, simple, from_date, to_date, budgetType) {
            const sendFromDate =
                formatMomentDate({
                    date: subtractYear({
                        date: from_date || moment(DateRangeModel.getFromString(), 'YYYY-MM-DD'),
                        numberOfYears: 1
                    }),
                    format: 'YYYY-MM-DD'
              });

            const sendToDate =
                formatMomentDate({
                    date: subtractYear({
                        date: to_date || moment(DateRangeModel.getToString(), 'YYYY-MM-DD'),
                        numberOfYears: 1
                  }),
                  format: 'YYYY-MM-DD'
              });

            return fetchData(interval, cashbook, balance, compare, excelFormat, simple, sendFromDate, sendToDate, budgetType);
        };

        const getBudgetCategoriesData = (date_from = DateRangeModel.getFromStringPadded(), date_to = DateRangeModel.getToStringPadded(), interval = 'month') => {
            //Build URL
            let url = `/v1/company/${CompanyModel.getCompany().id}/data/budget/category/${interval}?date_from=${date_from}&date_to=${date_to}`;

            if (ContextModel.getContext()) {
              url = `/v1/company/${CompanyModel.getCompany().id}/connection-see/${ContextModel.getContext().id}/data/budget/category/${interval}?date_from=${date_from}&date_to=${date_to}`
            }

            var promises = [];
            return requestData(url, 1)
              .then(function(data) {
                  if (data.errors) {
                      return false;
                  }

                  promises.push(data);

                  if (data.page && data.page > 1) {
                      for (var p = 2; p <= data.page; p++) {
                          var nextPromise = requestData(url, p);
                          promises.push(nextPromise);
                      }
                  }

                  return combinePromises(promises, interval);
              });
        };

        var fetchData = function(interval, cashbook, balance, compare, excelFormat, simple, from_date, to_date, budgetType) {
            const fromDate = from_date || DateRangeModel.getFromString();
            const toDate = to_date || DateRangeModel.getToString();
            const dataSize = 100;

            //Build URL
            let url = `/company/${CompanyModel.getCompany().id}`;

            if (ContextModel.getContext()) {
                url = `/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}`;
            }


            if (simple) {
                url = `/v2${url}/erp/budget-data`;
                url = `${url}?start_date=${fromDate}&end_date=${toDate}&page_size=${dataSize}&intervals=${interval}`;
            } else {
                url = url + '/data';

                //Export option
                if (excelFormat) {
                    url = url + '/export/excel';
                }

                url =  `${url}?startDate=${fromDate}&endDate=${toDate}&size=${dataSize}&compare=${compare}&balance=${balance}&intervals=${interval}&cashbook=${cashbook}`;
            }

            if (EntryDepartmentModel.getEntryDepartment()) {
                url = url + '&departmentId=' + EntryDepartmentModel.getEntryDepartment().id
            }

            if (BudgetFileModel.getBudgetFile() && simple && budgetType && budgetType == 'file') {
                url = url + '&budget_loaded_file=true';
            } else if (BudgetFileModel.getBudgetFile() && budgetType && budgetType == 'file') {
                url = url + '&budgetLoadedFile=true';
            }


            if (excelFormat) {
                return API.retrieve(url, excelFormat)
                    .then(function(data) {
                        if (!data.body || data.status == 404) {
                            return false;
                        } else {
                            return data.body;
                        }
                    }, function(err) {
                        return err;
                    });
            }

            var promises = [];
            return requestData(url, 1)
                .then(function(data) {
                    if (data.errors) {
                        return false;
                    }

                    promises.push(data);

                    if (data.page && data.page > 1) {
                        for (var p = 2; p <= data.page; p++) {
                            var nextPromise = requestData(url, p);
                            promises.push(nextPromise);
                        }
                    }

                    return combinePromises(promises, interval);
                });
        };

        const getCategories = (type, reclassified, presetFromDate = null, presetToDate = null, isSelectedCompany) => {
            const fromDate = presetFromDate || DateRangeModel.getFromStringPadded();
            const toDate = presetToDate || DateRangeModel.getToStringPadded();
            const dataSize = 1000;

            let url = `/v1/company/${CompanyModel.getCompany().id}/data/bookkeeping/category/${type}`;
            if (reclassified) {
                url = `/v1/company/${CompanyModel.getCompany().id}/data/reclassified/category/${type}`;
            }

            if (ContextModel.getContext()) {
                url = `/v1/company/${CompanyModel.getCompany().id}/connection-see/${ContextModel.getContext().id}/data/bookkeeping/category/${type}`;

                if (reclassified) {
                    url = `/v1/company/${CompanyModel.getCompany().id}/connection-see/${ContextModel.getContext().id}/data/reclassified/category/${type}`;
                }
            }

            url = `${url}?date_from=${fromDate}&date_to=${toDate}`;

            if (EntryDepartmentModel.getEntryDepartment() && !isSelectedCompany) {
                url = `${url}&department_id=${EntryDepartmentModel.getEntryDepartment().id}`
            } else if (EntryDepartmentModel.getEntryDepartment() && isSelectedCompany) {
                url = `${url}&department_id=null`
            }

            var promises = [];
            return requestData(url, 1)
                .then(function(data) {
                    if (data.errors) {
                        return false;
                    }

                    promises.push(data);
                    if (data.page_count && data.page_count > 1) {
                        for (var p = 2; p <= data.page_count; p++) {
                            var nextPromise = requestData(url, p);
                            promises.push(nextPromise);
                        }
                    }

                    return combineAggregatePromises(promises);
                });
        };

        return {
            getBudgetCategoriesData,
            getData : function(interval, cashbook, balance, compare, simple, from_date, to_date, budgetType) {
                return fetchData(interval, cashbook, balance, compare, false, simple, from_date, to_date, budgetType)
                    .then(function(data) {
                        return data;
                    });
            },
            getPreviousData : function (interval, cashbook, balance, compare, simple, from_date, to_date, budgetType) {
                return fetchPreviousData(interval, cashbook, balance, compare, false, simple, from_date, to_date, budgetType)
                    .then(function(data) {
                        return data;
                    });
            },
            getExcelData : function(interval, cashbook, balance, compare, simple, from_date, to_date) {
                return fetchData(interval, cashbook, balance, compare, true, simple, from_date, to_date)
                    .then(function(data) {
                        return data;
                    });
            },

            getFinExcelData : function(date_from, date_to, granularity, comparison, balance, cashbook, isReclassified, reportSheetType) {
                return fetchFinData(date_from, date_to, granularity, comparison, balance, cashbook, isReclassified, reportSheetType)
                    .then(function(data) {
                        return data;
                    });
            },

            getCategories,

            getCategoriesPreviousYearData(type, reclassified, presetFromDate = null, presetToDate = null) {
                const fromDate =
                    formatMomentDate({
                        date: subtractYear({
                            date:  presetFromDate || moment(DateRangeModel.getFromString(), 'YYYY-MM-DD'),
                            numberOfYears: 1
                        }),
                        format: 'YYYY-MM-DD'
                    });

                const toDate =
                    formatMomentDate({
                        date: subtractYear({
                            date: presetToDate || moment(DateRangeModel.getToString(), 'YYYY-MM-DD'),
                            numberOfYears: 1
                        }),
                        format: 'YYYY-MM-DD'
                    });

                return getCategories(type, reclassified, fromDate, toDate);
            },

            getAggregateCategories : function (from, to, source) {
                var fromDate = from || DateRangeModel.getFromStringPadded();
                var toDate = to || DateRangeModel.getToStringPadded();
                var dataSize = 100;

                let url = `/v1/company/${CompanyModel.getCompany().id}/data/${source}/category/range-selection/`;

                if (ContextModel.getContext()) {
                    url = `/v1/company/${CompanyModel.getCompany().id}/connection-see/${ContextModel.getContext().id}/data/${source}/category/range-selection/`;
                }

                url = url + fromDate + '/' + toDate + '?page_size=' + dataSize;

                var promises = [];
                return requestData(url, 1)
                .then(function(data) {
                    if (data.errors) {
                        return false;
                    }

                    promises.push(data);

                    if (data.page_count && data.page_count > 1) {
                        for (var p = 2; p <= data.page_count; p++) {
                            var nextPromise = requestData(url, p);
                            promises.push(nextPromise);
                        }
                    }

                    return combineAggregatePromises(promises);
                });
            }
        };
    };
});
