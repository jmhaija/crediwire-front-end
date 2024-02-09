    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import copyLink from 'elements/modals/copy-link-modal'
    import cancelFinalize from 'elements/modals/cancel-finalize-dialog'
    import DictionaryModel from 'models/DictionaryModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import Validator from 'services/Validator'
    import Toast  from 'services/Toast'

    const template = `
        <modal :title="dictionary.presentations.getLink" :close="close">                                        
            <template v-slot:content>
                <div class="input-field">
                    <input type="text" v-model="shareLink.name.value" v-bind:class="{ invalid : !shareLink.name.valid }" v-on:keyup="validateLinkName()" v-on:blur="validateLinkName(true)">
                    <label v-bind:class="{ filled: shareLink.name.value.length > 0 }">{{dictionary.presentations.recipient}}</label>
                    <div class="warning" v-bind:class="{ show : !shareLink.name.valid }">{{dictionary.general.validation.generic}}</div>
                </div>

                <div class="input-field">
                    <input type="text" v-model="shareLink.email.value" v-bind:class="{ invalid : !shareLink.email.valid }" v-on:keyup="validateLinkEmail()" v-on:blur="validateLinkEmail(true)">
                    <label v-bind:class="{ filled: shareLink.email.value.length > 0 }">{{dictionary.presentations.email}}</label>
                    <div class="warning" v-bind:class="{ show : !shareLink.email.valid }">{{dictionary.general.validation.email}}</div>
                </div>


                <div class="input-field">
                    <textarea v-model="shareLink.comment.value" style="height: 80px; resize: none;"></textarea>
                    <label class="filled">{{dictionary.presentations.comment}}</label>
                </div>
            </template>
                    
            <template v-slot:footer>
                <div class="alignment-buttons-footer" style="padding: 0px 8px !important;">
                    <button v-if="!copyDelaying" v-on:click="getShareableLink({report: selectedReport, copyOnly: true})">
                                {{dictionary.presentations.generateLink}}
                    </button>
                    <div class="working" v-if="copyDelaying"></div>
                    <button class="primary"
                            v-on:click="getShareableLink({report: selectedReport, copyOnly: false})" v-handle-enter-press="function() { getShareableLink({report: selectedReport, copyOnly: false}) }">
                                {{dictionary.presentations.sendLink}}
                    </button>
                </div>
            </template>                                  
        </modal>
    `;

    const data = () => ({
        dictionary: DictionaryModel.getHash(),
        shareLinkInfo: null,
        shareLink: {
            name: {value: '', valid: true},
            email: {value: '', valid: true},
            comment: {value: '', valid: true}
        },
        copyDelaying: false,
        delayedActions: []
    });

    const methods = {
        validateLinkName(force) {
            if (force || !this.shareLink.name.valid) {
                this.shareLink.name.valid = Validator.minLength(this.shareLink.name.value, 2);
            }

            return this.shareLink.name.valid;
        },

        validateLinkEmail(force) {
            if (force || !this.shareLink.email.valid) {
                this.shareLink.email.valid = Validator.email(this.shareLink.email.value);
            }

            return this.shareLink.email.valid;
        },

        getShareableLink({report, copyOnly}) {
            if (!copyOnly && (!this.validateLinkName(true) || !this.validateLinkEmail(true)) ) {
                return false;
            }

            if (!this.reportIsFinalized && !copyOnly) {
                this.$store.dispatch('runFinalizeCountDown');
                this.showFinalizeToast();

                //Report is not finalized - we are delaying link getting
                this.delayedActions.push(() => {
                    this.close();
                    this.finalizeReport();
                    this.getLink({report, copyOnly});
                })
            } else if(!this.reportIsFinalized && copyOnly) {
                this.showFinalizePopup();
            } else {
                this.close();
                this.getLink({report, copyOnly});
            }

        },
        getLink({report, copyOnly}) {
            PresentationTemplateCollection.getLink(report.id, this.shareLink.name.value, this.shareLink.email.value, this.shareLink.comment.value, this.dictionary.meta.code, !copyOnly)
              .then(function (res) {
                  if (copyOnly) {
                      this.shareLinkInfo = res;
                      this.showLinkCopyField();
                  } else {
                      Toast.show(this.dictionary.presentations.linkSent);
                      this.onLinkSent();
                  }
              }.bind(this));
        },
        showFinalizePopup() {
            this.$modal.show(cancelFinalize, {
                setReportFinalizationAndProceedToShare: () => {
                    this.copyDelaying = true;
                    this.finalizeReport(() => {
                        this.getLink({
                            report: this.selectedReport,
                            copyOnly: true
                        });
                        this.copyDelaying = false;
                    }

                    )
                }
            }, {
                height: 135
            });
        },
        showLinkCopyField() {
            this.$modal.show(copyLink, {shareLinkInfo: this.shareLinkInfo}, {height: 'auto'});
        },
        close() {
            this.$emit('close');
        },
        showFinalizeToast() {

            Toast.show(this.dictionary.presentations.reportIsGenerating, 'finalizing-toast',
              [
                  {
                      text: this.dictionary.presentations.ok,
                      onClick: () => {
                          this.$store.dispatch('finishFinalizeCountDown');
                      }
                  },
                  {
                      text: this.dictionary.presentations.cancel,
                      onClick: () => {
                          this.$store.dispatch('breakFinalizeCountDown');
                      }
                  }
              ]
            );
        },
    };

    export default Vue.extend({
        name: 'get-link',
        template,
        data,
        methods,
        props: {
            selectedReport: {
                type: Object,
                required: true
            },
            reportIsFinalized: {
                type: Boolean,
                default: false
            },
            finalizeReport: {
                type: Function,
                default: () => {}
            },
            onLinkSent: {
                type: Function,
                default: () => {}
            }
        },
        components: {
            modal
        },
        computed: {
            finalizeCountDown() {
                return this.$store.getters.finalizeCountDown;
            }
        },
        watch: {
            finalizeCountDown: function(newVal, oldVal) {
                if (newVal !== oldVal && newVal === 0 && (newVal !== null)) {//If countdown is finished (set to 0 and ONLY then to null)
                    if (this.delayedActions.length) {
                        this.delayedActions.forEach(action => {action()})
                    }
                } else if (newVal !== oldVal && oldVal !== 0 && newVal === null) {//If countdown is cancelled (set to null)
                    this.delayedActions = [];
                    this.close();
                }
            }
        },
    });
