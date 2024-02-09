<template>
    <article class="manual-run" v-show="connection || hasRunningJob || isInConnectionRoute">
        <section>
            <button class="accent tooltip" @click="startManualRun" :disabled="hasRunningJob || isInConnectionRoute">
                <span v-show="!hasRunningJob || isInConnectionRoute">{{ui.dictionary.manualrun.start}}</span>
                <span v-show="hasRunningJob">{{ui.dictionary.manualrun.inprogress}}</span>
                <span class="loader" v-show="hasRunningJob || !isInConnectionRoute"></span>
                <span v-show="!hasRunningJob && isInConnectionRoute" class="message left right-arrow-tooltip" style="width: 250px; margin-top: -10px;">{{ui.dictionary.manualrun.open}}</span>
            </button>
        </section>
    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import ErpModel from 'models/ErpModel'
    import ContextModel from 'models/ContextModel'
    import ManualRun from 'services/ManualRun'
    import EventBus from 'services/EventBus'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        },
        jobs : ManualRun.getJobs(),
        connectionID : null,
        pollDelay : 10000,
        context : ContextModel.getContext()
    })

    const methods = {
        init() {
            if (this.jobs === null) {
                this.getRunningJobs();
            }
            EventBus.$on('companyUserChanged', this.resetJobs);
            this.isShowManualRun();
        },

        resetJobs() {
            ManualRun.resetJobs();
            this.connectionID = null;
            this.context = ContextModel.getContext();
            this.getRunningJobs();
        },

        isShowManualRun() {
            this.show = true;
        },

        getRunningJobs() {
            ManualRun.fetchJobs()
                .then(function (res) {
                    if (res._embedded && res._embedded.items) {
                        this.jobs = res._embedded.items;
                        ManualRun.setJobs(res._embedded.items);
                        this.getConnectionID(res._embedded.items);
                    }
                }.bind(this));
        },

        getConnectionID(jobs) {
            this.connectionID = null;
            if (jobs[0] && jobs[0].company_connection_id && jobs[0].running) {
                this.connectionID = jobs[0].company_connection_id;
            }

            if (this.connectionID) {
                this.pollStatus();
            }
        },

        startManualRun() {
            this.connectionID = this.connection.id;
            ManualRun.createJob()
                .then(function (res) {
                    this.pollStatus();
                }.bind(this));
        },

        pollStatus() {
            setTimeout(function () {
                this.getRunningJobs();
            }.bind(this), this.pollDelay);
        },

        statusHoverText() {
            return (!hasRunningJob && isInConnectionRoute) ? 'Open a connection to start a manual run' : null;
        }
    };

    const computed = {
        hasRunningJob() {
            return this.connectionID !== null;
        },
        isInConnectionRoute() {
            return this.$route.path.indexOf('/account/connections') == 0;
        }
    };

    export default {
        data,
        methods,
        computed,
        props: {
            connection: {}
        },
        mounted() {
            EventBus.$on('callManualRun', () => {
                this.init();
            });
            this.init();
        }
    }
</script>
