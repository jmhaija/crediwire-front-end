define([
    'models/ContextModel',
], function(ContextModel) {
    return {
        data: function() {
            return  {
                context: ContextModel.getContext()
            };
        },
        computed: {
            isInContext() {
                return !!this.context;
            }
        }
    };
});
