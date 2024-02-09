/*global $*/

define([

    'Vue',
    'moment',
    'models/DictionaryModel'

], function(Vue, moment, DictionaryModel) {
    /**
     * Element template
     */
    var template = [
        '<article ref="datepicker">',
        '   <div v-on:click="showPicker()" class="date-picker"><i class="cwi-calendar"></i><input type="text" id="dp-root" readonly="readonly"></div>',
        '   <div class="onoff-selector dp-input"><input type="text" v-model="date" v-on:keyup="validate($event)" :class="{ invalid : !valid.date }"></div>',
        '</article>'
    ].join('');

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash()
            },
            valid : {
                date : true
            },
            date : null,
            dateModel : null
        };
    };


    /**
     * Methods
     */
    var methods = {
        init : function() {
            this.renderDatepicker();

            if (this.model) {
                this.date = moment(this.model).format(this.ui.dictionary.locale.displayFormat);
                this.dateModel = new Date(this.model);
            }
        },


        renderDatepicker : function() {
            var scope = this;

            $(this.$refs.datepicker.querySelector('#dp-root')).datepicker({
                language : this.ui.dictionary.locale,
                range : false,
                autoClose : true,
                onSelect : function(fd, d, picker) {
                    if (d) {
                        scope.dateModel = new Date(d);
                        scope.setTextFields();
                    }
                }
            });
        },

        validate : function(event) {
            var momentDate = moment(this.date, this.ui.dictionary.locale.displayFormat);

            this.valid.date = true;

            if (this.optional && this.date.length === 0) {
                return true;
            }

            if ( !momentDate.isValid()
                 || this.date.length !== this.ui.dictionary.locale.displayFormat.length
                 || (this.max && momentDate.unix() > moment(this.max).unix())
                ) {

                this.valid.date = false;
            }

            if (this.valid.date) {
                this.dateModel = momentDate.toDate();
            } else {
                this.dateModel = null;
            }
        },


        showPicker : function() {
            var scope = this;

            setTimeout(function() {
                var dp = $(scope.$refs.datepicker.querySelector('#dp-root')).data('datepicker');
                dp.show();
            }, 100);
        },

        setTextFields : function() {
            if (this.dateModel) {
                this.date = moment(this.dateModel).format(this.ui.dictionary.locale.displayFormat);
                this.validate();
            }
        }
    };


    return Vue.extend({
        name: 'date-field',
        template : template,
        data : bindings,
        methods : methods,
        props : ['onDateSelect', 'max', 'clearFlag', 'model', 'optional'],
        mounted : function() {
            this.init();
        },
        watch : {
            'dateModel' : function(value) {
                if (this.onDateSelect) {
                    this.onDateSelect(value, this.valid.date);
                }
            },
            'max' : function(value) {
                this.validate();
            },
            'clearFlag' : function(value) {
                if (value) {
                    this.date = null;
                    this.dateModel = null;
                }
            },
            'model' : function (value) {
                if (value !== this.dateModel) {
                    this.dateModel = value;
                    this.setTextFields();
                    if (this.onDateSelect) {
                        this.onDateSelect(value, this.valid.date);
                    }
                }
            }
        }
    });
});
