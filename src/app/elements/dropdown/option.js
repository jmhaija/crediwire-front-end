define([
    'Vue',
], function(Vue) {
    'use strict';
    /**
     * Passed in props
     */

    const props = {
        option: {
            type: Object,
            required: true
        },
        selectOption: {
            type: Function,
            required: true
        },
        isOptionSelected: {
            type: Boolean,
            required: true
        }
    };

    /**
     * Methods
     */

    return Vue.extend({
        name: 'dropdown-option',
        props,
        render: function(createElement) {
            const { title, id } = this.option;
            return createElement('div', {
                attrs: {
                    class: `${this.isOptionSelected ? 'selected' : ''} option sorting-dropdown-option`
                },
                on: {
                  click: (e) => {e.stopImmediatePropagation(); this.selectOption(this.option)}
                },
            },
                this.$scopedSlots.default({title, id})
            )
        }
    });
});
