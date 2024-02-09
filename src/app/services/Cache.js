/**
 * A CRRUD wrapper around a hash object kept in memory.
 * 
 * For each method, a promise is returned using the .then() method.
 * The promise will invoke either the success of failure callback. Each callback
 * will be injected with a response object.
 * 
 * The response callbacks are injected with DataResponseInterface object or a 
 * DataErrorInterface object.
 * See : https://bitbucket.org/crediwire/frontend-v2/wiki/DataResponseInterface
 * See : https://bitbucket.org/crediwire/frontend-v2/wiki/DataErrorInterface
 */
define([

    'q'
    
], function(q) {
    //Stores all of the data as a singleton
    var hash = {};
    
    //Generate DataResponseInterface object
    var genereateDataResponse = function(status, data) {
        return {
            ok : status,
            text : function() { return data; },
            json : function() { return JSON.parse(data); }
        };
    };
    
    return {
        /**
         * Create a resource.
         * 
         * @param key string The name of the resource.
         * @param value mixed The value of the resource.
         * @return promise To evaluate response or error.
         */
        create : function(key, value) {
            var d = q.defer();
            
            //Already exists
            if (hash[key]) {
                d.reject({ response : 'resource_exists', description : 'The resource you are trying to create already exists' });
                return d.promise;
            }
            
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
            
            hash[key] = value;
            d.resolve( genereateDataResponse(true, hash[key]) );
            
            return d.promise;
        },
        
        /**
         * Retrieve a resource.
         * 
         * @param key The name of the resource.
         * @return promise To evaluate response or error.
         */
        retrieve : function(key) {
            var d = q.defer();
            
            //Does not exist
            if (!hash[key]) {
                d.reject({ response : 'not_found', description : 'The resource you are trying to retrieve does not exist' });
                return d.promise;
            }
            
            d.resolve( genereateDataResponse(true, hash[key]) );
            return d.promise;
        },
        
        /**
         * Completely replace a resource.
         * 
         * @param key The name of the resource.
         * @param value The new value of the resource.
         * @return promise To evaluatte response or error.
         */
        replace : function(key, value) {
            var d = q.defer();
            
            //Does not exist
            if (!hash[key]) {
                d.reject({ response : 'not_found', description : 'The resource you are trying to replace does not exist' });
                return d.promise;
            }
            
            if (typeof value == 'object') {
                value = JSON.stringify(value);
            }
            
            hash[key] = value;
            
            d.resolve( genereateDataResponse(true, hash[key]) );
            return d.promise;
        },
        
        /**
         * Update a resource (objects are "extended").
         * 
         * @param key The name of the resource.
         * @param value The updated value of the resource.
         * @return promise To evaluate response or error.
         */
        update : function(key, value) {
            var d = q.defer();
            
            //Does not exist
            if (!hash[key]) {
                d.reject({ response : 'not_found', description : 'The resource you are trying to update does not exist' });
                return d.promise;
            }
            
            //Type mismatch
            if (typeof JSON.parse(hash[key]) !== typeof value) {
                d.reject({ response : 'type_mismatch', description : 'The resource you are trying to update is not of the same type as the supplied value' });
                return d.promise;
            }
            
            //Iterate through object
            if (typeof value == 'object') {
                var originalObject = JSON.parse(hash[key]);
                for (var attrname in value) { originalObject[attrname] = value[attrname]; }
                hash[key] = JSON.stringify(originalObject);
            } else {
                hash[key] = value;
            }
            
            d.resolve( genereateDataResponse(true, hash[key]) );
            return d.promise;
        },
        
        /**
         * Delete a resource.
         * 
         * @param key The name of the resource.
         * @return promise To evaluate response or error.
         */
        delete : function(key) {
            var d = q.defer();
            
            //Does not exist
            if (!hash[key]) {
                d.reject({ response : 'not_found', description : 'The resource you are trying to delete does not exist' });
                return d.promise;
            }
            
            delete hash[key];
            
            d.resolve( genereateDataResponse(true, null) );
            return d.promise;
        },
        
        /**
         * Check if a resource exists.
         * 
         * @param key The name of the resource.
         * @return promise To evaluate response or error.
         */
        exists : function(key) {
            var d = q.defer();
            
            if (!hash[key]) {
                d.reject({ response : 'not_found', description : 'The resource you are trying to retrieve does not exist' });
                return d.promise;
            }
            
            d.resolve( genereateDataResponse(true, null) );
            return d.promise;
        }
    };
});
