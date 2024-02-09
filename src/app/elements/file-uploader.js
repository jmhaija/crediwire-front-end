import Vue from 'Vue'
import File from 'components/file.vue'
import AddFile from 'components/addFile.vue'
import FileModel from 'models/FileModel'

const template =`
    <section class="file-uploader">
        <div>
            <template
                v-if="allowMultiple"
                v-for="file in files"
            >
                <file
                    :file="file"
                    :showPreview="showPreview"
                    v-on:deleteFile="deleteFile"
                ></file>
            </template>
            <file
                v-if="!allowMultiple && file"
                :showPreview="showPreview"
                :file="file"
                v-on:deleteFile="deleteFile"
            ></file>
            <add-file
                v-show="showAddFile"
                v-on:fileCreated="addFile"
            ></add-file>
            <button
                v-show="!uploading && showUploadButton"
                class="primary"
                @click="onUploadFilesClick"
            >{{uploadTitle}}</button>
            <div class="line-spacer"></div>
            <div
                v-show="uploading"
                class="working inline"
            ></div>
        </div>
    </section>
`

const data = () => ({
    file: null,
    files: [],
    uploading: false
})

const computed = {
    showAddFile() {
        return (
            this.allowMultiple
                ? true
                : !this.file
        )
    }
}

const methods = {
    init() {
        if (this.getFiles) {
            this.getFiles()
                .then(res => {
                if (res.url) {
                    this.file = new FileModel(res.url)
                }
            })
        }
    },

    onUploadFilesClick() {
        if (this.files.length || this.file) {
            this.uploading = true;

            const itemsToUpload = (
                this.allowMultiple
                    ? this.files
                    : this.file
            )
            this.uploadFiles(itemsToUpload)
                .then(
                    res => this.onFilesUploaded(res),
                    err => this.onError(err)
                )
        }
    },

    onFilesUploaded() {
        this.uploading = false;
        if (this.onUploadFiles) {
            this.onUploadFiles()
        }
    },

    deleteFile(fileToDelete) {
        if (this.allowMultiple) {
            this.files = (
                this.files
                    .filter(file => (file.id !== fileToDelete.id))
            )
        } else {
            this.file = null
        }
        if (this.onDeleteFile && fileToDelete.src) {
            this.onDeleteFile()
        }
    },

    addFile(fileToAdd) {
        if (this.allowMultiple) {
            this.files.push(fileToAdd)
        } else {
            this.file = fileToAdd;
            this.$emit('fileAdded', fileToAdd);
        }
    },

    onError() {
        this.uploading = false
    }
}

const props = {
    allowMultiple: {
        type: Boolean,
        default: false
    },
    showPreview: {
        type: Boolean,
        default: false
    },
    uploadFiles: {
        type: Function,
        required: true
    },
    onUploadFiles: {
        type: Function
    },
    onDeleteFile: {
        type: Function,
    },
    uploadTitle: {
        type: String,
        default: 'Upload file(s)'
    },
    getFiles: {
        type: Function
    },
    showUploadButton: {
        type: Boolean,
        default: true
    }
}

export default Vue.extend({
    name: 'file-uploader',
    mounted() {
        this.init();
    },
    components: {
        'file': File,
        'add-file': AddFile
    },
    props,
    template,
    data,
    methods,
    computed
})
