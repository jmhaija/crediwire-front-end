// This is the main bootstrap file for the Crediwire application.
// eslint-disable-next-line import/no-amd, import/no-unused-modules
define([
    'services/Config',
    'Vue',
    'VueRouter',
    'VueResource',
    'Vuex',
    'VModal',
    'Raven',
    'RavenVue',
    'Promise',
    'VTooltip',
    'jQuery',
    'datepicker',
    'Highcharts',
    'HighchartsMore',
    'config/routes',
    'config/browsers',
    'collections/LanguageCollection',
    'models/BrowserModel',
    'models/DictionaryModel',
    'models/UserModel',
    'models/CompanyModel',
    'models/XSRFModel',
    'services/API',
    'store/store',
    'store/persist-store',
    'directives/close-on-escape-press',
    'directives/handle-enter-press',
    'services/CookieConsent',
    'services/Track'

    // `jQuery`, `datepicker` are static imports,
    // it is fine that they are not used.

// eslint-disable-next-line @getify/proper-arrows/params
], (Config, Vue, VueRouter, VueResource, Vuex, VModal, Raven, RavenVue, Promise, VTooltip, jQuery, datepicker, Highcharts, HighchartsMore, routes, browsers, LanguageCollection, BrowserModel, DictionaryModel, UserModel, CompanyModel, XSRFModel, API, storeConfig, persistStore, closeOnEscapePress, handleEnterPress, CookieConsent, Track) => {
    // eslint-disable-next-line fp/no-let
    let store = null

    const installRaven = ({
          ravenDSN,
          ravenDebug: debug,
          environment,
          release,
          ravenWhitelist: whitelistUrls
      }) => {
        Raven.config(ravenDSN, {
            autoBreadcrumbs: true,
            maxBreadcrumbs: 20,
            debug,
            environment,
            release,
            whitelistUrls
        })
            .addPlugin(RavenVue, Vue)
            .install()
    }

    const setCookieConsent = () => {
        if (!window.location.href.includes('/embed')) {
            CookieConsent.install()
        }
    }

    // Before route hook.

    // This function is called once before a route is changed.
    // This is best for conducting operations that need to be done
    // before each route completes loading.

    // to is the route that is being navigate to,
    // from is the route that is being navigated away from,
    // next is the action hook itself, next() MUST be called in order
    // for the hook to be resolved.
    const beforeRoute = function beforeRoute(to, _, next) {
        if (!to.path.includes('/embed') && !to.query.path) {
            Track.ga.setPage(to.fullPath)
            Track.ga.sendPageView()
            Track.fb.track('track')
            Track.ic.update()
            // Abort all pending requests
            API.abortAllPendingRequests()
        }
        next()
    }

    // Bootstrap the router
    // - Bootstrap VueRouter
    // - Instantiate router and define routes
    // - Mount application to main app-root element in index.html
    const bootstrapRouter = function bootstrapRouter() {
        // Mount router
        Vue.use(VueRouter)

        const router = new VueRouter({
            mode: 'history',
            routes: routes.default
        })

        router.beforeEach(beforeRoute)

        const app = new Vue({
            router,
            store
        })

        app.$mount('#app-root')

        // Check browser compatibility
        // eslint-disable-next-line fp/no-loops, no-restricted-syntax
        for (const element of browsers) {
            const {name, version} = element
            if (BrowserModel.browser[name] && Number(BrowserModel.browser.version) < version) {
                // This is the Router API, not a mutation
                // eslint-disable-next-line fp/no-mutating-methods
                router.push('/unsupported')
            }
        }
    }

    // Bootstrap the environment.

    // Set up any environment models or services required before
    // loading the first view.

    // This method acts as a one-time configuration function.
    // So, if something needs to be configured once before running
    // the app, do it here.

    // TODO: Refactor this function
    // eslint-disable-next-line sonarjs/cognitive-complexity
    const init = function init(settings) {
        // Set the configuration settings.
        Config.settings(settings)

        // Mostly for IE11 : create Promise object.
        // This is a polyfill and is attached to the global
        // window object for other libs to use (such as fetch)
        // as part of the browser API.
        if (!window.Promise) {
            // eslint-disable-next-line fp/no-mutation
            window.Promise = Promise
        }

        // Polyfill for Object.assign
        // TODO: This is probably not needed anymore
        if (typeof Object.assign !== 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            // eslint-disable-next-line fp/no-mutating-methods
            Object.defineProperty(Object, 'assign', {
                value: function assign(target, varArguments) {
                    // .length of function is 2
                    if (target == null) { // TypeError if undefined or null
                        throw new TypeError('Cannot convert undefined or null to object')
                    }

                    // eslint-disable-next-line no-new-object
                    const to = new Object(target)

                    // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation, no-plusplus
                    for (let index = 1; index < varArguments.length; index++) {
                        const nextSource = varArguments[index]
                        if (nextSource != null) {
                            // Skip over if undefined or null
                            // eslint-disable-next-line fp/no-loops, no-restricted-syntax
                            for (const nextKey in nextSource) {
                                // Avoid bugs when hasOwnProperty is shadowed
                                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                    // eslint-disable-next-line fp/no-mutation
                                    to[nextKey] = nextSource[nextKey]
                                }
                            }
                        }
                    }
                    return to
                },
                writable: true,
                configurable: true
            })
        }

        /*
            * Polyfill for findIndex
            * */
        if (!Array.prototype.findIndex) {
            Array.prototype.findIndex = function(predicate) {
                if (this == null) {
                    throw new TypeError('Array.prototype.findIndex called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];
                var value;
                for (var i = 0; i < length; i++) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return i;
                    }
                }
                return -1;
            };
        }

        // Install Vuex store
        Vue.use(Vuex)
        // eslint-disable-next-line fp/no-mutation
        store = new Vuex.Store({
            ...storeConfig,
            plugins: [
                persistStore
            ]
        })

        // Install VueResource plugin
        Vue.use(VueResource)

        // Install v-tooltip
        Vue.use(VTooltip, {
            defaultTemplate: `
        <div class="v-tooltip" role="tooltip">
          <div class="tooltip-arrow"></div>
          <div class="tooltip-inner"></div>
        </div>
      `,
            popover: {
                defaultBaseClass: 'v-tooltip popover',
                defaultOffset: 10,
                defaultAutoHide: false,
                defaultTrigger: 'manual'
            }
        })

        // Install VModal
        Vue.use(VModal.default, {
            dynamic: true,
            injectModalsContainer: true,
            dialog: true
        })

        // Install Sentry.io client (Raven)
        installRaven(settings)

        // Initiate HighchartsMore
        HighchartsMore(Highcharts)

        // Get a list of available languages.
        LanguageCollection.fetchLanguages()
            .then(response => {
                // Set language list, which  will be available
                // throughout the app with
                // LanguageCollection.getList()
                LanguageCollection.setList(response)

                // Attempt to detect the browser language and
                // use it as the default, if it exists.
                // TODO remove comment below when trouble will be resolve
                // var language = DictionaryModel.getLanguage();
                const infoLanguage = JSON.parse(localStorage.getItem('dictionary'))
                // eslint-disable-next-line fp/no-let
                let language
                if (infoLanguage?.meta?.code) {
                    // eslint-disable-next-line fp/no-mutation
                    language = infoLanguage.meta.code
                }
                else {
                    // eslint-disable-next-line fp/no-mutation
                    localStorage.removeItem('dictionary');
                    language = DictionaryModel.getLanguage()
                }
                // Extract query parameter to determine language
                const getQueryParameter = function getQueryParameter(variable) {
                    const query = window.location.search.slice(1)
                    const vars = query.split('&')
                    // eslint-disable-next-line fp/no-loops, no-restricted-syntax
                    for (const element of vars) {
                        const pair = element.split('=')
                        if (pair[0] === `${variable}`) {
                            return pair[1]
                        }
                    }
                    return false
                }


                if (getQueryParameter('channel')) {
                    const channel = getQueryParameter('channel')
                    sessionStorage.setItem('channel', JSON.stringify(channel))
                }

                if (getQueryParameter('lang')) {
                    // If language supplied via query, use it
                    // eslint-disable-next-line fp/no-mutation
                    language = getQueryParameter('lang')
                }
                else {
                    // Otherwise try to detect browser language
                    // eslint-disable-next-line fp/no-loops, no-restricted-syntax
                    for (const element of response) {
                        if (BrowserModel.language === element.code) {
                            // eslint-disable-next-line fp/no-mutation
                            language = element.code
                        }
                    }
                }

                let x = 0;
                let interval = 1500;
                if (window.location.pathname !== "/not-found") {
                    fetchDictionary();
                } else {
                    bootstrapRouter()
                }

                // Set the dictionary language and
                // fetch the dictionary.
                function fetchDictionary() {
                    DictionaryModel.setLanguage(language) // Use browser language / or default
                    DictionaryModel.fetchDictionary(getQueryParameter('lang'))
                        .then(dictionary => {
                            x += 1;
                            if (dictionary?.meta?.code) {
                                DictionaryModel.setHash(dictionary)
                                DictionaryModel.setLanguage(dictionary?.meta?.code) // Reset, in case of refresh
                            } else {
                                if (x < 3) {
                                    let callDictionary = setInterval(function () {
                                        fetchDictionary();
                                        if (x === 3) {
                                            window.clearInterval(callDictionary);
                                            window.location.href = '/not-found';
                                            return false;
                                        }
                                    }, interval);
                                }
                            }

                            setCookieConsent()

                            if (getQueryParameter('login_token')) {
                                const token = getQueryParameter('login_token')

                                // Construct the user model from login_token if supplied.
                                UserModel.fromLoginToken(token)
                                    .then(userResponse => {
                                        if (userResponse.id) {
                                            UserModel.construct(userResponse)
                                            CompanyModel.setCompany(userResponse.company, store)
                                            XSRFModel.set(userResponse['xsrf-token'])
                                        }
                                        // Bootstrap the router
                                        bootstrapRouter()
                                    })
                            } else {
                                // Otherwise construct the user model from session
                                // if already logged in.
                                const isToken = localStorage.getItem('xsrf-token');
                                if (isToken && isToken !== 'false') {
                                    UserModel.fromSession()
                                        .then(userResponse => {
                                            if (userResponse.success) {
                                                UserModel.construct(userResponse.contents)
                                            }

                                            if (sessionStorage.getItem('singleCompany')) {
                                                CompanyModel.setCompany(JSON.parse(sessionStorage.getItem('singleCompany')), store)
                                            }

                                            // Bootstrap the router
                                            bootstrapRouter()
                                        })
                                } else {
                                    if (sessionStorage.getItem('singleCompany')) {
                                        CompanyModel.setCompany(JSON.parse(sessionStorage.getItem('singleCompany')), store)
                                    }

                                    // Bootstrap the router
                                    bootstrapRouter()
                                }
                            }
                        })
                }
            })

        Vue.directive('close-on-escape-press', closeOnEscapePress)
        Vue.directive('handle-enter-press', handleEnterPress)
    }

    return {
        // Inject the settings object into the
        // Config service.
        // @param settings JSON Key-value pair settings object.
        setConfig(settings) {
            Config.settings(settings)
        },

        // Run the application
        run: init
    }
})
