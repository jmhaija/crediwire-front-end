<template>
    <article class="connection-warnings">
       <nav class="tabs">
           <ul>
               <li :class="{ active : ui.section === 'warnings' }"><a v-on:click="ui.section = 'warnings'">{{ui.dictionary.warnings.warnings}}</a></li>
               <li :class="{ active : ui.section === 'settings' }"><a v-on:click="ui.section = 'settings'">{{ui.dictionary.warnings.settings}}</a></li>
           </ul>
       </nav>
       <section class="tab-content>">
<!--        /**-->
<!--        * Warnings section-->
<!--        */-->
            <section class="warnings" v-show="ui.section === 'warnings'">
                <div class="empty" v-show="!warnings || warnings.length === 0">
                  {{ui.dictionary.warnings.empty}}
                </div>

                <div class="warning-list" v-show="warnings">
                   <div class="warning" v-for="warning in warnings" v-on:click="showConditions(warning)">
                       <span class="param">{{getDate(warning.created)}}</span>
                       <span class="param">{{getTime(warning.created)}}</span>
                       <span class="param">{{warning.earlyWarning.name}}</span>
                       <div v-if="warning.showConditions" class="conditions">
                           <condition-summary :warnId="warning.earlyWarning.id" :values="warning.values"></condition-summary>
                       </div>
                   </div>
               </div>
           </section>

<!--        /**-->
<!--        * Settings section-->
<!--        */-->
          <section class="settings" v-show="ui.section === 'settings'">
            <div v-show="ui.loading" class="working"></div>
               <div v-if="!ui.loading">
                   <p>{{ui.dictionary.warnings.active}}</p>
                   <div v-for="warning in warningList" class="zero-padding">
                       <warning-exception :warning="warning" :connection="connection"></warning-exception>
                   </div>
               </div>
          </section>

       </section>
    </article>
</template>

<script>
    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'
    import WarningsCollection from 'collections/WarningsCollection'
    import conditionSummary from 'elements/condition-summary'
    import warningException from 'components/warningException.vue'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            section : 'warnings',
            loading : true
        },
        warningList : []
    })

    const methods = {
        init() {
            this.getWarnings();
        },

        getDate(dateString) {
            return moment(dateString).format(this.ui.dictionary.locale.displayFormat);
        },

        getTime(dateString) {
            return moment(dateString).format(this.ui.dictionary.locale.timeDisplayFormat);
        },

        showConditions(warning) {
            if (warning.showConditions) {
                Vue.set(warning, 'showConditions', false);
            } else {
                Vue.set(warning, 'showConditions', true);
            }
        },

        getWarnings() {
            var scope = this;
            var wc = new WarningsCollection();

            wc.getWarnings()
                .then(function(res) {
                    scope.warningList = res.contents;
                    scope.ui.loading = false;
                });
        }
    }

    export default {
        data,
        methods,
        props: {
            warnings: {},
            connection: {}
        },
        components : {
            'condition-summary' : conditionSummary,
            'warning-exception' : warningException
        },
        mounted() {
            this.init();
        }
    }


</script>
