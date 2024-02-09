define([
    'Vue',
    'models/AssetModel'
], function (Vue, AssetModel) {
    const template = `
    <section class="switcher custom-switch" :style="{transform: rotation}">
        <div class="pointer faded inline" style="padding: 0" v-on:click.stop="toggle" v-show="!value"><img :src="getImage('/assets/img/elements/switch-left.png')"></div>
        <div class="pointer faded inline" style="padding: 0" v-on:click.stop="toggle" v-show="value"><img :src="getImage('/assets/img/elements/switch-right.png')"></div>                
    </section>
`;

    const methods = {
        getImage : function(img) {
            return new AssetModel(img).path;
        },
        toggle() {
            this.$emit('input', !this.value)
        }
    };

    const data = function () {
        return {};
    };

    return Vue.extend({
        name: 'custom-switch',
        data,
        props: {
            value: {
                type: Boolean,
            },
            invert: {
                type: Boolean
            }
        },
        computed: {
          rotation() {
              return  this.invert ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        },
        template,
        methods
    });
});
