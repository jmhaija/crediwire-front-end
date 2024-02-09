<template>
    <article>
        <div v-show="ui.loading" class="working"></div>
           <div v-show="!ui.loading" class="zero-padding">
              <div class="checkbox-field zero-padding">
                  <label><input type="checkbox" v-model="warning.checked" v-on:change="syncIncludeExclude()"> <i></i> {{warning.name}}</label>
              </div>
           </div>
    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import WarningExceptionModel from 'models/WarningExceptionModel'
    import WarningsCollection from 'collections/WarningsCollection'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            saving : false,
            changes : false
        },
        include : false,
        exclude : false
    })

    const methods = {
        init() {
            this.getIncludeExclude();
        },

        getIncludeExclude() {
            var scope = this;
            var wc = new WarningsCollection();

            if (this.warning.all) {
                wc.getExclude(this.warning.id)
                    .then(function(res) {
                        scope.exclude = res.contents;
                        scope.filterResults(scope.exclude);
                        scope.ui.loading = false;
                    });
            } else {
                wc.getInclude(this.warning.id)
                    .then(function(res) {
                        scope.include = res.contents;
                        scope.filterResults(scope.include);
                        scope.ui.loading = false;
                    });
            }
        },

        filterResults(exceptions) {
            this.warning.checked = !!this.warning.all;

            exceptions.forEach(function(exception) {
                if (exception.connection == this.connection) {
                    this.warning.checked = !this.warning.checked;
                }
            }, this);
        },

        syncIncludeExclude() {
            var scope = this;
            var type = this.warning.all ? 'exclude' : 'include';
            var obj = { connection : this.connection };
            var wem = new WarningExceptionModel(this.warning.id);

            this.ui.changes = true;
            this.ui.saving = true;

            if (this.warning.checked) {
                if (type == 'include') {
                    //Create include
                    wem.createInclude(obj)
                        .then(function(res) {
                            scope.ui.changes = false;
                            scope.ui.saving = false;
                            scope.include.push(res);
                        });

                } else if (type == 'exclude') {
                    //Delete exclude
                    this.exclude.forEach(function(item, index) {
                        if (this.connection == item.connection) {
                            wem.deleteExclude(item.id)
                                .then(function() {
                                    scope.ui.changes = false;
                                    scope.ui.saving = false;
                                    scope.exclude.splice(index, 1);
                                });
                        }
                    }, this);


                    /**
                     wem.createExclude(obj)
                     .then(function(res) {
                            scope.ui.changes = false;
                            scope.ui.saving = false;
                            scope.exclude.push(res);
                        });
                     */
                }
            } else {
                if (type == 'include') {
                    //Delete include
                    this.include.forEach(function(item, index) {
                        if (this.connection == item.connection) {
                            wem.deleteInclude(item.id)
                                .then(function() {
                                    scope.ui.changes = false;
                                    scope.ui.saving = false;
                                    scope.include.splice(index, 1);
                                });
                        }
                    }, this);
                } else if (type == 'exclude') {
                    //Create exclude
                    wem.createExclude(obj)
                        .then(function(res) {
                            scope.ui.changes = false;
                            scope.ui.saving = false;
                            scope.exclude.push(res);
                        });
                }
            }
        }
    }

    export default {
        data,
        methods,
        props: {
            warning: {},
            connection: {}
        },
        mounted() {
            this.init();
        }
    }

</script>
