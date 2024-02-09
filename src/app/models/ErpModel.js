/**
 * Model representing an ERP connection.
 */
define([

    'moment',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel'

], function(moment, API, CompanyModel, ContextModel, DateRangeModel) {
    var erp = false;
    const erpCheckRequestsQueue = [];

    return {
        /**
         * Returns current ERP model.
         *
         * @return object JSON object representing an ERP.
         */
        getErp : function() {
            return erp;
        },

        /**
         * Set ERP model.
         *
         * @param object company JSON object representing an ERP.
         */
        setErp : function(erpObj, skipDate) {
            erp = erpObj;

            if (!sessionStorage.getItem('useQueryDate') && !skipDate) {
                const currentMonth = moment().month();

                if (erp.latestDate && erp.financialYears && erp.financialYears.length > 0) {
                    var latestDateStamp = moment.utc(erp.latestDate).unix();

                    const currentDate$ = moment();
                    erp.financialYears.forEach(function(financialYear, yearIdx) {
                        if (latestDateStamp >= moment.utc(financialYear.start).unix()
                            && latestDateStamp <= moment.utc(financialYear.end).unix()
                            && moment.utc(financialYear.start).unix() < currentDate$.unix()
                            ) {
                            const financialYearStart$ = moment.utc(financialYear.start);
                            const financialYearEnd$ = moment.utc(financialYear.end);

                            let from = financialYearStart$.toDate();
                            let to = financialYearEnd$.toDate();

                            if (financialYearEnd$.unix() > moment().unix()) {
                                to = currentDate$.toDate();
                            }
                            //When we are in a month that's a common first month of financial years (January and July primarily) the default date range is (max) one month.
                            //This also doesn't look especially good when only two months are shown.
                            //So, when the default start date is in the same month or the month following that of the default end date

                            if(currentMonth === financialYearStart$.month() && currentMonth - moment(to).month() <= 2) {
                                //the start date should be shifted back 3 months.
                                const newFromDate$ = moment(to).subtract(3, 'month');
                                //No further, however, than the earliest start date of the preceding financial year.
                                //If there is no preceding financial year, do not shift the start date.
                                const previousFinYear = erp.financialYears[yearIdx - 1];
                                if ( previousFinYear && ( newFromDate$.unix() > moment(previousFinYear.start).unix() )) {
                                    from = newFromDate$.toDate();
                                }
                            }

                            DateRangeModel.setFromDate(from);
                            DateRangeModel.setToDate(to);
                        }
                    });
                } else if (erp.financialYears && erp.financialYears.length > 0) {
                    let lastFinYear = erp.financialYears[erp.financialYears.length - 1];

                    //Looping backwards to find first financial year with the start date less than current date -
                    //it's our last financial year
                    if (erp.financialYears.length > 1) {
                        for (let i = erp.financialYears.length - 1; i >= 0; i--) {
                            let finYear = erp.financialYears[i];

                            if (moment.utc(finYear.start).unix() < moment().unix()) {
                                lastFinYear = finYear;
                                break;
                            }
                        }
                    }

                    let from = moment.utc(lastFinYear.start).toDate();
                    let to = moment.utc(lastFinYear.end).toDate();

                    if (moment.utc(lastFinYear.end).unix() > moment().unix()) {
                        to = moment().toDate();
                    }

                    DateRangeModel.setFromDate(from);
                    DateRangeModel.setToDate(to);
                } else {
                    DateRangeModel.setErpDate(erp.dateFrom, erp.latestDate);
                }
            }
        },


        /**
         * Forget ERP
         */
        forgetErp : function() {
            erp = null;
        },

        /**
         * Get ERP based on company.
         *
         * @return promise The response represented by a JSON object.
         */
        fromCompany : function(skipConnection, forceId) {
            var id = forceId ? forceId : CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext() && !skipConnection) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            return API.retrieve(url)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });

            
            //erpCheckRequestsQueue.push(
            //  () => API.retrieve(url)
            //);
            //return new Promise((resolve, reject) => {
            //    setInterval(() => {
            //        if(erpCheckRequestsQueue.length) {
            //            let request = erpCheckRequestsQueue.shift();

            //            request().then(function(erpResp) {
            //                if (erpResp.status == 403) {
            //                    resolve('forbidden');
            //                }
            //                resolve(erpResp.json());
            //            }, function(error) {
            //                reject(error);
            //            })
            //        }
            //    }, 5000)
            //})

        },

        /**
         * Create ERP connection.
         *
         * @param string provider The ERP provider.
         * @param string token The ERP token.
         * @return promise The result of the request.
         */
        createConnection : function(provider, token, country, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            var erpObject = {
                erp : provider,
                authentication : {
                    token : token,
                    code : token
                },
                performVatCheck : true
            };

            if (country) {
                erpObject.authentication.country = country;
            }

            return API.create(url, erpObject)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },

        createFortnoxConnection : function(token, currency, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            var erpObject = {
                erp : 'fortnox',
                authentication : {
                    "Authorization-Code" : token
                }
            };

            return API.create(url, erpObject)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },

        createTfourSevenOfficeConnection : function (clientName, userName, password, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            var erpObject = {
                erp : 'tfour-seven-office',
                authentication : {
                    clientName : clientName,
                    userName : userName,
                    password : password
                }
            };

            return API.create(url, erpObject)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },


        createDineroConnection : function(companyID, apiKey, currency, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            var erpObject = {
                erp : 'dinero',
                authentication : {
                    api_key : apiKey,
                    organisation_id : companyID,
                    currency : currency
                }
            };

            return API.create(url, erpObject)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },


        /**
         * Delete ERP connection.
         */
        deleteConnection : function(cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            return API.remove(url)
                .then(function(erpResp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },


        economicAdminConnection : function(userid, password, agreement) {
            var id = CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            return API.create(url, {
                erp : 'e-conomic-admin-parent',
                authentication : {
                    user_id : userid,
                    password : password,
                    admin_agreement_no : agreement
                }
            })
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },


        economicClientConnection : function(agreement, id, connID) {
            if (!id) {
                id = CompanyModel.getCompany().id;
            }

            if (!connID && ContextModel.getContext()) {
                connID = ContextModel.getContext().id;
            }

            var url = '/company/'+id+'/erp';

            if (connID) {
                url = '/company/'+id+'/connection/see/'+connID+'/erp';
            }

            return API.create(url, {
                erp : 'e-conomic-admin-child',
                authentication : {
                    client_agreement_no : agreement
                }
            })
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },

        approveVat : function (erpID, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp/'+erpID;
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp/'+erpID;
            }

            return API.update(url, {
                vatApproved : true
            })
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },

        sendSyncNotification : function () {
            var id = CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            return API.update(url, {
                reportNotifyAfterSync : true
            })
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        }

    };
});
