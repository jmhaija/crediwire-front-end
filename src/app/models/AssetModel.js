define([

    'config/assets'
    
], function(assets) {
    return function(assetPath) {
        var key = assetPath.replace('/assets/', '');
        
        if (assets[key]) {
            assetPath = '/assets/' + assets[key];
        }
        
        var info = function(string) {
            var parts = string.split('/');
            var last = parts.pop();
            var fileInfo = last.split('.');
            return {
                basename : fileInfo[0],
                ext : fileInfo[1],
                dir : parts.join('/')
            };
        };
        
        var fileInfo = info(assetPath);
        
        var assetDir = fileInfo.dir + '/';
        var assetBase =  fileInfo.basename;
        var assetExt = fileInfo.ext;
        var assetFile = assetBase + '.' + assetExt;
        
        return {
            file : assetFile,
            base : assetBase,
            extension : assetExt,
            path : assetDir + assetFile
        };
    };
});
