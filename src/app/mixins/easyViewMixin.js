    export default {
        methods: {
            checkEasyView: function(params) {
                if (params.graphType === 'line' && params.isEasyView !== null) {
                    this.$store.dispatch("setEasyView", Boolean(params.isEasyView));
                }
            }
        }
    };
