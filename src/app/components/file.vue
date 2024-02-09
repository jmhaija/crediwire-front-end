<template>
    <div class="file-item" :class="classArray">
        <div class="file-preview" v-if="showPreview">
            <img :src="imagePreview">
        </div>
        <i v-else class="cwi-template" ></i>
        <div class="file-name">
            {{file.name}}
        </div>
        <i class="delete cwi-close" @click="deleteFile(file)"></i>
    </div>
</template>
<script>
    const data = () => ({
        previewIsReady: false,
        imagePreview: null
    });

    const methods = {
        init() {
            const { fileObj, name, src } = this.file;
            if (this.showPreview && fileObj) {
                const reader = new FileReader();

                reader.addEventListener('load', () => {
                    this.previewIsReady = true;
                    this.imagePreview = reader.result;
                }, false);

                if (/\.(jpe?g|png|gif)$/i.test(name)) {
                    /*
                      Fire the readAsDataURL method which will read the file in and
                      upon completion fire a 'load' event which we will listen to and
                      display the image in the preview.
                    */
                    reader.readAsDataURL( fileObj );
                }
            } else if (this.showPreview && src) {
                this.imagePreview = src;
            }
        },
        deleteFile(file) {
            this.$emit('deleteFile', file);
        }
    };

    const computed = {
        classArray() {
            return this.showPreview ? '' : ['flex-column', 'flex-justify-center', 'flex-align-center'];
        }
    };

    const props = {
        file: {
            type: Object,
            required: true,
        },
        showPreview: {
            type: Boolean,
            default: false
        },
    };

    export default {
        name: 'file',
        data,
        methods,
        props,
        computed,
        mounted() {
            this.init();
        }
    }
</script>
