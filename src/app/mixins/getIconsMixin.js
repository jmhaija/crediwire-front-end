    export default {
        methods: {
            getGraphIcon: function(page, footer) {
                if (!footer) {
                    return !!((page.pseudo_dashboard === '_general' || page.dashboard_id || page.dashboard || page.kpi_drill_down) && !page.aggregations);
                } else {
                    return !!(!page.front_page && (page.pseudo_dashboard === '_general' || page.dashboard_id || page.dashboard || page.kpi_drill_down) && !page.aggregations);
                }
            },

            getChartIcon: function(page, footer) {
                if (!footer) {
                    return !!((page.pseudo_dashboard === '_general' || page.dashboard_id || page.dashboard) && page.aggregations);
                } else {
                    return !!(!page.front_page && (page.pseudo_dashboard === '_general' || page.dashboard_id || page.dashboard) && page.aggregations);
                }
            },

            getTableIcon: function(page, footer) {
                if (!footer) {
                    return !!(page.pseudo_dashboard === '_palbal' || page.context === 'invoice' || page.context === 'financial_report');
                } else {
                    return !!(!page.front_page && page.pseudo_dashboard === '_palbal' || page.context === 'invoice' || page.presentation_upload_id || page.context === 'financial_report');
                }
            },
        }
    };
