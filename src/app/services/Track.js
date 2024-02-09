define([

  'amplitude-js',
  'models/UserModel',
  'services/CookieConsent'

], (amplitude, UserModel, CookieConsent) => {
  // Google Analytics
  const ga = (...params) => {
    if (CookieConsent.isApproved('ga')) {
      window.ga(...params)
    }
  }
  ga.sendEvent = (...params) => {
    if (CookieConsent.isApproved('ga')) {
      window.ga('send', 'event', ...params)
    }
  }
  ga.sendPageView = (...params) => {
    if (CookieConsent.isApproved('ga')) {
      window.ga('send', 'pageview', ...params)
    }
  }
  ga.setPage = (...params) => {
    if (CookieConsent.isApproved('ga')) {
      window.ga('set', 'page', ...params)
    }
  }

  // Facebook
  const fb = (...params) => {
    if (CookieConsent.isApproved('fb')) {
      window.fbq(...params)
    }
  }
  fb.track = (...params) => {
    if (CookieConsent.isApproved('fb')) {
      window.fbq('track', ...params)
    }
  }

  // Intercom
  const ic = (...params) => {
    if (CookieConsent.isApproved('ic')) {
      window.Intercom(...params)
    }
  }
  ic.update = (...params) => {
    if (CookieConsent.isApproved('ic')) {
      window.Intercom('update', ...params)
    }
  }

  // Amplitude
  const am = (...params) => {
    if (CookieConsent.isApproved('am')) {
      amplitude.getInstance().logEvent(...params)
    }
  }
  am.log = (...params) => {
    if (CookieConsent.isApproved('am')) {
      if (UserModel.profile() && UserModel.profile().id) {
        const userInfo = UserModel.profile()
        amplitude.getInstance().setUserProperties({
          sessionID : amplitude.getInstance().getSessionId(),
          userID : userInfo.id,
          userRole : userInfo.roles.includes('accountant') ? 'Accountant' : (userInfo.roles.includes('bank') ? 'Bank' : 'SME'),
          email : userInfo.email,
          domain : userInfo.email.split('@')[1]
        })
      }
      amplitude.getInstance().logEvent(...params)
    }
  }

  return {
    ga,
    fb,
    ic,
    am
  }
})
