define([
    'Vue',
    'models/FileModel',
    'models/DictionaryModel',
], function (Vue, File, DictionaryModel) {
    const template = `
    <div class="upload-area">
        <input ref="file" type="file" id="file" v-on:change="handleFileUpload"/>
        <div class="text clickable">{{dictionary.fileUpload.selectFileOrDrag}}</div>
    </div>
`;

    const methods = {
        handleFileUpload() {
            this.file = this.$refs.file.files[0];

            if (this.file) {
                const createdFile = new File(this.file);
                this.$emit('fileCreated', createdFile);
            }
        }
    };

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash()
        };
    };

    return Vue.extend({
        name: 'add-file',
        data,
        template,
        methods
    });
});
