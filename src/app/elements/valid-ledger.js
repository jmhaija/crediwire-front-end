define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/ValidLedgerModel',
    'models/UserModel',
    'models/ContextModel',
    'elements/date-field',
    'services/EventBus'

], function (Vue, moment, DictionaryModel, ValidLedgerModel, UserModel, ContextModel, dateField, EventBus) {
    var template = [
    '<article class="valid-ledger">',
    '   <section :class="{ label :  permissions && (permissions.owner || permissions.permissionType == \'full\') }" v-on:click.stop="openPopup">',
    '       <i class="cwi-down float-right" v-show="permissions && (permissions.owner || permissions.permissionType == \'full\')"></i>',
    '       <div v-show="!date">--</div>',
    '       <div v-show="date">{{formatDate(date)}}</div>',
    '   </section>',

    '   <section class="popup" v-show="ui.showPopup" v-on:click.stop="" style="width: 200px;">',
    '       <div class="close"><i class="cwi-close" v-on:click="closePopup"></i></div>',
    '       <date-field :model="date" :onDateSelect="selectNewDate" :optional="true" :clearFlag="clearFlag"></date-field>',
    '       <span class="warning-ledger" v-if="showWarning">{{ui.dictionary.ledger.warning}}</span>',
    '       <div class="ok-button">',
    '           <button class="primary" v-on:click="setNewDate">{{ui.dictionary.general.ok}}</button>',
    '           <div style="font-size: 0.9rem; margin-top: 10px;"><a href="" v-on:click.prevent="clearDate()">{{ui.dictionary.locale.clear}}</a></div>',
    '       </div>',
    '   </section>',
    '</article>'
    ].join('');


    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                showPopup : false
            },
            date : null,
            dateList : null,
            permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
            clearFlag : false,
            showWarning: false,
        };
    };


    var methods = {
        init : function () {
            //document.addEventListener('click', this.closePopup);
            EventBus.$on('', this.getData);

            this.getData();
        },

        clearDate : function () {
            this.date = null;
            this.clearFlag = true;
            this.ui.showPopup = false;

            ValidLedgerModel.createDate(null)
                .then(function(res) {
                    EventBus.$emit('validLedgerDateChanged');
                    this.clearFlag = false;
                    this.showWarning = false;
                    ValidLedgerModel.setValidDate(false);
                }.bind(this));
        },


        getData : function () {
            ValidLedgerModel.getDates()
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items[0]) {
                        var date = res._embedded.items[0].date;
                        this.date = date ? moment(date).toDate() : null;
                        ValidLedgerModel.setValidDate(this.date);
                        this.dateList = res._embedded.items;
                        EventBus.$emit('validLedgerDateChanged');
                    } else {
                        this.date = false;
                        ValidLedgerModel.setValidDate(false);
                    }
                }.bind(this));
        },

        openPopup : function () {
            if  (this.permissions && (this.permissions.owner || this.permissions.permissionType == 'full') ) {
                this.ui.showPopup = true;
            }
        },

        closePopup : function () {
            this.ui.showPopup = false;
        },

        selectNewDate : function(value, valid) {
            if (!valid) {
                return false;
            }

            this.date = value;
            let dateRange = this.rangeDateFrom + ',' + this.rangeDateTo;
            this.checkDateEntrance(this.date, dateRange);
            ValidLedgerModel.setValidDate(this.date);
        },

        checkDateEntrance : function(date, period) {
            let periods = period.split(',');
            let startDate = moment(periods[0], this.ui.dictionary.locale.displayFormat);
            let endDate = moment(periods[1], this.ui.dictionary.locale.displayFormat);
            date >= new Date(moment(startDate).format("MM/DD/YYYY")) && date <= new Date(moment(endDate).format("MM/DD/YYYY")) ?  this.showWarning = false : this.showWarning = true;
        },

        setNewDate : function () {
            this.ui.showPopup = false;
            var formattedDate = moment(this.date).format('YYYY-MM-DD');

            if (this.dateList && this.dateList[0] && this.dateList[0].date == moment(this.date).format('YYYY-MM-DD')) {
                return false;
            } else if (!this.date || this.date.length === 0 || this.date == '') {
                formattedDate = null;
            }

            ValidLedgerModel.createDate(formattedDate)
                .then(function(res) {
                    if (res.date) {
                        EventBus.$emit('validLedgerDateChanged');
                    }
                });
        },

        formatDate : function (date) {
            return moment(date).format(this.ui.dictionary.locale.displayFormat);
        }
    };

    const computed = {
        rangeDateFrom() {
            return this.$store.getters.dateFrom;
        },
        rangeDateTo() {
            return this.$store.getters.dateTo;
        }
    };

    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        computed,
        components : {
            'date-field' : dateField
        },
        mounted : function () {
            this.init();
        },
        beforeDestroy : function () {
            //document.removeEventListener('click', this.closePopup);
            EventBus.$off('companyErpChanged');
        }
    });
});
