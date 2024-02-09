define([

    'models/CompanyModel',
    'models/ContextModel',
    'services/API'

], function (CompanyModel, ContextModel, API) {
    let budgetFile = sessionStorage.getItem('budget-file') ? JSON.parse(sessionStorage.getItem('budget-file')) : null

    let constructUrl = (contextID) => {
        const companyID = CompanyModel.getCompany().id;
        if(contextID) {
            return `/beta/company/${companyID}/connection/see/${contextID}/budget-loaded-file`
        } else {
            return `/beta/company/${companyID}/erp/budget-current-version`
        }
    }

    return {
        getBudgetFile: function () {
            return budgetFile
        },

        setBudgetFile: function (bf) {
            budgetFile = bf
            sessionStorage.setItem('budget-file', JSON.stringify(bf))
        },

        forgetBudgetFile: function () {
            budgetFile = null
            sessionStorage.removeItem('budget-file')
        },

        loadBudgetFile: function (contextID) {
            return API.retrieve(constructUrl(contextID))
                .then(function (resp) {
                    return resp.json()
                }, function (error) {
                    return error
                })
        },

        changeBudgetFile: function (id, contextID) {
            return API.create(constructUrl(contextID), {
                budget_file: id
            })
                .then(function (resp) {
                    return resp.json()
                }, function (error) {
                    return error
                })
        },

        deleteBudgetFile: function (contextID) {
            return API.delete(constructUrl(contextID))
                .then(function (resp) {
                    return true
                }, function (error) {
                    return error
                })
        }
    }
})
