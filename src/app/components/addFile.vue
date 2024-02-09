<template>
  <div class="upload-area">
    <input
      id="file"
      ref="file"
      type="file"
      @change="handleFileUpload"
    >
    <div class="text clickable">
      {{ dictionary.fileUpload.selectFileOrDrag }}
    </div>
  </div>
</template>

<script>
import DictionaryModel from '../models/DictionaryModel'
import FileModel from '../models/FileModel'

const methods = {
  handleFileUpload() {
    const file = this.$refs.file.files[0]
    if (file) {
      const createdFile = new FileModel(file)
      this.$emit('fileCreated', createdFile)
    }
  }
}

const data = () => ({
  dictionary: DictionaryModel.getHash()
})

export default {
  data,
  methods
}
</script>

<style lang="scss" scoped>
.upload-area {
    height: 143px;
    border-style: dashed;
    border-width: 3px;
    border-color: #aaaaaa;
    border-radius: 5px;
    margin: 2rem 0;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    .text {
        padding-top: 4rem;
        display: inline-block;

        i {
            margin: -1.5rem 0 0.5rem 0;
            font-size: 2rem;
        }
    }

    .chosen {
        color: $font-primary;
    }

    input[type=file] {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        opacity: 0;
        cursor: pointer;
    }

    input:invalid ~ .chosen {
        display: none;
    }

    input:valid ~ .empty {
        display: none;
    }
}
</style>
