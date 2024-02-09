define([
    
    'Vue',
    'models/DictionaryModel',
    'models/ErpModel'
    
],function(Vue, DictionaryModel, ErpModel) {
    /**
     * View template
     */
    var template = [
        '<article>',
        '   <section class="splash">',
        '       <h1>{{ui.dictionary.erp.seges.splash}}</h1>',
        '       <p>{{ui.dictionary.erp.seges.requestSent}}</p>',
        '   </section>',
        '</article>'
    ].join("\n");
    
    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
            }
        };
    };
    
    
    var methods = {
    };
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods
    });
});
