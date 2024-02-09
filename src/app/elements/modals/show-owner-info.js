define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel',
    'elements/connection-card',
], function (Vue, moment, modal, DictionaryModel, connectionCard) {
    const template = `
        <modal :title="getTitle()" :close="close">  
            <span v-show="connection.company.name">: {{connection.company.name}}</span>                                      
            <template v-slot:content>
                <div class="working" v-show="!adminData"></div>
                <table class="owner-info owner-info-modal" v-if="adminData">
                    <tr><td>{{dictionary.profile.name}}:</td><td>{{adminData.owner.name}}</td></tr>
                    <tr><td>{{dictionary.profile.email}}:</td><td>{{adminData.owner.email}}</td></tr>
                    <tr><td>{{dictionary.profile.phone}}:</td><td>{{adminData.owner.phone}}</td></tr>
                    <tr><td>{{dictionary.profile.created}}:</td><td>{{formatDate(adminData.owner.created)}}</td></tr>
                    <tr><td>{{dictionary.profile.source}}:</td><td>
                        <span v-if="adminData.owner.source">{{dictionary.profile.sources[adminData.owner.source.type]}}
                            <span v-if="adminData.owner.source.company && adminData.owner.source.company.name">: {{adminData.owner.source.company.name}}</span>
                            <span v-if="adminData.owner.source.app && adminData.owner.source.app.name">: {{adminData.owner.source.app.name}}</span>
                        </span>
                        <span v-show="!adminData.owner.source">{{dictionary.profile.sources.direct}}</span>
                    </td></tr>
                </table>         
            </template>                                                       
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },
        formatDate : function(date) {
            return moment(date).format(this.dictionary.locale.displayFormat);
        },

        getTitle() {
            return this.dictionary.connections.ownerInfo + ': ' + this.connection.company.name;
        }
    };

    return Vue.extend({
        name: 'show-owner',
        template,
        data,
        methods,
        props: ['connection', 'adminData'],
        components: {
            modal
        },
        created: function () {},
        mounted: function() {},
    });
});
