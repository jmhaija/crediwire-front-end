define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel',
    'models/EntryDepartmentModel'

], function(API, CompanyModel, ContextModel, DateRangeModel, EntryDepartmentModel) {
    return {
        getLedgerEntries : function(account, sort, from, to, min, max, page, excel) {
            var fromDate = from || DateRangeModel.getFromString();
            var toDate = to || DateRangeModel.getToString();
            var pageSize = 1000;
            
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/ledger-entry';
            
            if (ContextModel.getContext()) {
                url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id + '/ledger-entry';
            }
            
            if (!excel) {
                url = url + '?page_size=' + pageSize + '&page=' + page + '&';
            } else {
                url = url + '-export?';
            }
            
            
            if (sort) {
                if (sort.order == 'desc') {
                    url = url + 'sort=-' + sort.param;
                } else {
                    url = url + 'sort=' + sort.param;
                }
            } else {
                url = url + 'sort=date';
            }
            
            
            
            if (fromDate) {
                url = url + '&date_from=' + fromDate;
            }
            
            if (toDate) {
                url = url + '&date_to=' + toDate;
            }
            
            if (min || max) {
                url = url + '&amount=' + (min ? min : '') + ',' + (max ? max : '');
            }
            
            if (EntryDepartmentModel.getEntryDepartment()) {
                url = url + '&department_id=' + EntryDepartmentModel.getEntryDepartment().id
            }
            
            url = url + '&account=' + account;
            
            if (excel) {
                return API.retrieve(url, true)
                    .then(function(data) {
                        if (!data.body || (data.status != 200 && data.status != 201) ) {
                            return false;
                        } else {
                            return data.body;
                        }
                    }, function(err) {
                        return err;
                    });
            }
            
            return API.retrieve(url)
                .then(function(listResp) {
                    return listResp.json();
                }, function(err) {
                    return err;
                });
        },
        
        getExcelData : function (account, sort, from, to, min, max) {
            return this.getLedgerEntries(account, sort, from, to, min, max, false, true)
                .then(function (res) {
                    return res;
                });
        }
    };
});
