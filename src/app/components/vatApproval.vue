<template>
  <article>
    <section :class="{ 'half-width' : !setup }">
      <div  v-if="ui.vatApprovalSection == 'init'">
        <vat-mismatch-warning
          data-test-id="vatMismatchWarning"
          v-if="showVatNumberMismatchMessage"
        ></vat-mismatch-warning>
        <div :class="{ 'half-width' : !setup }">
          <h4>{{ui.dictionary.vatApproval.crediwireInfo}}</h4>
          <company-settings :forVatCheck="true" :presetCompany="company"></company-settings>
        </div>
        <div :class="{ 'half-width' : !setup }">
          <h4>{{ui.dictionary.vatApproval.erpInfo}}</h4>
          <div class="input-field">
            <input type="text" v-model="erpObject.metaInfo.name" disabled>
            <label class="filled">{{ui.dictionary.company.name}}</label>
          </div>
          <div class="input-field" v-if="erpObject.metaInfo.vat && erpObject.metaInfo.vat.length > 0">
            <input type="text" v-model="erpObject.metaInfo.vat" disabled>
            <label class="filled">{{ui.dictionary.company.vat}}</label>
          </div>
          <div class="input-field" v-if="!erpObject.metaInfo.vat || erpObject.metaInfo.vat.length == 0">
            <input type="text" v-model="erpObject.metaInfo.company_id_number" disabled>
            <label class="filled">{{ui.dictionary.company.vat}}</label>
          </div>
        </div>

        <div class="line-spacer"></div>
        
        <div>
          <div :class="{ 'quarter-width' : !setup, 'inline-block' : setup }">
            <button class="accent" v-on:click="approveReconnect()">{{ui.dictionary.vatApproval.reconnect}}</button>
          </div>
          <div :class="{ 'quarter-width' : !setup, 'float-right' : setup, 'no-margin' : setup }">
            <button
              data-test-id="approveVatInfoButton"
              class="accent"
              v-on:click.prevent="approveVat()"
            >{{ui.dictionary.vatApproval.approve}}</button>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<script>
import DictionaryModel from 'models/DictionaryModel'
import vatMismatchWarning from 'elements/vat-mismatch-warning'
import companySettings from 'views/CompanySettingsView'

const erpObjectStatuses = {
  ERP_VAT_MISMATCH: 'erp_vat_mismatch'
}

const data = () => ({
  ui : {
    dictionary : DictionaryModel.getHash(),
    vatApprovalSection : 'init'
  }
})

const computed = {
  showVatNumberMismatchMessage() {
    return this.erpObject && this.erpObject.status === erpObjectStatuses.ERP_VAT_MISMATCH
  }
}

const methods = {}

export default {
  data,
  methods,
  computed,
  props : ['company', 'erpObject', 'approveReconnect', 'approveVat'],
  components : {
    'vat-mismatch-warning': vatMismatchWarning,
    'company-settings' : companySettings
  }
}
</script>
