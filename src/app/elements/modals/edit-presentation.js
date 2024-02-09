define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'elements/date-field',
    'models/DictionaryModel',
    'models/DateRangeModel',
    'collections/PresentationTemplateCollection',
    'services/Validator',
], function (Vue, moment, modal, dateField, DictionaryModel, DateRangeModel, PresentationTemplateCollection, Validator) {
    const template = `
        <modal :title="dictionary.presentations.titlePage" :close="close">                                        
            <template v-slot:content>
                
                       <section class="input-field margin-input" style="padding-top: 12px;">
                               <label class="static-label" v-bind:class="{ filled: presentation.name }">{{dictionary.presentations.reportName}}:</label>
                               <input type="text" class="grey-input" style="font-style: italic;" v-model="presentation.name" :placeholder="dictionary.presentations.titleExample" v-bind:class="{ invalid : !validation.presentationName }" v-on:keyup="validatePresentationName()" v-on:blur="validatePresentationName(true)">
                           <div class="warning" v-bind:class="{ show : !validation.presentationName }">{{dictionary.general.validation.generic}}</div>
                       </section>

                       <section class="input-field margin-input" style="padding-top: 6px;">
                               <label class="static-label" v-bind:class="{ filled: presentation.title.length > 0 }">{{dictionary.presentations.subtitle}} ({{dictionary.general.labels.optional}}):</label>
                               <input type="text" class="grey-input" style="font-style: italic;" :placeholder="dictionary.presentations.subtitleExample" v-model="presentation.title" v-bind:class="{ invalid : !validation.presentationTitle }">
                           <div class="warning" v-bind:class="{ show : !validation.presentationTitle }">{{dictionary.general.validation.generic}}</div>
                       </section>
                       <div class="input-field periods-date-inputs dates-report-popup" style="margin-bottom: 0;">
                           <div>
                               <div class="static-label zero-padding-bottom">{{dictionary.presentations.reportPeriodStart}}:</div>
                               <div class="zero-padding-top"><date-field :onDateSelect="setFromDate" :max="date.toDate" :optional="true" :model="date.from"></date-field></div>
                           </div>
                       <div style="padding-top: 10px; margin-left: 3rem">
                           <div class="static-label zero-padding-bottom">{{dictionary.presentations.reportPeriodEnd}}:</div>
                           <div class="zero-padding-top"><date-field :onDateSelect="setToDate" :max="date.now" :optional="true" :model="date.to"></date-field></div>
                           </div>
                       </div>
                                
            </template>
            
            <template v-slot:footer>
                 <button class="primary edit-report-popup full-width" @click="updatePresentation();" v-handle-enter-press="updatePresentation">{{dictionary.presentations.saveReport}}</button>
            </template>                                                       
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            validation : {
                name : true,
                presentationName : true,
                presentationTitle : true
            },
            date: {
                fromDate: DateRangeModel.getFromDate(),
                from: null,
                fromValid: true,
                toDate: DateRangeModel.getToDate(),
                to: null,
                toValid: true,
                now: new Date()
            },
        };
    };

    const methods = {
        validatePresentationName : function (force) {
            if (force || !this.validation.presentationName) {
                this.validation.presentationName = Validator.minLength(this.presentation.name, 2);
            }

            return this.validation.presentationName;
        },
        setFromDate(value, valid) {
            this.date.fromDate = value;
            this.date.fromValid = valid;
            if (value) {
                this.date.from = moment(value).format('YYYY-MM-DD');
            } else {
                this.date.fromValid = false;
            }
        },
        setToDate(value, valid) {
            this.date.toDate = value;
            this.date.toValid = valid;
            if (value) {
                this.date.to = moment(value).format('YYYY-MM-DD');
            } else {
                this.date.toValid = false;
            }
        },
        updatePresentation() {
            if (!this.validatePresentationName(true)) {
                return false;
            }

            const { from, to } = this.date;

            this.savePresentation({from, to});
            this.close();
        },
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'edit-presentation',
        template,
        data,
        methods,
        props: {
            presentation: {
                type: Object,
                required: true
            },
            savePresentation: {
                type: Function,
                required: true
            }
        },
        components: {
            modal,
            'date-field': dateField
        },
        mounted: function() {
            this.date.from = this.presentation.start_date;
            this.date.to = this.presentation.end_date;
        },
    });
});
