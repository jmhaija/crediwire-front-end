<template>
    <div class="presentation-description" :class="[preview ? 'preview-mode' : 'presentation-mode']">
        <div class="presentation-description-header" @click="toggleDescription">
            <span class="description-header-title">{{ui.dictionary.presentations.comments}}</span>
            <span class="description-header-indicator" v-html="ui.isOpened? '-' : '+'">+</span>
        </div>
        <div class="presentation-description-body" v-show="ui.isOpened">
            {{description}}
        </div>
    </div>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            isOpened: false
        }
    });

    const methods = {
        toggleDescription() {
            this.ui.isOpened = !this.ui.isOpened;
        }
    };

    export default {
        data,
        methods,
        props : {
            description: {},
            preview: {}
        }
    }

</script>
