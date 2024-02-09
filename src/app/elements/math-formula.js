define([

    'Vue',
    'katex',
    'models/DictionaryModel'

], function(Vue, katex, DictionaryModel) {
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const template = `
        <article ref="formula">
           <div v-show="ui.show">
               <div :id="'katex' + id"></div>
           </div>
           <div v-show="!ui.show">
               <div class="working"></div>
           </div>
        </article>
    `;


    const bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                show : false,
            },
            id : ''
        };
    };


    const methods = {
        checkAutoInit : function() {
            if (this.autoShow) {
                this.ui.show = true;
                this.parse();
            }
        },
        parse : function() {
            var scope = this;
            var numerator = [];
            var denominator = [];

            this.numerator.forEach(function (el, i) {
                numerator[i] = scope.mathmetize(el);
            }, numerator);

            this.denominator.forEach(function (el, i) {
                denominator[i] = scope.mathmetize(el);
            }, denominator);

            numerator = numerator.join('');
            denominator = denominator.join('');

            var expression = '';

            //Determine if fraction or not
            if (this.inDenom) {
                expression = '\\frac{' + numerator + '}{' + denominator + '}';
            } else {
                expression = numerator;
            }

            //Determine if percentage or not
            if (this.isPercent && expression.length > 0) {
                if (this.autoShow) {
                    expression = expression + '\\times 100';
                } else {
                    expression = '(' + expression + ') \\times 100';
                }
            }

            this.render(expression);
        },


        mathmetize : function(expression) {
            //Color and text formatting
            if (!this.easyview && (expression.indexOf('$') === 0 || expression.indexOf('#') === 0) ) {
                if (expression.indexOf('|ch') > 0) {
                    expression = '\\underline{' + expression + '}';
                }

                if (expression.indexOf('sum') > 0) {
                    expression = '\\color{blue}{' + expression + '}';
                } else if (expression.indexOf('avg') > 0) {
                    expression = '\\color{orange}{' + expression + '}';
                } else if (expression.indexOf('ultcur') > 0) {
                    expression = '\\color{brown}{' + expression + '}';
                } else if (expression.indexOf('ult') > 0) {
                    expression = '\\color{violet}{' + expression + '}';
                }
            }

            //Special character formatting
            expression = expression.split('/').join('\\div'); //Division sign
            expression = expression.split('*').join('\\times'); //Multiplication sign
            expression = this.ignorePeriods ? expression : expression.split('.').join(this.ui.dictionary.meta.decimalSymbol); //Internationalized decimal
            expression = expression.split('~').join(' -'); //Negative sign (treated differently than minus operator)

            expression = expression.split('@').join(' '); //Static variables
            expression = expression.split('$').join(' '); //Mapping variables
            expression = expression.split('#').join('\\#'); //Account variables

            //Variable additional parameters
            expression = expression.split('|sum').join('');
            expression = expression.split('|avg').join('');
            expression = expression.split('|ultcur').join('');
            expression = expression.split('|ult').join('');
            expression = expression.split('|ba').join('');
            expression = expression.split('|ch').join('');

            return expression;
        },


        render : function(exp) {
            const element = this.$refs.formula.querySelector(`#katex${this.id}`);
            katex.render(exp, element);
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['numerator', 'denominator', 'isPercent', 'easyview', 'inDenom', 'init', 'autoShow', 'ignorePeriods'],
        mounted : function() {
            this.checkAutoInit();
        },
        beforeMount() {
            this.id = generateId();
        },
        watch : {
            numerator : function(num) {
                this.parse();
            },
            denominator : function(denom) {
                this.parse();
            },
            isPercent : function(ip) {
                this.parse();
            },
            easyview : function(ev) {
                this.parse();
            },
            inDenom : function(id) {
                this.parse();
            },
            init : function(val) {
                if (val) {
                    this.ui.show = true;
                    this.parse();
                }
            }
        }
    });
});
