define([
  'Vue',
  'models/DictionaryModel',
  'elements/modals/modal',
  'services/API'
], function(Vue, DictionaryModel, modal, API) {

  const onCallSendEmailEndpoint = ({companyId}) => {
    const data = {requested: true}
    const url = `/beta/company/${companyId}/mapping-validation-request`;
    API.create(url, data).then(response => {
        if (response.ok) {
          sessionStorage.setItem(`company-mapping-requested-${companyId}`, 'true');
        }
    });
  }

  const template = `
    <modal :title="ui.dictionary.financialAid.packages" :close="close">
      <template v-slot:content>
        <div
          class="financial-aid-packages"
          v-if="isMappingValid || !wasFinancialAidFixCostReportRequested"
        >
          <section class="package">
            <div class="download">
              <button class="accent" @click="downloadReport('ef'); close()">{{ui.dictionary.financialAid.download}}</button>
            </div>
            <div class="description">
              <p>{{ui.dictionary.financialAid.descEF}}</p>
            </div>
          </section>
          <section class="package">
            <div class="download">
              <button class="accent" @click="downloadReportConditionally">{{ui.dictionary.financialAid.download}}</button>
            </div>
            <div class="description">
              <p>{{ui.dictionary.financialAid.descK}}</p>
            </div>
          </section>
          <section class="package">
            <div class="download">
              <button class="accent" @click="downloadReport('vf'); close()">{{ui.dictionary.financialAid.download}}</button>
            </div>
            <div class="description">
              <p>{{ui.dictionary.financialAid.descVF}}</p>
            </div>
          </section>
           <section class="package" v-if="showPfReport">
            <div class="download">
              <button class="primary" @click="downloadReport('pf'); close()">{{ui.dictionary.financialAid.download}}</button>
            </div>
            <div class="description">
              <p>{{ui.dictionary.financialAid.descPF}}</p>
            </div>
          </section>
        </div>
        <div
          class="financial-aid-packages"
          v-if="wasFinancialAidFixCostReportRequested && !isMappingValid"
        >
          {{ui.dictionary.financialAid.notValidMapping}}
        </div>
      </template>
      <template v-slot:footer>
        <div class="close zero-padding single-footer-btn"><button class="primary" @click="close">{{ui.dictionary.financialAid.close}}</button></div>
      </template>
    </modal>
  `;

  const data = () => {
    return {
      ui : {
        dictionary : DictionaryModel.getHash()
      },
      wasFinancialAidFixCostReportRequested: false
    };
  };

  const methods = {
    close() {
      this.$emit('close')
    },
    downloadReportConditionally() {
      if (this.isMappingValid) {
        this.downloadReport('erst')
        this.close()
      }
      else {
        this.wasFinancialAidFixCostReportRequested = true
        const {company} = this
        if (company?.id && !this.wasMappingValidationRequested) {
          const wasAlreadyRequestedForThisCompany = sessionStorage.getItem(
            `company-mapping-requested-${company.id}`
          );
          if (!wasAlreadyRequestedForThisCompany) {
            onCallSendEmailEndpoint({
              companyId: company.id,
            })
          }
        }
      }
    }
  };

  return Vue.extend({
    name : 'financial-aid-packages',
    template,
    data,
    methods,
    computed: {
      showPfReport() {
        return this.company?.modules?.indexOf('financial_package') >= 0
      }
    },
    props : {
      downloadReport : {
        type : Function,
        required : true
      },
      isMappingValid : {
        type: Boolean,
        required: true
      },
      wasMappingValidationRequested: {
        type: Boolean,
        required: true
      },
      company: {
        type: Object,
        required: true
      }
    },
    components: {
      modal
    }
  });
});
