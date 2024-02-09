    import Vue from 'Vue'
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import CompanyUserModel from 'models/CompanyUserModel'
    import UserModel from 'models/UserModel'
    import ContextModel from 'models/ContextModel'
    import AssetModel from 'models/AssetModel'
    import CompanyUserInvitationModel from 'models/CompanyUserInvitationModel'
    import CompanyUserCollection from 'collections/CompanyUserCollection'
    import CompanyUserInvitationsCollection from 'collections/CompanyUserInvitationsCollection'
    import LanguageCollection from 'collections/LanguageCollection'
    import userSettings from 'elements/user-settings'
    import inviteUserSettings from 'elements/invite-user-settings'
    import resendInvitationModal from 'elements/modals/resend-invitation'
    import userSettingsDialog from 'elements/modals/user-settings-dialog'
    import inviteNewUserModal from 'elements/modals/invite-new-user'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'
    import Toast from 'services/Toast'

    const template = `
    <article class="connections">
<!--    /**-->
<!--     * User list-->
<!--     */-->
       <div class="working" v-show="ui.loading"></div>

       <section class="splash" v-show="!ui.loading && users.length === 1 && invitations.length === 0 && userRequests.length === 0">
           <h1>{{ui.dictionary.company.splash.title}}</h1>
           <p>{{ui.dictionary.company.splash.text}}</p>
           <button class="primary" v-on:click="showNewUserDialog()" v-show="profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full'">{{ui.dictionary.company.splash.action}}</button>
       </section>

       <section v-show="!ui.loading && (users.length > 1 || invitations.length > 0 || userRequests.length > 0)">

           <div class="search input-field">
               <input type="text" v-model="ui.search">
               <label v-bind:class="{ filled: ui.search.length > 0 }">{{ui.dictionary.company.search}}</label>

               <section class="add" v-show="profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full'">
                   <a v-on:click="showNewUserDialog()"><i class="cwi-add"></i> {{ui.dictionary.company.userInvitation.inviteUser}}</a>
               </section>
           </div>

           <div class="sort">
               {{ui.dictionary.company.showByAccess}} : 
               <select v-model="showUserType" :style="{ backgroundImage : getDropdownArrow() }"><option value="all">{{ui.dictionary.company.allUsers}}</option><option value="full">{{ui.dictionary.connections.full}}</option><option value="extended">{{ui.dictionary.connections.extended}}</option><option value="limited">{{ui.dictionary.connections.limited}}</option></select>
           </div>



           <section class="category" v-show="userRequests.length > 0">
               <div class="section"><div class="name">{{ui.dictionary.company.userInvitation.pendingRequests}}</div></div>
               <div class="list">
               <div class="connection" v-for="(request, index) in userRequests">
                   <div class="more">
                       <span class="tooltip"><i class="cwi-decline warning clickable" v-on:click="declineRequest(request, index)"></i><div class="message right" style="width: 150px; top: -10px; margin-left: 10px;">{{ui.dictionary.company.userInvitation.declineRequest}}</div></span>
                       &nbsp;
                       <span class="tooltip"><i class="cwi-approve primary clickable" v-on:click="approveRequest(request, index)"></i><div class="message right" style="width: 150px; top: -10px; margin-left: 10px;">{{ui.dictionary.company.userInvitation.acceptRequest}}</div></span>
                   </div>

                   <div class="icon">
                       <div class="circle">{{getFirstChar(request._embedded)}}</div>
                   </div><div class="info">
                       <div class="company">{{request._embedded.user.name}}</div>
                       <div class="vat">{{request._embedded.user.email}}</div>
                   </div>
               </div>
               </div>
           </section>


           <section class="category" v-show="invitations.length > 0">
               <div class="section"><div class="name">{{ui.dictionary.company.userInvitation.pending}}</div></div>
               <div class="list">
               <div class="connection" v-for="(invitation, index) in filterInvitations(invitations)">
                   <div class="more">
                       <i class="cwi-reload"
                          :class="{ clickable : profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' }"
                          v-on:click.stop="openInviteMenu(index)"></i>
                       <div class="menu" :class="{ open : inviteMenu == index }">
                           <ul>
                               <li class="clickable" v-on:click="resendInvitationDialog(invitation)">{{ui.dictionary.company.resendInvite}}</li>
                               <li class="clickable" v-on:click="currentInvite = invitation; showDeleteInviteConfirmation(invitation);">{{ui.dictionary.company.deleteInvite}}</li>
                          </ul>
                       </div>
                   </div>

                   <div class="icon">
                       <div class="circle">{{getFirstChar(invitation)}}</div>
                   </div><div class="info">
                       <div class="company">{{invitation.name}}</div>
                       <div class="vat">{{ui.dictionary.connections.access}} : {{ui.dictionary.connections[invitation.permission_type]}}</div>
                   </div>
               </div>
               </div>
           </section>


           <section class="category" v-show="users.length > 1">
               <div class="section"><div class="name">{{ui.dictionary.company.users}}</div></div>
               <div class="list">
               <div class="connection" v-for="(user, index) in filterUsers(users)">
                   <div class="more" v-show="showMoreIcon(user)">
                       <i class="cwi-settings-gear clickable" v-on:click.stop="openMenu(index)"></i>
                       <div class="menu" :class="{ open : menu == index }">
                           <ul>
                               <li class="clickable" v-on:click="showUserSettingsDialog(user)">{{ui.dictionary.company.userSettings}}</li>
                               <li class="clickable" v-on:click="currentUser = user; showUserDeleteConfirmation(user)">{{ui.dictionary.company.deleteUser}}</li>
                          </ul>
                       </div>
                   </div>
                   <div class="icon">
                       <div class="circle">{{getFirstChar(user)}}</div>
                  </div><div class="info">
                       <div class="company">{{user.user.name}}</div>
                       <div class="vat">{{user.user.email}}</div>
                       <div class="vat">{{ui.dictionary.connections.access}} : {{ui.dictionary.connections[user.permissionType]}}</div>
                   </div>
               </div>
               </div>
           </section>
       </section>
    </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            showUserSettings : false,
            deleteConfirmation : false,
            newUserDialog : false,
            newSearch : '',
            addingError : false,
            userError : false,
            invalidEmail : false,
            adding : false,
            search: '',
            showMoreOptions : false,
            langOptions : false,
            resendInviteDialog : false,
            resendingInvite : false
        },
        users : [],
        menu : null,
        inviteMenu : null,
        currentUser : null,
        currentInvite : null,
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        showUserType : 'all',
        profile : UserModel.profile(),
        userInvitation : {
            name : { value : '', valid : true },
            email : { value : '', valid : true },
            permissionType : 'extended',
            kpiDefinitionAccess : false,
            companyConnectionAccess : false,
            shareAllDashboards : false,
            language : DictionaryModel.getHash().meta.code,
            validFrom : null,
            validTo : null,
            make_owner : false,
            remove_inviter : false
        },
        invitations : [],
        langOptions : [],
        resendInviteObject : {
            invitation : null,
            email : null,
            emailValid : true
        },
        userRequests : []
    });

    const methods = {
        init() {
            /**
             * Event listeners
             */
            EventBus.$on('companyErpChanged', this.companyErpChanged);
            EventBus.$on('click', this.openMenu);
            EventBus.$on('click', this.openInviteMenu);
            document.addEventListener('clickAppBody', this.openMenu);
            this.langOptions = LanguageCollection.getList();

            this.getUsers();
            this.getInvitations();
            this.getRequests();
        },

        approveRequest(request, index) {
            var cu = new CompanyUserModel();

            this.userRequests.splice(index, 1);

            cu.acceptUserRequest(request.id)
                .then(function (res) {
                    this.getUsers();
                }.bind(this));
        },

        declineRequest(request, index) {
            var cu = new CompanyUserModel();

            this.userRequests.splice(index, 1);

            cu.declineUserRequest(request.id)
                .then(function (res) {
                    this.getUsers();
                }.bind(this));
        },


        getRequests() {
            if (!CompanyModel.getCompany()) {
                return false;
            }

            this.ui.loading = true;

            var um = new CompanyUserCollection();
            um.getRequests()
                .then(function(res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.userRequests = res._embedded.items;
                    }
                    this.ui.loading = false;
                }.bind(this));
        },

        resendInvitationDialog(invitation) {
            var uim = new CompanyUserInvitationModel();

            this.resendInviteObject = {
                invitation : invitation,
                email : null,
                emailValid : true
            };

            this.showResendInviteDialog(this.resendInviteObject);
            //this.ui.resendInviteDialog = true;

            uim.getEmail(invitation.id)
                .then(function(res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.resendInviteObject.email = res._embedded.items[0].email;
                    } else {
                        this.resendInviteObject.email = '';
                    }
                }.bind(this));
        },

        resendInvitation(invitationObject) {
            if ( !this.validateInviteEmail(true) ) {
                return false;
            }

            this.ui.resendInviteDialog = false;

            var cuim = new CompanyUserInvitationModel();
            cuim.addEmail(invitationObject.invitation.id, invitationObject.email)
                .then(function(res) {
                    if (res.id) {
                        Toast.show(this.ui.dictionary.company.inviteResent);
                    } else {
                        Toast.show(this.ui.dictionary.company.inviteResentError, 'warning');
                    }
                }.bind(this));
        },

        validateInviteEmail(force) {
            if (force || !this.resendInviteObject.emailValid) {
                this.resendInviteObject.emailValid = Validator.email(this.resendInviteObject.email);
            }

            return this.resendInviteObject.emailValid;
        },

        selectValidFromDate(value, valid) {
            if (!valid) {
                this.userInvitation.validFrom = null;
                return false;
            }

            this.userInvitation.validFrom = value;
        },

        selectValidToDate(value, valid) {
            if (!valid) {
                this.userInvitation.validTo = null;
                return false;
            }

            this.userInvitation.validTo = value;
        },

        companyErpChanged() {
            this.getUsers();
            this.getInvitations();
        },


        validateName(force) {
            if (force || !this.userInvitation.name.valid) {
                this.userInvitation.name.valid = Validator.minLength(this.userInvitation.name.value, 2);
            }

            return this.userInvitation.name.valid;
        },

        validateEmail(force) {
            if (force || !this.userInvitation.email.valid) {
                this.userInvitation.email.valid = Validator.email(this.userInvitation.email.value);
            }

            return this.userInvitation.email.valid;
        },


        getDropdownArrow() {
            var path = new AssetModel('/assets/img/elements/arrow-down.png').path;
            return 'url(' + path + ')';
        },

        getUsers() {
            if (!CompanyModel.getCompany()) {
                return false;
            }

            var scope = this;

            scope.ui.loading = true;
            var um = new CompanyUserCollection();
            um.getUsers()
                .then(function(res) {
                    scope.users = res.contents;
                    scope.ui.loading = false;
                    scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo()
                });
        },


        getInvitations() {
            var scope = this;

            var cui = new CompanyUserInvitationsCollection();
            cui.getInvitations()
                .then(function(res) {
                    scope.invitations = [];

                    if (res.total_items && res.total_items > 0) {
                        res._embedded.items.forEach(function(item) {
                            if (!item.converted) {
                                scope.invitations.push(item);
                            }
                        });
                    }
                });
        },

        openMenu(index) {
            if (index !== undefined) {
                this.menu = index;
            } else {
                this.menu = null;
            }
        },

        openInviteMenu(index) {
            if (this.profile.roles.indexOf('admin') < 0 && !this.permissions.owner && this.permissions.permissionType != 'full') {
                return false;
            }

            if (index !== undefined) {
                this.inviteMenu = index;
            } else {
                this.inviteMenu = null;
            }
        },

        getFirstChar(user) {
            if (user.name) {
                return user.name.toUpperCase().charAt(0);
            } else if (user.user.name) {
                return user.user.name.toUpperCase().charAt(0);
            } else {
                return '?';
            }
        },

        deleteUser(user) {
            var um = new CompanyUserModel();
            um.delete(user);

            var index = null;
            this.users.forEach(function(u, i) {
                if (u.id == user.id) {
                    index = i;
                }
            });
            this.users.splice(index, 1);
            this.currentUser = null;
        },

        deleteInvite(invite) {
            var cuim = new CompanyUserInvitationModel();
            cuim.delete(invite);

            var index = null;
            this.invitations.forEach(function(u, i) {
                if (u.id == invite.id) {
                    index = i;
                }
            });
            this.invitations.splice(index, 1);
            this.currentInvite = null;
        },

        addUser(email, cb) {
            if ( !this.validateName(true) || !this.validateEmail(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.invalidEmail = false;
            scope.ui.userError = false;
            scope.ui.addingError = false;
            scope.ui.adding = true;


            var cuim = new CompanyUserInvitationModel();
            cuim.inviteUser({
                name : scope.userInvitation.name.value,
                language : scope.userInvitation.language,
                permission_type : scope.userInvitation.permissionType,
                kpi_definition_access : scope.userInvitation.kpiDefinitionAccess,
                company_connection_access : scope.userInvitation.companyConnectionAccess,
                share_all_dashboards : scope.userInvitation.shareAllDashboards,
                valid_from : scope.userInvitation.validFrom ? moment(scope.userInvitation.validFrom).format('YYYY-MM-DD') : null,
                valid_to : scope.userInvitation.validTo ? moment(scope.userInvitation.validTo).format('YYYY-MM-DD') : null,
                department_id : null,
                make_owner : scope.userInvitation.make_owner,
                remove_inviter : scope.userInvitation.remove_inviter
            }).then(function(res) {
                if (res.id) {
                    cuim.addEmail(res.id, scope.userInvitation.email.value)
                        .then(function(eres) {
                            if (eres.id) {
                                scope.ui.newUserDialog = false;
                                scope.getInvitations();

                                scope.userInvitation = {
                                    name : { value : '', valid : true },
                                    email : { value : '', valid : true },
                                    permissionType : 'extended',
                                    kpiDefinitionAccess : false,
                                    companyConnectionAccess : false,
                                    shareAllDashboards : false,
                                    language : DictionaryModel.getHash().meta.code
                                };
                                scope.ui.showMoreOptions = false;
                            } else {
                                //Failed to create email
                                scope.ui.invalidEmail = true;
                            }

                            scope.ui.adding = false;

                            if(cb) {
                                cb();
                            }
                        });
                } else {
                    //Failed to create invitation
                    scope.ui.adding = false;
                    scope.ui.addingError = true;
                }
            });
        },

        validEmail(email) {
            return Validator.email(email);
        },

        filterInvitations(users) {
            if (this.ui.search.length > 0) {
                this.showUserType = 'all';

                return users.filter(function(user) {
                    var searchStrings = this.ui.search.split(' ');
                    var found = false;

                    for (var i = 0; i < searchStrings.length; i++) {
                        if (searchStrings[i].length > 0 && user.name && user.name.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                            found = true;
                        } else if (searchStrings[i].length > 0 && user.email && user.email.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                            found = true;
                        }
                    }

                    return found;
                }, this);
            } else if (this.showUserType !== 'all') {
                return users.filter(function(user) {
                    return user.permission_type == this.showUserType;
                }, this);
            }

            return users;
        },

        showResendInviteDialog(resendInviteObject) {
          this.$modal.show(resendInvitationModal, {
              resendInvitation: this.resendInvitation,
              resendInviteObject,
              resendingInvite: this.ui.resendingInvite

          },{height: 'auto'});
        },

        showUserDeleteConfirmation(user) {
            const { dictionary } = this.ui;

            this.$modal.show('dialog', {
                text: dictionary.company.deleteUserConfirmation,
                width: 600,
                buttons: [
                    {
                        title: dictionary.company.deleteUserCancel,
                        class: 'highlighted-text',
                    },
                    {
                        title: dictionary.company.deleteUser,
                        class: 'warning',
                        default: true,
                        handler: () => { this.deleteUser(user); this.$modal.hide('dialog')}
                    }
                ]
            });
        },

        showUserSettingsDialog(user) {
            this.currentUser = user;
            this.$modal.show(userSettingsDialog, {
               user,
               onClose: () => this.currentUser = null
            },{height: 'auto'});
        },

        showNewUserDialog() {
            this.$modal.show(inviteNewUserModal, {
                userInvitation: this.userInvitation,
                addUser: this.addUser
            },{height: 'auto'});
        },

        filterUsers(users) {
            if (this.ui.search.length > 0) {
                this.showUserType = 'all';

                return users.filter(function(user) {
                    var searchStrings = this.ui.search.split(' ');
                    var found = false;

                    for (var i = 0; i < searchStrings.length; i++) {
                        if (searchStrings[i].length > 0 && user.user.name && user.user.name.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                            found = true;
                        } else if (searchStrings[i].length > 0 && user.user.email && user.user.email.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                            found = true;
                        }
                    }

                    return found;
                }, this);
            } else if (this.showUserType !== 'all') {
                return users.filter(function(user) {
                    return user.permissionType == this.showUserType;
                }, this);
            }

            return users;
        },
        showMoreIcon(user) {
            const { profile, permissions } = this;
            return (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType === 'full') && !user.owner;
        },
        showDeleteInviteConfirmation(invitation) {
            const { dictionary } = this.ui;

            this.$modal.show('dialog', {
                text: dictionary.company.deleteInviteConfirmation,
                width: 600,
                buttons: [
                    {
                        title: dictionary.company.deleteUserCancel,
                        class: 'highlighted-text',
                    },
                    {
                        title: dictionary.company.deleteInvite,
                        class: 'warning',
                        default: true,
                        handler: () => { this.$modal.hide('dialog'); this.deleteInvite(invitation); }
                    }
                ]
            });
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'user-settings' : userSettings,
            'invite-user-settings' : inviteUserSettings
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('companyErpChanged');
            EventBus.$off('click');
            document.removeEventListener('clickAppBody', this.openMenu);
        }
    });
