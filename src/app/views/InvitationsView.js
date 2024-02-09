    import Vue from 'Vue'
    import moment from 'moment'
    import Raven from 'Raven'
    import DictionaryModel from 'models/DictionaryModel'
    import InvitationModel from 'models/InvitationModel'
    import InvitationEmailModel from 'models/InvitationEmailModel'
    import ContextModel from 'models/ContextModel'
    import UserModel from 'models/UserModel'
    import PartnerModel from 'models/PartnerModel'
    import CompanyModel from 'models/CompanyModel'
    import SharedConnectionModel from 'models/SharedConnectionModel'
    import SeeConnectionModel from 'models/SeeConnectionModel'
    import InvitationCollection from 'collections/InvitationCollection'
    import InviteEmailCollection from 'collections/InviteEmailCollection'
    import LanguageCollection from 'collections/LanguageCollection'
    import CompanyCollection from 'collections/CompanyCollection'
    import Validator from 'services/Validator'
    import EventBus from 'services/EventBus'
    import Toast from 'services/Toast'
    import dateField from 'elements/date-field'
    import tutorialSlide from 'elements/tutorial-slide'
    import modal from 'elements/modals/modal'
    import showNewInvitationsModal from 'elements/modals/show-new-invitations-modal'
    import Tutorial from 'services/Tutorial'
    import resendConfirm from 'elements/modals/resend-confirm'
    import resendReminders from 'elements/modals/resend-reminders'
    import changeEmailConfirm from 'elements/modals/change-email-confirm'
    import copyLink from 'elements/modals/copy-link-modal'
    import connectCompanies from 'elements/modals/connect-companies'
    import Config from 'services/Config'

    const template = `
    <article class="manage-dashboards connections invitations" ref="invitations">

       <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/connections/all"><a>{{ui.dictionary.connections.all}}</a></router-link>
                   <router-link tag="li" to="/account/connections/portfolio"><a>{{ui.dictionary.connections.portfolio}}</a></router-link>
                   <router-link tag="li" to="/account/connections/shared" v-show="company && company.owned"><a>{{ui.dictionary.connections.shared}}</a></router-link>
                   <router-link tag="li" v-show="profile.roles && profile.roles.indexOf('sales_potential_role') >= 0" to="/account/sales-potential"><a>{{ui.dictionary.salesPotential.salesPotentialReport}}</a></router-link>
                   <router-link tag="li" class="right-float" to="/account/invitations"><a>{{ui.dictionary.invitations.title}}</a></router-link>
                   <router-link v-show="company && company.settings && company.settings.invitation_metric" tag="li" class="right-float" to="/account/invitation-metrics"><a>{{ui.dictionary.invitations.metrics}}</a></router-link>
               </ul>
           </nav>
       <section class="tab-content">
           <div class="working" v-show="ui.loading"></div>

           <v-popover :open="showInvitationAddTutorial()" placement="bottom" class="blocker">
               <div class="splash" v-show="!ui.loading && (invitations.length === 0 || (tutorial.state.started && !tutorial.state.finished) )">
                   <h1>{{ui.dictionary.invitations.splash.title}}</h1>
                   <p>{{ui.dictionary.invitations.splash.invite}}</p>
                   <button class="primary" v-on:click="showNewInvitations();" v-show="permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended'">{{ui.dictionary.invitations.new}}</button>
               </div>
               <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
           </v-popover>

           <div class="dashboard-list" v-show="!ui.loading && invitations.length > 0 && (!tutorial.state.started || tutorial.state.finished)">

<!--                /**-->
<!--                 * Filter / Add invitation button-->
<!--                 */-->
               <div class="search input-field">
                   <input type="text" v-model="ui.search">
                   <label v-bind:class="{ filled: ui.search.length > 0 }">{{ui.dictionary.invitations.search}}</label>

                   <div class="add" v-show="permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended'">
                       <a href="#" data-test-id="addNewInvitations" v-on:click.prevent="showNewInvitations();"><i class="cwi-add"></i> {{ui.dictionary.invitations.new}}</a>
                   </div>
               </div>

<!--                /**-->
<!--                 * Invitation list-->
<!--                 */-->
               <section>

               <div class="invite-table">
                   <div class="row headings">
                       <div class="cell" v-on:click="changeSortBy('date')"><span v-show="sort.param == 'date'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.created}}</div>
                       <div class="cell" v-on:click="changeSortBy('vat')"><span v-show="sort.param == 'vat'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.company.vat}}</div>
                       <div class="cell" v-on:click="changeSortBy('name')"><span v-show="sort.param == 'name'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.smeName}}</div>
                       <div class="cell" v-on:click="changeSortBy('creatorName')" v-if="profile.roles.indexOf('admin') >= 0"><span v-show="sort.param == 'creatorName'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.invitedBy}}</div>
                       <div class="cell" v-on:click="changeSortBy('department')"><span v-show="sort.param == 'department'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.department}}</div>
                       <div class="cell" v-on:click="changeSortBy('connected')"><span v-show="sort.param == 'connected'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.status}}</div>
                       <div class="cell" v-on:click="changeSortBy('followUpDate')" v-if="profile.roles.indexOf('admin') >= 0"><span v-show="sort.param == 'followUpDate'"><i :class="{ 'cwi-down' : sort.direction == 'asc', 'cwi-up' : sort.direction == 'desc'}"></i></span>{{ui.dictionary.invitations.followupDate}}</div>
                   </div
                   ><div class="row" :class="{ 'tabular-row' : index % 2 === 0, 'tabular-altrow' : index % 2 !== 0 }" v-for="(invitation, index) in sortInvitations(filterInvitations(searchInvitations(invitations)))">
                       <div class="cell" v-on:click="toggleInvite(invitation)">
                           <span v-show="!currentInvite || currentInvite.id != invitation.id">+</span>
                           <span v-show="currentInvite && currentInvite.id == invitation.id">&ndash;</span>
                           {{formatDate(invitation.created)}}
                       </div>
                       <div class="cell" v-on:click="toggleInvite(invitation)">{{invitation.vat}}</div>
                       <div class="cell" v-on:click="toggleInvite(invitation)">{{invitation.name}}</div>
                       <div class="cell" v-on:click="toggleInvite(invitation)" v-if="profile.roles.indexOf('admin') >= 0">{{getCreatorName(invitation.adminData)}}</div>
                       <div class="cell" v-on:click="toggleInvite(invitation)">{{getDepartmentName(invitation.department)}}</div>
                       <div class="cell status-cell" v-show="!invitation.overrideStatus" @click="changeStatus(getCurrentStatus(invitation), invitation)">
                           <span>{{getCurrentStatus(invitation)}}</span><i class="cwi-down down-status" v-if="profile.roles.indexOf('admin') >= 0 && isChangeStatus(getCurrentStatus(invitation))"></i>
                           <div class="status-option" v-if="ui.options && showSelectStatus === invitation.id">
                               <div class="option" v-for="item in statusOptions" :key="item.id" v-on:click.stop="setStatus(item, invitation)">{{item.value}}</div>
                           </div>
                       </div>
                       <div class="cell status-cell" v-show="invitation.overrideStatus" @click="changeStatus(getCurrentStatus(invitation), invitation)">
                           <span>{{getOverrideStatus(invitation)}}</span><i class="cwi-down down-status" v-if="profile.roles.indexOf('admin') >= 0 && isChangeStatus(getOverrideStatus(invitation))"></i>
                           <div class="status-option" v-if="ui.options && showSelectStatus === invitation.id">
                               <div class="option" v-for="item in statusOptions" :key="item.id" v-on:click.stop="setStatus(item, invitation)">{{item.value}}</div>
                           </div>
                       </div>

                       <div class="cell" v-on:click="toggleInvite(invitation)">
                           <span v-show="invitation.followUpDate">{{formatDate(invitation.followUpDate)}}</span>
                           <span v-show="invitation.sharedNote || (profile.roles.indexOf('admin') >= 0 && (invitation.adminData.privateNote || invitation.adminData.erpProvider || invitation.adminData.phoneNumber))" class="float-right no-margin"><i class="cwi-comment"></i></span>
                       </div>

                       <div v-show="currentInvite && currentInvite.id == invitation.id" class="row-details">
                           <div class="line-spacer"></div>
                           <div class="float-right no-margin" v-show="!invitation.converted && invitation.emails">
                               <div class="auto-copy" v-show="currentLink"><span class="copied" :class="{ show : ui.showCopied }">{{ui.dictionary.invitations.copied}}</span><span class="copy-button" v-on:click.stop="copyLink(invitation.id)">{{ui.dictionary.invitations.copy}}</span><input v-model="currentLink" :id="generateID(invitation.id)" v-on:click.stop="highlightTextbox(invitation.id)"></div>
                               <button v-on:click.stop="resendInvitation()" v-show="hasSentEmails()">{{ui.dictionary.invitations.resend}}</button>
                               <button v-on:click.stop="resendInvitation()" v-show="!hasSentEmails()">{{ui.dictionary.invitations.send}}</button>
                           </div>
                           <p class="label">{{ui.dictionary.invitations.log}}</p>
                           <div class="working" v-show="!invitation.emails"></div>
                           <div v-show="invitation.emails">
                               <div v-for="email in filterNormalEmails(invitation.emails)" class="email" v-show="email.sent">
                                   <div class="float-right no-margin warn-color" v-show="!invitation.converted && invitation.type != 'see' && emailIsExpired(email)"> <i class="cwi-calendar"></i> {{ui.dictionary.invitations.emailExpired}}</div>
                                   {{email.email}} <span class="faded">(<span v-show="email.bounced" class="warn-color">{{ui.dictionary.invitations.bounced}}</span><span v-show="!email.bounced && email.sent">{{ui.dictionary.invitations.sent}}</span><span v-show="!email.bounced && !email.sent">{{ui.dictionary.invitations.scheduled}}</span>: {{formatDate(email.created, email.delay)}})</span>
                               </div>
                               <div v-show="!invitation.emails">
                                   <em>{{ui.dictionary.invitations.emailsNotSent}}</em>
                               </div>
                           </div>
                           <div v-if="!invitation.sent" v-for="(item, index) in filterNotSentEmails(invitation.emails)" :key="item.id" class="email">
                               <span style="word-wrap: break-word;"><a :href="item.link" target="_blank">Link</a></span>
                               <span class="faded">({{ui.dictionary.connections.generated}}: {{formatDate(item.created)}})</span>
                           </div>

                           <div class="line-spacer"></div>

                           <div class="float-right no-margin" v-show="!invitation.converted && invitation.emails && !hasReminders()">
                               <button v-on:click.stop="resendReminders()">{{ui.dictionary.invitations.reminder}}</button>
                           </div>

                           <p class="label" v-show="invitation.emails">{{ui.dictionary.invitations.reminders}}</p>
                           <div v-show="invitation.emails">
                               <div v-for="email in sortReminderEmails(filterReminderEmails(invitation.emails))" class="email">
                                   <div class="float-right no-margin warn-color" v-show="!invitation.converted && invitation.type != 'see' && emailIsExpired(email)"> <i class="cwi-calendar"></i> {{ui.dictionary.invitations.emailExpired}}</div>
                                   <button class="warning" v-on:click.stop="deleteReminder(email)" v-show="!invitation.converted && !email.sent && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType === 'extended' || permissions.permissionType === 'full')">{{ui.dictionary.invitations.delete}}</button>
                                   {{email.email}} <span class="faded">(<span v-show="email.bounced" class="warn-color">{{ui.dictionary.invitations.bounced}}</span><span v-show="!email.bounced && email.sent">{{ui.dictionary.invitations.sent}}</span><span v-show="!email.bounced && !email.sent">{{ui.dictionary.invitations.scheduled}}</span>: {{formatDate(email.created, email.delay)}})</span>
                               </div>
                               <div v-show="!hasReminders()">
                                   <em>{{ui.dictionary.invitations.remindersNotSent}}</em>
                               </div>
                           </div>

                           <div class="line-spacer"></div>

                           <div v-show="profile.roles.indexOf('admin') < 0 && invitation.sharedNote">
                               <p class="label">{{ui.dictionary.invitations.notes}}</p>
                               <p>{{invitation.sharedNote}}</p>
                           </div><div class="invitation-quarter" v-if="profile.roles.indexOf('admin') >= 0">
                               <p class="label">{{ui.dictionary.invitations.notes}}</p>
                               <textarea v-model="invitation.sharedNote"></textarea>
                           </div><div class="invitation-quarter" v-if="profile.roles.indexOf('admin') >= 0">
                               <p class="label">{{ui.dictionary.invitations.privateNotes}}</p>
                               <textarea v-model="invitation.adminData.privateNote"></textarea>
                           </div><div class="invitation-quarter" v-if="profile.roles.indexOf('admin') >= 0">
                               <p class="label">{{ui.dictionary.invitations.contactSme}}</p>
                               <div class="value">{{invitation.name}}</div>
                               <div class="line-spacer"></div>
                               <div class="line-spacer"></div>

                               <div class="input-field">
                                   <input type="text" v-model="invitation.adminData.phoneNumber">
                                   <label v-bind:class="{ filled: invitation.adminData.phoneNumber && invitation.adminData.phoneNumber.length > 0 }">{{ui.dictionary.invitations.phoneNumber}}</label>
                               </div>

                               <div class="input-field">
                                   <input type="text" v-model="invitation.adminData.erpProvider">
                                   <label v-bind:class="{ filled: invitation.adminData.erpProvider && invitation.adminData.erpProvider.length > 0 }">{{ui.dictionary.invitations.erpProvider}}</label>
                               </div>

                               <p class="label" v-if="profile.roles.indexOf('admin') >= 0">{{ui.dictionary.invitations.followupDate}}</p>
                               <date-field :model="invitation.followUpDate" v-if="profile.roles.indexOf('admin') >= 0" :onDateSelect="selectFollowUpDate"></date-field>
                               </div><div class="invitation-quarter" v-if="profile.roles.indexOf('admin') >= 0">
                               <p class="label">{{ui.dictionary.invitations.officialName}}</p>
                               <div class="value">{{invitation.adminData.officialName}}<span v-show="!invitation.adminData.officialName">--</span></div>
                               <div class="line-spacer"></div>


                               <p class="label">{{ui.dictionary.invitations.officialType}}</p>
                               <div class="value">
                                   <span v-show="invitation.adminData.officialShortType">{{invitation.adminData.officialShortType}} &nbsp; <i class="cwi-info" :title="invitation.adminData.officialType"></i></span>
                                   <span v-show="!invitation.adminData.officialShortType">--</span>
                               </div>
                              <div class="line-spacer"></div>


                               <p class="label">{{ui.dictionary.invitations.officialStatus}}</p>
                               <div class="value">
                                   <span v-show="invitation.adminData.officialStatus !== false">{{ui.dictionary.invitations.statusPositive}}</span>
                                   <span v-show="invitation.adminData.officialStatus === false">{{ui.dictionary.invitations.statusNegative}} ({{formatDate(invitation.adminData.officialValidTo)}})</span>
                               </div>

                           </div>

                           <div v-show="profile.roles.indexOf('admin') >= 0">
                               <div class="working" v-show="ui.invitationUpdating"></div>
                               <button class="primary" v-show="!ui.invitationUpdating" v-on:click="updateInvitation(invitation)">{{ui.dictionary.invitations.saveNotes}}</button>
                           </div>

                       </div>

                   </div>
               </div>
               </section>

           </div>
       </section>
    </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            saving : false,
            showEmailError : false,
            showResendConfirm : false,
            langOptions : false,
            showCopied : false,
            search: '',
            invitationAlreadySentToVatError : false,
            invitationUpdating : false,
            options: false
        },
        invitations : [],
        langOptions : [],
        fields : {
            name : { value : '', valid: true, error : false },
            vat : { value : '', valid: true, error : false, alreadyInvited: false },
            email : {value : '', valid : true, error : false, ownEmail: false },
            reminders : false,
            language : DictionaryModel.getLanguage()
        },
        addConnectionType : 'see',
        currentInvite : null,
        currentDelete : null,
        currentLink : null,
        newEmail : null,
        permissions : UserModel.getCompanyUserInfo(),
        partner : PartnerModel.getPartner(),
        hasReminderEmails : false,
        sort : {
            param : 'date',
            direction : 'desc'
        },
        departments : [],
        company : CompanyModel.getCompany(),
        chosenCompany : null,
        profile : UserModel.profile(),
        lastDateSelected : null,
        tutorial : Tutorial,
        addButtonTutorialReady : false,
        invitationTutorialReady : false,
        existingInvitations : [],
        showSelectStatus: null,
        statusOptions: []
    });

    const methods = {
        init() {
            this.langOptions = LanguageCollection.getList();
            //EventBus.$on('companyErpChanged', this.getInvitations);
            //EventBus.$on('companyUserChanged', this.updatePermissions);
            document.addEventListener('contextChange', this.updatePermissions);

            if (this.permissions.company) {
                this.getInvitations(true);
            }

            if (this.$route.query && this.$route.query.new) {
                this.$modal.show(showNewInvitationsModal, {done: this.completeMultipleInvitations}, {height: 'auto'});
            }
            EventBus.$on('resendEmail', (email) => {
                this.changeReminderEmails(email)
            });
            EventBus.$on('changeEmailConfirm', (res) => {
                this.changeReminderEmails(res.email, res.params);
            });
            this.getExistingInvitations();
            document.addEventListener('clickAppBody', this.closeMenu);
        },

        getExistingInvitations() {
            var ic = new InvitationCollection();
            ic.checkUnique()
                .then(function (res) {
                    if (res._embedded && res._embedded.items) {
                        res._embedded.items.forEach(function (existingInvitation) {
                            if (existingInvitation.data && existingInvitation.data[0] && existingInvitation.data[0].value && existingInvitation.data[0].value.length > 0) {
                                this.existingInvitations.push(existingInvitation.data[0].value);
                            }
                        }.bind(this));
                    }
                }.bind(this));
        },

        showNewInvitations() {
            this.$modal.show(showNewInvitationsModal, {done: this.completeMultipleInvitations}, {height: 'auto'});
        },

        emailIsExpired(email) {
            if (!email || !email.expiredDate) {
                return false;
            }

            var now = moment().unix();
            var emailStamp = moment(email.expiredDate).unix();

            return now > emailStamp;
        },

        showInvitationAddTutorial() {
            if (this.tutorial.current && this.tutorial.current.name == 'connectionAdd' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.$modal.hide(showNewInvitationsModal);
                this.invitationTutorialReady = false;

                setTimeout(function() {
                    this.addButtonTutorialReady = true;
                }.bind(this), 2000);

                if (this.addButtonTutorialReady) {
                    return true;
                }
            }

            return false;
        },

        searchInvitations(invitations) {
            if (this.ui.search == '' || this.ui.search.length === 0 || !invitations || !invitations.slice) {
                return invitations;
            }

            var list = invitations.slice();
            return list.filter(function(invitation) {
                if ( (invitation.name && invitation.name.toLowerCase().indexOf(this.ui.search.toLowerCase()) >= 0)
                     || (invitation.vat && invitation.vat.indexOf(this.ui.search) >= 0)
                    ) {

                    return true;
                }

                return false;
            }.bind(this));
        },

        filterInvitations(invitations) {
            return invitations.filter(function(invitation) {
                if (invitation.department === null || (invitation.department && invitation.department.name)) {
                    return true;
                }

                return false;
            });
        },

        updatePermissions() {
            this.permissions = UserModel.getCompanyUserInfo();
            this.company = CompanyModel.getCompany();
            if (this.$route.path === '/account/invitations') {
                this.getInvitations(false);
            }
        },


        generateID(suffix) {
            return 'invitelink-' + suffix;
        },


        highlightTextbox(id) {
            var query = '#invitelink';

            if (id) {
                query = '#' + this.generateID(id);
            }
            var i = this.$refs.invitations.querySelector(query);

            i.select();
        },


        copyLink(id) {
            var scope = this;
            var query = '#invitelink';

            if (id) {
                query = '#' + this.generateID(id);
            }
            var i = this.$refs.invitations.querySelector(query);

            i.select();

            try {
                document.execCommand('copy');
                i.blur();
                this.ui.showCopied = true;

                setTimeout(function() {
                    scope.ui.showCopied = false;
                }, 4000);
            }
            catch (err) {
                alert(this.ui.dictionary.invitations.copyFail);
            }
        },


        changeSortBy(param) {
            if (this.sort.param == param && this.sort.direction == 'asc') {
                this.sort.direction = 'desc';
            } else if (this.sort.param == param && this.sort.direction == 'desc') {
                this.sort.direction = 'asc';
            } else {
                this.sort.param = param;
                this.sort.direction = 'asc';
            }
        },

        sortInvitations(invitations) {
            if (!invitations) {
                return [];
            }

            var list = invitations.slice();

            if (this.sort.param == 'date') {
                if (this.sort.direction == 'desc') {
                    return this.sortByDate(list).reverse();
                }

                return this.sortByDate(list);
            } else if (this.sort.param == 'followUpDate') {
                if (this.sort.direction == 'desc') {
                    return this.sortByFollowUpDate(list).reverse();
                }

                return this.sortByFollowUpDate(list);
            } else if (this.sort.param == 'name') {
                if (this.sort.direction == 'desc') {
                    return this.sortByName(list).reverse();
                }

                return this.sortByName(list);
            } else if (this.sort.param == 'status') {
                if (this.sort.direction == 'desc') {
                    return this.sortByStatus(list).reverse();
                }

                return this.sortByStatus(list);
            } else if (this.sort.param === 'creatorName') {
                if (this.sort.direction === 'desc') {
                    return this.sortByCreatorName(list).reverse();
                }

                return this.sortByCreatorName(list);
            } else if (this.sort.param === 'department') {
                if (this.sort.direction === 'desc') {
                    return this.sortByDepartment(list).reverse();
                }

                return this.sortByDepartment(list);
            } else {
                if (this.sort.direction == 'desc') {
                    return this.sortByParam(list, this.sort.param).reverse();
                }

                return this.sortByParam(list, this.sort.param);
            }
        },

        sortByStatus(list) {
            return list.sort(function(a, b) {
                var sa = 0;
                var sb = 0;

                if (a.converted && a.accepted && a.connected) {
                    sa = 3;
                } else if (a.converted && a.accepted && !a.connected) {
                    sa = 2;
                } else if (a.converted && !a.accepted) {
                    sa = 1;
                }


                if (b.converted && b.accepted && b.connected) {
                    sb = 3;
                } else if (b.converted && b.accepted && !b.connected) {
                    sb = 2;
                } else if (b.converted && !b.accepted) {
                    sb = 1;
                }

                return sa - sb;
            });
        },

        sortByName(list) {
            return list.sort(function(a, b) {
                if (!a.name && !b.name) {
                    return 0;
                } else if (!a.name) {
                    return 1;
                } else if (!b.name) {
                    return -1;
                }

                return a.name.toLocaleLowerCase()>b.name.toLocaleLowerCase()? 1 : (a.name.toLocaleLowerCase()<b.name.toLocaleLowerCase() ? -1 : 0);
            });
        },

        sortByCreatorName(list) {
            return list.sort(function(a, b) {
                const propertyNameA = a.adminData?.creatorName.toLocaleLowerCase();
                const propertyNameB = b.adminData?.creatorName.toLocaleLowerCase();
                if (propertyNameA > propertyNameB) {
                    return 1
                }
                if (propertyNameA < propertyNameB) {
                    return -1
                }
                return 0
            });
        },

        sortByDepartment(list) {
            return list.sort(function(a, b) {
                const propertyNameA = a.department?.name.toLocaleLowerCase();
                const propertyNameB = b.department?.name.toLocaleLowerCase();
                if (propertyNameA > propertyNameB) {
                    return 1
                }
                if (propertyNameA < propertyNameB) {
                    return -1
                }
                return 0
            });
        },

        sortByDate(list) {
            return list.sort(function(a, b) {
                var da = moment(a.created);
                var db = moment(b.created);

                return da.unix() - db.unix();
            });
        },

        sortByFollowUpDate(list) {
            return list.sort(function(a, b) {
                if (a.followUpDate === null) {
                    if (b.followUpDate == null) {
                        return 0;
                    }

                    return 1;
                }


                if (b.followUpDate === null) {
                    if (a.followUpDate === null) {
                        return 0;
                    }

                    return -1;
                }

                return moment(a.followUpDate).unix() - moment(b.followUpDate).unix();
            });
        },

        sortByParam(list, param) {
            return list.sort(function(a, b) {
                return a[param] - b[param];
            });
        },

        sortyByParam(list, param) {
            return list;
        },

        hasSentEmails() {
            if (!this.currentInvite || !this.currentInvite.emails || this.currentInvite.emails.length === 0) {
                return false;
            }

            var found = false;

            this.currentInvite.emails.forEach(function(email) {
                if (!email.delay && email.sent) {
                    found = true;
                }
            });
            return found;
        },

        hasReminders() {
            if (!this.currentInvite || !this.currentInvite.emails || this.currentInvite.emails.length === 0) {
                return false;
            }

            var found = false;

            this.currentInvite.emails.forEach(function(email) {
                if (email.delay) {
                    found = true;
                }
            });

            return found;
        },

        deleteReminder(email, confirmed) {
            if (!confirmed) {
                this.currentDelete = email;
                this.$modal.show('dialog', {
                    text: this.ui.dictionary.invitations.confirmDelete,
                    width: 600,
                    buttons: [
                        {
                            title: this.ui.dictionary.invitations.noDelete,
                            class: 'highlighted-text',
                        },
                        {
                            title: this.ui.dictionary.invitations.delete,
                            class: 'warning',
                            default: true,
                            handler: () => { this.deleteReminder(this.currentDelete, true); this.$modal.hide('dialog')}
                        }
                    ]
                });
                return false;
            }

            var scope = this;
            scope.ui.saving = true;

            var em = new InvitationEmailModel(this.currentInvite.id);
            em.deleteInvite(email.id)
                .then(function(res) {
                    if (true) {
                        scope.currentInvite.emails.forEach(function(e, i) {
                            if (e.id == email.id) {
                                scope.currentInvite.emails.splice(i, 1);
                            }
                        });
                    }

                    scope.ui.saving = false;
                    scope.$modal.hide('dialog');
                    scope.currentDelete = null;
                });
        },

        filterNormalEmails(emails) {
            if (!emails) {
                return [];
            }

            return emails.filter(function(email) {
                return email.delay === null;
            });
        },

        filterNotSentEmails(emails) {
            if (!emails) {
                return [];
            }

            return emails.filter(function(email) {
                return email.sent === false && email.link;
            });
        },

        sortReminderEmails(emails) {
            return emails.sort(function(a, b) {
                if (a.delay === 'P2D' || a.delay === 'P7D') {
                    return -1;
                }
                return 1;
            });
        },

        filterReminderEmails(emails) {
            if (!emails) {
                return [];
            }

            return emails.filter(function(email) {
                return email.delay !== null;
            });
        },

        formatDate(dateString, delay) {
            if (!dateString) {
                return dateString;
            }

            var momentDate = moment(dateString);

            if (delay && delay === 'P2D') {
                momentDate.add(2, 'days');
            } else if (delay && delay === 'P5D') {
                momentDate.add(5, 'days');
            } else if (delay && delay === 'P7D') {
                momentDate.add(7, 'days');
            } else if (delay && delay === 'P21D') {
                momentDate.add(21, 'days');
            }

            return momentDate.format(this.ui.dictionary.locale.displayFormat);
        },

        getInvitations(fromInit) {
            var scope = this;
            scope.ui.loading = true;
            scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();

            var ic = new InvitationCollection();
            ic.getInvitations(this.profile.roles.indexOf('admin') >= 0)
                .then(function(res) {
                    if (res.contents) {
                        scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
                        scope.invitations = res.contents;
                        scope.ui.loading = false;

                        scope.formatInvitations(res.contents);
                    }
                });
        },


        formatInvitations(invitations) {
            var scope = this;

            scope.departments = [];

            invitations.forEach(function(invitation) {
                /**
                 * Figure out departments
                 */
                if (invitation && invitation.department && invitation.department.name && scope.departments.indexOf(invitation.department.name) < 0) {
                    scope.departments.push(invitation.department.name);
                } else if (invitation && invitation.department === null && scope.departments.indexOf('_default') < 0) {
                    scope.departments.push('_default');
                }

                /**
                 * Use official phone number if no phone number exists
                 * (extra info for admin only)
                 */
                if (invitation && invitation.adminData && invitation.adminData.officialPhone && !invitation.adminData.phoneNumber) {
                    invitation.adminData.phoneNumber = invitation.adminData.officialPhone;
                }
            });

            scope.departments.sort();
            scope.departments.push(scope.departments.shift());
        },


        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        validateVat(force) {
            if (this.fields.vat.value.length == 0) {
                this.fields.vat.valid = true;
                return true;
            }

            this.fields.vat.alreadyInvited = this.invitationsVats.indexOf(this.fields.vat.value !== -1);

            if (force || !this.fields.vat.valid) {
                this.fields.vat.valid = Validator.vat(this.fields.vat.value);
            }

            return this.fields.vat.valid;
        },


        validateEmail(force) {
            if (force || !this.fields.email.valid) {
                this.fields.email.valid = Validator.email(this.fields.email.value);
            }

            return this.fields.email.valid;
        },

        createInvitation(linkOnly) {
            var scope = this;

            var im = new InvitationModel();
            im.createInvitation({
                name : scope.fields.name.value,
                type : scope.addConnectionType,
                language : scope.fields.language,
                vat : scope.fields.vat.value
            }).then(function(res) {
                if (res.id) {
                    res.adminData = {
                        creatorName : scope.profile.name,
                        erpProvider : null,
                        officialName : null,
                        officialPhone : null,
                        officialShortType : null,
                        officialStatus : null,
                        officialType : null,
                        officialValidTo : null,
                        phoneNumber : null,
                        privateNote : null
                    };
                    scope.invitations.push(res);
                    scope.formatInvitations(scope.invitations);

                    scope.fields.email.error = false;
                    var em = new InvitationEmailModel(res.id);
                    em.sendInvite(scope.fields.email.value, false, false, linkOnly)
                        .then(function(emailRes) {
                            if (emailRes.id) {
                                if (linkOnly) {
                                    scope.showLinkDialog(emailRes.link);
                                }

                                var rm1 = new InvitationEmailModel(res.id);
                                rm1.sendInvite(scope.fields.email.value, 'P7D', 'invite-reminder-1');

                                var rm2 = new InvitationEmailModel(res.id);
                                rm2.sendInvite(scope.fields.email.value, 'P21D', 'invite-reminder-2');


                                scope.$modal.hide(showNewInvitationsModal);
                                scope.fields.name.value = '';
                                scope.fields.vat.value = '';
                                scope.fields.email.value = '';
                                scope.fields.reminders = false;
                            } else {
                                //Handle failure
                                scope.currentInvite = res;
                                scope.currentInvite.emails = [];
                                scope.fields.email.error = true;
                                Raven.captureMessage('Created invitation, but failed to send email.');
                            }

                            scope.ui.saving = false;
                        });
                } else {

                    if (res.errors && res.errors[0] && res.errors[0].type == 'InvitationAlreadySentToVat') {
                        scope.ui.invitationAlreadySentToVatError = true;
                    }

                    scope.ui.saving = false;
                }
            });
        },



        showLinkDialog(link) {
            this.currentLink = link;
            this.$modal.show(copyLink, {shareLinkInfo: this.currentLink, withoutPin: true}, {height: 'auto'});
        },

        openInvite(invite) {
            var scope = this;
            this.currentInvite = invite;
            this.lastDateSelected = null;
            this.fields.email.value = '';
            this.fields.email.valid = true;
            if (!invite.emails) {
                var ec = new InviteEmailCollection(invite.id);
                ec.getEmails()
                    .then(function(res) {
                        Vue.set(invite, 'emails', res.contents);
                        Vue.set(scope.currentInvite, 'emails', res.contents);

                        //Get invitation link
                        if (res.contents.length > 0) {
                            res.contents.forEach(function(email) {
                                if (email.link) {
                                    scope.currentLink = email.link;
                                }
                            });
                        }
                    });
            } else {
                invite.emails.forEach(function(email) {
                    if (email.link) {
                        scope.currentLink = email.link;
                    }
                });
            }
        },


        toggleInvite(invite) {
            this.currentLink = null;
            this.ui.showCopied = false;

            if (this.currentInvite && this.currentInvite.id == invite.id) {
                this.currentInvite = null;
            } else {
                this.openInvite(invite);
            }
        },


        changeReminderEmails(newEmail, confirm) {
            if (!confirm) {
                var found = false;
                this.currentInvite.emails.forEach(function(email) {
                    if (!email.sent) {
                        found = true;
                    }
                });

                if (found) {
                    this.newEmail = newEmail;
                    this.$modal.show(changeEmailConfirm, {newEmail: newEmail }, {height: 'auto'});
                }

                return false;
            }

            this.currentInvite.emails.forEach(function(e, i) {
                if (!e.sent) {
                    Vue.set(this.currentInvite.emails[i], 'email', newEmail);

                    var em = new InvitationEmailModel(this.currentInvite.id);
                    em.changeEmail(e.id, newEmail);
                }
            }, this);

        },


        resendReminders(confirm) {
            if (!confirm) {
                this.$modal.show(resendReminders,  {fields: this.fields, currentInvite: this.currentInvite }, {height: 'auto'});
                this.fields.email.value = this.currentInvite.emails[0] ? this.currentInvite.emails[0].email : '';
                return false;
            }


            if (!this.validateEmail(true) || this.ui.saving) {
                return false;
            }

            var scope = this;
            //scope.ui.saving = true;

            var rm1 = new InvitationEmailModel(this.currentInvite.id);
            rm1.sendInvite(scope.fields.email.value, 'P7D', 'invite-reminder-1')
                .then(function(res) {
                    scope.currentInvite.emails.push(res);
                });

            var rm2 = new InvitationEmailModel(this.currentInvite.id);
            rm2.sendInvite(scope.fields.email.value, 'P21D', 'invite-reminder-2')
                .then(function(res) {
                    scope.currentInvite.emails.push(res);
                });

            scope.$modal.hide(resendReminders);
            //scope.ui.saving = false;
            scope.fields.email.value = '';
        },


        resendInvitation(confirm, linkOnly) {
            if (!confirm) {
                this.$modal.show(resendConfirm, {fields: this.fields, currentInvite: this.currentInvite, hasReminders: this.hasReminders}, {height: 'auto'});
                this.fields.email.value = this.currentInvite.emails[0] ? this.currentInvite.emails[0].email : '';
                return false;
            }

            if (!this.validateEmail(true) || this.ui.saving) {
                return false;
            }

            var scope = this;
            scope.ui.saving = true;

            var em = new InvitationEmailModel(this.currentInvite.id);

            em.sendInvite(this.fields.email.value, false, false, linkOnly)
                .then(function(res) {
                    if (res.id) {
                        scope.currentInvite.emails.push(res);
                        scope.fields.email.value = '';
                        scope.fields.email.error = false;
                        scope.fields.reminders = false;
                        scope.$modal.hide(resendConfirm);
                        scope.$modal.hide(showNewInvitationsModal);

                        if (scope.currentInvite.emails[0] && res.email != scope.currentInvite.emails[0].email) {
                            scope.changeReminderEmails(res.email);
                        } else if (!scope.hasReminders()) {
                            var rm1 = new InvitationEmailModel(res.id);
                            rm1.sendInvite(res.email, 'P7D', 'invite-reminder-1');

                            var rm2 = new InvitationEmailModel(res.id);
                            rm2.sendInvite(res.email, 'P21D', 'invite-reminder-2');
                        }
                    } else {
                        scope.fields.email.error = true;
                    }

                    scope.ui.saving = false;
                    scope.$modal.hide(showNewInvitationsModal);
                    scope.fields.name.value = '';
                    scope.fields.vat.value = '';
                    scope.fields.email.value = '';
                    scope.fields.reminders = false;
                });
        },

        declineResend() {
            this.fields.email.value = '';
            this.fields.email.error = false;
            this.fields.reminders = false;
            this.$modal.hide(resendConfirm);
            this.$modal.hide(resendReminders);
        },


        selectFollowUpDate(value, valid) {
            if (!valid) {
                return false;
            }

            this.lastDateSelected = value;
        },

        updateInvitation(invitation) {
            var scope = this;
            this.ui.invitationUpdating = true;
            invitation.privateNote = invitation.adminData.privateNote;
            invitation.phoneNumber = invitation.adminData.phoneNumber;
            invitation.erpProvider = invitation.adminData.erpProvider;

            if (this.lastDateSelected) {
                invitation.followUpDate = moment(this.lastDateSelected).format('YYYY-MM-DD');
            } else if (invitation.followUpDate) {
                invitation.followUpDate = moment(invitation.followUpDate).format('YYYY-MM-DD');
            }

            var im = new InvitationModel(invitation.id);
            im.update(invitation)
                .then(function(res) {
                    if (res.id) {
                        Toast.show(scope.ui.dictionary.invitations.notesSaved);
                    } else {
                        Toast.show(scope.ui.dictionary.invitations.notesError, 'warning');
                    }

                    scope.ui.invitationUpdating = false;
                });
        },

        completeMultipleInvitations() {
            this.getInvitations();
        },

        getCurrentStatus(invitation) {
            const supportConnection = Config.get('supportConnection');
            if (invitation.converted && invitation.accepted && invitation.connected && invitation.erp) {
                return this.ui.dictionary.invitations.converted;
            } else if (invitation.converted && invitation.accepted && invitation.connected && !invitation.erp) {
                return this.ui.dictionary.invitations.connected;
            } else if (invitation.converted && invitation.accepted && !invitation.connected) {
                return this.ui.dictionary.invitations.notConnected;
            } else if (invitation.converted && !invitation.accepted) {
                return this.ui.dictionary.invitations.declined;
            } else if (invitation.sent === false && !invitation.converted) {
                return this.ui.dictionary.invitations.bounced;
            } else if ((invitation.sent || invitation.sent === null) && !invitation.converted) {
                return this.ui.dictionary.invitations.pending;
            }
        },

        getOverrideStatus(invitation) {
            if (invitation.overrideStatus === 'converted') {
                return this.ui.dictionary.invitations.converted;
            } else if (invitation.overrideStatus === 'connected') {
                return this.ui.dictionary.invitations.connected;
            } else if (invitation.overrideStatus === 'declined') {
                return this.ui.dictionary.invitations.declined;
            } else if (invitation.overrideStatus === 'bounced') {
                return this.ui.dictionary.invitations.bounced;
            } else if (invitation.overrideStatus === 'pending') {
                return this.ui.dictionary.invitations.pending;
            } else if (invitation.overrideStatus === 'notSupported') {
                return this.ui.dictionary.invitations.notSupported;
            } else {
                return this.ui.dictionary.invitations.notConnected;
            }

        },

        changeStatus(status, invitation) {
            if (this.profile.roles.indexOf('admin') >= 0) {
                if (this.showSelectStatus === invitation.id && this.ui.options) {
                    this.ui.options = false;
                    return false
                } else {
                    event.stopPropagation();
                    this.ui.options = false;
                    this.statusOptions = [];
                    this.statusOptions.push({id: 0, value: this.ui.dictionary.invitations.pending, }, {id: 1, value: this.ui.dictionary.invitations.declined});
                    this.showSelectStatus = invitation.id;
                    this.ui.options = true;
                }
            }
        },

        setStatus(status, invitation) {
            this.ui.options = false;
            status.value === this.ui.dictionary.invitations.declined ? invitation.overrideStatus = (status.value).toLowerCase() : invitation.overrideStatus = null;
            this.updateInvitation(invitation);

        },

        isChangeStatus(status) {
            return this.ui.dictionary.invitations.pending === status || this.ui.dictionary.invitations.declined === status;
        },

        closeMenu() {
            this.ui.options = false;
        },

        getCreatorName(invitation) {
            return invitation?.creatorName;
        },

        getDepartmentName(invitation) {
            return invitation?.name;
        }
    };

    const watch = {
        'fields.email.value': function (newVal) {
            this.fields.email.ownEmail = Validator.isOwnEmail(newVal);
        }
    };

    const computed = {
      invitationsVats() {
         return this.invitations.map(invitation => invitation.vat);
      }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'date-field' : dateField,
            'tutorial-slide' : tutorialSlide
        },
        watch,
        computed,
        created() {
            this.init();
            EventBus.$on('updateListInvitations', update => {
                update ? this.init() : '';
            })
        },
        beforeDestroy() {
            EventBus.$off('updateListInvitations');
            document.removeEventListener('clickAppBody', this.closeMenu);
            //EventBus.$off('companyUserChanged');
        }
    });
