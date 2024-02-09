    import ContextModel from 'models/ContextModel'
    import UserModel from 'models/UserModel'
    import ErpModel from 'models/ErpModel'
    
    export default {
        data: function() {
            return  {
                permissions: ContextModel.getContext() || UserModel.getCompanyUserInfo(),
                erp: ErpModel.getErp()
            };
        },
        computed: {
            hasFullPermissions: function() {
                return this.permissions.owner || this.permissions.permissionType === 'full';
            },
            hasExtendedPermissions: function() {
                return this.permissions.permissionType === 'extended';
            },
            isFinancialReportAvailable: function () {
                const { permissions } = this;
                return (
                  this.hasFullPermissions
                  || this.hasExtendedPermissions
                  || permissions.shareAllDashboards
                  || permissions.allowExternalDashboard
                );
            },
            invoicesSupported() {
                const { erp } = this;
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
            },
        }
    };
