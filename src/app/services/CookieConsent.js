define([

  'amplitude-js',
  'services/Config',
  'models/DictionaryModel'

], (amplitude, Config, DictionaryModel) => {
  const appendScriptToBody = ({
    src,
    id,
    culture
  }) => {
    const script = document.createElement('script')
    if (id) {
      script.setAttribute('id', id)
    }
    if (culture) {
      script.setAttribute('data-culture', culture)
    }
    script.setAttribute('src', src)
    document.body.appendChild(script)
  }

  const waitForScriptToInit = ({
    checkFunction, // must return `true` or `false`
    checkInterval = 500, // in milliseconds
    numberOfTries = 10
  }) => (
    (resolve, reject) => {
      const checkIfReady = (triesLeft = numberOfTries) => {
        if (checkFunction()) {
          resolve()
        } else {
          if (triesLeft === 0) {
            reject()
          }
          else {
            setTimeout(() => {
              checkIfReady(triesLeft - 1)
            }, checkInterval)
          }
        }
      }
      checkIfReady()
    }
  )

  const trackerDefaultProperties = {
    embedded: false,
    initialized: false,
    approved : false
  }

  const trackers = {
    ga: { // Google Analytics
      ...trackerDefaultProperties,
      embed: () => {
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;
          i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
          }, i[r].l = 1 * new Date();
          a = s.createElement(o),
          m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
      },
      ready: () => (
        new Promise(waitForScriptToInit({
          checkFunction: () => (typeof window.ga === 'function')
        }))
      ),
      init: () => {
        window.ga('create', Config.get('gaTrackId'), 'auto')
        window.ga('set', 'anonymizeIp', true)
      },
      isCallable: () => {
        return typeof window.ga === 'function'
      }
    },
    fb: { // Facebook events
      ...trackerDefaultProperties,
      embed: () => {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      },
      ready: () => (
        new Promise(waitForScriptToInit({
          checkFunction: () => (typeof window.fbq === 'function')
        }))
      ),
      init: () => {
        window.fbq('init', Config.get('facebook').pixelId)
      },
      disable: () => {
        window.location.reload()
      },
      isCallable: () => {
        return typeof window.fbq === 'function'
      }
    },
    ic: { // Intercom
      ...trackerDefaultProperties,
      embed: () => {
        appendScriptToBody({
          src: 'https://widget.intercom.io/widget/z25tbyfp'
        })
      },
      ready: () => (
        new Promise(waitForScriptToInit({
          checkFunction: () => (typeof window.Intercom === 'function' && typeof window.Intercom.apply === 'function')
        }))
      ),
      init: () => {
        window.Intercom("boot", {
          app_id: Config.get('intercom').appId
        })
      },
      enable: () => {
        window.Intercom('update', {
          hide_default_launcher: false
        })
      },
      disable: () => {
        window.Intercom('update', {
          hide_default_launcher: true
        })
      },
      isCallable: () => {
        return typeof window.Intercom === 'function' && typeof window.Intercom.apply === 'function'
      }
    },
    am: { // Amplitude
      ...trackerDefaultProperties,
      embed: () => {},
      ready: () => (
        new Promise(waitForScriptToInit({
          checkFunction: () => (true)
        }))
      ),
      init: () => {
        amplitude.getInstance().init(Config.get('amplitudeId'))
      },
      enable: () => {
        amplitude.getInstance().enableTracking(true)
        amplitude.getInstance().setOptOut(false)
      },
      disable: () => {
        amplitude.getInstance().enableTracking(false)
        amplitude.getInstance().setOptOut(true)
      },
      isCallable: () => {
        return true
      }
    }
  }

  const {ic, ga, fb, am} = trackers
  const cookieConsentTrackerMap = {
    cookie_cat_functional: [ic, am],
    cookie_cat_statistic: [ga],
    cookie_cat_marketing: [fb]
  }

  const enableTrackers = category => {
    cookieConsentTrackerMap[category].forEach(tracker => {
      tracker.approved = true
      if (!tracker.embedded) {
        tracker.embed()
        tracker.embedded = true
      }
      if (!tracker.initialized) {
        tracker.ready().then(
          () => {
            tracker.init()
            tracker.initialized = true
          }
        )
      }
      else {
        if (tracker.enable) {
          tracker.enable()
        }
      }
    })
  }

  const disableTrackers = category => {
    cookieConsentTrackerMap[category].forEach(tracker => {
      tracker.approved = false
      if (tracker.initialized) {
        if (tracker.disable) {
          tracker.disable()
        }
      }
    })
  }

  return {
    install: () => {
      appendScriptToBody({
        src: 'https://policy.app.cookieinformation.com/uc.js',
        id: 'CookieConsent',
        culture: DictionaryModel.getHash().meta.culture
      })
      window.addEventListener('CookieInformationConsentGiven', () => {
        const cookieCategories = [
          'cookie_cat_functional',
          'cookie_cat_marketing',
          'cookie_cat_statistic'
        ]
        cookieCategories.forEach(cookieCategory => {
          if (CookieInformation.getConsentGivenFor(cookieCategory)) {
            enableTrackers(cookieCategory)
          } else {
            disableTrackers(cookieCategory)
          }
        })
      })
    },
    isApproved: tracker => {
      return trackers[tracker].approved && trackers[tracker].isCallable()
    }
  }
})
