    const DEFAULT_LOGO_WIDTH = 200;

    export default {
        computed: {
            logoWidth : function () {
               return (this.partner && this.partner.logoWidth ? this.partner.logoWidth : DEFAULT_LOGO_WIDTH) + 'px';
            }
        }
    };
