define([
    
    'Vue',
    'models/DictionaryModel'
    
], function(Vue, DictionaryModel) {
    var template = [
    '<div>',
    '   <p>{{ui.dictionary.onboarding.tutorial[tutorial.current.name]}}</p>',
    '</div>',
    ].join('');
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash()
            }
        };
    };
    
    
    var methods = {
        getSteps : function(string) {
            string = string.replace(':step', this.tutorial.state.step + 1);
            string = string.replace(':total', this.tutorial.steps.length);
            return string;
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['tutorial']
    });
});
