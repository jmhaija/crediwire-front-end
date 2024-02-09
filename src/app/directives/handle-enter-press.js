define([

], function() {
    'use strict';

    let handleEnterPress;

    return {
        bind (el, binding, vnode) {
            handleEnterPress = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    const handler = binding.value;

                    if (handler) {
                        handler();
                    }
                }
            };
            document.addEventListener('keyup', handleEnterPress);
        },
        unbind () {
            document.removeEventListener('keyup', handleEnterPress);
        }
    };
});
