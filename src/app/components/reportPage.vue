<template>
    <div :draggable="!page.front_page">
            <span class="icon draggable-icon">
                <span class="delete"><i class="cwi-close" v-on:click="onDeleteClick(page)" v-show="!page.front_page"></i></span>
                <!--                <div v-show="!canDelete && !page.front_page" class="working inline delete">-->
                <!--                    <i v-tooltip="{content: 'You cannot delete a page while report is generating', placement: 'bottom-center'}"></i>-->
                <!--                </div>-->
                <span class="title-page" v-show="page.front_page">{{ui.dictionary.presentations.titlePage}}</span>
                <span class="icon-image" v-show="!page.front_page && (page.pseudo_dashboard == '_general' || page.dashboard_id || page.dashboard || page.kpi_drill_down) && !page.aggregations"><i class="cwi-graph"></i></span>
                <span class="icon-image" v-show="!page.front_page && (page.pseudo_dashboard == '_general' || page.dashboard_id || page.dashboard) && page.aggregations"><i class="cwi-pie-chart"></i></span>
                <span class="icon-image" v-show="!page.front_page && page.pseudo_dashboard == '_palbal' || page.context === 'invoice' || page.presentation_upload_id || page.context === 'file_upload' || page.context === 'financial_report'"><i class="cwi-table"></i></span>
            </span>
        <span class="name text-overflow" v-on:click="onTitleClick(page)" :title="page.name">{{page.name}}</span>
    </div>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'

    const data = () => ({
        style: '',
        ui: {
            dictionary : DictionaryModel.getHash(),
        }
    })

    export default {
        name: 'report-page',
        props: {
            onDrop: Function,
            onDragOver: Function,
            onDragStart: Function,
            onDragEnd : Function,
            onTitleClick: Function,
            onDeleteClick: Function,
            page: Object,
            canDelete: Boolean
        },
        data
    }
</script>
