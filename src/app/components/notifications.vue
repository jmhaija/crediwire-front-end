<template>
    <article>
       <section v-show="ui.loading">
            <div class="working inline"></div>
       </section>
       <section v-show="!ui.loading && notifications.total === 0" class="tooltip inactive">
           <i class="cwi-bell"></i>
           <div class="message left right-arrow-tooltip">{{ui.dictionary.notifications.noNew}}</div>
       </section>
       <section v-show="!ui.loading && notifications.total > 0" class="active">
           <i class="cwi-bell"></i>
           <div class="counter">{{notifications.total}}</div>
               <div class="notification-details" :class="{ two :  notifications.seeConnections > 0 && notifications.showConnections > 0 }">

                   <div class="title">{{notifications.seeConnections}} {{ui.dictionary.notifications.newSeeConnections}}</div>
                   <div class="connection" v-for="connection in seeConnections" v-on:click="gotoConnection(connection)">
                        <div class="float-right no-margin ok-color" v-show="connection.company.erp && connection.company.erp.connected">&#10004;</div>
                        <span v-show="connection.company.name">{{connection.company.name}}</span><span v-show="!connection.company.name">{{connection.company.vat}}</span>
                   </div>

                   <div class="title">{{notifications.showConnections}} {{ui.dictionary.notifications.newSharedConnections}}</div>
                   <div class="connection" v-for="connection in showConnections" v-on:click="gotoSharedConnections()"><span v-show="connection.company.name">{{connection.company.name}}</span><span v-show="!connection.company.name">{{connection.company.vat}}</span></div>

                   <div class="clear"><a href="" v-on:click.prevent="clear()">{{ui.dictionary.notifications.clear}}</a></div>
               </div>
       </section>
    </article>
</template>

<script>
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import CompanyModel from 'models/CompanyModel'
    import ConnectionCollection from 'collections/ConnectionCollection'
    import EventBus from 'services/EventBus'
    import ConnectionStoreCollection from 'collections/ConnectionStoreCollection'
    import connectionsMutationTypes from 'store/connectionsMutationTypes'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : false
        },
        notifications : {
            seeConnections : 0,
            showConnections : 0,
            total : 0
        },
        profile : UserModel.profile(),
        seeConnections : [],
        showConnections : [],
        companyID : null
    });

    var methods = {
        init() {
            EventBus.$on('notificationsReadyToLoad', this.getConnectionInfo);
        },

        clear() {
            this.seeConnections = [];
            this.showConnections = [];
            this.notifications.seeConnections = 0;
            this.notifications.showConnections = 0;
            this.notifications.total = 0;
        },

        getConnectionInfo() {
            var currentCompanyID = CompanyModel.getCompany().id;
            if (this.companyID && this.companyID == currentCompanyID) {
                return false;
            }

            this.companyID = currentCompanyID;
            var scope = this;
            var cmSee = new ConnectionCollection('see');
            var cmShow = new ConnectionCollection('show');
            var stamp = moment(this.profile.settings.lastLogin).unix();

            //scope.ui.loading = true;
            scope.notifications = {
                seeConnections : 0,
                showConnections : 0,
                total : 0
            };
            this.seeConnections = [];
            this.showConnections = [];

            cmSee.getConnections()
                .then(function(res) {
                    if (res.contents) {
                        ConnectionStoreCollection.set(res.contents);
                        this.$store.dispatch('setLastConnectionType', {
                            type: 'see'
                        });
                        res.contents.forEach(function (connection) {
                            if (moment(connection.created).unix() > stamp) {
                                this.seeConnections.push(connection);
                                this.notifications.seeConnections++;
                                this.notifications.total++;
                            }

                            this.ui.loading = false;
                        }.bind(this));
                    }
                }.bind(this));

            cmShow.getConnections()
                .then(function(res) {
                    if (res.contents) {
                        res.contents.forEach(function (connection) {
                            if (moment(connection.created).unix() > stamp) {
                                this.showConnections.push(connection);
                                this.notifications.showConnections++;
                                this.notifications.total++;
                            }

                            this.ui.loading = false;
                        }.bind(this));
                    }
                }.bind(this));
        },

        gotoConnection(connection) {
            if (!connection.company.erp || !connection.company.erp.connected) {
                return false;
            }

            this.$router.push('/account/connections/all?id=' + connection.id);
        },

        gotoConnections() {
            this.$router.push('/account/connections/all');
        },

        gotoSharedConnections() {
            this.$router.push('/account/connections/shared');
        }
    };

    export default {
        name: 'notifications',
        data,
        methods,
        created() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('notificationsReadyToLoad');
        }
    }
</script>
