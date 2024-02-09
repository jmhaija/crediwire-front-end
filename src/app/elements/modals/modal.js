define([
    'Vue',
], function (Vue) {
    const template =`
    <section class="custom-modal" v-close-on-escape-press="close">

        <div class="popup zero-padding">

            <div class="header-modal">
                <slot name="header">
                    <p class="header-title-modal" v-if="title">{{title}}</p>
                    <div class="close header-close-popup"><i class="cwi-close clickable" @click.prevent="close" data-test-id="closeModal"></i></div>
                </slot>  
            </div>

            <div :class="[!hideScroll ? 'content-modal' : 'hide-scroll']">
                <slot name="content">
                
                </slot>            
            </div>

            <div class="modal-footer">              
                <slot name="footer">
                
                </slot>
            </div>
        </div>

    </section>        
    `;

    const data = function () {
        return {
            style: ''
        };
    };

    return Vue.extend({
        name: 'modal',
        props: {
            title: {
                type: String
            },
            close: {
                type: Function
            },
            hideScroll : {
                type: Boolean
            }
        },
        template,
        data,
        mounted() {
            document.body.classList.add("modal-open");
        },
        beforeDestroy() {
            document.body.classList.remove("modal-open");
        }
    });
});
