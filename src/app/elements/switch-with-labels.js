define([
    'Vue',
    'elements/custom-switch'
], function (Vue, customSwitch) {

    return Vue.extend({
        name: 'switch-with-labels',
        props: ['value', 'firstValue', 'secondValue'],
        render(createElement) {
            const { firstValue, secondValue } = this;

            const toggle = () => {
                this.$emit('input', this.value === secondValue ? firstValue : secondValue);
            };

            return createElement('div', {attrs: {class: 'inline-flex flex-align-start toggle-span'}, on: {click: toggle}}, [
                this.$slots['label-left'],
                createElement(customSwitch, {
                    props: {
                        value: this.value === secondValue
                    },
                    on: {
                        input: toggle
                    }
                }),
                this.$slots['label-right'],
            ]);

        },
    });
});
