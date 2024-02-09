define([

  'services/API',
  'models/CompanyModel',
  'models/ContextModel'

], (API, CompanyModel, ContextModel) => {
  return {
    getEntryDepartments() {
      let url = `/beta/company/${CompanyModel.getCompany().id}/entry-department`

      if (ContextModel.getContext()) {
        url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}/entry-department`
      }

      return API.retrieve(url)
        .then(function(listResp) {
          return listResp.json()
        }, function(err) {
          return err
        });
    }
  }
})
