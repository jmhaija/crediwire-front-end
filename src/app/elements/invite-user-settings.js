define([
    
    'Vue',
    'models/DictionaryModel',
    'models/UserModel',
    'models/CompanyUserModel',
    'collections/DashboardCollection',
    'elements/date-field'

], function(Vue, DictionaryModel, UserModel, CompanyUserModel, DashboardCollection, dateField) {
    
    var template = [
    '<article class="permissions">',
    '   <aside v-show="!ui.details">',
    
    '      <section class="perm-tag">{{ui.dictionary.connections.access}}</section>',
    '      <section class="buttons">',
    '            <div v-on:click="user.permissionType = \'limited\'" :class="{ active : user.permissionType == \'limited\' }">{{ui.dictionary.connections.limited}}</div',
    '           ><div v-on:click="user.permissionType = \'extended\'" :class="{ active : user.permissionType == \'extended\' }">{{ui.dictionary.connections.extended}}</div',
    '           ><div v-on:click="user.permissionType = \'full\'" :class="{ active : user.permissionType == \'full\' }">{{ui.dictionary.connections.full}}</div>',
    '       </section>',
    '       <p class="explanation" v-show="user.permissionType == \'limited\'">',
    '           {{ui.dictionary.company.permissionDescriptions.limited}}',
    '       </p>',
    '       <p class="explanation" v-show="user.permissionType == \'extended\'">',
    '           {{ui.dictionary.company.permissionDescriptions.extended}}',
    '       </p>',
    '       <p class="explanation" v-show="user.permissionType == \'full\'">',
    '           {{ui.dictionary.company.permissionDescriptions.full}}',
    '       </p>',
    '      <section class="configure" v-show="user.permissionType == \'limited\'">',
    '           <a v-on:click="ui.details = true;">{{ui.dictionary.connections.configure}} <i class="cwi-right"></i></a>',
    '      </section>',
    '   </aside>',
    
    '   <aside v-show="ui.details">',
    
    '      <section class="perm-tag">{{ui.dictionary.connections.access}}</section>',
    '       <a v-on:click="ui.details = false;"><i class="cwi-left"></i> {{ui.dictionary.connections.back}}</a>',
    '       <p class="explanation">{{ui.dictionary.company.configureDescription}}</p>',
    
    '       <section class="dash-perms">',
    '           <div class="checkbox-field"><label><input type="checkbox" v-model="user.shareAllDashboards"> <i></i> {{ui.dictionary.connections.shareAllDashboards}}</label></div>',
    '           <ul v-show="!user.shareAllDashboards">',
    '               <li v-for="dashboard in dashboards" class="checkbox-field">',
    '                   <label><input type="checkbox" v-model="dashboard._permission" v-on:change="setPermState(dashboard)"> <i></i> {{dashboard.name}}</label>',
    '               </li>',
    '           </ul>',
    '       </section><section class="other-perms">',
    '           <div class="checkbox-field"><label><input type="checkbox" v-model="user.kpiDefinitionAccess"> <i></i> {{ui.dictionary.connections.kpiDefinitionPermission}}</label></div>',
    '           <div class="checkbox-field"><label><input type="checkbox" v-model="user.companyConnectionAccess"> <i></i> {{ui.dictionary.connections.companyConnectionAccess}}</label></div>',
    '       </section>',
    '   </aside>',

    '</article>'
    ].join('');
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
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
    
    
    var methods = {
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
            var um = new CompanyUserModel();
            
            var userId = UserModel.getCompanyUserInfo().id;
            
            um.getDashboardPermissions(userId)
                .then(function(res) {
                    scope.dashboardPermissions = res.contents;
                    
                    //Map permissions to dashboards to make data models
                    if (scope.dashboards && scope.dashboards.forEach) {
                        scope.dashboards.forEach(function(dashboard) {
                            dashboard._permission = false;
                            
                            if (scope.dashboardPermissions && scope.dashboardPermissions.forEach) {
                                scope.dashboardPermissions.forEach(function(permission) {
                                    if (permission.dashboard == dashboard.id) {
                                        dashboard._permission = true;
                                        return true;
                                    }
                                });
                            }
                        });
                    }
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
            
            var um = new CompanyUserModel();
            
            this.create.forEach(function(dashboard) {
                um.createDashboardPermission(scope.user.id, dashboard.id);
            });
            
            this.remove.forEach(function(permission) {
                um.deleteDashboardPermission(scope.user.id, permission.id);
            });
            
            
            um.update(this.user)
                .then(function(res) {
                    scope.callback();
                });
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'date-field' : dateField
        },
        props : ['user', 'callback'],
        mounted : function() {
            this.init();
        }
    });
});
