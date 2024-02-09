<template>
    <article>
       <div class="working" v-show="ui.loading"></div>
       <div class="selector inline" v-show="!ui.loading">
           <div class="label transparent" v-on:click.stop="ui.options = true">
               <span>{{ui.dictionary.meta.lang}}</span> <i class="cwi-down"></i>
               <div class="options" v-bind:class="{ show : ui.options }">
                   <div class="option" v-for="language in languages" v-bind:class="{ selected : language.code === ui.dictionary.meta.code }" v-on:click.stop="setLanguage(language.code)">
                       <span>{{language.name}}</span>
                   </div>
               </div>
           </div>
       </div>
    </article>
</template>

<script>
    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import LanguageCollection from 'collections/LanguageCollection'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            options : false,
            loading : false
        },
        languages : LanguageCollection.getList()
    });

    const methods = {
        init() {
            var scope = this;
            document.onclick = function(event) {
                scope.ui.options = false;
            };
        },

        setLanguage(language) {
            var scope = this;
            this.ui.options = false;
            this.ui.loading = true;

            DictionaryModel.setLanguage(language);
            DictionaryModel.fetchDictionary(true)
                .then(function(dictionary) {
                    DictionaryModel.setHash(dictionary);
                    scope.callback(dictionary);
                    scope.ui.dictionary = dictionary;
                    scope.ui.loading = false;
                });
        }
    };

    export default {
        name : 'language-picker',
        data,
        methods,
        props: {
            callback: {}
        },
        created() {
            this.init();
        }
    };

</script>
