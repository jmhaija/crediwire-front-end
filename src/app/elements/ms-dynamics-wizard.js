/* global saveAs */

define([
    
    'Vue',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/AssetModel',
    'services/DynamicsParser'
    
], function(Vue, DictionaryModel, ErpModel, AssetModel, DynamicsParser) {
    'use strict';

    const template = `
    <article>
        <section v-show="ui.loading">
            <div class="working"></div>
        </section>
        
        <section v-show="!ui.loading">


            <div class="form" v-show="ui.step == 1">

                <p class="warning" v-show="ui.companyError">{{ui.dictionary.erp.dynamics.error}}</p>

                <div class="input-field">
                   <input type="text" v-model="info.username.value" v-on:keyup="info.username.entered = true" v-bind:class="{ invalid : info.username.entered && !info.username.value.length }">
                   <label v-bind:class="{ filled: info.username.entered && info.username.value.length > 0 }">{{ui.dictionary.erp.dynamics.username}}</label>
                   <div class="warning" v-bind:class="{ show : info.username.entered && !info.username.value.length }">{{ui.dictionary.general.validation.generic}}</div>
                </div>
                <div class="ms-dynamics-guide-open" v-on:click.prevent="openGuide('username')">
                    <i class="cwi-info"></i>
                </div>

                <div class="input-field">
                   <input type="text" v-model="info.key.value" v-on:keyup="info.key.entered = true" v-bind:class="{ invalid : info.key.entered && !info.key.value.length }">
                   <label v-bind:class="{ filled: info.key.entered && info.key.value.length > 0 }">{{ui.dictionary.erp.dynamics.key}}</label>
                   <div class="warning" v-bind:class="{ show : info.key.entered && !info.key.value.length }">{{ui.dictionary.general.validation.generic}}</div>
                </div>
                <div class="ms-dynamics-guide-open" v-on:click.prevent="openGuide('key')">
                    <i class="cwi-info"></i>
                </div>

                <div class="input-field">
                   <input type="text" v-model="info.env.value" v-on:keyup="info.env.entered = true" v-bind:class="{ invalid : info.env.entered && !info.env.value.length }">
                   <label v-bind:class="{ filled: info.env.entered && info.env.value.length > 0 }">{{ui.dictionary.erp.dynamics.env}}</label>
                   <div class="warning" v-bind:class="{ show : info.env.entered && !info.env.value.length }">{{ui.dictionary.general.validation.generic}}</div>
                </div>
                <div class="ms-dynamics-guide-open" v-on:click.prevent="openGuide('env')">
                    <i class="cwi-info"></i>
                </div>

                <div class="input-field">
                   <input type="text" v-model="info.domain.value" v-on:keyup="info.domain.entered = true" v-bind:class="{ invalid : info.domain.entered && !info.domain.value.length }">
                   <label v-bind:class="{ filled: info.domain.entered && info.domain.value.length > 0 }">{{ui.dictionary.erp.dynamics.domain}}</label>
                   <div class="warning" v-bind:class="{ show : info.domain.entered && !info.domain.value.length }">{{ui.dictionary.general.validation.generic}}</div>
                </div>
                <div class="ms-dynamics-guide-open" v-on:click.prevent="openGuide('domain')">
                    <i class="cwi-info"></i>
                </div>

                <button class="primary" v-on:click="connectToDynamics">{{ui.dictionary.erp.dynamics.connect}}</button>
            </div>


            <div class="form" v-show="ui.step == 2">

                <p >{{ui.dictionary.erp.dynamics.chooseCompany}}</p>

                <div class="radio-field" v-for="company in companyList">
                    <label><input type="radio" v-model="chosenCompany" v-bind:value="company"> <i></i> {{company.name}}</label>
                </div>

                <button v-show="chosenCompany" class="primary" v-on:click="connectToErp">{{ui.dictionary.erp.dynamics.complete}}</button>
            </div>
        </section>
    </article>
    `;
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : false,
                step : 1,
                companyError : false
            },
            info : {
                username : { value : '', entered : false },
                key : { value : '', entered : false },
                env : { value : '', entered : false },
                domain : { value : '', entered : false }
            },
            companyList : [],
            chosenCompany : null,
            guides : {
                username : false,
                key : false,
                env : false,
                domain : false
            }
        };
    };
    
    
    var methods = {
        connectToDynamics : function() {
            if (this.info.username.value.length &&
                this.info.key.value.length &&
                this.info.env.value.length &&
                this.info.domain.value.length) {


                this.ui.loading = true;
                DynamicsParser.getCompanyInfo(this.info.username.value, this.info.key.value, this.info.env.value, this.info.domain.value)
                    .then(function (res) {
                        if (res.company_info && res.company_info.length) {
                            if (res.company_info.length == 1) {
                                this.chosenCompany = res.company_info[0];
                                this.connectToErp();
                            } else {
                                this.companyList = res.company_info
                                this.ui.step++;
                            }
                        } else {
                            this.ui.companyError = true;
                        }
                        this.ui.loading = false;
                    }.bind(this));

            } else {
                this.info.username.entered = true;
                this.info.key.entered = true;
                this.info.env.entered = true;
                this.info.domain.entered = true;
            }
        },

        connectToErp : function () {
            this.ui.loading = true;

            DynamicsParser.connectToDynamics(this.info.username.value, this.info.key.value, this.info.env.value, this.info.domain.value, this.chosenCompany.id)
                .then(function (res) {
                    if (res.status) {
                        ErpModel.setErp(res);
                        this.$router.push('/account/updating');
                    } else {
                        this.ui.loading = false;
                        this.ui.step--;
                        this.ui.companyError = true;
                    }
                }.bind(this));
        },

        openGuide : function (type) {
            this.guides[type] = true;
            this.$modal.show({
                template: `
                <div>
                    <div class="content-modal">
                        <div class="ms-dynamics-guide popup wide scrollable mid-height" v-if="isUsernameGuideOpen">
                        <div class="close close-ms-dynamics-modal"><i class="cwi-close clickable" v-on:click="closeGuide('username'); $emit('close');"></i></div>
                            <p v-html="ui.dictionary.erp.dynamics.guide.username[0]"></p>
                            <p v-html="ui.dictionary.erp.dynamics.guide.username[1]"></p>
                            <p><img :src="loadImage('user1.png')"/></p>
                            <p v-html="ui.dictionary.erp.dynamics.guide.username[2]"></p>
                            <p><img :src="loadImage('user2.png')"/></p>
                        </div>
                        
                        <div class="ms-dynamics-guide popup wide scrollable mid-height" v-if="isKeyGuideOpen">
                            <div class="close close-ms-dynamics-modal"><i class="cwi-close clickable" v-on:click="closeGuide('key'); $emit('close')"></i></div>
                            <p v-html="ui.dictionary.erp.dynamics.guide.key[0]"></p>
                            <p><img :src="loadImage('key1.png')"/></p>
                            <p><img :src="loadImage('key2.png')"/></p>
                            <p><img :src="loadImage('key3.png')"/></p>
                            <p v-html="ui.dictionary.erp.dynamics.guide.key[1]"></p>
                        </div>
                        
                         <div class="ms-dynamics-guide popup wide scrollable mid-height" v-if="isEnvGuideOpen">
                            <div class="close close-ms-dynamics-modal"><i class="cwi-close clickable" v-on:click="closeGuide('env'); $emit('close')"></i></div>
                            <p v-html="ui.dictionary.erp.dynamics.guide.env[0]"></p>
                            <p><img :src="loadImage('env1.png')"/></p>
                        </div>
                        
                        <div class="ms-dynamics-guide popup wide scrollable mid-height" v-if="isDomainGuideOpen">
                            <div class="close close-ms-dynamics-modal"><i class="cwi-close clickable" v-on:click="closeGuide('domain'); $emit('close')"></i></div>
                            <p v-html="ui.dictionary.erp.dynamics.guide.domain[0]"></p>
                            <p v-html="ui.dictionary.erp.dynamics.guide.domain[1]"></p>
                            <p><img :src="loadImage('dom1.png')"/></p>
                            <p><img :src="loadImage('dom2.png')"/></p>
                        </div>
            
                    </div>
                </div>
                `,
                props: ['ui', 'loadImage', 'isUsernameGuideOpen', 'isKeyGuideOpen', 'isEnvGuideOpen', 'isDomainGuideOpen', 'closeGuide']
            }, {
                ui: this.ui, loadImage: this.loadImage, isUsernameGuideOpen: this.isUsernameGuideOpen, isKeyGuideOpen: this.isKeyGuideOpen,
                isEnvGuideOpen: this.isEnvGuideOpen, isDomainGuideOpen: this.isDomainGuideOpen, closeGuide: this.closeGuide
            },
                {
                    scrollable: true,
                    width: 800,
                    styles: 'min-height: 50vh; padding: 1rem 3rem; overflow: auto',
                    clickToClose: false
                });
        },

        closeGuide : function (type) {
            this.guides[type] = false;
        },

        loadImage : function (name) {
            return new AssetModel('/assets/img/msdynamics/' + name).path;
        }
    };
    

    var computed = {
        isUsernameGuideOpen : function () {
            return this.guides.username;
        },

        isKeyGuideOpen : function () {
            return this.guides.key;
        },

        isEnvGuideOpen : function () {
            return this.guides.env;
        },

        isDomainGuideOpen : function () {
            return this.guides.domain;
        }
    };
    
    return Vue.extend({
        template : template,
        data : bindings,
        computed : computed,
        methods : methods
    });
});
