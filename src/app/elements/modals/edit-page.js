define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'services/Validator',
], function (Vue, modal, DictionaryModel, Validator) {
    const template = `
        <modal :title="title" :close="close">                                        
            <template v-slot:content>
                       <section>
                        <span class="add-page-explanation" v-if="addingPage">{{dictionary.presentations.addPageDescription}}</span>
                       </section> 
                       <section class="input-field">
                           <input type="text" v-model="currentPage.name" v-bind:class="{ invalid : !validation.name }" v-on:keyup="validatePageName()" v-on:blur="validatePageName(true, currentPage)">
                           <label v-bind:class="{ filled: currentPage.name }">{{dictionary.presentations.pageName}}</label>
                           <div class="warning" v-bind:class="{ show : !validation.name }">{{dictionary.general.validation.generic}}</div>
                       </section>

                       <section class="input-field" v-if="!currentPage.front_page && !addingPage">
                           <input type="number" min="2" :max="pagesLength" v-model="currentPage.number">
                           <label v-bind:class="{ filled: currentPage.number }">{{dictionary.presentations.pageNumber}}</label>
                           <div class="warning" v-bind:class="{ show : !currentPage.number > pagesLength }">{{dictionary.general.validation.generic}}</div>
                       </section>

                       <section>
                           <div class="label">{{dictionary.presentations.comment}}</div>
                           <textarea v-model="currentPage.description" style="height: 130px;"></textarea>
                       </section>             
            </template>
            
            <template v-slot:footer>
                <div class="working inline" v-show="saving"></div>
                <span style="width: 100%; padding: 0 5px;">
                    <button v-show="!saving" class="primary" style="float: right;" @click="updateReportPage(currentPage);" v-handle-enter-press="function() { updateReportPage(currentPage) }">{{dictionary.presentations.savePage}}</button>
                </span>
            </template>                                                       
        </modal>
    `;

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            validation: {name: true}
        };
    };

    const methods = {
        validatePageName : function(force, page) {
            if (force || !this.validation.name) {
                this.validation.name = Validator.minLength(page.name, 2);
            }

            return this.validation.name;
        },
        updateReportPage(currentPage) {
            if (!this.validatePageName(true, currentPage) || currentPage.number > this.pagesLength) {
                return false;
            }

            this.saveReportPage(currentPage);
            this.$store.dispatch('saveReportPage', true);

            this.close();
        },

        close() {
            this.$emit('close');
        }
    };

    const computed = {
        title() {
            return  this.addingPage? this.dictionary.presentations.addPage : this.dictionary.presentations.editPage
        }
    };

    return Vue.extend({
        name: 'edit-page',
        template,
        data,
        methods,
        computed,
        props: {
            currentPage: {
                type: Object,
                required: true
            },
            saveReportPage: {
                type: Function,
                required: true
            },
            pagesLength: {
                type: Number
            },
            addingPage: {
                type: Boolean,
                default: false
            },
            saving: {
                type: Boolean,
                required: true
            }
        },
        components: {
            modal
        },
        mounted: function() {

        },
    });
});
