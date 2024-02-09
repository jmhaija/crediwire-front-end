import Vue from 'Vue'
import FileUploader from 'elements/file-uploader'
import Card from 'components/card.vue'
import DictionaryModel from 'models/DictionaryModel'
import CompanyModel from 'models/CompanyModel'
import promiseHelpers from 'helpers/promiseHelpers'
import reportPageTypes from 'constants/reportPageTypes'

const template = `
    <article>
        <card
            iconClass="cwi-import"
            :header="dictionary.file.uploadFile"
            :description="dictionary.file.uploadPdfFileDescription"
        >
            <div style="margin: auto;width: 350px;">
                <file-uploader
                    ref="fileUploader"
                    @fileAdded="onFileAdded"
                    :uploadFiles="uploadReportFile"
                    :showPreview="false"
                    :uploadTitle="dictionary.file.uploadFile"
                    :getFiles="getFile"
                    :onDeleteFile="deleteFile"
                    :showUploadButton="showUploadButton"
                ></file-uploader>
            </div>
        </card>
    </article>
`

const data = () => ({
  dictionary: DictionaryModel.getHash(),
  file: null
})

const methods = {
  uploadReportFile: () => {},
  getFile: () => {},
  deleteFile: () => {},
  onFileAdded(addedFile) {
    this.file = addedFile;
  }
};

const watch = {
  presentationInfoFlag(pageNumber) {
    if (this.file) {
      this.processReportPageInfo({
        context: reportPageTypes.FILE_UPLOAD,
        presentation_file: this.file,
        page: pageNumber
      });
    }
  }
};

export default Vue.extend({
  name: 'reports-file-uploader',
  props: {
    processReportPageInfo: {
      type: Function,
    },
    presentationInfoFlag: {
      type: Number
    },
    showUploadButton: {
      type: Boolean,
      default: true
    }
  },
  template,
  data,
  methods,
  watch,
  components: {
    'file-uploader': FileUploader,
    'card': Card
  },
})
