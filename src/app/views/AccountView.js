/* global localStorage */
import Vue from 'Vue'
import moment from 'moment'
import UserModel from 'models/UserModel'
import DictionaryModel from 'models/DictionaryModel'
import CompanyModel from 'models/CompanyModel'
import ContextModel from 'models/ContextModel'
import DateRangeModel from 'models/DateRangeModel'
import ErpModel from 'models/ErpModel'
import AssetModel from 'models/AssetModel'
import BudgetFileModel from 'models/BudgetFileModel'
import CompanyCollection from 'collections/CompanyCollection'
import companyList from 'elements/company-list'
import notifications from 'components/notifications.vue'
import tutorialSlide from 'elements/tutorial-slide'
import sessionTimeout from 'components/sessionTimeout.vue'
import sessionConstants from 'constants/session'
import manualRun from 'components/manualRun.vue'
import EventBus from 'services/EventBus'
import Tutorial from 'services/Tutorial'
import companyMutationTypes from 'store/companyMutationTypes'
import connectionsMutationTypes from 'store/connectionsMutationTypes'

const template = `
     <article class="app-layout" v-on:click="triggerClickAppBodyEvent()">
           <div v-if="showGlobalOverlay" class="app-overlay"></div>
           <section class="modal" :class="{ show : ui.showSessionTimeoutPopup }" v-close-on-escape-press="function() {ui.showSessionTimeoutPopup = false;}">
               <session-timeout @showPopup="ui.showSessionTimeoutPopup = true;" @hidePopup="ui.showSessionTimeoutPopup = false;"></session-timeout>
           </section>
           <div v-if="showTutorialOverlay()" class="tutorialOverlay">
               <div class="popup" v-show="showIntroPopup()">
                   <div class="right-text close"><i class="cwi-close" v-on:click.prevent="tutorial.end()"></i></div>
                   <div class="content">
                       <h1>{{ui.dictionary.onboarding.tutorialIntro.welcome}}</h1>
                       <p>{{ui.dictionary.onboarding.tutorialIntro.introText}}</p>
                       <div class="summary">
                           <h2>{{ui.dictionary.onboarding.tutorialIntro.summaryTitle}}</h2>

                           <div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/building.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryConnections}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/money-coins.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryPerformance}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/download.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryTrialBalance}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/overview.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryInvoices}}</p>
                           </div>

                       </div>
                       <div class="button-area"><button v-on:click="tutorial.next()">{{ui.dictionary.onboarding.tutorialIntro.summaryStart}}</button></div>
                   </div>
               </div>

               <div class="popup" v-show="showBusinessIntroPopup()">
                   <div class="right-text close"><i class="cwi-close" v-on:click.prevent="tutorial.end()"></i></div>
                   <div class="content">
                       <h1>{{ui.dictionary.onboarding.tutorialIntro.welcome}}</h1>
                       <p>{{ui.dictionary.onboarding.tutorialIntro.introText}}</p>
                       <div class="summary">
                           <h2>{{ui.dictionary.onboarding.tutorialIntro.summaryTitle}}</h2>

                           <div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/overview.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryDataOverview}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/building.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryCompanyUsers}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/money-coins.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryFinancialPerformance}}</p>
                           </div

                           ><div class="section">
                               <div class="icon"><img :src="getImage('/assets/img/tour/invoice.svg')"></div>
                               <p>{{ui.dictionary.onboarding.tutorialIntro.summaryNavigateInvoices}}</p>
                           </div>

                       </div>
                       <div class="button-area"><button v-on:click="tutorial.next()">{{ui.dictionary.onboarding.tutorialIntro.summaryStart}}</button></div>
                   </div>
               </div>
           </div>

           <div v-if="showTutorialOverlay() && !showIntroPopup() && !showBusinessIntroPopup()" class="tutorial-navigator" :class="{ semiTransparent : tutorial.current && tutorial.current.name == 'companyUsers'  }">
                   <div class="right-text close"><i class="cwi-close" v-on:click.prevent="tutorial.end(true)"></i></div>
                   <div class="previous"><button class="primary" v-on:click="tutorial.previous()">{{ui.dictionary.onboarding.previous}}</button></div
                   ><div class="steps">{{getSteps(ui.dictionary.onboarding.steps)}}</div
                   ><div class="next" v-if="tutorial.current.showNext"><button class="primary" v-on:click="tutorial.next()">{{ui.dictionary.onboarding.next}}</button></div
                  ><div class="next" v-if="tutorial.current.showEnd"><button class="accent" v-on:click="tutorial.end()">{{ui.dictionary.onboarding.finish}}</button></div>
           </div>

           <nav class="nav-bar" :class="{ expanded : expandNavMenu, show : ui.mobileMenu }">
               <section class="logo pointer" v-on:click="gotoOverview()"><img :src="getImage('/assets/img/logo/small-cw-logo.png')" /></section>

               <v-popover :open="showConnectionPopup()" placement="left" :popoverClass="popoverClass">
                   <section class="nav-links">
                       <div class="mobile block" v-on:click="ui.mobileMenu = false"><i class="cwi-left"></i> {{ui.dictionary.menu.close}}</div>
                       <div :class="{ active : isActive('overview') }" v-show="((companyList.length > 0 || singleCompany) && company && company.settings && !company.settings.hide_overview) || context" v-on:click="gotoOverview()"><i class="cwi-graph"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.overview}}</span></span></div>
                       <div :class="{ active : isActive('connections') }"  v-show="!context && (companyList.length > 0 || singleCompany) && (profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended' || permissions.companyConnectionAccess)" v-on:click="gotoConnections()"><i class="cwi-link"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.connections}}</span></span></div>
                       <div :class="{ active : isActive('summary') }"  v-show="(profile.roles.indexOf('admin') >= 0 || profile.roles.indexOf('accountant') >= 0) && !context" v-on:click="gotoSummary()"><i class="cwi-book"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.summary}}</span></span></div>
                       <div :class="{ active : isActive('warnings') }"  v-show="(profile.roles.indexOf('admin') >= 0 || profile.roles.indexOf('accountant') >= 0) && !context" v-on:click="gotoWarnings()"><i class="cwi-warning"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.warnings}}</span></span></div>
                       <div :class="{ active : isActive('stats') }"  v-show="(profile.roles.indexOf('admin') >= 0) || (profile.roles.indexOf('admin_overview') >= 0 && permissions && (permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended') && !context)" v-on:click="gotoStats()"><i class="cwi-stats"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.stats}}</span></span></div>
                       <div :class="{ active : isActive('company-stats') }"  v-show="profile.roles.indexOf('admin') >= 0 && !context" v-on:click="gotoCompanyStats()"><i class="cwi-stats-bars"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.menu.companyStats}}</span></span></div>
                       <div :class="{ active : isActive('manage') }" v-show="companyList.length > 0 || singleCompany" v-on:click="gotoManage()"><i class="cwi-dashboards"></i> <span class="mobile" :class="{ expanded : expandNavMenu }"><span :class="{ hide : hideMenuText }">{{ui.dictionary.overview.admin}}</span></span></div>
                       <div class="menu-toggler" :class="{ open :  rotateToggler }" v-on:click="toggleMenu()"><i class="cwi-right"></i></div>
                   </section>

                   <template slot="popover" v-if="showConnectionPopup()"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
               </v-popover>

           </nav>
           <nav class="top-bar">
               <section class="mobile-button">
                   <div class="menu" v-on:click="ui.mobileMenu = true"><i class="cwi-menu"></i></div>
                   <div class="logo pointer" v-on:click="gotoOverview()"><img :src="getImage('/assets/img/logo/small-cw-logo.png')" /></div>
               </section>

               <section class="manual-run-area" v-if="company && profile.roles && profile.roles.indexOf('manual_run_role') >= 0">
                   <manual-run :connection="context"></manual-run>
               </section>

               <section class="notification-area" v-show="!context && companyList.length > 0">
                   <notifications></notifications>
               </section>

               <v-popover :open="showCompanyPopup()" placement="right" offset="-200">
                   <section class="context-menu">
                       <div class="context-container">
                           <company-list v-show="!context" :ready="ui.companiesReady" :companies="companyList" :singleCompany="singleCompany" :readyCallback="setPermissions"></company-list>
                       </div>

<!--                        /**-->
<!--                         * Connection context pill-->
<!--                         */-->
                       <div class="context-container">
                       <div class="context-pill" v-if="context">
                           <span v-on:click="gotoCompanySettings()" class="name">
                               <span v-show="context.company.name">{{context.company.name}}</span>
                               <span v-show="!context.company.name">{{context.company.vat}}</span>
                               <i class="cwi-gear"></i>
                           </span>
                           <span v-on:click="closeContext()"><i class="cwi-close"></i></span>
                       </div>
                       <div v-if="context">
                           <small class="faded">
                               <span v-if="context.company.cvrCompanyInfo && context.company.cvrCompanyInfo.industryName">{{context.company.cvrCompanyInfo.industryName}}</span>
                               <span v-if="context.company.cvrCompanyInfo && context.company.cvrCompanyInfo.industryName && context.company.cvrCompanyInfo.industryCode">-</span>
                               <span v-if="context.company.cvrCompanyInfo && context.company.cvrCompanyInfo.industryCode">{{context.company.cvrCompanyInfo.industryCode}}</span>
                           </small>
                       </div>
                       </div>
                   </section>

                   <template slot="popover" v-if="showCompanyPopup()"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
               </v-popover>

               <v-popover :open="showProfilePopup()" placement="right">
                   <section
                        data-test-id="mainUserDropdown"
                        class="profile"
                        v-on:click.stop="ui.profileMenu = true"
                    >
                       <i class="cwi-user"></i>
                       <div class="menu" v-bind:class="{ show : ui.profileMenu }">
                            <a data-test-id="profileButton" v-on:click.stop="gotoProfile()"><div>{{ui.dictionary.menu.profile}}</div></a>
                            <a :href="ui.dictionary.menu.help.url" target="_blank" v-show="showHelpCenterLink"><div>{{ui.dictionary.menu.help.linkText}}</div></a>
                            <a v-on:click.stop="gotoHelp()" v-show="!showHelpCenterLink"><div>{{ui.dictionary.menu.help.linkText}}</div></a>
                            <a v-on:click.stop="restartRmTutorial()" v-show="!isHideList || (isHideList && !hasVatParam)"><div>{{ui.dictionary.menu.tutorial}}</div></a>
                           <router-link
                                data-test-id="logoutButton"
                                to="/logout"
                            ><div>{{ui.dictionary.menu.logout}}</div></router-link>
                       </div>
                   </section>
                   <template slot="popover" v-if="showProfilePopup()"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
               </v-popover>
           </nav>
           <section class="app-content">
               <router-view :key="id"></router-view>
           </section>
        </article>
    `;

const data = () => ({
    id: 1,
    ui: {
        dictionary: DictionaryModel.getHash(),
        profileMenu: false,
        mobileMenu: false,
        companiesReady: false,
        showSessionTimeoutPopup: false
    },
    companyList: [],
    profile: {},
    context: ContextModel.getContext(),
    permissions: ContextModel.getContext() || UserModel.getCompanyUserInfo(),
    singleCompany: JSON.parse(sessionStorage.getItem('singleCompany')) || false,
    appBodyEvent: null,
    isNordea: sessionStorage.getItem('hideConnectionList') ? true : false,
    tutorial: Tutorial,
    isHideList: sessionStorage.getItem('hideConnectionList') ? true : false,
    hasVatParam: false,
    popoverClass: 'connectionsOffset',
    expandNavMenu: false,
    hideMenuText: false,
    rotateToggler: false,
    company: CompanyModel.getCompany()
});

const methods = {
    init() {
        localStorage.removeItem('client');
        this.hasVatParam = (this.$route.query.vat !== undefined || this.$route.query.org_id !== undefined);

        var scope = this;

        /**
         * Click app body event
         */
        this.appBodyEvent = document.createEvent('Event');
        this.appBodyEvent.initEvent('clickAppBody', true, true);

        /**
         * Event listeners
         */
        EventBus.$on('newCompanyCreated', function () {
            scope.companyList.push(CompanyModel.getCompany());
            scope.permissions = UserModel.getCompanyUserInfo();
        });

        EventBus.$on('newCompanyCreatedRefresh', this.getCompanies);

        EventBus.$on('uiLanguageChanged', function () {
            this.$nextTick(() => {
                scope.ui.dictionary = DictionaryModel.getHash();
            });
        });

        EventBus.$on('contextChanged', this.handleContextChange);
        EventBus.$on('budgetFileChanged', this.budgetFileCheck);

        EventBus.$on('companyUserChanged', this.setPermissions);

        EventBus.$on('CompanySettingsSaved', function () {
            scope.detectCompanyNameChange();
        });

        EventBus.$on('endRMTutorial', function () {
            scope.ui.showOverlay = false;
        });

        EventBus.$on('addContextPillMock', this.addContextPillMock);

        EventBus.$on('removeContextPillMock', this.removeContextPillMock);

        EventBus.$on('companyDeleted', this.getCompanies);

        EventBus.$on('addMockPill', this.addContextPillMock);
        EventBus.$on('removeMockPill', this.removeContextPillMock);
        EventBus.$on('endTutorial', function () {
            this.removeContextPillMock();
            this.id++;
        }.bind(this));

        EventBus.$on('requestRMTutorial', this.restartRmTutorial);
        EventBus.$on('clearConnectionContext', this.clearContext);
        EventBus.$on('uiLanguageChanged', this.languageListener);
        //this.budgetFileCheck();
    },

    languageListener() {
        this.$forceUpdate();
    },

    handleContextChange() {
        this.context = ContextModel.getContext();
        this.budgetFileCheck();
    },

    budgetFileCheck() {
        BudgetFileModel.loadBudgetFile(this.context.id)
            .then(function (res) {
                if (res.errors) {
                    return false;
                }
                BudgetFileModel.setBudgetFile(res);
                //if (res.status != 'completed' && res.status != 'failed') {
                setTimeout(function () {
                    this.budgetFileCheck();
                }.bind(this), 30000);
                //}
            }.bind(this));
    },

    toggleMenu() {
        if (this.expandNavMenu) {
            this.expandNavMenu = false;
            this.hideMenuText = false;

            setTimeout(function () {
                this.rotateToggler = false;
            }.bind(this), 250);
        } else {
            this.hideMenuText = true;
            this.expandNavMenu = true;
            setTimeout(function () {
                this.hideMenuText = false;
            }.bind(this), 150);

            setTimeout(function () {
                this.rotateToggler = true;
            }.bind(this), 250);
        }
    },

    getImage(file) {
        return new AssetModel(file).path;
    },

    getSteps(string) {
        string = string.replace(':step', this.tutorial.state.step);
        string = string.replace(':total', this.tutorial.steps.length - 1);
        return string;
    },

    addContextPillMock() {
        this.context = {
            company: {
                name: 'ABC Company',
                vat: "230597350"
            }
        };
    },

    removeContextPillMock() {
        this.context = null;
    },

    showTutorialOverlay() {
        return this.tutorial.state.started && !this.tutorial.state.finished;
    },

    showIntroPopup() {
        return this.tutorial.current && this.tutorial.current.name == 'rmTutorialIntro' && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    showBusinessIntroPopup() {
        return this.tutorial.current && this.tutorial.current.name == 'businessTutorialIntro' && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    showInviteIntroPopup() {
        return this.tutorial.current && this.tutorial.current.name == 'inviteCompanyIntro' && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    showConnectionPopup() {
        if (this.tutorial.current && this.tutorial.current.name == 'overview') {
            this.popoverClass = 'overviewOffset';
        }
        return this.tutorial.current && (this.tutorial.current.name == 'connections' || this.tutorial.current.name == 'overview') && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    showProfilePopup() {
        return this.tutorial.current && this.tutorial.current.name == 'restartTutorial' && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    showCompanyPopup() {
        return this.tutorial.current && this.tutorial.current.name == 'companyMenu' && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    hasNeverDoneTutorial() {
        return !this.profile.settings.completedTutorial;
    },

    startRmTutorial(force) {
        /**
         * Begin RM tutorial
         */
        if (this.profile.roles.indexOf('accountant') >= 0 && (this.hasNeverDoneTutorial() || force)) {
            this.ui.showOverlay = true;
            Tutorial.registerRouter(this.$router);

            if (this.isHideList && !this.hasVatParam) {
                Tutorial.start('no-list');
            } else {
                Tutorial.start('rm');
            }

            DateRangeModel.setFromDate(moment('2017-01-01').toDate());
            DateRangeModel.setToDate(moment('2017-12-31').toDate());
            DateRangeModel.lockDate();
        } else if (this.profile.roles.indexOf('accountant') < 0 && force && this.permissions && this.permissions.owner) {
            if (this.$route.path == '/account/overview') {
                this.$router.push('/account/connections/all');
            }

            this.ui.showOverlay = true;
            Tutorial.registerRouter(this.$router);

            if (this.company && this.company.settings && this.company.settings.hide_overview) {
                Tutorial.start('business-no-overview');
            } else {
                Tutorial.start('business');
            }


            DateRangeModel.setFromDate(moment('2017-01-01').toDate());
            DateRangeModel.setToDate(moment('2017-12-31').toDate());
            DateRangeModel.lockDate();
        }
    },

    restartRmTutorial() {
        setTimeout(function () {
            this.startRmTutorial(true);
        }.bind(this), 500);
    },

    detectCompanyNameChange() {
        var scope = this;

        var newCompany = CompanyModel.getCompany();

        this.companyList.forEach(function (company, index) {
            if (company.id == newCompany.id) {
                scope.companyList[index] = newCompany;
            }
        });
    },


    setPermissions() {
        this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
        this.company = CompanyModel.getCompany();
        this.isNordea = sessionStorage.getItem('hideConnectionList') ? true : (this.$route.query.hide_list ? true : false);
        this.isHideList = this.isNordea;
        this.hasVatParam = (this.$route.query.vat !== undefined || this.$route.query.org_id !== undefined);

        if (this.isNordea && !this.$route.query.vat && !this.$route.query.org_id) {
            ContextModel.forgetContext();
            this.context = null;
            if (this.$route.path == '/account/overview') {
                this.$router.push('/account/connections/all');
            }
            //this.closeContext(true);
            //this.gotoConnections(true);
        }
    },

    /**
     * Trigger clickAppBody event
     */
    triggerClickAppBodyEvent() {
        EventBus.$emit('click');
        EventBus.$emit('clickAppBody');
        document.dispatchEvent(this.appBodyEvent);
        this.ui.profileMenu = false;
    },
    /**
     * Check if user is authenticated
     */
    checkUser() {
        if (!UserModel.authenticated()) {
            this.$router.push('/login?p=' + this.$route.path);
            return false;
        }

        this.profile = UserModel.profile();

        if (!this.profile['agreed-to-latest-terms-of-service']) {
            this.$router.push('/new-tos');
            return false;
        }


        /**
         * Start relationship manager tutorial
         */
        this.startRmTutorial();
    },
    /**
     * Get list of companies
     */
    getCompanies() {
        var scope = this;
        this.companyList = [];
        this.ui.companiesReady = false;

        if (UserModel.profile().company || scope.singleCompany) {
            setTimeout(function () {
                scope.singleCompany = CompanyModel.getCompany();
                sessionStorage.setItem('singleCompany', JSON.stringify(CompanyModel.getCompany()));
                scope.ui.companiesReady = true;
            }, 100);

            return false;
        }

        var companies = new CompanyCollection({ type: '_all' });

        companies.getCompanies()
            .then(function (list) {
                scope.ui.companiesReady = true;
                scope.companyList = list.contents;
                EventBus.$emit('companiesLoaded');

                if (scope.companyList && scope.companyList.length === 0) {
                    EventBus.$emit('noCompaniesExist');
                    scope.$router.push('/account/create-company');
                }
            });
    },

    /**
     * Go to Overview
     */
    gotoOverview() {
        this.ui.mobileMenu = false;
        this.$store.dispatch('setRedirectToOverview', true);
        this.$store.dispatch('setRedirectToConnections', false);
        if ((this.companyList.length > 0 || this.singleCompany) && this.company && this.company.settings && !this.company.settings.hide_overview) {
            this.$router.push('/account/overview/generaloverview');
        } else {
            this.$router.push('/account/connections/all');
        }
    },

    gotoManage() {
        this.$router.push('/account/dashboards');
    },

    /**
     * Go to Connections
     */
    gotoConnections(flag) {
        this.ui.mobileMenu = false;
        var hasPortfolio = this.permissions && this.permissions.settings && this.permissions.settings.portfolio && this.permissions.settings.portfolio.length > 0;
        let lastConnectionView = this.getLastConnectionView;
        if (flag) {
            this.$router.push('/account/connections/all?r=1');
            this.$store.dispatch('setLastConnectionView', {
                type: 'all'
            });
        } else if (hasPortfolio && (!lastConnectionView || lastConnectionView != 'portfolio')) {
            this.$router.push('/account/connections/portfolio');
            this.$store.dispatch('setLastConnectionView', {
                type: 'portfolio'
            });
        } else {
            this.$router.push('/account/connections/all');
            this.$store.dispatch('setLastConnectionView', {
                type: 'all'
            });
        }
    },

    /**
     * Go to portfolio
     */
    gotoPortfolio() {
        this.$router.push('/account/connections/portfolio?r=1');
    },

    /**
     * Go to Summary
     */
    gotoSummary() {
        this.ui.mobileMenu = false;
        this.$router.push('/account/summary');
    },

    /**
     * Go to Early Warnings
     */
    gotoWarnings() {
        this.ui.mobileMenu = false;
        this.$router.push('/account/warnings');
    },

    /**
     * Go to profile
     */
    gotoProfile() {
        this.ui.profileMenu = false;
        this.$router.push('/account/profile/info');
    },

    /**
     * Go to help section
     */
    gotoHelp() {
        this.ui.profileMenu = false;
        this.$router.push('/account/help');
    },

    /**
     * Go to company context
     */
    gotoCompanySettings() {
        this.$router.push('/account/company/settings');
        EventBus.$emit('selectCompany', true);
    },


    gotoStats() {
        this.$router.push('/account/stats');
    },

    gotoCompanyStats() {
        this.$router.push('/account/company-stats');
    },

    /**
     * Close context
     */
    closeContext(skipEmits) {
        if (ContextModel.getContext()) {
            var fromSummary = ContextModel.getContext().fromSummary;
            var fromPortfolio = ContextModel.getContext().fromPortfolio;
        }

        if (fromSummary) {
            this.gotoSummary();
        } else if (fromPortfolio) {
            this.gotoPortfolio();
        } else {
            this.gotoConnections(true);
        }


        if (this.$route.path == '/account/company/mapping') {
            return false;
        }

        this.clearContext(skipEmits);
        BudgetFileModel.forgetBudgetFile();
    },


    clearContext(skipEmits) {
        ContextModel.forgetContext();
        this.context = null;

        if (!skipEmits) {
            EventBus.$emit('connectionContextClosed');
        }
    },


    /**
     * Which nav section is active
     */
    isActive(section) {
        var parts = this.$route.path.split('/');

        if (parts[2] && parts[2] == section) {
            return true;
        } else if (parts[2] && parts[2] == 'sales-potential' && section == 'connections') {
            return true;
        } else if (parts[2] && parts[2] == 'invitations' && section == 'connections') {
            return true;
        } else if (parts[2] && parts[2] == 'dashboards' && section == 'manage') {
            return true;
        } else if (parts[2] && parts[2] == 'kpis' && section == 'manage') {
            return true;
        }

        return false;
    }
};

const computed = {
    showGlobalOverlay() {
        return this.$store.getters.showOverlay;
    },
    showHelpCenterLink() {
        return DictionaryModel.getLanguage() === 'da-DK'
    },
    isInConnectionsRoute() {
        return this.$route.path.indexOf('/account/connections') == 0;
    },
    getLastConnectionView() {
        return this.$store.getters.lastConnectionView;
    },
};

export default Vue.extend({
    name: 'AccountView',
    template,
    data,
    methods,
    computed,
    components: {
        'company-list': companyList,
        'notifications': notifications,
        'tutorial-slide': tutorialSlide,
        'manual-run': manualRun,
        'session-timeout': sessionTimeout
    },
    created() {
        this.init();
        this.checkUser();
        this.getCompanies();
    },
    beforeDestroy() {
        EventBus.$off('newCompanyCreated');
        EventBus.$off('uiLanguageChanged', this.languageListener);
        EventBus.$off('contextChanged');
        EventBus.$off('companyUserChanged');
    }
});
