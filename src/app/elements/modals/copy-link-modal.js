    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import DictionaryModel from 'models/DictionaryModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import Config from 'services/Config'
    // 'elements/modals/show-new-invitations-modal'

    const template = `
        <modal :title="dictionary.presentations.shareableLink" :close="close">                                        
            <template v-slot:content>
                <div class="auto-copy no-padding full-width-copy-link">
                    <span class="copied" :class="{ show : showCopied }" style="top: 37px; right: -6px;">{{dictionary.invitations.copied}}</span>
                    <span class="copy-button" v-on:click.stop="copyLink">{{dictionary.invitations.copy}}</span>
                    <textarea ref="textarea" id="reportLink"  v-if="!withoutPin" style="height: 90px; resize: none;">Link : {{domain}}presentation?token={{shareLinkInfo.token}} \r\n\r\nPIN: {{shareLinkInfo.pin_code}}</textarea>
                    <textarea ref="textarea" id="invitelink" v-else style="height: 90px; resize: none;">Link : {{shareLinkInfo}} </textarea>
                 </div>                
            </template>                                                       
        </modal>
    `;


    const data = () => ({
        dictionary: DictionaryModel.getHash(),
        showCopied: false,
        domain: Config.get('domain'),
    });

    const methods = {
        copyLink() {
            const textarea = this.$refs.textarea;
            textarea.select();

            try {
                document.execCommand('copy');
                textarea.blur();
                this.showCopied = true;

                setTimeout(() => {
                    this.showCopied = false;
                }, 4000);
            } catch (err) {
                alert(this.dictionary.invitations.copyFail);
            }
        },
        close() {
            this.$emit('close');
        }
    };

    export default Vue.extend({
        name: 'copy-link',
        template,
        data,
        methods,
        props: ['shareLinkInfo', 'withoutPin'],
        components: {
            modal
        },
    });
