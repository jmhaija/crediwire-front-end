define(
    [
        'models/DictionaryModel',
        'models/CompanyModel',
        'models/SharedConnectionModel',
        'models/SeeConnectionModel',
        'elements/modals/modal',
        'elements/modals/add-new-connection',
        'elements/modals/invite-to-crediwire',
        'elements/modals/connection-settings',
        'collections/ConnectionStoreCollection',
        'collections/ConnectionCollection',
        'elements/modals/show-connection-confirm'
    ], function(DictionaryModel, CompanyModel, SharedConnectionModel, SeeConnectionModel, modal, addNewConnection, inviteToCrediwire, connectionSettings, ConnectionStoreCollection, ConnectionCollection, showConnectionConfirm) {
    return {
        data: function() {
            return  {
                ui : {
                    dictionary: DictionaryModel.getHash()
                }
            };
        },
        methods: {
            showInvitation : function() {
                this.$emit('close');
                this.$modal.show(inviteToCrediwire, {}, {height: 'auto'});
            },

            categorize : function(connections) {
                var scope = this;
                scope.connections = {};

                this.ui.dictionary.meta.alphabet.forEach(function(letter) {
                    scope.connections[letter] = [];
                });

                if (scope.connections._ === undefined) {
                    scope.connections._ = [];
                }

                if (scope.connections.pending === undefined) {
                    scope.connections.pending = [];
                }

                if (scope.connections.all === undefined) {
                    scope.connections.all = [];
                }

                if (!connections) {
                    return false;
                }

                connections.forEach(function(connection) {
                    if (scope.connectionFilter == 'portfolio' && scope.portfolio && scope.portfolio.indexOf && scope.portfolio.indexOf(connection.id) < 0) {
                        return false;
                    }

                    if (scope.connectionType == 'show' && connection.processed && !connection.approved) {
                        return false;
                    }

                    if (!connection.processed) {
                        scope.connections.pending.push(connection);
                    } else if (connection.company.name) {
                        var firstLetter = connection.company.name.toLowerCase().charAt(0);
                        if (scope.connections[firstLetter]) {
                            scope.connections[firstLetter].push(connection);
                        } else {
                            scope.connections._.push(connection);
                        }
                    } else {
                        scope.connections._.push(connection);
                    }

                    scope.connections.all.push(connection);
                    scope.connections._id = CompanyModel.getCompany().id;
                });
            },

            addConnection : function(company, param) {
                param ? this.confirmedConnect = param : '';
                this.currentCompanyToAdd = company;
                var scope = this;
                scope.suggestions = [];
                scope.ui.addingError = false;

                //See connections only for extended permission type
                if (!this.permissions.owner && this.permissions.permissionType == 'extended') {
                    this.addConnectionType = 'see';
                }

                var found = false;
                var existingConnection = null;
                scope.rawConnections.forEach(function(connection) {
                    if (connection.company.id == company.id) {
                        found = true;
                        existingConnection = connection;
                    }
                });

                if (found && scope.connectionType == 'show' && !existingConnection.approved && this.confirmedConnect) {
                    this.updateShowConnection(existingConnection);
                    return false;
                } else if (found && scope.connectionType == 'show' && !existingConnection.approved) {
                    this.$emit('close');
                    this.$modal.show(showConnectionConfirm, {name: company, erpConnectionCompleted: this.erpConnectionCompleted,  showUserInviteForm: this.showUserInviteForm, connectionType: this.addConnectionType}, {height: 'auto'});
                    return false;
                } else if (found && scope.connectionType == 'see' && scope.addConnectionType == 'see') {
                    scope.ui.adding = false;
                    scope.ui.addingError = true;
                    return false;
                }

                if (this.addConnectionType == 'see') {
                    var cm = new SeeConnectionModel();
                } else if (this.addConnectionType == 'show' && this.confirmedConnect) {
                    var cm = new SharedConnectionModel();
                } else if (this.addConnectionType == 'show') {
                    this.$emit('close');
                    this.$modal.show(showConnectionConfirm, {name: company, erpConnectionCompleted: this.erpConnectionCompleted,  showUserInviteForm: this.showUserInviteForm, connectionType: this.addConnectionType}, {height: 'auto'});
                    return false;
                }

                scope.ui.adding = true;

                cm.request(company.id)
                    .then(function(res) {
                        if (res.id) {
                            res.company = company;

                            if (scope.connectionType == scope.addConnectionType) {
                                scope.rawConnections.push(res);
                                scope.categorize(scope.rawConnections);
                                ConnectionStoreCollection.set(scope.rawConnections);
                            }

                            scope.company = null;
                            scope.ui.newSearch = '';
                            scope.$emit('close');
                            if (scope.addConnectionType == 'show') {
                                scope.redirectAfterSettings = true;
                                scope.showSettings(res);
                            } else {
                                scope.$router.push('/account/connections/all');
                            }

                            scope.ui.adding = false;
                        } else if (res.errors[0].type == 'ResourceAlreadyExists' && scope.addConnectionType == 'show') {
                            scope.getShowConnectionsAndUpdate(company.id);
                        } else {
                            scope.ui.addingError = true;
                            scope.ui.adding = false;
                        }

                        scope.currentCompanyToAdd = null;
                        scope.confirmedConnect = false;
                    });
            },

            hideSettings : function() {
                this.currentConnection = null;
                this.$emit('close');
                if (this.redirectAfterSettings) {
                    this.$router.push('/account/connections/shared');
                }
            },

            getShowConnectionsAndUpdate : function(companyId) {
                var scope = this;
                var connections = new ConnectionCollection('show');
                connections.getConnections()
                    .then(function(list) {
                        if (!list.errors) {
                            list.contents.forEach(function(connection) {
                                if (connection.company.id == companyId) {
                                    scope.updateShowConnection(connection);
                                }
                            });
                        } else {
                            scope.ui.addingError = true;
                            scope.ui.adding = false;
                        }

                        scope.confirmedConnect = false;
                    });
            },

            updateShowConnection : function(connection) {
                var scope = this;
                connection.approved = true;

                var cm = new SharedConnectionModel();
                cm.update(connection)
                    .then(function(res) {
                        if (res.id) {
                            scope.categorize(scope.rawConnections);
                            ConnectionStoreCollection.set(scope.rawConnections);
                            scope.company = null;
                            scope.ui.newSearch = '';
                            scope.$emit('close');
                            scope.showSettings(res);
                        } else {
                            scope.ui.addingError = true;
                        }

                        scope.ui.adding = false;
                    });
            },

            showSettings : function(connection) {
                this.currentConnection = connection;
                if (this.currentConnection?.company?.name) {
                    this.$modal.show(connectionSettings, {connection: this.currentConnection, callback: this.hideSettings}, {height: 'auto'});
                }
            },

        }
    };
});
