<template>
    <section class="import-budget">
        <div class="container">
            <i v-if="iconClass" :class="iconClass"></i>
            <h1 v-if="header">{{header}}</h1>
            <p v-if="description">{{description}}</p>
            <slot></slot>
        </div>
    </section>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'

    const data = () => ({
        dictionary: DictionaryModel.getHash()
    })

    export default {
        name: 'card',
        data,
        props: {
            iconClass: {
                type: String
            },
            header: {
                type: String,
            },
            description: {
                type: String
            }
        }
    }
</script>
