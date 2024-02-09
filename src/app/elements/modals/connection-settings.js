define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'models/SharedConnectionModel',
    'collections/DashboardCollection'
    // 'elements/modals/show-new-invitations-modal'
], function (Vue, modal, DictionaryModel, SharedConnectionModel, DashboardCollection) {
    const template = `
        <modal :title="ui.dictionary.connections.settings" :close="close">                                        
            <template v-slot:content>
                <article class="permissions">
                    <aside v-show="!ui.details">
                        <section class="identity">   
                           <section class="name">{{connection.company.name}}</section>
                           <section class="tag">{{connection.company.vat}}</section>
                        </section>
                        <section class="perm-tag">{{ui.dictionary.connections.access}}</section>
                        <section class="buttons">
                            <div v-on:click="connection.permissionType = 'limited'" :class="{ active : connection.permissionType == 'limited' }">{{ui.dictionary.connections.limited}}</div
                           ><div v-on:click="connection.permissionType = 'extended'" :class="{ active : connection.permissionType == 'extended' }">{{ui.dictionary.connections.extended}}</div
                           ><div v-on:click="connection.permissionType = 'full'" :class="{ active : connection.permissionType == 'full' }">{{ui.dictionary.connections.full}}</div>
                        </section>
                        <p class="explanation" v-show="connection.permissionType == 'limited'">
                           {{ui.dictionary.connections.permissionDescriptions.limited}}
                        </p>
                        <p class="explanation" v-show="connection.permissionType == 'extended'">
                           {{ui.dictionary.connections.permissionDescriptions.extended}}
                        </p>
                        <p class="explanation" v-show="connection.permissionType == 'full'">
                           {{ui.dictionary.connections.permissionDescriptions.full}}
                        </p>
                        <section class="configure" v-show="connection.permissionType == 'limited'">
                           <a v-on:click="ui.details = true;">{{ui.dictionary.connections.configure}} <i class="cwi-right"></i></a>
                        </section>
                    </aside>
    
                   <aside v-show="ui.details">
                       <a v-on:click="ui.details = false;"><i class="cwi-left"></i> {{ui.dictionary.connections.back}}</a>
                       <p class="explanation">{{ui.dictionary.connections.configureDescription}}</p>
                
                       <section class="dash-perms">
                           <div class="checkbox-field"><label><input type="checkbox" v-model="connection.shareAllDashboards"> <i></i> {{ui.dictionary.connections.shareAllDashboards}}</label></div>
                           <ul v-show="!connection.shareAllDashboards">
                               <li v-for="dashboard in dashboards" class="checkbox-field">
                                   <label><input type="checkbox" v-model="dashboard._permission" v-on:change="setPermState(dashboard)"> <i></i> {{dashboard.name}}</label>
                               </li>
                           </ul>
                       </section><section class="other-perms">
                           <div class="checkbox-field"><label><input type="checkbox" v-model="connection.kpiDefinitionAccess"> <i></i> {{ui.dictionary.connections.kpiDefinitionPermission}}</label></div>
                           <div class="checkbox-field"><label><input type="checkbox" v-model="connection.allowExternalDashboard"> <i></i> {{ui.dictionary.connections.allowExternalDashboard}}</label></div>
                       </section>
                   </aside>    
                  </article>    
            </template>        
            
            <template v-slot:footer>
                <div class="zero-padding single-footer-btn">
                    <aside class="save"
                        <span class="working" v-show="ui.saving"></span>
                        <button class="primary" v-on:click="save()" v-show="!ui.saving" v-handle-enter-press="save">{{ui.dictionary.connections.save}}</button>
                    </aside>
                 </div>
            </template>                                                  
        </modal>
    `;


    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                loading : false,
                details : false,
                saving : false
            },
            dashboards : [],
            dashboardPermissions : [],
            create : [],
            remove : []
        };
    };

    const methods = {
        init : function() {
            this.getDashboards();
        },

        getDashboards : function() {
            var scope = this;
            var dashboards = new DashboardCollection();
            dashboards.getDashboards()
                .then(function(list) {
                    scope.dashboards = list.contents;
                    scope.getDashboardPermissions();
                });
        },

        getDashboardPermissions : function() {
            var scope = this;
            var cm = new SharedConnectionModel();

            cm.getDashboardPermissions(this.connection.id)
                .then(function(res) {
                    if (res.contents) {
                        scope.dashboardPermissions = res.contents;
                    }


                    //Map permissions to dashboards to make data models
                    scope.dashboards.forEach(function(dashboard) {
                        dashboard._permission = false;

                        scope.dashboardPermissions.forEach(function(permission) {
                            if (permission.dashboard == dashboard.id) {
                                dashboard._permission = true;
                                return true;
                            }
                        });
                    });
                });
        },

        setPermState : function(dashboard) {
            var found = false;
            var inCreate = null;
            var inRemove = null

            this.dashboardPermissions.forEach(function(permission) {
                if (permission.dashboard == dashboard.id) {
                    found = permission;
                }
            });

            this.create.forEach(function(db ,idx) {
                if (db.id == dashboard.id) {
                    inCreate = idx;
                }
            });


            if (!found && dashboard._permission && inCreate === null) {
                this.create.push(dashboard);
            } else if (!dashboard._permission && inCreate !== null) {
                this.create.splice(inCreate, 1);
            } else if (found && !dashboard._permission && inRemove === null) {
                this.remove.push(found);
            } else if (dashboard._permission && inRemove !== null) {
                this.remove.splice(inRemove, 1);
            }
        },

        save : function() {
            var scope = this;
            scope.ui.saving = true;

            var cm = new SharedConnectionModel();

            this.create.forEach(function(dashboard) {
                cm.createDashboardPermission(scope.connection.id, dashboard.id);
            });

            this.remove.forEach(function(permission) {
                cm.deleteDashboardPermission(scope.connection.id, permission.id);
            });

            cm.update(this.connection)
                .then(function(res) {
                    scope.callback();
                    scope.close();
                });
        },


        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'connection-settings',
        template,
        data,
        methods,
        props : ['connection', 'callback'],
        components: {
            modal
        },
        mounted: function() {
            this.init();
        },
    });
});
