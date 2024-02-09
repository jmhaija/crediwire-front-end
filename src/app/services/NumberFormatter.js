define([
    'models/DictionaryModel'
], function(DictionaryModel) {
    return {
        format : function(value) {
            var dictionary = DictionaryModel.getHash();
            
            value = parseFloat(value).toFixed(2);
            
            if (isNaN(value)) {
                value = parseFloat(0).toFixed(2);
            }
            
            value = String(value).replace('.', '__');
            value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, dictionary.meta.thousandSeparator);
            return String(value).replace('__', dictionary.meta.decimalSymbol);
        },
        
        abbreviate : function(value, largeOnly, toOne) {
            var dictionary = DictionaryModel.getHash();
            
            if (value > 999999999 || value < -999999999) {
                value = Math.round((value / 1000000000) * 10) / 10 + ' ' + dictionary.meta.billions;
            } else if (value > 999999 || value < -999999) {
                value = Math.round((value / 1000000) * 10) / 10 + ' ' + dictionary.meta.millions;
            } else if (largeOnly && (value > 9999 || value < -9999)) {
                value = Math.round((value / 1000) * 10) / 10 + ' ' + dictionary.meta.thousands;
            } else if (!largeOnly && (value > 999 || value < -999)) {
                value = Math.round((value / 1000) * 10) / 10 + ' ' + dictionary.meta.thousands;
            } else if (toOne) {
                value = (Math.round(value * 100) / 100).toFixed(1);
            } else {
                value = (Math.round(value * 100) / 100).toFixed(2);
            }
                    
            return String(value).replace('.', dictionary.meta.decimalSymbol);
        }
    };
});
