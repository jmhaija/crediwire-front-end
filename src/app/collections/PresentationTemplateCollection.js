define([

    'Vue',
    'moment',
    'services/API',
    'services/Config',
    'models/CompanyModel',
    'services/PersistentSettings',
    'store/dashboardMutationTypes',
    'models/ContextModel',
    'q',
    'helpers/reportHelpers',
    'constants/reportPageTypes',
    'collections/DashboardCollection',
    'models/XSRFModel'

], function(Vue, moment, API, Config, CompanyModel, PersistentSettings, dashboardMutationTypes, ContextModel, q, reportHelpers, reportPageTypes, DashboardCollection, XSRFModel) {

    const getItems = response => response.body?._embedded.items || response._embedded.items;

    const withPagination = req => {
       return () => new Promise((resolve, reject) => {
           req(1).then((response) => {
               const body = response.body? response.body : response;
               const result = [];
               result.push(...body._embedded.items);
               if (body.page_count > 1) {

                   const numberOfPages = Math.ceil(body.total_items / body.page_size);
                   const queue = [];

                   for (let i = 2; i <= numberOfPages; i++) {
                       queue.push(req(i))
                   }

                   Promise.all(queue).then((resItems) => {
                       resItems.forEach(resItem => {
                           result.push(...getItems(resItem))
                       })
                       resolve(result);
                   })
               } else {
                   resolve(result);
               }
           }, err => reject(err))
       })
    };

    const getPages = (id, fromTemplate = false) => {
        const companyID = CompanyModel.getCompany().id;
        const templatesPath = fromTemplate ? 'template/' : '';

        let url = `/beta/company/${companyID}/presentation/${templatesPath}${id}/page`;

        if (ContextModel.getContext() && !fromTemplate) {
            url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${templatesPath}${id}/page`;
        }

        return API.retrieve(url)
          .then(function(resp) {
              return resp.json();
          }, function(error) {
              return error;
          });
    };

    const addTemplate = ({name, title, start_date, end_date, language}) => {
        const companyID = CompanyModel.getCompany().id;
        let url = `/beta/company/${companyID}/presentation/template`;

        return API.create(url, {
            name,
            title,
            start_date: moment(start_date).format('YYYY-MM-DD'),
            end_date: moment(end_date).format('YYYY-MM-DD'),
            language
        })
          .then(function(resp) {
              return resp.json();
          }, function(error) {
              return error;
          });
    }

    const uploadFile = ({url, params}) => {
        try {
            let formData = new FormData();

            formData.append('presentation_file', params.presentation_file.fileObj, params.presentation_file.name);
            formData.append('name', params.name);
            formData.append('number', params.number);

            return Vue.http.post(Config.get('apiUrl') + url, formData, {
                headers : {
                    'X-Xsrf-Token' : XSRFModel.get(),
                    'X-Persist' : 'false'
                },
                credentials : Config.get('corsCredentials')
            });
        } catch (e) {
            console.log('error', e);
        }

    }

    const addPage = ({id, params, isUploadingFile = false, toTemplates = false}) => {

        const companyID = CompanyModel.getCompany().id;
        const templatesPath = toTemplates ? 'template/' : '';
        const endPoint = isUploadingFile ? 'upload' : 'page';

        let url = `/beta/company/${companyID}/presentation/${templatesPath}${id}/${endPoint}`;

        if (ContextModel.getContext() && !toTemplates) {
            url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${templatesPath}${id}/${endPoint}`;
        }

        if (isUploadingFile) {
            return  uploadFile({url, params})
        } else {
            return API.create(url, params)
              .then(function(resp) {
                  return resp.json();
              }, function(error) {
                  return error;
              });
        }
    }

    const createPresentation  = (name, title, from, to, lang) => {
        var companyID = CompanyModel.getCompany().id;
        var url = '/beta/company/'+companyID+'/presentation';

        if (ContextModel.getContext()) {
            url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation';
        }

        return API.create(url, {
            name : name,
            title : title,
            start_date : from,
            end_date : to,
            language : lang
        })
          .then(function(resp) {
              return resp.json();
          }, function(error) {
              return error;
          });
    };

    const getTemplateList = (pageNumber) => {
          var companyID = CompanyModel.getCompany().id;
          var url = '/beta/company/'+companyID+'/presentation/template';

          url = url + '?page_size=100';

          if (pageNumber) {
              url = url + '&page=' + pageNumber;
          }

          return API.retrieve(url);
      };

    const getPresentationList = (pageNumber) => {
        var companyID = CompanyModel.getCompany().id;
        var url = '/beta/company/'+companyID+'/presentation';

        if (ContextModel.getContext()) {
            url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation';
        }

        url = url + '?page_size=100';

        if (pageNumber) {
            url = url + '&page=' + pageNumber;
        }

        return API.retrieve(url)
          .then(function(resp) {
              return resp.json();
          }, function(error) {
              return error;
          });
    };

    const getFileContents = ({presentationId, pageId, uploadId, fromPresentation = false, token}) => {
        let url;
        if (fromPresentation) {
            return Vue.http.get(Config.get('apiUrl') +  `/beta/presentation/${presentationId}/page/${pageId}/content`, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + token,
                },
                credentials : Config.get('corsCredentials'),
                responseType : 'arraybuffer'
            }).then(data => {
                return data.body
            });

        } else {
            const companyID = CompanyModel.getCompany().id;

            url = `/beta/company/${companyID}/presentation/${presentationId}/upload/${uploadId}?content_only=true`;

            if (ContextModel.getContext()) {
                url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${presentationId}/upload/${uploadId}?content_only=true`;
            }
        }

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

    };

    return {
        getTemplateList: withPagination(getTemplateList),

        getPresentationList : withPagination(getPresentationList),

        createPresentation,

        createPresentationFromTemplate: function ({name, title, start_date, end_date, lang, pages, callback}) {
            const {getReportPageParams, updateStartEndDates} = reportHelpers;

            DashboardCollection().getDashboards().then(dashboardsData => {
                let pagesToSave = [];

                pagesToSave = reportHelpers.checkTemplatePagesRestrictions({
                    pages,
                    dashboards: dashboardsData.contents
                });

                createPresentation(name, title, start_date, end_date, lang).then(createdReport => {
                   const queue = pagesToSave.map(page =>
                        //We need to update start_date and end_date for each page and save it as report page
                            addPage({
                              id: createdReport.id,
                              params: getReportPageParams(updateStartEndDates({page, start_date, end_date}), createdReport)
                            })
                    )

                    Promise.all(queue).then(res => {
                        if (callback) {
                            callback(createdReport);
                        }
                    })
                })
            });
        },

        createTemplate: (report, pages) => {
            return addTemplate(report).then(template => {
                const {id: templateId} = template;

                pages.forEach(page => {
                    const params = reportHelpers.getReportPageParams(page, template);

                    addPage({
                        id: templateId,
                        params,
                        toTemplates: true
                    });
                })

                return template;
            });


        },

        deleteReport : function (id) {
            const companyID = CompanyModel.getCompany().id;
            let url = `/beta/company/${companyID}/presentation/${id}`;

            if (ContextModel.getContext()) {
                url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${id}`;
            }

            if (ContextModel.getContext()) {
                url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation/' + id;
            }

            return API.remove(url)
                .then(function(resp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },

        deleteTemplate : function (id) {
            const companyID = CompanyModel.getCompany().id;
            const url = `/beta/company/${companyID}/presentation/template/${id}`;
            return API.remove(url)
                .then(function(resp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },

        getLink : function (id, name, email, comment, lang, send) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/beta/company/'+companyID+'/presentation/' + id + '/link';

            if (ContextModel.getContext()) {
                url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation/' + id + '/link';
            }

             return API.create(url, {
                name : name,
                email : email,
                text : comment,
                language : lang,
                send : send
            })
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },

        getPages,

        addPage,

        editReport : function (id, params) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/beta/company/' + companyID + '/presentation/' + id;

            if (ContextModel.getContext()) {
                url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation/' + id;
            }

             return API.update(url, {
                 name : params.name,
                 title : params.title,
                 start_date : moment(params.start_date).format('YYYY-MM-DD'),
                 end_date : moment(params.end_date).format('YYYY-MM-DD')
             })
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },

        checkReportIsGenerating : function (id) {
            const companyID = CompanyModel.getCompany().id;
            let url = `/beta/company/${companyID}/presentation/${id}`;

            if (ContextModel.getContext()) {
                url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${id}`;
            }

            return API.retrieve(url)
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },

        finalizeReport : function(id, finalized = true) {
            const companyID = CompanyModel.getCompany().id;
            let url = `/beta/company/${companyID}/presentation/${id}`;

            if (ContextModel.getContext()) {
                url = `/beta/company/${companyID}/connection/see/${ContextModel.getContext().id}/presentation/${id}`;
            }

            return API.update(url, {finalized}).then(
                response => response.json(),
                error => error
            )
        },


        editPage : function (id, params, isEditPopup) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/beta/company/' + companyID + '/presentation/' + id + '/page/' + params.id;

            if (ContextModel.getContext()) {
                url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation/' + id + '/page/' + params.id;
            }
            if (isEditPopup) {
                return API.update(url, {
                    title: params.title,
                    name : params.name,
                    number : params.number,
                    start_date: params.start_date,
                    end_date: params.end_date,
                })
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            } else {
                return API.update(url, {
                    name : params.name,
                    description : params.description,
                    number : params.number
                })
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            }
        },

        deletePage : function (id, page) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/beta/company/'+companyID+'/presentation/' + id + '/page/' + page;

            if (ContextModel.getContext()) {
                url = '/beta/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/presentation/' + id + '/page/' + page;
            }

            return API.remove(url)
                .then(function(resp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },

        checkTokenPin : function (token, pin) {
            var url = '/parse-token';

             return API.create(url, {
                type : 'presentation-link',
                token : token,
                pin_code : pin
             })
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },

        getPresentationInfo : function (token, presentation) {
            return Vue.http.get(Config.get('apiUrl') + '/presentation/' + presentation, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                  return response.json();
              });
        },

        getPagesInfo : function (token, presentation) {
            return Vue.http.get(Config.get('apiUrl') + '/presentation/' + presentation + '/page', {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                  return response.json();
              });
        },

        getData : function (token, presentation, page) {
            return Vue.http.get(Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/data', {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                  return response.json();
              });
        },

        getInvoiceSummary : function (token, presentation, page, from, to) {
            let url = Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/invoice-summary';

            if (from && to) {
                url = url + '?from=' + from + '&to=' + to;
            } else if (from) {
                url = url + '?from=' + from;
            } else if (to) {
                url = url + '?to=' + to;
            }

            return Vue.http.get(url, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },


        getInvoiceContactSummary: function (token, presentation, page, p, sort, from, to) {
            let sortParam = sort.param;

            if (sort.param === 'name') {
                sortParam = 'display_name';
            } else if (sort.param === 'percent') {
                sortParam = 'total_invoiced';
            } else if (sort.param === 'outstanding') {
                sortParam = 'unpaid';
            }

            if (sort.direction == 'desc') {
                sortParam = '-' + sortParam;
            }

            let url = Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/invoice-contact-summary'

            url = url + '?page_size=100';
            url = url + '&page=' + p;
            url = url + '&sort=' + sortParam;

            if (from && to) {
                url = url + '&from=' + from + '&to=' + to;
            } else if (from) {
                url = url + '&from=' + from;
            } else if (to) {
                url = url + '&to=' + to;
            }

            return Vue.http.get(url, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },

        getInvoiceRecipientUnpaid: function (token, presentation, page, recipient) {
            return Vue.http.get(Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/invoice-recipient-unpaid/' + recipient, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },

        getUninvoicedTransaction: function (token, presentation, page, contactReference) {
            return Vue.http.get(Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/un-invoiced-transaction/' + contactReference, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },

        combinePromises(promises) {
            var response = promises.shift();

           return  q.allSettled(promises).then((promises) => {
                promises.forEach(({value : {body : {_embedded : {items}}}}) => {
                    response._embedded.items =  [...response._embedded.items, ...items];
                });

                return response;
            });
        },

        getPage(token, url, pageSize, pageNumber) {

            url += pageNumber? '?page=' + pageNumber : '';
            url += pageSize? '&page_size=' + pageSize : '';

            return Vue.http.get(url, {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            });
        },

        getFinancialReportByRangeData({token, presentationId, pageId, pageType, pageSize, pageNumber}) {
            let url = Config.get('apiUrl') + '/beta/presentation/' + presentationId + '/page/' + pageId + '/' + pageType;

            const promises = [];
            return this.getPage(token, url, pageSize, pageNumber)
            .then(({data}) => {
                if (data.errors) {
                    return false;
                }
                promises.push(data);
                if (data.page_count && data.page_count > 1) {
                    for (var p = 2; p <= data.page_count; p++) {
                        var nextPromise = this.getPage(token, url, pageSize, p);
                        promises.push(nextPromise);
                    }
                }

                return this.combinePromises(promises);
            });
        },

        getAnnualReport: function(token, presentation, page) {
            return Vue.http.get(Config.get('apiUrl') + '/beta/presentation/' + presentation + '/page/' + page + '/annual-report', {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },

        getFinancialReportAccounts : function(token, presentationId, pageId) {
            return Vue.http.get(Config.get('apiUrl') + '/beta/presentation/' + presentationId + /page/ + pageId + '/erp-mapping', {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            });
        },
        getFileContents
    };
});
