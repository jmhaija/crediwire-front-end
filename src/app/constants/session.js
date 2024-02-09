define([], function () {
    return {
        KEEP_ALIVE_MAX_TIME:  60 * 60 * 1000,
        KEEP_ALIVE_SHOW_COUNTDOWN_TIME: 59 * 60 * 1000,
        SESSION_MAX_TIME: 6 * 60 * 60 * 1000, //6h
        SESSION_EXPIRY_TIME: 40 * 60 * 1000, //40m
        SESSION_HEARTBEAT_TIMEOUT: 30 * 60 * 1000 //30m
    };
});
