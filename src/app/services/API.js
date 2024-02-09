/**
 * A CRRUD wrapper around fetch/HTTP object.
 *
 * The methods map to HTTP methods as (url is relative resource url, body is in JSON):
 * create(url, body) : POST
 * retrieve(url) : GET
 * replace(url, body) : PUT
 * update(url, body) : PATCH
 * delete(url) : DELETE
 */
import Vue from 'vue'
import vueResource from 'vue-resource'
import Raven from 'raven-js'
import Config from 'services/Config'
import XSRFModel from 'models/XSRFModel'
import Partner from 'services/Partner'

Vue.use(vueResource)

// Generic headers to send with every request
var headers = {
    'Content-Type': 'application/json',
    'Cache-control' : 'no-cache',
    'Pragma' : 'no-cache'
};


// Do not abort these requests
var doNotAbort = [
    /\/profile/,
    /\/erp/,
    /\/company-user\/_self/,
    /\/company\/_all/,
    /\/dashboard\/_all/,
    /\/custom-export/,
    /\/logout/,
    /\/process-invitation/,
    /\/process-user-invitation/,
    /\/decline-invitation/,
    /\/industry-codes/,
    /\/agreement/,
    /include=toCompany/,
    /budget-loaded-file/,
    /budget-current-version/,
    /annual-report/,
    /department/,
    /manual-run/
];


// Contains queue of xhr requests
var requests = [];

// Check the status of the response
var checkStatus = function (response) {
    if (response.status == 401 && window.location.pathname != '/') {
        var paths = Partner.getCodes();
        paths.push('/session-timeout');
        paths.push('/login');
        paths.push('/register');
        paths.push('/forgot');
        paths.push('/recover');
        paths.push('/client');
        paths.push('/export');
        paths.push('/decline-invitation');
        paths.push('/connection/see');
        for (var i = 0; i < paths.length; i++) {
            if (window.location.href.indexOf(paths[i]) >= 0) {
                return response;
            }
        }

        // Raven debug
        if (window.location.pathname.indexOf('/connect') >= 0) {
            Raven.captureMessage('ERP redirect flow failed!', {
                extra : {
                    'xsrf-token' : sessionStorage.getItem('xsrf-token'),
                    'client' : sessionStorage.getItem('client')
                }
            });
        }

        if (response.url.indexOf('/profile') < 0) {
            window.location.href = '/session-timeout';
        }
        return response;
    } else {
        return response;
    }
};

// Guard before request is fired off
var beforeRequest = function(xhr) {
    requests.push(xhr);
};


// Check for exact duplicate requests
var duplicateRequest = function(url, method) {
    //Disable this feature for now
    return false;

    //For now limit to only certain URLs
    if (url.indexOf('/_self') < 0) {
        return false;
    }

    var found = false;

    requests.forEach(function(existing) {
        var existingUrl = existing.url.indexOf('?uts=') >= 0 ? existing.url.substring(0, existing.url.indexOf('?uts=')) : existing.url.substring(0, existing.url.indexOf('&uts='));
        if (existing.method == method && existingUrl == (Config.get('apiUrl') + url)) {
            found = true;
            console.log('Duplicate request to ' + url + ' stopped.');
        }
    });

    return found;
};

// Callback for after request is completed
var afterRequest = function(response) {
    requests.forEach(function(request, index) {
        if (request.url == response.url) {
            requests.splice(index, 1);
        }
    });

    return response;
};

// Test URL against abort blacklist
var inAbortBlacklist = function(url) {
    var found = false;

    doNotAbort.forEach(function(entry) {
        if (entry.test(url)) {
            found = true;
        }
    });

    return found;
};


var addStamp = function(url) {
    var stamp = Date.now() + (Math.random() * 1000).toFixed();
    if (url.indexOf('?') > 0) {
        return url + '&uts=' + stamp;
    } else {
        return url + '?uts=' + stamp;
    }
};

/**
 * Create a new resource.
 *
 * @param string url The URL of the resource
 * @param JSON body Representation of the resource
 * @return promise Function with success and failure callbacks.
 */
const create = function (url, body) {
    if (duplicateRequest(url, 'POST')) {
        return false;
    }

    return Vue.http.post(Config.get('apiUrl') + addStamp(url), JSON.stringify(body), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}


/**
 * Retrieve a new resource.
 *
 * @param string url The URL of the resource
 * @return promise Function with success and failure callbacks.
 */
const retrieve = function (url, stream) {
    if (duplicateRequest(url, 'GET')) {
        return false;
    }
    return Vue.http.get(Config.get('apiUrl') + addStamp(url), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest,
        responseType : stream ? 'arraybuffer' : 'text'
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

/**
 * Replace a resource (completely over-write)
 *
 * @param string url The URL of the resource
 * @param JSON body Representation of the resource
 * @return promise Function with success and failure callbacks.
 */
const replace = function (url, body) {
    if (duplicateRequest(url, 'PUT')) {
        return false;
    }

    return Vue.http.put(Config.get('apiUrl') + addStamp(url), JSON.stringify(body), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

/**
 * Update a resource
 *
 * @param string url The URL of the resource
 * @param JSON body Representation of the resource
 * @return promise Function with success and failure callbacks.
 */
const update = function (url, body) {
    if (duplicateRequest(url, 'PATCH')) {
        return false;
    }
    return Vue.http.patch(Config.get('apiUrl') + addStamp(url), JSON.stringify(body), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

/**
 * Delete a resource.
 *
 * @param string url The URL of the resource
 * @return promise Function with success and failure callbacks.
 */
const remove = function (url) {
    if (duplicateRequest(url, 'DELETE')) {
        return false;
    }

    return Vue.http.delete(Config.get('apiUrl') + addStamp(url), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

/**
 * Check if a resource exists.
 *
 * @param string url The URL of the resource
 * @return promise Function with success and failure callbacks.
 */
const exists = function (url) {
    return Vue.http.head(Config.get('apiUrl') + addStamp(url), {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'true'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

// Do a "hard" check if a resource exists by trying to create
// a resource without persisting it (using x-persist header).
const hardExists = function (url, body) {
    return Vue.http.post(Config.get('apiUrl') + addStamp(url), JSON.stringify(body) , {
        headers : {
            'Content-Type' : headers['Content-Type'],
            'X-Xsrf-Token' : XSRFModel.get(),
            'X-Persist' : 'false'
        },
        credentials : Config.get('corsCredentials'),
        before : beforeRequest
    }).then(afterRequest)
        .then(function (response) {
            return response;
        }, checkStatus);
}

// Abort all requests
const abortAllPendingRequests = function() {
    for (var i = 0; i < requests.length; i++) {
        if (!inAbortBlacklist(requests[i].url)) {
            requests[i].abort();
        }
    }
}

export {
    create,
    retrieve,
    replace,
    update,
    remove,
    exists,
    hardExists,
    abortAllPendingRequests,
}
