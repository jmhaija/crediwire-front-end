import Vue from 'Vue'
import FileUploader from 'elements/file-uploader'
import Card from 'components/card.vue'
import DictionaryModel from 'models/DictionaryModel'
import CompanyModel from 'models/CompanyModel'
import promiseHelpers from 'helpers/promiseHelpers'

const template = `
    <article>
        <card
            iconClass="cwi-import"
            :header="dictionary.company.companyLogo.uploadCompanyLogo"
            :description="dictionary.company.companyLogo.selectIcon"
        >
            <div style="margin: auto;width: 350px;">
                <file-uploader
                    :uploadFiles="uploadCompanyLogo"
                    :showPreview="true"
                    :uploadTitle="dictionary.company.companyLogo.uploadLogo"
                    :getFiles="getLogo"
                    :onDeleteFile="deleteLogo"
                ></file-uploader>
            </div>
        </card>
    </article>
`

const data = () => ({
    dictionary: DictionaryModel.getHash()
})

const {rejectedPromise} = promiseHelpers

const methods = {
    uploadCompanyLogo: logoFile => (
        logoFile.fileObj
            ? CompanyModel.uploadCompanyLogo(logoFile.fileObj)
            : rejectedPromise()
    ),
    getLogo: () => CompanyModel.getCompanyLogo(),
    deleteLogo: () => CompanyModel.deleteCompanyLogo()
}

export default Vue.extend({
    template,
    data,
    methods,
    components: {
        'file-uploader': FileUploader,
        'card': Card
    },
})
