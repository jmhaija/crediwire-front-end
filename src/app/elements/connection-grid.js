define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/UserModel',
    'models/ConnectionSubscriptionModel',
    'collections/ConnectionSubscriptionCollection',
    'elements/connection-card',
    'services/Toast',
    'services/Config',
    'services/Track'

], function(Vue, moment, DictionaryModel, UserModel, ConnectionSubscriptionModel, ConnectionSubscriptionsCollection, connectionCard, Toast, Config, Track) {

    var template = [
        '<article class="connection-grid">',
        '<span v-show="false">{{counter}}</span>',

        '       <div v-for="(cat, catIndex) in sortCategories(ui.dictionary.meta.alphabet)" class="category" :class="{ collapsed: search.length > 0 }" v-show="connections[cat] && connections[cat].length > 0">',
        '           <div class="section" v-show="search.length === 0 && sort.param == \'name\' && cat != \'all\' && cat != \'direct\' && cat != \'app\' && cat != \'partner\'"><div class="name" :class="{ letter : cat != \'_\' && cat != \'pending\' }">{{formatLetter(cat)}}</div></div>',
        '           <div v-show="cat == \'pending\' && connectionType == \'see\' && search.length === 0" class="pending-subtext"><i class="cwi-reload"></i> {{ui.dictionary.connections.pendingDescription}}</div>',
        '           <div v-show="cat == \'pending\' && connectionType == \'show\' && search.length === 0" class="pending-subtext"><i class="cwi-reload"></i> {{ui.dictionary.connections.pendingDescriptionShow}}</div>',
        '           <div class="list">',


        '               <div class="connection" v-for="(connection, index) in filterValidationStatus(filterDepartments(filterConnections(sortConnections(connections[cat], catIndex), cat, catIndex)))" v-show="connection.id != supportConnection">',
        '                   <connection-card :subscribe="subscribeConnection" :unsubscribe="unsubscribeConnection" :subscribed="subscriptionLookup[connection.id]" :connection="connection" :addPortfolio="addPortfolio" :cat="cat" :index="index" :removePortfolioConfirm="removePortfolioConfirm" :showSettings="showSettings" :showRevokeConfirmation="showRevokeConfirmation" :showDeleteConfirmation="showDeleteConfirmation" :connectionType="connectionType" :connectionFilter="connectionFilter" :inPortfolio="inPortfolio" :permissions="permissions" :declineConnection="declineConnection" :approveConnection="approveConnection" :openOverview="openOverview" :departments="departments"></connection-card>',
        '               </div>',

        '           </div>',
        '       </div>',

        '       <div class="load-more" v-show="((showCategories < totalCategories && sort.param == \'name\' && search.length === 0) || (search.length === 0 && moreConnections)) && connections.all && connections.all.length > 0" v-on:click="loadMore()">{{ui.dictionary.connections.loadMore}}</div>',
        '</article>'
    ].join('');


    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
            },
            totalCategories : DictionaryModel.getHash().meta.alphabet.length + 1, //How many total cateogories there are (static, based on dictionary)
            showCategories : 2, //How many categories to show at the beginning
            showConnections : 50, //How many connections to show/load first time
            addConnections : 50, //How many more connections to add/load at a time,
            moreConnections : false,
            currentConnection : null,
            currentCategory : null,
            currentIndex : null,
            intervalHandler : null,
            subscriptions : {},
            subscriptionLookup : {},
            counter: 0,
            latestSortParam : null,
            lastID : false,
            supportConnection : Config.get('supportConnection')
        };
    };


    var methods = {
        init : function() {
            this.showCategories = 2;
            this.showConnections = 17;
            this.moreConnections = false;

            document.addEventListener('scroll', this.watchScroll);
            this.resetConnectionLoad(true);

            var scope = this;
            this.intervalHandler = setInterval(function() {
                if (scope.scrolledToBottom() && scope.showCategories < scope.totalCategories + 4 && scope.sort.param == 'name' && scope.connections.all && scope.connections.all.length > 0) {
                    scope.loadMore();
                }
            }, 100);
        },

        filterDepartments : function (connections) {
            var list = connections.slice();

            if (this.departmentFilter == 'all') {
                return list;
            }

            if (this.departmentFilter === null) {
                return list.filter(function(c) {
                    return c.department === null;
                });
            }

            return list.filter(function(c) {
                return c.department == this.departmentFilter;
            }.bind(this));
        },

        filterValidationStatus : function (connections) {
            var list = connections.slice();

            if (this.validationFilter == 'validated') {
                return list.filter(function(c) {
                    return c.company && c.company.erp && c.company.erp.currentMappingValidity;
                });
            }

            if (this.validationFilter == 'notvalidated') {
                return list.filter(function(c) {
                    return !c.company || !c.company.erp || !c.company.erp.currentMappingValidity;
                });
            }

            //All
            return list;
        },

        getSubscriptions : function() {
            var scope = this;

            var sc = new ConnectionSubscriptionsCollection();
            sc.getSubscriptions()
                .then(function(res) {
                    if (res._embedded && res._embedded.items) {
                        scope.subscriptions = res._embedded.items;
                        scope.subscriptions.forEach(function(subscription) {
                            scope.subscriptionLookup[subscription.connection_id] = true;
                        });
                        scope.counter++;
                    }
                });
        },

        subscribeConnection : function(connID) {
            Track.am.log('SUBSCRIBE_TO_CONNECTION');
            var scope = this;

            var cs = new ConnectionSubscriptionModel(connID);
            cs.subscribe()
                .then(function(res) {
                    if (res.id) {
                        scope.subscriptions.push(res);
                        Vue.set(scope.subscriptionLookup, res.connection_id, true);
                    } else {
                        Toast.show(scope.ui.dictionary.connections.failedSubscribe, 'warning');
                    }
                    scope.counter++;
                });
        },

        unsubscribeConnection : function(connID) {
            Track.am.log('UNSUBSCRIBE_FROM_CONNECTION');
            var scope = this;
            var subID = this.getSubID(connID);

            var cs = new ConnectionSubscriptionModel(connID);
            cs.unsubscribe(subID)
                .then(function(res) {
                    if (res) {
                        Vue.set(scope.subscriptionLookup, connID, false);
                        scope.subscriptionLookup[connID] = false;
                    } else {
                        Toast.show(scope.ui.dictionary.connections.failedUnsubscribe, 'warning');
                    }
                    scope.counter++;
                });
        },

        getSubID : function(connID) {
            var found = false;

            this.subscriptions.forEach(function(sub) {
                if (sub.connection_id == connID) {
                    found = sub.id;
                }
            });

            return found;
        },


        loadMore : function() {
            this.showCategories += 4;
        },

        watchScroll : function() {
            if (this.scrolledToBottom()
                && this.moreConnections) {

                this.showConnections += this.addConnections;

            } else if (this.scrolledToBottom()
                       && this.sort.param == 'name'
                       && this.showCategories < this.totalCategories) {

                this.showCategories++;
                this.showConnections = this.addConnections;
            }
        },

        scrolledToBottom : function() {
            return (window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight - (window.innerHeight / 2));
        },

        limitCategories : function(cats) {
            return cats.slice(0, this.showCategories);
        },

        limitConnections: function(conn) {
            return conn.slice(0, this.showConnections);
        },

        sortCategories : function(cats) {
            var categories = ['all'];

            if (this.sort.param == 'name' && this.search.length === 0) {
                categories = cats.filter(function(el) {
                    return el != 'all';
                });
            }/** else if (this.sort.param == 'source' && this.search.length === 0) {
                categories = ['direct', 'app', 'partner'];
            }*/


            if (this.sort.order == 'desc') {
                var list = categories.slice();
                var reversed = list.reverse();
                var pending = reversed.pop();
                reversed.unshift(pending);

                //return reversed;
                return this.limitCategories(reversed);
            }

            //return categories;
            return this.limitCategories(categories);
        },

        formatLetter : function(character) {
            if (character == '_') {
                return this.ui.dictionary.connections.misc;
            } else if (character == 'pending') {
                return this.ui.dictionary.connections.pending;
            }

            return character.toUpperCase();
        },

        filterConnections : function(connections, cat, catIndex) {
            /**
             * Track how many connections are loaded/shown at once
             */
            if (this.showCategories - catIndex === 1 || this.sort.param != 'name') {
                if (this.connections && this.connections[cat] && this.connections[cat].length > this.showConnections) {
                    this.moreConnections = true;
                } else {
                    this.moreConnections = false;
                }
            }

            if (this.search && this.search.length > 0) {
                if (!this.latestSortParam) {
                    this.latestSortParam = this.sort.param;
                }
                this.sort.param = 'name';

                const searchStrings = this.search.split(' ');
                const normalizeInput = input => input.trim().toLowerCase()
                const normalizedSearchStrings = normalizeInput(this.search)
                const isExactNameMatch = (connection, name) => (
                    normalizeInput(connection.company.name) === name
                )
                return connections.filter(function(connection) {
                        var found = false;

                        for (var i = 0; i < searchStrings.length; i++) {
                            if (searchStrings[i].length > 0 && connection.company.name && connection.company.name.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                                found = true;
                            } else if (searchStrings[i].length > 0 && connection.company.vat && connection.company.vat.indexOf(searchStrings[i]) >= 0) {
                                found = true;
                            }
                        }

                        return found;
                    }).sort(function(left, right) {
                        if (isExactNameMatch(left, normalizedSearchStrings)) {
                            return -1
                        }
                        if (isExactNameMatch(right, normalizedSearchStrings)) {
                            return 1
                        }
                        return 0
                    })
            } else if (this.latestSortParam) {
                this.sort.param = this.latestSortParam;
                this.latestSortParam = null;
            }

            return connections;
        },

        sortConnections : function(conn, catIndex) {
            if (conn === undefined) {
                return [];
            }

            var connections = conn.slice();
            var connectionList = connections;

            if (connections && this.sort.param == 'created') {
                connectionList = connections.sort(function(a, b) {
                    var at = moment(a.created).unix();
                    var bt = moment(b.created).unix();
                    return at - bt;
                });
            } else if (connections && this.sort.param == 'source') {
                connectionList = connections.sort(function(a, b) {
                    var as = (a.adminData && a.adminData.owner && a.adminData.owner.source && a.adminData.owner.source.type) ? a.adminData.owner.source.type : 'unknown';
                    var bs = (b.adminData && b.adminData.owner && b.adminData.owner.source && b.adminData.owner.source.type) ? b.adminData.owner.source.type : 'unknown';
                    return as - bs;
                });
            } else if (connections && this.sort.param == 'activity') {
                connectionList = connections.sort(function(a, b) {
                    var as = (a.company && a.company.erp && a.company.erp.latestDate) ? moment(a.company.erp.latestDate).unix() : 0;
                    var bs = (b.company && b.company.erp && b.company.erp.latestDate) ? moment(b.company.erp.latestDate).unix() : 0;
                    return as - bs;
                });
            } else {
                connectionList = connections.sort(function(a, b) {
                    if (a.company.name === null) {
                        if (b.company.name == null) {
                            return 0;
                        }

                        return 1;
                    }

                    if (b.company.name === null) {
                        if (a.company.name == null) {
                            return 0;
                        }

                        return -1;
                    }

                    return a.company.name.toLocaleLowerCase()>b.company.name.toLocaleLowerCase()? 1 : (a.company.name.toLocaleLowerCase()<b.company.name.toLocaleLowerCase() ? -1 : 0);
                });
            }


            if (this.sort.order == 'desc') {
                connectionList = connectionList.reverse();
            }


            if (this.showCategories - catIndex === 1 || this.sort.param != 'name') {
                var limConn = this.limitConnections(connectionList);
                return limConn;
            } else {
                return connectionList;
            }

        },

        addPortfolio : function(connection) {
            this.portfolio.push(connection.id);

            var ui = UserModel.getCompanyUserInfo();
            ui.settings.portfolio = this.portfolio;
            UserModel.setCompanyUserInfo(ui);
            UserModel.saveCompanyUserInfo();
        },

        inPortfolio : function(connection) {
            if (Array.isArray(this.portfolio) && this.portfolio.indexOf(connection.id) >= 0) {
                return true;
            }

            return false;
        },

        removePortfolio : function(connection, cat, index) {
            var idx = this.portfolio.indexOf(connection.id);

            if (idx >= 0) {
                this.portfolio.splice(idx, 1);
            }

            var ui = UserModel.getCompanyUserInfo();
            ui.settings.portfolio = this.portfolio;
            UserModel.setCompanyUserInfo(ui);
            UserModel.saveCompanyUserInfo();


            if (this.connectionFilter == 'portfolio') {
                this.connections[cat].splice(index, 1);
                this.resetConnectionLoad(true);
            }
        },

        removePortfolioConfirm : function(connection, cat, index) {
            this.currentConnection = connection;
            this.currentCategory = cat;
            this.currentIndex = index;
            this.removePortfolioConfirmation();
        },

        resetConnectionLoad : function(skipSubLoad) {
            this.showCategories = 2;
            this.showConnections = this.addConnections;

            if (this.connections.all && this.connections.all.length < this.showConnections) {
                this.showCategories = 100;
            }

            if (!skipSubLoad && this.connections._id && this.connections._id != this.lastID) {
                this.getSubscriptions();
            }
        },

        removePortfolioConfirmation : function () {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.connections.removePortfolioConfirmation,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.removePortfolioNo,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.connections.removePortfolioYes,
                        default: true,
                        class: 'warning',
                        handler: () => { this.removePortfolio(this.currentConnection, this.currentCategory, this.currentIndex); this.$modal.hide('dialog')}
                    }
                ]
            })
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'connection-card' : connectionCard
        },
        props : ['search', 'connections', 'sort', 'portfolio', 'connectionType', 'connectionFilter', 'showSettings', 'permissions', 'showDeleteConfirmation', 'showRevokeConfirmation', 'approveConnection', 'declineConnection', 'openOverview', 'departments', 'departmentFilter', 'validationFilter'],
        mounted : function() {
            this.init();
        },
        watch : {
            'connections' : function(c) {
                this.resetConnectionLoad(c === false);
                this.lastID = c ? c._id : false;
            },
            'sort.param' : function(p) {
                this.resetConnectionLoad(true);
            },
            'sort.order' : function(o) {
                this.resetConnectionLoad(true);
            },
            'search' : function(s) {
                this.resetConnectionLoad(true);
            }
        },
        beforeDestroy : function() {
            clearInterval(this.intervalHandler);
        }
    });
});
