define([

], function() {
    'use strict';

    let handleOutsideClick;

    return {
        bind (el, binding, vnode) {
            handleOutsideClick = (e) => {
                e.stopPropagation();
                const { handler, exclude } = binding.value;
                let clickedOnExcludedEl = false;
                exclude.forEach(refName => {
                    if (!clickedOnExcludedEl) {
                        const excludedEl = vnode.context.$refs[refName];

                        clickedOnExcludedEl = excludedEl ? excludedEl.contains(e.target) : false;
                    }
                });

                if (!el.contains(e.target) && !clickedOnExcludedEl) {
                    vnode.context[handler]();
                }
            };
            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);
        },
        unbind () {
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        }
    };
});
