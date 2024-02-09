define([
    
    'Vue',
    'models/DictionaryModel',
    'elements/stats-table'
    
], function (Vue, DictionaryModel, statsTable) {
    
    var template = [
    '<tr>',
    '   <td>',
    '       Dept',

    '       <span v-show="department.childDepts.length > 0" style="width: 15px; display: inline-block;">',
    '           <span v-show="!department.openChildren">+</span>',
    '           <span v-show="department.openChildren">&ndash;</span>',
    '       </span>',
    '   </td>',
    '</tr>',
    ].join('');
    
    
    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash()
            }
        };
    };
    
    return Vue.extend({
        template : template,
        props : ['department', 'getGoalValue', 'getConversionPercent', 'getGoalValuePercent', 'getLoginsPerWeek'],
        components : {
            'stats-table' : statsTable
        }
    });
});
