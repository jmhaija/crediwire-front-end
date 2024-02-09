define([
    'Vue',
], function (Vue) {
    var template ='<span><!-- please see styling in head section--></span>';


    var bindings = function () {
        return {
           style: ''
        };
    };

    return Vue.extend({
        name: 'app-style',
        template : template,
        data : bindings,
        created: function () {
            this.$slots.default.forEach((val, index) => {
                this.style += val.text;
            });
        },
        mounted: function() {
            // create <style/>
            const styl = document.createElement('style');
            const txtNode = document.createTextNode(this.style);
            // replace current node
            styl.append(txtNode);
            this.$el.replaceWith(styl);
        },
    });
});
