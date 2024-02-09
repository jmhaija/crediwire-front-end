/* global navigator */
/**
 * Model representing the user's browser.
 * Depends on bowser, which is exposed as the browser property.
 */
define([
    'bowser'
], function(bowser) {
    return {
        language : navigator.language || navigator.userLanguage || null,
        useragent : navigator.userAgent,
        browser : bowser
    };
});
