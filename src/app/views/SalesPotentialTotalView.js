define([
    
    'Vue',
    'collections/SalesPotentialDataCollection'
    
],function(Vue, SalesPotentialDataCollection) {
    /**
     * View template
     */
    var template = [
    '<article>',
    '   Sales Potential Total',
    '</article>'
    ].join('');
    
    
    /**
     * Bindings
     */
    var bindings = function () {
        return {
            
        };
    };
    
    /**
     * Methods
     */
    var methods = {
        init : function() {
            SalesPotentialDataCollection.getSalesPotentialTotal()
                .then(function (res) {
                    console.log(res);
                });
        }
    };
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        mounted : function() {
            this.init();
        }
    });
});
