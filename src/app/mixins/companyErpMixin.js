define(['services/EventBus',  'models/CompanyModel'], function(EventBus, CompanyModel) {
    return {
        data: function() {
            return  {
                eventAttached: false,
                company: sessionStorage.getItem('target-client-company') ? JSON.parse(sessionStorage.getItem('target-client-company')) : CompanyModel.getCompany()
            };
        },
        methods: {
            attachSessionListener: function(url) {
                var erpWindow = window.open(this.buildUrl(url), 'externalErpFlowSession', 'menubar=0,status=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',scrollbars=1');
                erpWindow.opener = null;

                if (!this.eventAttached) {
                    window.addEventListener('storage', function(event) {
                        if (event.key === 'erp') {
                            this.eventAttached = true;
                            var erp = JSON.parse(localStorage.getItem('erp'));

                            if (!erp) {
                                this.getErpCheckStatus();
                            } else if (erp && erp.vatCheckStatusText == 'mismatch') {
                                EventBus.$emit('callInitVatApproval', erp);
                            } else if (this.completedCallback) {
                                this.completedCallback();
                            } else if (!this.noredirect) {
                                this.$router.push('/account/updating');
                            }

                            setTimeout(function() {
                                erpWindow.close();
                                localStorage.removeItem('erp');
                            }, 1000);
                        }

                    }.bind(this));
                }
            },

            buildUrl : function(url) {
                if (url === undefined) {
                    return url;
                }
                var companyId = this.company.id;

                url = url.replace(':company', companyId);

                var uuid1 = this.generateGuid().id();
                var uuid2 = this.generateGuid().id();

                url = url.replace(':secure_string_1', uuid1);
                url = url.replace(':secure_string_2', uuid2);

                return url;
            },

            generateGuid : function () {
                function part() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
                }

                return {
                    id: function () { return (part() + part() + "-" + part() + "-" + part() + "-" + part() + "-" + part() + part() + part()); }
                };
            }
        }
    };
});
