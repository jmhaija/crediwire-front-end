  import Vue from 'Vue'
  import moment from 'moment'
  import modal from 'elements/modals/modal'
  import DictionaryModel from 'models/DictionaryModel'
  import warningSettings from 'components/warningSettings.vue'

  const template = `
        <modal :close="close" class="no-header">  
            <template v-slot:content>
                <div>{{ ui.dictionary.presentations.reportIsGenerating }}</div>
            </template>   
            <template v-slot:footer>
                <div class="close flex-row flex-justify-space-between">
                    <button class="primary" v-on:click="finish()">
                        {{ui.dictionary.presentations.ok}}
                    </button>
                    <button class="primary" v-on:click="close()">
                        <span>({{secondsLeft}}) seconds</span>
                        {{ui.dictionary.presentations.cancel}}
                    </button>
                </div>
            </template>                                                    
        </modal>
    `;

  let interval = null;

  const data = () => ({
      ui: {
        dictionary: DictionaryModel.getHash(),
      },
      secondsLeft: 5
  });

  const methods = {
    close() {
      this.$emit('close');
    },
    finish() {
      this.$emit('close');
      this.setReportFinalizationAndProceedToShare();
    }
  };

  export default Vue.extend({
    name: 'cancel-finalize-dialog',
    template,
    data,
    methods,
    props: {
      setReportFinalizationAndProceedToShare: {
        type: Function,
        default: () => {}
      }
    },
    components: {
      modal,
    },
    mounted() {
      interval = setInterval(() => {
        this.secondsLeft -= 1;
     }, 1000)
    },
    watch: {
      secondsLeft(secondsLeft) {
        if (secondsLeft === 0) {
          this.$emit('close');
          this.setReportFinalizationAndProceedToShare();
        }
      }
    },
    beforeDestroy() {
      clearInterval(interval)
    }
  });
