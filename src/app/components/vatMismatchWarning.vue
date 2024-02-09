<template>
  <article class="vat-mismatch-warning">
    <h2 class="vat-mismatch-warning-title"><i class="cwi-warning"></i>{{ui.dictionary.vatApproval.mismatchFound}}</h2>
    <p class="vat-mismatch-warning-text">{{ui.dictionary.vatApproval.vatMismatch}}</p>
    <ul class="vat-mismatch-reasons-list">
      <li class="vat-mismatch-reason">{{ui.dictionary.vatApproval.vatMismatchReasons.typo}}</li>
      <li class="vat-mismatch-reason">{{ui.dictionary.vatApproval.vatMismatchReasons.wrongAccount}}</li>
      <li class="vat-mismatch-reason">{{ui.dictionary.vatApproval.vatMismatchReasons.informationIsWrong}}</li>
    </ul>
  </article>
</template>

<script>
import DictionaryModel from 'models/DictionaryModel'

const data = () => ({
  ui : {
    dictionary : DictionaryModel.getHash()
  }
})

export default {
  template,
  data
}
</script>
