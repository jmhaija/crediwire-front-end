define([], function () {
  var connectionStore = null;

  return {
    set : function (conn) {
      connectionStore = conn;
    },
    get : function () {
      return connectionStore;
    },
    remove : function () {
      connectionStore = null;
    }
  };
});
