define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/UserModel',
    'models/SeeConnectionModel',
    'elements/tutorial-slide',
    'elements/modals/modal',
    'elements/modals/show-owner-info',
    'services/EventBus',
    'services/Tutorial',
    'services/Track',
    'elements/modals/resend-company-approval',
    'elements/modals/show-departaments'

], function(Vue, moment, DictionaryModel, UserModel, SeeConnectionModel, tutorialSlide, modal, showOwnerInfo, EventBus, Tutorial, Track, resendCompanyApprovalModal, showDepartaments) {
    const template = `
        <article>

           <div class="more" v-show="connection.processed && connection.approved">
               <i class="cwi-settings-gear clickable" v-on:click.stop="openMenu()"></i>
               <div class="menu" :class="{ open : menu }">
                   <ul>
                       <li v-on:click="addPortfolio(connection)" class="clickable" v-show="connectionType == 'see' && connectionFilter != 'portfolio' && !inPortfolio(connection)">{{ui.dictionary.connections.addPortfolio}}</li>
                       <li v-on:click="removePortfolioConfirm(connection, cat, index)" class="clickable" v-show="connectionType == 'see' && inPortfolio(connection)">{{ui.dictionary.connections.removePortfolio}}</li>
                       <li v-on:click="showDepartmentConfirmation(connection)" class="clickable" v-show="connectionType == 'see' && !connection.department && permissions.department && (permissions.owner || permissions.permissionType == 'full' || (permissions.permissionType == 'extended' && permissions.seeNoDepartment && permissions.setNullDepartment) )">{{ui.dictionary.connections.setToDepartment}}</li>
                       <li v-on:click="showSettings(connection)" class="clickable" v-show="connectionType == 'show' && (permissions.owner || permissions.permissionType == 'full' || permissions.companyConnectionAccess)">{{ui.dictionary.connections.settings}}</li>
                       <li v-on:click="showRevokeConfirmation(connection)" class="clickable" v-show="connectionType == 'show' && connection.approved && (permissions.owner || permissions.permissionType == 'full' || permissions.companyConnectionAccess)">{{ui.dictionary.connections.revoke}}</li>
                       <li v-on:click="showDeleteConfirmation(connection)" class="clickable" v-show="connectionType == 'see' && connection.approved && hasPermissionsToDelete">{{ui.dictionary.connections.delete}}</li>
                   </ul>
               </div>
           </div>


           <div class="more" v-show="connection.processed && !connection.approved && connectionType == 'see' && hasPermissionsToDelete">
               <i class="cwi-decline clickable" v-on:click.stop="openMenu()"></i>
               <div class="menu" :class="{ open : menu }">
                   <ul>
                       <li v-on:click="showDeleteConfirmation(connection)" class="clickable">{{ui.dictionary.connections.delete}}</li>
                   </ul>
               </div>
           </div>


           <div class="more" v-show="!connection.processed">
               <i class="cwi-reload" v-show="connectionType == 'see'" :title="ui.dictionary.connections.requestSent"></i>
               <i class="cwi-settings-gear clickable" v-show="connectionType == 'see'" v-on:click.stop="openMenu()"></i>
               <div class="menu" :class="{ open : menu }" v-show="connectionType == 'see' && hasPermissionsToDelete">
                   <ul>
                       <li v-on:click="showDeleteConfirmation(connection)" class="clickable">{{ui.dictionary.connections.delete}}</li>
                   </ul>
               </div>

               <span class="tooltip"><i class="cwi-decline warning clickable" v-show="connectionType == 'show'" v-on:click="declineConnection(connection)"></i><div class="message right" style="width: 150px; top: -10px; margin-left: 10px;">{{ui.dictionary.connections.declineConnection}}</div></span>
               &nbsp;
               <span class="tooltip"><i class="cwi-approve primary clickable" v-show="connectionType == 'show'" v-on:click="approveConnection(connection)"></i><div class="message right" style="width: 150px; top: -10px; margin-left: 10px;">{{ui.dictionary.connections.approveConnection}}</div></span>
           </div>


           <div class="icon">
               <div class="circle" :class="{ declined : connection.processed && !connection.approved }">{{getFirstChar(connection)}}</div>
           </div><div class="info">
               <div v-show="connection.company.name" class="company">

                   <span v-show="inPortfolio(connection)" class="tooltip"><i class="cwi-book-full"></i><div class="message right" style="margin-top: 4px;">{{ui.dictionary.connections.portfolio}}</div></span>

               <span class="tooltip title-wrapper">
                   <span class="clickable" v-tooltip="{content: connection.company.name, placement: 'top-center'}" v-on:click="openOverview(connection)" v-show="connectionType == 'see' && connection.processed && connection.approved && (permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended' || permissions.companyConnectionAccess)">{{connection.company.name}}</span>
               </span>

                   <span v-show="connectionType != 'see' || !connection.processed || !connection.approved || (!permissions.owner && permissions.permissionType != 'full' && permissions.permissionType != 'extended' && !permissions.companyConnectionAccess)">{{connection.company.name}}</span>
               </div>
               <div v-show="connection.company.vat" class="vat">
                  
                  <span class="tooltip" v-if="showValidationStatus">
                    <i class="cwi-shield" :class="{ 'ok-color' : mappingCurrentlyValidated, 'caution-color' : mappingPreviouslyValidated }"></i>
                    <div class="message right">
                      <span v-show="mappingCurrentlyValidated">{{ui.dictionary.connections.validated}}</span>
                      <span v-show="mappingPreviouslyValidated">{{ui.dictionary.connections.previouslyValidated}}</span>
                    </div>
                  </span>
                  
                  <span class="tooltip" v-show="connectionType == 'see' && connection.approved">
                      <span :class="{ active : connection.company.erp && connection.company.erp.connected && connection.company.erp.erp != 'seges-contact' && connection.company.erp.erp != 'e-conomic-admin-parent', bad : connection.company.erp && !connection.company.erp.connected }"><span class="bold" v-html="getErpSymbol(connection)"></span></span>
                      <div class="message right" v-show="connection.company.erp && connection.company.erp.connected && connection.company.erp.erp != 'seges-contact' && connection.company.erp.erp != 'e-conomic-admin-parent'">{{ui.dictionary.connections.erpConnected}}</div>
                      <div class="message right" v-show="connection.company.erp && !connection.company.erp.connected">{{ui.dictionary.connections.erpBad}}</div>
                      <div class="message right" v-show="!connection.company.erp">{{ui.dictionary.connections.erpNotConnected}}</div>
                  </span> {{connection.company.vat}}
                  <span class="tooltip" v-if="connectionType == 'see' && connection.approved && connection.company && connection.company.erp">
                      <span v-if="(vatGoodState() && fyGoodState()) || (vatGoodState() && fyMissingState()) || (vatMissingState() && fyGoodState())" class="ok-color"><i class="cwi-bookkeeping"></i></span>
                      <span v-if="(vatMissingState() && fyWarningState()) || (vatGoodState() && fyBadState()) || (vatGoodState() && fyWarningState())" class="caution-color"><i class="cwi-bookkeeping"></i></span>
                      <span v-if="vatMissingState() && fyBadState()" class="warn-color"><i class="cwi-bookkeeping"></i></span>
                      <span v-if="vatMissingState() && fyMissingState()"><i class="cwi-bookkeeping"></i></span>

                      <div class="message right" v-if="vatGoodState() && fyGoodState()">{{ui.dictionary.vatApproval.states.good.vat}} <br> {{replaceWithTotalYears(ui.dictionary.vatApproval.states.good.fy)}}</div>
                      <div class="message right" v-if="vatGoodState() && fyWarningState()">{{ui.dictionary.vatApproval.states.good.vat}} <br> {{replaceWithTotalYears(replaceWithFailureYears(ui.dictionary.vatApproval.states.warning.fy))}}</div>
                      <div class="message right" v-if="vatGoodState() && fyBadState()">{{ui.dictionary.vatApproval.states.good.vat}} <br> {{replaceWithTotalYears(ui.dictionary.vatApproval.states.bad.fy)}}</div>
                      <div class="message right" v-if="vatGoodState() && fyMissingState()">{{ui.dictionary.vatApproval.states.good.vat}}</div>
                      <div class="message right" v-if="vatMissingState() && fyGoodState()">{{replaceWithTotalYears(ui.dictionary.vatApproval.states.good.fy)}}</div>
                      <div class="message right" v-if="vatMissingState() && fyWarningState()">{{replaceWithTotalYears(replaceWithFailureYears(ui.dictionary.vatApproval.states.warning.fy))}}</div>
                      <div class="message right" v-if="vatMissingState() && fyBadState()">{{replaceWithTotalYears(ui.dictionary.vatApproval.states.bad.fy)}}</div>
                      <div class="message right" v-if="vatMissingState() && fyMissingState()">{{ui.dictionary.vatApproval.states.empty}}</div>
                  </span>
               </div>
               <div v-show="connection.created" class="created">{{formatDate(connection.created)}}</div>
               <div class="department-name" v-show="connectionType == 'see' && profile.roles.indexOf('department_role') >= 0 && (permissions.owner || permissions.permissionType == 'full')" v-on:click="openDepartmentSelect()">
                   <span v-show="!connection.department">({{ui.dictionary.connections.notInDepartment}})</span>
                   <span v-show="connection.department">{{getDepartmentName(connection.department)}}</span>
               </div>
               <div class="unapproved-companies" v-if="!connection.approved">{{ui.dictionary.stats.unapproved}}</div>
               <div class="department-spacer" v-show="connectionType != 'see' || profile.roles.indexOf('department_role') < 0 || (!permissions.owner && permissions.permissionType != 'full')"></div>
           </div>


           <v-popover :open="showOpenDataTutorial()" placement="right" class="blocker">
               <div class="open-overview" :style="!connection.approved ? 'margin-top: -20px;' : ''">
                  <span v-on:click="subscribe(connection.id)" v-show="!subscribed">
                       <i v-tooltip="{content: ui.dictionary.connections.subscribe, placement: 'bottom-center'}" class="cwi-eye-plus clickable"></i>
                   </span>
                  <span v-on:click="unsubscribe(connection.id)" v-show="subscribed">
                       <i v-tooltip="{content: ui.dictionary.connections.unsubscribe, placement: 'bottom-center'}" class="cwi-eye-minus clickable warn"></i>
                  </span>

                   <span v-show="connectionType == 'see' && profile.roles.indexOf('admin') >= 0" v-on:click="openOwnerInfo()">
                       <i v-tooltip="{content: ui.dictionary.connections.adminData, placement: 'bottom-center'}" class="cwi-user clickable"></i>
                  </span>

                   <span class="tooltip" v-show="(connectionType == 'see' && connection.processed && connection.approved && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended' || permissions.companyConnectionAccess) )" v-on:click="openOverview(connection)">
                       <i v-tooltip="{content: ui.dictionary.connections.open, placement: 'bottom-center'}" class="cwi-graph clickable"></i>
                   </span>
               </div>

               <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
           </v-popover>

        </article>
    `

    const bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
            },
            userInvitation : {
                name: null,
            },
            menu : false,
            profile : UserModel.profile(),
            tutorial : Tutorial,
            adminData : null
        };
    };


    const methods = {
        openMenu : function() {
            Track.am.log('CONNECTION_SETTINGS_MENU_CLICKED');
            this.menu = true;
        },

        vatGoodState : function () {
            var connection = this.connection;
            return connection.company && connection.company.erp && connection.company.erp.vatCheckStatusText && (connection.company.erp.vatCheckStatusText == 'matches' || connection.company.erp.vatCheckStatusText == 'approved');
        },

        vatMissingState : function () {
            var connection = this.connection;
            return !connection.company || !connection.company.erp || !connection.company.erp.vatCheckStatusText || (connection.company.erp.vatCheckStatusText != 'matches' && connection.company.erp.vatCheckStatusText != 'approved');
        },

        fyGoodState : function () {
            var connection = this.connection;
            return connection.company && connection.company.erp && connection.company.erp.verifications && connection.company.erp.verifications.financial_year_mismatch && connection.company.erp.verifications.financial_year_mismatch.total_count > 0 && connection.company.erp.verifications.financial_year_mismatch.failure_count == 0;
        },

        fyWarningState : function () {
            var connection = this.connection;
            return connection.company && connection.company.erp && connection.company.erp.verifications && connection.company.erp.verifications.financial_year_mismatch && connection.company.erp.verifications.financial_year_mismatch.total_count > 0 && connection.company.erp.verifications.financial_year_mismatch.failure_count > 0 && connection.company.erp.verifications.financial_year_mismatch.failure_count < connection.company.erp.verifications.financial_year_mismatch.total_count;
        },

        fyBadState : function () {
            var connection = this.connection;
            return connection.company && connection.company.erp && connection.company.erp.verifications && connection.company.erp.verifications.financial_year_mismatch && connection.company.erp.verifications.financial_year_mismatch.total_count > 0 && connection.company.erp.verifications.financial_year_mismatch.failure_count > 0 && connection.company.erp.verifications.financial_year_mismatch.failure_count == connection.company.erp.verifications.financial_year_mismatch.total_count;
        },

        fyMissingState : function () {
            var connection = this.connection;
            return !connection.company || !connection.company.erp || !connection.company.erp.verifications || !connection.company.erp.verifications.financial_year_mismatch || connection.company.erp.verifications.financial_year_mismatch.total_count == 0;
        },

        replaceWithFailureYears : function (string) {
            if (this.connection.company && this.connection.company.erp && this.connection.company.erp.verifications && this.connection.company.erp.verifications.financial_year_mismatch && this.connection.company.erp.verifications.financial_year_mismatch.failure_count) {
                return string.replace(':x', this.connection.company.erp.verifications.financial_year_mismatch.failure_count);
            }

            return string.replace(':x', 0);
        },

        replaceWithTotalYears : function (string) {
            if (this.connection.company && this.connection.company.erp && this.connection.company.erp.verifications && this.connection.company.erp.verifications.financial_year_mismatch && this.connection.company.erp.verifications.financial_year_mismatch.total_count) {
                return string.replace(':y', this.connection.company.erp.verifications.financial_year_mismatch.total_count);
            }

            return string.replace(':y', 0);
        },

        openDepartmentSelect : function () {
            this.$modal.show(showDepartaments, {departments: this.departments, connection: this.connection}, {styles: "height: fit-content; overflow: inherit"});
        },

        getDepartmentName : function (department) {
            if (!this.departments || this.departments.length === 0) {
                return ' ';
            }

            var found = false;

            this.departments.forEach(function (dept) {
                if (dept.id == department) {
                    if (dept.short_name) {
                        found = dept.short_name;
                    } else if (dept.name) {
                        found = dept.name;
                    } else {
                        found = ' ';
                    }
                }
            });

            if (found) {
               return found;
            } else {
                return '(' + this.ui.dictionary.connections.notInDepartment + ')';
            }
        },

        getErpSymbol : function(connection) {
            if (connection.company.erp && connection.company.erp.connected && connection.company.erp.erp != 'seges-contact' && connection.company.erp.erp != 'e-conomic-admin-parent') {
                return '&#10004;';
            } else if (connection.company.erp && !connection.company.erp.connected) {
                return '!';
            } else {
                return '&#9679;';
            }
        },

        closeMenu : function() {
            this.menu = false;
        },

        getFirstChar : function(connection) {
            if (connection.company.name) {
                return connection.company.name.toUpperCase().charAt(0);
            } else if (connection.company.vat) {
                return connection.company.vat.charAt(0);
            } else {
                return '?';
            }
        },

        formatDate : function(date) {
            return moment(date).format(this.ui.dictionary.locale.displayFormat);
        },

        openOwnerInfo : function() {
            var scm = new SeeConnectionModel();

            scm.getAdminData(this.connection.id)
                .then(function (res) {
                    this.adminData = res.adminData;
                    // CHECK THIS
                    this.$modal.show(showOwnerInfo, {connection: this.connection, adminData: this.adminData}, {height: 'auto'});
                }.bind(this));
        },

        showOpenDataTutorial : function() {
            return this.tutorial.current && this.tutorial.current.name == 'seeConnectionData' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showDepartmentConfirmation : function (connection) {
            this.showDepartmentConfirmationDialog(connection);
        },

        changeDepartment : function (connection) {
            connection.department = this.permissions.department;

            var scm = new SeeConnectionModel();

            scm.changeDepartment(connection.id, this.permissions.department)
                .then(function (res) {});
        },

        resendCompany : function (connection) {
            this.userInvitation.name = connection.company.name;
            this.$modal.show(resendCompanyApprovalModal, {name: this.userInvitation.name}, {height: 'auto'});
        },

        showDepartmentConfirmationDialog : function (connection) {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.connections.setToDepartmentConfirm,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.setToDepartmentDecline,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.connections.setToDepartmentAccept,
                        class: 'warning',
                        default: true,
                        handler: () => { this.changeDepartment(connection); this.$modal.hide('dialog'); }
                    }
                ]
            });
        }
    };

    const computed = {
      hasPermissionsToDelete() {
          const { owner, permissionType, companyConnectionAccess, deleteConnection } = this.permissions

          return owner || permissionType === 'full' || companyConnectionAccess || deleteConnection
      },
      mappingCurrentlyValidated() {
        return this.connection?.company?.erp?.currentMappingValidity
      },
      mappingPreviouslyValidated() {
        return !this.mappingCurrentlyValidated && this.connection?.company?.erp?.previouslyValidated
      },
      mappingNeverValidated() {
        return !this.mappingCurrentlyValidated && !this.mappingPreviouslyValidated
      },
      showValidationStatus() {
        return (
          this.connection?.company?.erp
            && !this.mappingNeverValidated
            && (
              this.mappingCurrentlyValidated
                || (
                  this.mappingPreviouslyValidated
                    && this.profile?.roles?.indexOf
                    && (this.profile.roles.indexOf('mapping_validator') >= 0)
                )
            )
        )
      }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        computed,
        components : {
            'tutorial-slide' : tutorialSlide
        },
        props : ['connection', 'addPortfolio', 'cat', 'index', 'removePortfolioConfirm', 'showSettings', 'showRevokeConfirmation', 'showDeleteConfirmation', 'connectionType', 'connectionFilter', 'inPortfolio', 'permissions', 'declineConnection', 'approveConnection', 'openOverview', 'subscribe', 'unsubscribe', 'subscribed', 'departments'],
        created : function() {
            EventBus.$on('click', this.closeMenu);
            document.addEventListener('clickAppBody', this.closeMenu);
        },
        mounted : function() {
            EventBus.$on('continueRMTutorial', this.continueRMTutorial);
        },
        beforeDestroy : function() {
            EventBus.$off('click');
            document.removeEventListener('clickAppBody', this.closeMenu);
        }
    });
});
