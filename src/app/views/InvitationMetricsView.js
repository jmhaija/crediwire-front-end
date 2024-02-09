    import Vue from 'Vue'
    import Highcharts from 'Highcharts'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import UserModel from 'models/UserModel'
    import InvitationCollection from 'collections/InvitationCollection'
    import EventBus from 'services/EventBus'

    const template = `
        <article ref="chartarea">
           <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/connections/all"><a>{{ui.dictionary.connections.all}}</a></router-link>
                   <router-link tag="li" to="/account/connections/portfolio"><a>{{ui.dictionary.connections.portfolio}}</a></router-link>
                   <router-link tag="li" to="/account/connections/shared" v-show="permissions.owner"><a>{{ui.dictionary.connections.shared}}</a></router-link>
                   <router-link tag="li" class="right-float" to="/account/invitations"><a>{{ui.dictionary.invitations.title}}</a></router-link>
                   <router-link tag="li" class="right-float" to="/account/invitation-metrics"><a>{{ui.dictionary.invitations.metrics}}</a></router-link>
               </ul>
           </nav>
           <section class="tab-content">
               <div class="working" v-show="ui.loading"></div>
               <div class="metrics-container" v-show="!ui.loading">
        
                   <div class="stats">
                       <h2>{{ui.dictionary.invitations.metrics}}</h2>
        
                       <div>
                           {{ui.dictionary.invitations.goal}}: <input type="number" v-model="goalField" min="0" max="9999"><button class="primary" v-on:click.stop="changeGoal(goalField)">{{ui.dictionary.general.go}}</button>
                       </div>
        
                       <div class="bar-graph">
                           <div id="bar-chart"></div>
                       </div>
        
                   </div><div class="cta">
                       <div class="splash">
                           <h1>{{ui.dictionary.invitations.splash.title}}</h1>
                           <p>{{ui.dictionary.invitations.splash.invite}}</p>
                          <button class="primary" v-on:click="gotoInvitations()" v-show="permissions.owner || permissions.permissionType == 'full' || permissions.permissionType == 'extended'">{{ui.dictionary.invitations.new}}</button>
                       </div>
                   </div>
        
               </div>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : false
        },
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        company : CompanyModel.getCompany(),
        invitations : {
            sent : 0,
            converted : 0,
            goal : 0,
            goalMin : 0,
            goalMax : 9999,
            convertedPercent : 0,
            goalPercent : 0
        },
        goalField : 0,
        chartObject : {},
        chartOptions : {
            chart : {
                animation: false,
                width: (window.innerWidth > 1600 || window.innerWidth < 1200) ? 700 : (window.innerWidth > 1200 ? 550 : 300),
                height: 500,
                type: 'column'
            },
            credits : {
                enabled : false
            },
            legend : {
                enabled : false
            },
            plotOptions : {
                column : {
                    dataLabels : {
                        enabled : true,
                        verticalAlign: 'top',
                        useHTML : true,
                        y: -22
                    }
                },
            },
            series: [{
                animation: false,
                data : [{
                    name : 'sent',
                    y : 0,
                    color : '#2fabff'
                }, {
                    name : 'converted',
                    y : 0,
                    color : '#ffa630'
                }]
            }],
            title : null,
            tooltip : {
                enabled: false
            },
            xAxis : {
                categories : [DictionaryModel.getHash().invitations.sent, DictionaryModel.getHash().invitations.converted]
            },
            yAxis : {
                gridLineColor: '#f9f9f9',
                labels : {
                    style : {
                        color: '#cccccc'
                    }
                },
                title : {
                    text : null
                }
            }
        }
    });


    const methods = {
        init() {
            EventBus.$on('companyErpChanged', this.getInvitations);
            EventBus.$on('companyUserChanged', this.updatePermissions);
            document.addEventListener('contextChange', this.updatePermissions);
            this.getInvitations();
        },

        updatePermissions() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.company = CompanyModel.getCompany();

            if (this.$route.path == '/account/invitation-metrics' && (!this.company.settings || !this.company.settings.invitation_metric) ) {
                this.$router.push('/account/invitations');
            }
        },

        changeGoal(goal) {
            goal = parseInt(goal, 10);

            if (isNaN(goal)) {
                goal = 0;
            } else if (goal < this.invitations.goalMin) {
                goal = this.invitations.goalMin;
            } else if (goal > this.invitations.goalMax) {
                goal = this.invitations.goalMax;
            }

            this.goalField = goal;
            this.invitations.goal = goal;
            this.permissions.settings.invitationsGoal = goal;

            this.saveUserSettings();

            this.chartOptions.series[0].animation = true;
            this.calculatePercents();
        },

        saveUserSettings() {
            var scope = this;
            UserModel.setCompanyUserInfo(this.permissions);
            UserModel.saveCompanyUserInfo()
                .then(function(res) {
                    scope.permissions = res;
                });
        },

        calculatePercents() {
            if (this.invitations.sent > 0) {
                this.invitations.convertedPercent = ((this.invitations.converted / this.invitations.sent) * 100).toFixed(0);
            } else {
                this.invitations.convertedPercent = 0;
            }


            if (this.invitations.goal > 0) {
                this.invitations.goalPercent = ((this.invitations.sent / this.invitations.goal) * 100).toFixed(0);
            } else {
                this.invitations.goalPercent = 0;
            }


            var scope = this;
            this.chartOptions.plotOptions.column.dataLabels.formatter = function() {
                var percent;

                if (this.key == 'sent') {
                    percent = scope.invitations.goalPercent;
                } else if (this.key == 'converted') {
                    percent = scope.invitations.convertedPercent;
                } else {
                    percent = 0;
                }

                var output = '<div style="text-align: center;">';
                output += '<div>' + this.y + '</div>';
                if (percent > 0) {
                    output += '<div style="padding-top: 42px;">' + percent + '%</div>';
                }
                output += '</div>';
                return output;
            };

            this.drawGraph();

        },

        drawGraph() {
            var scope = this;
            setTimeout(function() {
                if (scope.$refs && scope.$refs.chartarea) {
                    scope.chartObject = Highcharts.chart(scope.$refs.chartarea.querySelector('#bar-chart'), scope.chartOptions);
                }
                scope.ui.loading = false;
            }, 1000);

        },

        getInvitations() {
            var scope = this;
            scope.ui.loading = true;
            scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();

            var ic = new InvitationCollection();

            ic.getInvitations()
                .then(function(res) {
                    if (res.meta) {
                        scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
                        scope.invitations.sent = res.meta.totalSent || 0;
                        scope.invitations.converted = res.meta.totalConverted || 0;
                        scope.invitations.goal = (scope.permissions.settings ? scope.permissions.settings.invitationsGoal : 0) || 0;
                        scope.goalField = scope.invitations.goal;

                        scope.calculatePercents();
                        scope.drawGraph();
                    }
                });
        },

        gotoInvitations() {
            this.$router.push('/account/invitations?new=1');
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        mounted() {
            this.init();
        },
        watch : {
            'invitations.sent' : function(val) {
                this.chartOptions.series[0].data[0].y = val;
            },
            'invitations.converted' : function(val) {
                this.chartOptions.series[0].data[1].y = val;
            }
        }
    });
