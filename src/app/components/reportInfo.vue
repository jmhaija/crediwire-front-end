<template>
    <div class="info">
        <div class="open-icon tooltip">
            <span class="report-name" v-on:click="onTitleClick">{{presentation.name}}</span>
            <div class="message right white-message">{{presentation.name}}</div>
        </div>
        <span class="created">{{formatDate(presentation.created)}}</span>
        <span class="pages">{{dictionary.presentations.pages}}: <span class="page-number">{{pages.length}}</span></span>
        <slot></slot>
    </div>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import dateMixin from 'mixins/dateMixin'

    const props = {
        presentation: {
            type: Object,
            required: true
        },
        onTitleClick: {
            type: Function,
            default: () => {}
        },
        pages: {
            type: Array
        }
    };

    const data = () => ({
        dictionary: DictionaryModel.getHash()
    });

    export default {
        name: 'report-info',
        props,
        data,
        mixins: [dateMixin]
    }

</script>
