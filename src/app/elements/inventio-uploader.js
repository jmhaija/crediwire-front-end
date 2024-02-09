define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/AssetModel',
    'models/ErpModel',
    'services/Toast',
    'services/InventioParser',
    'elements/date-field',
    'services/EventBus'

], function(Vue, moment, DictionaryModel, AssetModel, ErpModel, Toast, InventioParser, dateField, EventBus) {
    var template = [
    '<article class="inventio-uploader">',

    '  <div class="selector full-width">',
    '    <label :class="{ filled : ui.method }">{{ui.dictionary.erp.inventio.selectMethod}}</label>',
    '    <div class="label" v-on:click.stop="ui.methodOptions = true">',
    '      <span v-show="ui.method" class="filled">',
    '           <span v-show="ui.method == \'upload\'">{{ui.dictionary.erp.inventio.byFileUpload}}</span>',
    '           <span v-show="ui.method == \'refid\'">{{ui.dictionary.erp.inventio.byRefId}}</span>',
    '       </span>',
    '      <i class="cwi-down"></i>',
    '      <div class="options" v-bind:class="{ show : ui.methodOptions }">',
    '        <div class="option"v-bind:class="{ selected : ui.method == \'upload\' }" v-on:click.stop="ui.method = \'upload\'; ui.methodOptions = false;">',
    '          <span>{{ui.dictionary.erp.inventio.byFileUpload}}</span>',
    '        </div>',
    '        <div class="option"v-bind:class="{ selected : ui.method == \'refid\' }" v-on:click.stop="ui.method = \'refid\'; ui.methodOptions = false;">',
    '          <span>{{ui.dictionary.erp.inventio.byRefId}}</span>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </div>',

    '   <section class="slide" v-if="ui.step < ui.maxSteps && ui.method == \'upload\'">',
    '       <div class="instruction">{{ui.dictionary.erp.inventio.instruction}}</div>',
    '       <div class="screenshot">',
    '           <img :src="getImageSource(ui.step)">',
    '       </div>',
    '       <div class="description">',
    '           {{getDescription(ui.step)}}',
    '       </div>',
    '   </section>',

    '   <section class="upload-field" v-show="ui.step == ui.maxSteps && !ui.uploading">',
    '       <div class="instruction">{{ui.dictionary.erp.inventio.upload}}</div>',
    '       <input type="file" v-on:change="processEvent">',
    '       <div class="error" v-show="ui.uploadError">{{ui.dictionary.erp.inventio.uploadError}}</div>',
    '       <div>',
    '           <button class="primary" v-on:click="uploadFile()">{{ui.dictionary.erp.inventio.uploadAction}}</button>',
    '       </div>',
    '   </section>',



    '   <section v-if="ui.step < ui.maxSteps && ui.method == \'refid\' && !ui.uploading">',
    '       <div class="input-field">',
    '           <input type="text" v-model="refId">',
    '           <label v-bind:class="{ filled: refId.length > 0 }">{{ui.dictionary.erp.inventio.refId}}</label>',
    '       </div>',
    '       <div class="full-width">',
    '           <button class="primary" v-on:click="parseRefId()">{{ui.dictionary.erp.inventio.submitRefId}}</button>',
    '       </div>',
    '   </section>',

    '   <div v-if="ui.step > ui.maxSteps && !ui.uploading">',
    '       <div class="form">',
    '           <p>{{ui.dictionary.erp.inventio.connectInstruction}}</p>',


    '           <div>',
    '               <h3>{{ui.dictionary.erp.inventio.info}}</h3>',
    '           </div>',


    '           <div class="selector full-width">',
    '               <label :class="{ filled : fields.currency }" class="caps">{{ui.dictionary.erp.inventio.currency}}</label>',
    '               <div class="label highlighted" v-on:click.stop="ui.options = true">',
    '                   <span v-show="fields.currency" class="filled"><span class="caps">{{fields.currency}}</span></span>',
    '                   <span v-show="!fields.currency">{{ui.dictionary.erp.inventio.selectCurrency}}</span>',
    '                   <i class="cwi-down"></i>',
    '                   <div class="options" v-bind:class="{ show : ui.options }">',
    '                       <div class="option" v-for="curr in currencies" v-bind:class="{ selected : curr == fields.currency }" v-on:click.stop="setCurrency(curr)">',
    '                           <span><span class="caps">{{curr}}</span></span>',
    '                       </div>',
    '                   </div>',
    '               </div>',
    '           </div>',


    '           <p class="label">{{ui.dictionary.erp.inventio.firstYearDateFrom}}</p>',
    '           <date-field :model="fields.fromDate.value" :onDateSelect="selectFromDate"></date-field>',

    '           <p class="label">{{ui.dictionary.erp.inventio.firstYearDateTo}}</p>',
    '           <date-field :model="fields.toDate.value" :onDateSelect="selectToDate"></date-field>',
    '           <div class="fiscal-switcher" v-show="fields.fromDate.value && fields.fromDate.valid"><a href="" v-on:click.prevent="toDatePreset(12)">{{ui.dictionary.overview.annual}}</a> / <a href="" v-on:click.prevent="toDatePreset(6)">{{ui.dictionary.overview.semiannual}}</a></div>',

    '           <div class="error" v-show="ui.daterangeError">{{ui.dictionary.erp.inventio.daterangeError}}</div>',
    '           <div class="error" v-show="ui.tokenError">{{ui.dictionary.erp.inventio.tokenError}}</div>',


    '           <div>',
    '               <div class="float-right toggle-editable">',
    '                   <span v-show="ui.advanced"><a href="" v-on:click.prevent="ui.advanced = false">{{ui.dictionary.erp.inventio.disableAdvanced}}</a></span>',
    '                   <span v-show="!ui.advanced"><a href="" v-on:click.prevent="ui.advanced = true">{{ui.dictionary.erp.inventio.enableAdvanced}}</a></span>',
    '               </div>',
    '               <h3 v-show="ui.advanced">{{ui.dictionary.erp.inventio.tokens}}</h3>',
    '               <h3 v-show="!ui.advanced">&nbsp;</h3>',
    '           </div>',



    '           <div v-show="ui.advanced">',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.code" v-bind:class="{ invalid : !info.code || !info.code.length }">',
    '               <label v-bind:class="{ filled: info.code && info.code.length > 0 }">CODE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.code || !info.code.length }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.company_info_get_type" v-bind:class="{ invalid : !info.company_info_get_type || !info.company_info_get_type.length }">',
    '               <label v-bind:class="{ filled: info.company_info_get_type && info.company_info_get_type.length && info.company_info_get_type.length > 0 }">COMPANYINFORMATION-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.company_info_get_type || !info.company_info_get_type.length }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.vat_get" v-bind:class="{ invalid : !info.vat_get || !info.vat_get.length }">',
    '               <label v-bind:class="{ filled: info.vat_get && info.vat_get.length && info.vat_get.length > 0 }">VAT-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.vat_get || !info.vat_get.length || !info.vat_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.customer_get" v-bind:class="{ invalid : !info.customer_get || !info.customer_get.length}">',
    '               <label v-bind:class="{ filled: info.customer_get && info.customer_get.length && info.customer_get.length > 0 }">CUSTOMER-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.customer_get || !info.customer_get.length || !info.customer_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.customer_get_type" v-bind:class="{ invalid : !info.customer_get_type || !info.customer_get_type.length}">',
    '               <label v-bind:class="{ filled: info.customer_get_type && info.customer_get_type.length  && info.customer_get_type.length > 0 }">CUSTOMER-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.customer_get_type || !info.customer_get_type.length || !info.customer_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.gl_account_get" v-bind:class="{ invalid : !info.gl_account_get || !info.gl_account_get.length }">',
    '               <label v-bind:class="{ filled: info.gl_account_get && info.gl_account_get.length && info.gl_account_get.length > 0 }">GLACCOUNT-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.gl_account_get || !info.gl_account_get.length || !info.gl_account_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.gl_account_get_type" v-bind:class="{ invalid : !info.gl_account_get_type || !info.gl_account_get_type.length }">',
    '               <label v-bind:class="{ filled: info.gl_account_get_type && info.gl_account_get_type.length && info.gl_account_get_type.length > 0 }">GLACCOUNT-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.gl_account_get_type || !info.gl_account_get_type.length || !info.gl_account_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.gl_entry_get" v-bind:class="{ invalid : !info.gl_entry_get || !info.gl_entry_get.length }">',
    '               <label v-bind:class="{ filled: info.gl_entry_get && info.gl_entry_get.length && info.gl_entry_get.length > 0 }">GLENTRY-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.gl_entry_get || !info.gl_entry_get.length || !info.gl_entry_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.gl_entry_get_type" v-bind:class="{ invalid : !info.gl_entry_get_type || !info.gl_entry_get_type.length }">',
    '               <label v-bind:class="{ filled: info.gl_entry_get_type && info.gl_entry_get_type.length && info.gl_entry_get_type.length > 0 }">GLENTRY-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.gl_entry_get_type || !info.gl_entry_get_type.length || !info.gl_entry_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.item_get" v-bind:class="{ invalid : !info.item_get || !info.item_get.length }">',
    '               <label v-bind:class="{ filled: info.item_get && info.item_get.length && info.item_get.length > 0 }">ITEM-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.item_get || !info.item_get.length || !info.item_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.item_get_type" v-bind:class="{ invalid : !info.item_get_type || !info.item_get_type.length }">',
    '               <label v-bind:class="{ filled: info.item_get_type && info.item_get_type.length && info.item_get_type.length > 0 }">ITEM-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.item_get_type || !info.item_get_type.length || !info.item_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.sales_order_get" v-bind:class="{ invalid : !info.sales_order_get || !info.sales_order_get.length }">',
    '               <label v-bind:class="{ filled: info.sales_order_get && info.sales_order_get.length && info.sales_order_get.length > 0 }">SALESORDER-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.sales_order_get || !info.sales_order_get.length || !info.sales_order_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.sales_order_get_type" v-bind:class="{ invalid : !info.sales_order_get_type || !info.sales_order_get_type.length }">',
    '               <label v-bind:class="{ filled: info.sales_order_get_type && info.sales_order_get_type.length && info.sales_order_get_type.length > 0 }">SALESORDER-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.sales_order_get_type || !info.sales_order_get_type.length || !info.sales_order_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.sales_order_line_get" v-bind:class="{ invalid : !info.sales_order_line_get || !info.sales_order_line_get.length }">',
    '               <label v-bind:class="{ filled: info.sales_order_line_get && info.sales_order_line_get.length && info.sales_order_line_get.length > 0 }">SALESORDERLINE-GET</label>',
    '               <div class="warning" v-bind:class="{ show : !info.sales_order_line_get || !info.sales_order_line_get.length || !info.sales_order_line_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="info.sales_order_line_get_type" v-bind:class="{ invalid : !info.sales_order_line_get_type || !info.sales_order_line_get_type.length }">',
    '               <label v-bind:class="{ filled: info.sales_order_line_get_type && info.sales_order_line_get_type.length && info.sales_order_line_get_type.length > 0 }">SALESORDERLINE-GET-TYPE</label>',
    '               <div class="warning" v-bind:class="{ show : !info.sales_order_line_get_type || !info.sales_order_line_get_type.length || !info.sales_order_line_get_approved }">{{ui.dictionary.erp.inventio.invalidValue}}</div>',
    '           </div>',

    '           </div>',


    '           <button class="primary" v-on:click="connect">{{ui.dictionary.erp.inventio.connect}}</button>',
    '       </div>',

    '       <div class="line-spacer"></div><div class="line-spacer"></div>',
    '   </div>',



    '   <div class="nav" v-show="!ui.uploading && ui.method == \'upload\'">',
    '       <div v-show="ui.step < 2"></div',
    '       ><div v-show="ui.step > 1" class="previous" v-on:click="goBack()"><i class="cwi-left"></i> {{ui.dictionary.erp.inventio.previous}}</div',
    '       ><div v-show="ui.step < ui.maxSteps" class="next" v-on:click="goForward()">{{ui.dictionary.erp.inventio.next}} <i class="cwi-right"></i></div>',
    '   </div>',

    '   <div class="center-text skip" v-show="ui.step < ui.maxSteps && !ui.uploading">',
    '       <a href="" v-show="ui.method == \'upload\'" v-on:click.prevent="ui.step = ui.maxSteps">{{ui.dictionary.erp.inventio.skip}}</a>',
    '       <div v-show="ui.method == \'upload\'">{{ui.dictionary.general.or}}</div>',
    '       <a href="" v-on:click.prevent="enableManual()">{{ui.dictionary.erp.inventio.manual}}</a>',
    '   </div>',

    '   <div v-show="ui.uploading">',
    '       <div class="app-loader" style="padding: 0"></div>',
    '   </div>',

    '</article>',
    ].join('');


    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                step : 1,
                maxSteps : 10,
                uploading : false,
                uploadError : false,
                tokenError : false,
                daterangeError : false,
                advanced : false,
                options : false,
                method : 'upload',
                methodOptions : false
            },
            refId : '',
            upEv : null,
            info : {
                code: '',
                company_info_get_type: '',
                customer_get: '',
                customer_get_type: '',
                customer_get_approved: false,
                gl_account_get: '',
                gl_account_get_approved: false,
                gl_entry_get: '',
                gl_entry_get_type: '',
                gl_account_get_type: '',
                gl_entry_get_approved: false,
                item_get: '',
                item_get_type: '',
                item_get_approved: false,
                sales_order_get: '',
                sales_order_get_type: '',
                sales_order_get_approved: false,
                sales_order_line_get:  '',
                sales_order_line_get_type:  '',
                sales_order_line_get_approved: false,
                vat_get: '',
                vat_get_approved: false
            },
            fields : {
                currency : 'dkk',
                fromDate : { value : null, valid : true },
                toDate : { value : null, valid : true }
            },
            currencies : ['aud', 'bgn', 'brl', 'cad', 'chf', 'cny', 'czk', 'dkk',
            'gbp', 'hkd', 'hrk', 'huf', 'idr', 'ils', 'inr', 'isk', 'jpy', 'krw',
            'mxn', 'myr', 'nok', 'nzd', 'php', 'pln', 'ron', 'rub', 'sek', 'sgd',
            'thb', 'try', 'usd', 'zar']
        };
    };


    var methods = {
        setCurrency : function (curr) {
            this.fields.currency = curr;
            this.ui.options = false;
        },

        parseRefId : function () {
            if (this.refId.length === 0) {
                return false;
            }

            this.ui.uploading = true;
            this.ui.uploadError = false;

            InventioParser.parseRefId(this.refId)
                .then(function (res) {
                    if (res.code) {
                        this.info = res;
                        this.ui.step = this.ui.maxSteps + 1;
                    } else {
                        this.ui.uploadError = true;
                    }

                    this.ui.uploading = false;
                }.bind(this));
        },

        enableManual : function () {
            this.ui.step = this.ui.maxSteps + 1;
            this.ui.advanced = true;
        },

        selectFromDate : function(value, valid) {
            if (!valid) {
                this.fields.fromDate.value = null;
                this.fields.fromDate.valid = false;
                return false;
            }

            this.fields.fromDate.valid = true;
            this.fields.fromDate.value = value;
            this.toDatePreset(12);
        },

        selectToDate : function(value, valid) {
            if (!valid) {
                this.fields.toDate.value = null;
                this.fields.tpDate.valid = false;
                return false;
            }

            this.fields.toDate.valid = true;
            this.fields.toDate.value = value;
        },

        toDatePreset : function (months) {
            var year = moment(this.fields.fromDate.value).year();
            var day = 31;

            if (months === 6) {
                day = 30;
            }
            var nextEndDate = moment().year(year).month(months - 1).date(day);

            if (nextEndDate.unix() < moment(this.fields.fromDate.value).unix()) {
                this.fields.toDate.value = nextEndDate.add(1, 'years').toDate();
            } else {
                this.fields.toDate.value = nextEndDate.toDate();
            }
        },


        validateDates : function () {
            if (!this.fields.fromDate.value ||
                !this.fields.toDate.value ||
                !this.fields.fromDate.valid ||
                !this.fields.toDate.valid) {

                return false;
            }

            if (moment(this.fields.fromDate.value).unix() > moment(this.fields.toDate.value).unix()) {
                return false;
            }

            return true;
        },

        validateTokens : function () {
            const isValid = 
                this.info.code.length &&
                this.info.company_info_get_type.length &&
                this.info.vat_get.length &&
                this.info.vat_get_approved &&
                this.info.customer_get.length &&
                this.info.customer_get_type.length &&
                this.info.customer_get_approved &&
                this.info.gl_account_get.length &&
                this.info.gl_account_get_approved &&
                this.info.gl_entry_get.length &&
                this.info.gl_entry_get_type.length &&
                this.info.gl_account_get_type.length &&
                this.info.gl_entry_get_approved &&
                this.info.item_get.length &&
                this.info.item_get_type.length &&
                this.info.item_get_approved &&
                this.info.sales_order_get.length &&
                this.info.sales_order_get_type.length &&
                this.info.sales_order_get_approved &&
                this.info.sales_order_line_get.length &&
                this.info.sales_order_line_get_type.length &&
                this.info.sales_order_line_get_approved;

            return isValid;
        },

        connect : function() {

            if (!this.validateDates()) {
                this.ui.daterangeError = true;
                return false;
            }

            if (!this.validateTokens()) {
                this.ui.tokenError = true;
                this.ui.advanced = true;
                return false;
            }

            this.ui.daterangeError = false;
            this.ui.tokenError = false;
            this.ui.uploading = true;

            var date_from = moment(this.fields.toDate.value).add(1, 'days').toDate();
            var date_to = moment(this.fields.toDate.value).add(1, 'years').toDate();

            var erpObj = {
                erp : 'inventio',
                authentication : {
                    "code" : this.info.code,
                    "currency" : this.fields.currency,
                    "first_year_date_from" : moment(this.fields.fromDate.value).format('YYYY-MM-DD'),
                    "first_year_date_to" : moment(this.fields.toDate.value).format('YYYY-MM-DD'),
                    "date_from" : moment(date_from).format('YYYY-MM-DD'),
                    "date_to" : moment(date_to).format('YYYY-MM-DD'),
                    "VAT-GET" : this.info.vat_get,
                    "CUSTOMER-GET" : this.info.customer_get,
                    "CUSTOMER-GET-TYPE" : this.info.customer_get_type,
                    "GLACCOUNT-GET" : this.info.gl_account_get,
                    "GLACCOUNT-GET-TYPE" : this.info.gl_account_get_type,
                    "GLENTRY-GET" : this.info.gl_entry_get,
                    "GLENTRY-GET-TYPE" : this.info.gl_entry_get_type,
                    "ITEM-GET" : this.info.item_get,
                    "ITEM-GET-TYPE" : this.info.item_get_type,
                    "SALESORDER-GET" : this.info.sales_order_get,
                    "SALESORDER-GET-TYPE" : this.info.sales_order_get_type,
                    "SALESORDERLINE-GET" : this.info.sales_order_line_get,
                    "SALESORDERLINE-GET-TYPE" : this.info.sales_order_line_get_type,
                    "COMPANYINFORMATION-GET-TYPE": this.info.company_info_get_type,
                }
            };

            InventioParser.connect(erpObj, this.company)
                .then(function (response) {
                    if (response.status) {
                        ErpModel.setErp(response);
                        EventBus.$emit('closePopup', true);
                        Toast.show(this.ui.dictionary.erp.saved);

                        if (this.requiresOwnerApproval) {
                            this.showUserInviteForm(true);
                        } else {
                            this.$router.push('/account/updating');
                        }
                    } else {
                        ErpModel.forgetErp();
                        this.ui.uploading = false;
                        Toast.show(this.ui.dictionary.erp.notsaved, 'warning');

                    }
                }.bind(this));
        },

        getImageSource : function (index) {
            return AssetModel('/assets/img/inventio/inventio' + index + '.png').path;
        },

        getDescription : function (index) {
            return this.ui.dictionary.erp.inventio.steps[index - 1];
        },

        goBack : function() {
            this.ui.step--;
        },

        goForward : function() {
            this.ui.step++;
        },

        processEvent : function (event) {
            this.upEv = event;
        },

        uploadFile : function () {
            if (!this.upEv) {
                return false;
            }

            this.ui.uploading = true;
            this.ui.uploadError = false;

            InventioParser.parse(this.upEv)
                .then(function(res) {
                    if (res.code) {
                        this.info = res;
                        this.ui.step++;
                    } else {
                        this.ui.uploadError = true;
                    }
                    this.ui.uploading = false;
                }.bind(this));
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'date-field' : dateField
        },
        props : ['company', 'requiresOwnerApproval', 'showUserInviteForm']
    });
});
