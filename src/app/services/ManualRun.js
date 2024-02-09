define([
    
    'Vue',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(Vue, API, CompanyModel, ContextModel) {
    var jobs = null;

    return {
        getJobs : function () {
          return jobs;
        },
        
        setJobs : function (j) {
          jobs = j;
        },

        resetJobs : function () {
          jobs = null;
        },

        fetchJobs : function () {
          let companyID = CompanyModel.getCompany().id;
          let url = '/beta/company/' + companyID + '/manual-run?limit=company_user&sort=-created&page_size=1';

          return API.retrieve(url)
            .then(function(res) {
              return res.json();
            }, function(error) {
              return error;
            });
        },

        createJob : function () {
          let companyID = CompanyModel.getCompany().id;
          let url = '/beta/company/' + companyID + '/manual-run';
          let connectionID = ContextModel.getContext().id;

          return API.create(url, {
            "company_connection": connectionID
          })
            .then(function(res) {
              return res.json();
            }, function(error) {
              return error;
            });
        }
    };
});
