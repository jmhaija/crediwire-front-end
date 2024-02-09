   import Vue from 'Vue'
   import DictionaryModel from 'models/DictionaryModel'
   import CompanyStatsCollection from 'collections/CompanyStatsCollection'
   import EventBus from 'services/EventBus'

    const template = `
        <article class="connections">
           <h1>{{ui.dictionary.companyStats.title}}</h1>
           <div class="working" v-show="ui.loading"></div>
        
           <section v-if="!ui.loading">
               <div v-show="ui.noData || items.length === 0">
                   {{ui.dictionary.companyStats.noData}}
               </div>
               <div v-if="!ui.noData && items.length > 0">
                   <table class="stats-table">
                       <thead>
                           <tr class="primary-headings">
                               <th>{{ui.dictionary.companyStats.name}}</th>
                               <th>{{ui.dictionary.companyStats.total}}</th>
                               <th>{{ui.dictionary.companyStats.conversions}}</th>
                               <th>{{ui.dictionary.companyStats.lastWeek}}</th>
                               <th>{{ui.dictionary.companyStats.lastWeekChange}}</th>
                               <th>{{ui.dictionary.companyStats.lastMonth}}</th>
                               <th>{{ui.dictionary.companyStats.lastMonthChange}}</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr v-for="item in items">
                               <td>{{item.name}}</td>
                               <td>{{item.total}}</td>
                               <td>{{calcPercent(item.total_converted, item.total)}}%</td>
                               <td>{{item.week}}</td>
                               <td>
                                   {{calcPercentDiff(item.week, item.week_previous)}}
                                   <span v-show="item.week >= item.week_previous && item.week_previous !== 0" class="bold ok-color">&#11014;</span>
                                   <span v-show="item.week < item.week_previous && item.week_previous !== 0" class="bold warn-color">&#11015;</span>
                               </td>
                               <td>{{item.month}}</td>
                               <td>
                                   {{calcPercentDiff(item.month, item.month_previous)}}
                                   <span v-show="item.month >= item.month_previous && item.month_previous !== 0" class="bold ok-color">&#11014;</span>
                                   <span v-show="item.month < item.month_previous && item.month_previous !== 0" class="bold warn-color">&#11015;</span>
                               </td>
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
            noData : false
        },
        items : []
    });


    const methods = {
        init() {
            EventBus.$on('companyUserChanged', this.loadData);
            this.getStats();
        },

        getStats() {
            this.ui.loading = true;
            this.ui.noData = false;

            CompanyStatsCollection.getStats()
                .then(function(res) {
                    if (res && res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.items = res._embedded.items;
                    } else {
                        this.ui.noData = true;
                    }

                    this.ui.loading = false;
                }.bind(this));
        },

        calcPercent(num, total) {
            if (!total || total === 0) {
                return 0;
            }

            return Math.round( (num / total) * 100 );
        },

        calcPercentDiff(current, previous) {
            var total = previous;

            if (total === 0) {
                return 'N/A';
            }

            var delta = current - previous;

            return Math.abs(Math.round( (delta / total) * 100) ) + '%';
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        mounted() {
            this.init();
        }
    });
