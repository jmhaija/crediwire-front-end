    import Vue from 'Vue'
    import moment from 'moment'
    import StatsCollection from 'collections/StatsCollection'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import DateRangeModel from 'models/DateRangeModel'
    import dateField from 'elements/date-field'
    import statsTable from 'elements/stats-table'
    import setGoalsDialog from 'elements/modals/set-goals-dialog'
    import EventBus from 'services/EventBus'

    const template = `
        <article class="connections">
           <h1>{{ui.dictionary.stats.title}}</h1>
    
         <div class="working" v-show="ui.loading"></div>
           <section v-if="!ui.loading">
               <div class="stats-bar">
                   <div class="inline-daterange">
                       <date-field :onDateSelect="setFromDate" :max="date.toDate" :model="date.fromDate"></date-field>
                       &#8594;
                       <date-field :onDateSelect="setToDate" :max="date.now" :model="date.toDate"></date-field>
                       <button class="primary" v-on:click="loadData()">Go</button>
                   </div>
               </div>
    
    
    
               <div>
                   <div v-show="departments.length === 0">
                       {{ui.dictionary.stats.noData}}
                   </div>
                   <table class="stats-table" v-if="departments.length > 0">
                       <thead>
                           <tr class="primary-headings">
                               <th>{{ui.dictionary.stats.department}}</th>
                               <th colspan="2">{{ui.dictionary.stats.sent}}</th>
                               <th colspan="4">{{ui.dictionary.stats.converted}}</th>
                               <th colspan="4">{{ui.dictionary.stats.logins}}</th>
                           </tr>
                           <tr class="secondary-headings">
                               <th>&nbsp;</th>
                               <th>{{ui.dictionary.stats.total}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>%</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>#</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>{{ui.dictionary.stats.total}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>{{ui.dictionary.stats.perWeek}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr class="companyTotal">
                               <td>{{ui.dictionary.stats.total}}</td>
                               <td>{{totals.sent}}</td>
                               <td>{{getGoalValue(totals.goals.invitations)}}</td> <!--//Sent goal-->
                               <td>{{getConversionPercent(totals.converted, totals.sent)}}%</td>
                               <td>{{getGoalValuePercent(totals.goals.conversions, totals.goals.invitations)}}</td> <!--//Converted % goal-->
                               <td>{{totals.converted}}</td>
                               <td>{{getGoalValue(totals.goals.conversions)}}</td> <!--//Converted # goal-->
                               <td>{{totals.logins}}</td>
                               <td>{{getGoalValue(totals.goals.logins)}}</td> <!--//Total logins goal-->
                               <td>{{getLoginsPerWeek(totals.logins)}}</td>
                               <td>{{totals.goals.logins}}</td> <!--//Per week logins goal-->
                           </tr>
                       </tbody>
                   </table>
    
    
                   <table class="stats-table" v-if="departments.length > 0" v-for="(department, index) in departments">
                       <tbody>
                           <tr v-show="department.parentDepts.length == 0" v-on:click="drilldownDepartment(department)" :class="{ active : currentDepartment == department.key }">
                               <td>
                                   <span v-show="department.childDepts.length > 0" style="width: 15px; display: inline-block;">
                                       <span v-show="!department.openChildren">+</span>
                                       <span v-show="department.openChildren">&ndash;</span>
                                   </span>
                                   <span v-show="!department.key">{{ui.dictionary.stats.noDepartment}}</span>
                                   <span v-show="department.key" :title="department.key">{{department.key}}</span>
                               </td>
                               <td>{{department.invitations_sent}}</td>
                               <td>{{getGoalValue(department.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                               <td>{{getConversionPercent(department.invitations_converted, department.invitations_sent)}}%</td>
                               <td>{{getGoalValuePercent(department.goals.conversions.value_per_company_user, department.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                               <td>{{department.invitations_converted}}</td>
                               <td>{{getGoalValue(department.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                               <td>{{department.logins}}</td>
                               <td>{{getGoalValue(department.goals.logins.value_per_company_user)}}</td> <!--//Total logins goal-->
                               <td>{{getLoginsPerWeek(department.logins)}}</td>
                               <td>{{department.goals.logins.value_per_company_user}}</td> <!--//Per week logins goal-->
                           </tr>
                           <template v-for="(subDept1, index) in department.childDepts">
                               <tr v-show="department.openChildren" v-on:click="drilldownDepartment(subDept1)" :class="{ active : currentDepartment == subDept1.key }">
                                   <td>
                                       &nbsp;&nbsp;&nbsp;&nbsp;
                                       <span v-show="subDept1.childDepts.length > 0" style="width: 15px; display: inline-block;">
                                           <span v-show="!subDept1.openChildren">+</span>
                                           <span v-show="subDept1.openChildren">&ndash;</span>
                                       </span>
                                       <span v-show="subDept1.childDepts.length == 0">
                                           &nbsp;&nbsp;&nbsp;&nbsp;
                                       </span>
                                       <span v-show="!subDept1.key">{{ui.dictionary.stats.noDepartment}}</span>
                                       <span v-show="subDept1.key" :title="subDept1.key">{{subDept1.key}}</span>
                                   </td>
                                   <td>{{subDept1.invitations_sent}}</td>
                                   <td>{{getGoalValue(subDept1.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                                   <td>{{getConversionPercent(subDept1.invitations_converted, subDept1.invitations_sent)}}%</td>
                                   <td>{{getGoalValuePercent(subDept1.goals.conversions.value_per_company_user, subDept1.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                                   <td>{{subDept1.invitations_converted}}</td>
                                   <td>{{getGoalValue(subDept1.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                                   <td>{{subDept1.logins}}</td>
                                   <td>{{getGoalValue(subDept1.goals.logins.value_per_company_user)}}</td> <!--//Total logins goal-->
                                   <td>{{getLoginsPerWeek(subDept1.logins)}}</td>
                                   <td>{{subDept1.goals.logins.value_per_company_user}}</td> <!--//Per week logins goal-->
                               </tr>
                               <template v-for="(subDept2, index) in subDept1.childDepts">
                                   <tr v-show="subDept1.openChildren" v-on:click="drilldownDepartment(subDept2)" :class="{ active : currentDepartment == subDept2.key }">
                                       <td>
                                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                           <span v-show="subDept2.childDepts.length > 0" style="width: 15px; display: inline-block;">
                                               <span v-show="!subDept2.openChildren">+</span>
                                               <span v-show="subDept2.openChildren">&ndash;</span>
                                           </span>
                                           <span v-show="subDept2.childDepts.length == 0">
                                               &nbsp;&nbsp;&nbsp;&nbsp;
                                           </span>
                                           <span v-show="!subDept2.key">{{ui.dictionary.stats.noDepartment}}</span>
                                           <span v-show="subDept2.key" :title="subDept2.key">{{subDept2.key}}</span>
                                       </td>
                                       <td>{{subDept2.invitations_sent}}</td>
                                       <td>{{getGoalValue(subDept2.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                                       <td>{{getConversionPercent(subDept2.invitations_converted, subDept2.invitations_sent)}}%</td>
                                       <td>{{getGoalValuePercent(subDept2.goals.conversions.value_per_company_user, subDept2.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                                       <td>{{subDept2.invitations_converted}}</td>
                                       <td>{{getGoalValue(subDept2.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                                       <td>{{subDept2.logins}}</td>
                                       <td>{{getGoalValue(subDept2.goals.logins.value_per_company_user)}}</td> <!--//Total logins goal-->
                                       <td>{{getLoginsPerWeek(subDept2.logins)}}</td>
                                       <td>{{subDept2.goals.logins.value_per_company_user}}</td> <!--//Per week logins goal-->
                                   </tr>
                                   <template v-for="(subDept3, index) in subDept2.childDepts">
                                       <tr v-show="subDept2.openChildren" v-on:click="drilldownDepartment(subDept3)" :class="{ active : currentDepartment == subDept3.key }">
                                           <td>
                                               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                               <span v-show="subDept3.childDepts.length > 0" style="width: 15px; display: inline-block;">
                                                   <span v-show="!subDept3.openChildren">+</span>
                                                   <span v-show="subDept3.openChildren">&ndash;</span>
                                               </span>
                                               <span v-show="subDept3.childDepts.length == 0">
                                                   &nbsp;&nbsp;&nbsp;&nbsp;
                                               </span>
                                               <span v-show="!subDept3.key">{{ui.dictionary.stats.noDepartment}}</span>
                                               <span v-show="subDept3.key" :title="subDept3.key">{{subDept3.key}}</span>
                                           </td>
                                           <td>{{subDept3.invitations_sent}}</td>
                                           <td>{{getGoalValue(subDept3.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                                           <td>{{getConversionPercent(subDept3.invitations_converted, subDept3.invitations_sent)}}%</td>
                                           <td>{{getGoalValuePercent(subDept3.goals.conversions.value_per_company_user, subDept3.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                                           <td>{{subDept3.invitations_converted}}</td>
                                           <td>{{getGoalValue(subDept3.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                                           <td>{{subDept3.logins}}</td>
                                           <td>{{getGoalValue(subDept3.goals.logins.value_per_company_user)}}</td> <!--//Total logins goal-->
                                           <td>{{getLoginsPerWeek(subDept3.logins)}}</td>
                                           <td>{{subDept3.goals.logins.value_per_company_user}}</td> <!--//Per week logins goal-->
                                       </tr>
                                       <template v-for="(subDept4, index) in subDept3.childDepts">
                                           <tr v-show="subDept3.openChildren" v-on:click="drilldownDepartment(subDept4)" :class="{ active : currentDepartment == subDept4.key }">
                                               <td>
                                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                   <span v-show="subDept4.childDepts.length > 0" style="width: 15px; display: inline-block;">
                                                       <span v-show="!subDept4.openChildren">+</span>
                                                       <span v-show="subDept4.openChildren">&ndash;</span>
                                                   </span>
                                                   <span v-show="subDept4.childDepts.length == 0">
                                                       &nbsp;&nbsp;&nbsp;&nbsp;
                                                   </span>
                                                   <span v-show="!subDept4.key">{{ui.dictionary.stats.noDepartment}}</span>
                                                   <span v-show="subDept4.key" :title="subDept4.key">{{subDept4.key}}</span>
                                               </td>
                                               <td>{{subDept4.invitations_sent}}</td>
                                               <td>{{getGoalValue(subDept4.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                                               <td>{{getConversionPercent(subDept4.invitations_converted, subDept4.invitations_sent)}}%</td>
                                               <td>{{getGoalValuePercent(subDept4.goals.conversions.value_per_company_user, subDept4.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                                               <td>{{subDept4.invitations_converted}}</td>
                                               <td>{{getGoalValue(subDept4.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                                               <td>{{subDept4.logins}}</td>
                                               <td>{{getGoalValue(subDept4.goals.logins.value_per_company_user)}}</td> <!--//Total logins goal-->
                                               <td>{{getLoginsPerWeek(subDept4.logins)}}</td>
                                               <td>{{subDept4.goals.logins.value_per_company_user}}</td> <!--//Per week logins goal-->
                                           </tr>
                                       </template>
                                   </template>
                               </template>
                           </template>
                       </tbody>
                   </table>
    
               </div>
    
               <div class="line-spacer"></div>
               <div class="line-spacer"></div>
    
    
    
    
               <span id="stats-scroll-marker"></span>
               <div v-show="ui.showDeptDetails" class="department-breakdown">
    
                   <div class="float-right">
                       <button class="primary" v-on:click="showGoalsDialog">{{ui.dictionary.stats.setGoals}}</button>
                   </div>
                   <h3 v-show="!currentDepartment">{{ui.dictionary.stats.noDepartment}}</h3>
                   <h3 v-show="currentDepartment">{{currentDepartment}}</h3>
    
    
                   <div v-show="ui.deptLoading">
                       <div class="working"></div>
                   </div>
                   <div v-show="currentUsers.length === 0 && !ui.deptLoading">
                       {{getDeptName(ui.dictionary.stats.noUserData)}}
                   </div>
                   <table class="stats-table" v-if="currentUsers.length > 0 && !ui.deptLoading">
                        <thead>
                           <tr class="primary-headings">
                               <th>{{ui.dictionary.stats.companyUser}}</th>
                               <th colspan="2">{{ui.dictionary.stats.sent}}</th>
                               <th colspan="4">{{ui.dictionary.stats.converted}}</th>
                               <th colspan="4">{{ui.dictionary.stats.logins}}</th>
                           </tr>
                           <tr class="secondary-headings">
                               <th>&nbsp;</th>
                               <th>{{ui.dictionary.stats.total}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>%</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>#</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>{{ui.dictionary.stats.total}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                               <th>{{ui.dictionary.stats.perWeek}}</th>
                               <th class="goal">{{ui.dictionary.stats.goal}}</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr class="companyTotal">
                               <td>{{ui.dictionary.stats.total}}</td>
                               <td>{{totals.sentUsers}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.invitations.value_per_company_user)}}</td> <!--//Sent goal-->
                               <td>{{getConversionPercent(totals.convertedUsers, totals.sentUsers)}}%</td>
                               <td>{{getGoalValuePercent(currentDepartmentObj.goals.conversions.value_per_company_user, currentDepartmentObj.goals.invitations.value_per_company_user)}}</td> <!--//Converted % goal-->
                               <td>{{totals.convertedUsers}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.conversions.value_per_company_user)}}</td> <!--//Converted # goal-->
                               <td>{{totals.loginsUsers}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.logins.value_per_company_user)}}</td> <!--//Logins total goal-->
                               <td>{{getLoginsPerWeek(totals.loginsUsers)}}</td>
                               <td>{{currentDepartmentObj.goals.logins.value_per_company_user}}</td> <!--//Logins per week goal-->
                           </tr>
                           <tr v-for="(user, index) in currentUsers">
                               <td>{{user.key}}</td>
                               <td>{{user.invitations_sent}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.invitations.value)}}</td> <!--//Sent goal-->
                               <td>{{getConversionPercent(user.invitations_converted, user.invitations_sent)}}%</td>
                               <td>{{getGoalValuePercent(currentDepartmentObj.goals.conversions.value, currentDepartmentObj.goals.invitations.value)}}</td> <!--//Converted % goal-->
                               <td>{{user.invitations_converted}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.conversions.value)}}</td> <!--//Converted # goal-->
                               <td>{{user.logins}}</td>
                               <td>{{getGoalValue(currentDepartmentObj.goals.logins.value)}}</td> <!--//Logins total goal-->
                               <td>{{getLoginsPerWeek(user.logins)}}</td>
                               <td>{{currentDepartmentObj.goals.logins.value}}</td> <!--//Logins per week goal-->
                           </tr>
                       </tbody>
                   </table>
               </div>
    
    
    
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            deptLoading : false,
            showDeptDetails : false,
            section : 'departments',
            intervalOptions : false,
            goalsDialog : false
        },
        grouping : 'week',
        departments : [],
        users : [],
        goals : [],
        currentDepartment : false,
        currentDepartmentObj : false,
        currentGoal : false,
        context : ContextModel.getContext(),
        company : CompanyModel.getCompany(),
        totals : {
            sent: 0,
            converted: 0,
            logins: 0
        },
        currentUsers : [],
        date : {
            fromDate : null,
            from : null,
            fromValid : true,
            toDate : null,
            to : null,
            toValid : true,
            now : new Date()
        },
        refresh : 0
    });


    const methods = {
        init() {
            //EventBus.$on('companyErpChanged', this.loadData);
            EventBus.$on('companyUserChanged', this.loadData);

            this.date.toDate = new Date();
            this.date.to = moment(this.date.toDate).format('YYYY-MM-DD');
            this.date.fromDate = new Date();
            this.date.fromDate.setMonth(this.date.fromDate.getMonth() - 1);
            this.date.from = moment(this.date.fromDate).format('YYYY-MM-DD');

            this.loadData();
        },


        getGoalValue(goal) {
            if (!goal) {
                return '--';
            }

            var days = DateRangeModel.delta('days', this.date.from, this.date.to);

            if (!days || days === 0) {
                return 0;
            }

            return Math.round((goal / 7) * days);
        },

        getGoalValuePercent(goal, total) {
            if (total === 0 || !total) {
                return '--';
            }

            return Math.round( (this.getGoalValue(goal) / this.getGoalValue(total) ) * 100) + '%';
        },


        setGoals(department_id, goals) {
            //Invitations
            if (goals.invitations.id) {
                StatsCollection.updateGoal(goals.invitations.id, {
                    id : goals.invitations.id,
                    value : goals.invitations.value
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            } else {
                StatsCollection.createGoal({
                    key : 'invitations',
                    value : goals.invitations.value,
                    department : department_id
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            }


            //Conversions
            if (goals.conversions.id) {
                StatsCollection.updateGoal(goals.conversions.id, {
                    id : goals.conversions.id,
                    value : goals.conversions.value
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            } else {
                StatsCollection.createGoal({
                    key : 'conversions',
                    value : goals.conversions.value,
                    department : department_id
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            }


            //Logins
            if (goals.logins.id) {
                StatsCollection.updateGoal(goals.logins.id, {
                    id : goals.logins.id,
                    value : goals.logins.value
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            } else {
                StatsCollection.createGoal({
                    key : 'logins',
                    value : goals.logins.value,
                    department : department_id
                }).then(function (res) {
                    this.calculateGoalTotals(res);
                }.bind(this));
            }

            this.ui.goalsDialog = false;
        },


        calculateGoalTotals(goal) {
            var scope = this;

            scope.totals.goals.invitations = 0;
            scope.totals.goals.conversions = 0;
            scope.totals.goals.logins = 0;
            scope.totals.goals.loginsPerWeek = 0;

            scope.departments.forEach(function(dept) {
                if (dept.id == 'null') {
                    dept.id = null;
                }

                if (goal.department_id === dept.id) {
                    dept.goals[goal.key].id = goal.id;
                    dept.goals[goal.key].value = goal.value;
                    dept.goals[goal.key].value_per_company_user = goal.value_per_company_user;
                }

                scope.totals.goals.invitations += dept.goals.invitations.value_per_company_user;
                scope.totals.goals.conversions += dept.goals.conversions.value_per_company_user;
                scope.totals.goals.logins += dept.goals.logins.value_per_company_user;
                scope.totals.goals.loginsPerWeek += dept.goals.logins.value;
            });
        },

        setFromDate(value, valid) {
            this.date.fromDate = value;
            this.date.fromValid = valid;
            if (value) {
                this.date.from = moment(value).format('YYYY-MM-DD');
            }
        },


        setToDate(value, valid) {
            this.date.toDate = value;
            this.date.toValid = valid;
            if (value) {
                this.date.to = moment(value).format('YYYY-MM-DD');
            }
        },


        loadData() {
            if (!this.date.fromValid || !this.date.toValid) {
                return false;
            }

            this.company = CompanyModel.getCompany();

            var scope = this;
            scope.ui.showDeptDetails = false;
            scope.currentDepartment = false;
            this.ui.loading = true;
            scope.departments = [];
            scope.users = [];
            scope.currentUsers = [];
            scope.totals = {
                sent: 0,
                converted: 0,
                logins: 0,
                sentUsers: 0,
                convertedUsers: 0,
                loginsUsers: 0,
                goals : {
                    invitations : 0,
                    conversions : 0,
                    logins : 0,
                    loginsPerWeek : 0
                }
            };

            StatsCollection.getDepartmentsAll(this.date.from, this.date.to)
                .then(function(res) {
                    if (res._embedded && res._embedded.items && res._embedded.items[0] && res._embedded.items[0]._embedded && res._embedded.items[0]._embedded.statistics) {
                        scope.departments = res._embedded.items[0]._embedded.statistics;

                        StatsCollection.getGoals()
                            .then(function(res) {
                                if (res._embedded && res._embedded.items) {
                                    scope.goals = res._embedded.items;
                                } else {
                                    scope.goals = [];
                                }

                                var deptsByID = {};
                                scope.departments.forEach(function (dept) {
                                    deptsByID[dept.id] = dept;
                                });

                                var includeDepartments = [];
                                scope.departments.forEach(function(dept) {
                                    if (dept.id == 'null') {
                                        dept.id = null;
                                    }


                                    dept.goals = {
                                        invitations : {
                                            id : null,
                                            value : 0,
                                            value_per_company_user : 0
                                        },
                                        conversions : {
                                            id : null,
                                            value : 0,
                                            value_per_company_user : 0
                                        },
                                        logins : {
                                            id : null,
                                            value : 0,
                                            value_per_company_user : 0
                                        }
                                    };

                                    scope.goals.forEach(function(goal) {
                                        if (goal.department_id === dept.id) {
                                            dept.goals[goal.key].id = goal.id;
                                            dept.goals[goal.key].value = goal.value;
                                            dept.goals[goal.key].value_per_company_user = goal.value_per_company_user;
                                        }
                                    });


                                    dept.childDepts = [];
                                    dept.openChildren = false;
                                    dept.children.forEach(function (ch) {
                                        if (deptsByID[ch]) {
                                            dept.childDepts.push(deptsByID[ch]);
                                        }
                                    });

                                    dept.parentDepts = [];
                                    dept.parents.forEach(function (pa) {
                                        if (deptsByID[pa]) {
                                            dept.parentDepts.push(deptsByID[pa]);
                                        }
                                    });

                                    if (dept.parentDepts.length == 0) {
                                        includeDepartments.push(dept);

                                        scope.totals.sent += dept.invitations_sent;
                                        scope.totals.converted += dept.invitations_converted;
                                        scope.totals.logins += dept.logins;

                                        scope.totals.goals.invitations += dept.goals.invitations.value_per_company_user;
                                        scope.totals.goals.conversions += dept.goals.conversions.value_per_company_user;
                                        scope.totals.goals.logins += dept.goals.logins.value_per_company_user;
                                        scope.totals.goals.loginsPerWeek += dept.goals.logins.value;
                                    }

                                });

                                scope.departments = includeDepartments;

                                scope.ui.loading = false;
                            });


                    } else {
                        scope.departments = [];
                        scope.ui.loading = false;
                    }
                });

            StatsCollection.getUsersAll(this.date.from, this.date.to)
                .then(function(res) {
                    if (res._embedded && res._embedded.items && res._embedded.items[0] && res._embedded.items[0]._embedded && res._embedded.items[0]._embedded.statistics) {
                        scope.users = res._embedded.items[0]._embedded.statistics;
                    } else {
                        scope.users = [];
                    }
                });
        },

        getConversionPercent(converted, sent) {
            if (sent === 0 || !sent) {
                return 0;
            }

            return Math.round( (converted / sent) * 100);
        },

        getLoginsPerWeek(totalLogins) {
            var weeks = DateRangeModel.delta('weeks', this.date.fromDate, this.date.toDate);

            if (!weeks || weeks === 0) {
                return 0;
            }

            return Math.round(totalLogins / weeks);
        },

        closeAllDepts(department) {
            department.openChildren = false;

            if (department.childDepts.length > 0) {
                department.childDepts.forEach(function (dept) {
                    this.closeAllDepts(dept);
                }.bind(this));
            }
        },

        drilldownDepartment(department) {
            if (department.childDepts.length > 0) {
                if (department.openChildren) {
                    //department.openChildren = false;
                    this.closeAllDepts(department);
                } else {
                    department.openChildren = true;
                }

                this.refresh++;
                //return false;
            }

            if (department.key == this.currentDepartment) {
                this.currentDepartment = false;
                this.ui.showDeptDetails = false;
                return false;
            }

            var scope = this;
            scope.currentDepartment = department.key;
            scope.currentDepartmentObj = department;

            scope.ui.showDeptDetails = false;

            if (department.childDepts.length == 0) {
                scope.ui.showDeptDetails = true;
            }

            scope.currentUsers = scope.users.filter(function(user) {
                return (user.parent_id === department.id) || (user.parent_id === null && department.id == 'none');
            });

            scope.totals.sentUsers = 0;
            scope.totals.convertedUsers = 0;
            scope.totals.loginsUsers = 0;

            scope.currentUsers.forEach(function(user) {
                scope.totals.sentUsers += user.invitations_sent;
                scope.totals.convertedUsers += user.invitations_converted;
                scope.totals.loginsUsers += user.logins;
            });

            if (department.childDepts.length == 0) {
                var el = document.getElementById('stats-scroll-marker');
                $('body,html').animate({scrollTop: el.offsetTop - 100}, 1500);
            }
        },

        getDeptName(string) {
            return string.replace(':department', this.currentDepartment || this.ui.dictionary.stats.noDepartment);
        },

        showGoalsDialog() {
            this.$modal.show(setGoalsDialog, {
                currentDepartment: this.currentDepartment,
                currentDepartmentObj: this.currentDepartmentObj,
                setGoals: this.setGoals
            }, {height: 'auto'});
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'date-field' : dateField,
            'stats-table' : statsTable
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('companyErpChanged');
        },
    });
