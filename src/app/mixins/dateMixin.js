    import moment from 'moment'
    import DictionaryModel from 'models/DictionaryModel'

    export default {
        methods: {
            formatDate : function(dateString) {
                if (dateString) {
                    return moment(dateString).format(DictionaryModel.getHash()?.locale?.displayFormat);
                } else {
                    return '--';
                }
            }
        }
    };
