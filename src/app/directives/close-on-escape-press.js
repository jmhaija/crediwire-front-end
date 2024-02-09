define([

], function() {
    'use strict';

    let handleEscapePress;

    return {
        bind (el, binding, vnode) {
            handleEscapePress = (e) => {
                if (e.key === 'Escape') {
                    const handler = binding.value;

                    if (handler) {
                        handler();
                    }
                }
            };
            document.addEventListener('keyup', handleEscapePress);
        },
        unbind () {
            document.removeEventListener('keyup', handleEscapePress);
        }
    };
});
