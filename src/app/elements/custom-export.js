define([

    'Vue',
    'FileSaver',
    'models/DictionaryModel',
    'models/ExportModel',
    'models/CompanyModel',
    'models/UserModel',
    'collections/ExportCollection',
    'services/EventBus'

], function(Vue, FileSaver, DictionaryModel, ExportModel, CompanyModel, UserModel, ExportCollection, EventBus) {
    var template = [
    '<article class="custom-export-bar" v-if="exports.length > 0 || (profile && profile.roles && profile.roles.indexOf(\'dashboard_export_role\') >= 0 && isGeneralDashboard)">',
    '   <section class="custom-export">',
    '     <div class="working" v-show="ui.downloading"></div>',
    '     <section v-show="!ui.loading && !ui.downloading" class="flex-row flex-align-center">',
    '         <i class="cwi-download export" v-on:click.stop="ui.showExportOptions = true"></i>',
    '         <div class="selector inline">',
    '             <div class="label" v-on:click.stop="ui.showExportOptions = true">',
    '                 <span>{{ui.dictionary.export.title}}</span> <i class="cwi-down"></i>',
    '                 <div class="options" v-bind:class="{ show : ui.showExportOptions }">',
    '                     <div class="option" v-for="exp in exports" v-on:click.stop="exportToExcel(exp)" v-show="!ui.mappingInvalid">',
    '                         <span v-show="exp.name">{{exp.name}}</span><span v-show="!exp.name">{{exp.id}}</span>',
    '                     </div>',
    '                     <div class="option" v-on:click="exportDashboard()" v-show="isGeneralDashboard && profile && profile.roles && profile.roles.indexOf(\'dashboard_export_role\') >= 0">',
    '                         {{ui.dictionary.export.dashboard}}',
    '                     </div>',
    '                 </div>',
    '             </div>',
    '         </div>',
    '     </section>',
    '     <section v-show="!ui.loading && ui.mappingInvalid && !(profile && profile.roles && profile.roles.indexOf(\'dashboard_export_role\') >= 0)">',
    '         <small class="faded">{{ui.dictionary.export.unavailable}} <i class="cwi-info" :title="ui.dictionary.export.invalidMapping"></i></small>',
    '     </section>',
    '   </section>',
    '</article>',
    ].join('');

    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                showExportOptions : false,
                downloading : false,
                mappingInvalid : false
            },
            exports : [],
            profile : UserModel.profile()
        };
    };


    var methods = {
        init : function() {
            EventBus.$on('companyContextChanged', this.getExportList);
            EventBus.$on('dashboardExportCompleted', this.endExportLoader);
            document.addEventListener('clickAppBody', this.closeAllOptions);

            this.getExportList();
        },


        endExportLoader : function () {
            this.ui.downloading  = false;
        },

        exportDashboard : function () {
            this.ui.downloading = true;
            setTimeout(function () {
                this.closeAllOptions();
            }.bind(this), 100);

            this.exportDashboardHandler();
        },

        exportToExcel : function(exportFile) {
            if (exportFile && exportFile.id) {
                this.ui.downloading = true;
                var em = new ExportModel(exportFile.id);

                em.getExport()
                    .then(function(data) {
                        var blob = new Blob([data], {
                            type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        FileSaver.saveAs(blob, (exportFile.name || 'export') + '.xlsx');
                        this.ui.downloading = false;
                    }.bind(this));

                this.closeAllOptions();
            }
        },


        getExportList : function() {
            if (!CompanyModel.getCompany() || !CompanyModel.getCompany().id) {
                return false;
            }

            var scope = this;
            var ec = new ExportCollection();


            scope.exports = [];
            scope.ui.mappingInvalid = false;

            ec.getExportList()
                .then(function(res) {
                    if (res.export_list) {
                        scope.exports = res.export_list;
                    } else if (res.errors && res.errors[0] && res.errors[0].type == 'MappingNotValidatedException') {
                        scope.ui.mappingInvalid = true;
                    }

                    scope.ui.loading = false;
                });
        },

        closeAllOptions : function() {
            this.ui.showExportOptions = false;
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['exportDashboardHandler', 'isGeneralDashboard'],
        mounted : function() {
            this.init();
        },
        beforeDestroy : function() {
            EventBus.$off('companyContextChanged');
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        }
    });
});
