/**
 * Small utility based off amd-loader
 * https://www.npmjs.com/package/amd-loader
 * 
 * Uses the same module extraction as amd-loader,
 * but simply returns the raw factory (function, object)
 * of the AMD module so that it could be tested as a
 * truly independent unit.
 */

var moduleStack = [];
var defaultCompile = module.constructor.prototype._compile;

module.constructor.prototype._compile = function(content, filename){  
    moduleStack.push(this);
    try {        
        return defaultCompile.call(this, content, filename);
    }
    finally {
        moduleStack.pop();
    }
};

global.define = function (id, injects, factory) {

    // infere the module
    var currentModule = moduleStack[moduleStack.length-1];
    var mod = currentModule || module.parent || require.main;
    
    // parse arguments
    if (!factory) {
        // two or less arguments
        factory = injects;
        if (!factory) {
            // only one arg, just the factory
            factory = id;
        }
    }
    
    return mod.exports = factory;
};
