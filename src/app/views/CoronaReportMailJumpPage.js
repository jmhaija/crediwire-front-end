define([
  'Vue',
  'services/Track'
], function(Vue, Track) {

  const template = `
    <div></div>
  `

  return Vue.extend({
    template,
    mounted () {
      const redirectUrl = 'https://crediwire.com/garanti-og-overblik.html'
      Track.ga.sendEvent('COVID Report mail invitation', 'fulfill');
      window.location.replace(redirectUrl)
    }
  })
})
