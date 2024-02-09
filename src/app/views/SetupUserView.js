define([
    
    'Vue',
    'models/DictionaryModel',
    'models/InviteTokenModel',
    'models/UserModel',
    'services/EventBus',
    'services/Validator',
    'services/Toast'
    
], function(Vue, DictionaryModel, InviteTokenModel, UserModel, EventBus, Validator, Toast) {
    var template = [
    '<article v-on:click="triggerClickAppBodyEvent()">',
    '   <section class="lone-component">',
    
    '       <h1 v-show="ui.step == 1" class="page-title center-text">{{ui.dictionary.company.userInvitation.acceptTitle}}</h1>',
    '       <h1 v-show="ui.step == 2" class="page-title center-text">{{ui.dictionary.setup.title}}</h1>',
    
    '       <div v-show="ui.step == 1" class="onpage-tip"><i class="cwi-info"></i>{{parseCompanyName(ui.dictionary.company.userInvitation.inviteDescription)}}</div>',
    '       <div v-show="ui.step == 2" class="onpage-tip"><i class="cwi-info"></i>{{ui.dictionary.setup.tips.profile}}</div>',
    
    '       <section v-show="ui.step === 1">',
    
    '           <section class="form">',
    '               <form v-on:submit.prevent="processInvitation(true)">',
    '                   <section class="center-text message-bar">',
    '                       <div class="working" v-show="ui.working"></div>',
    '                       <button type="submit" v-show="!ui.working" class="primary">{{ui.dictionary.company.userInvitation.accept}}</button>',
    '                   </section>',
    '               </form>',
    '           </section>',
    
    '           <div class="center-text">',
    '               <a href="" v-on:click.prevent="processInvitation(false)">{{ui.dictionary.company.userInvitation.decline}}</a>',
    '           </div>',
    '       </section>',
    
    
    '       <section v-show="ui.step === 2">',
    '           <header class="section-heading">{{ui.dictionary.profile.title}}</header>',
    '           <section class="form">',
    '               <form v-on:submit.prevent="completeSetup()">',
    '                   <div class="input-field">',
    '                       <input type="text" v-model="profile.name.value" v-bind:class="{ invalid : !profile.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">',
    '                       <label v-bind:class="{ filled: profile.name.value.length > 0 }">{{ui.dictionary.profile.name}}</label>',
    '                       <div class="warning" v-bind:class="{ show : !profile.name.valid }">{{ui.dictionary.general.validation.name}}</div>',
    '                   </div>',
    '                   <div class="input-field">',
    '                       <input type="text" v-model="profile.phone.value">',
    '                       <label v-bind:class="{ filled: profile.phone.value.length > 0 }">{{ui.dictionary.profile.phone}}</label>',
    '                   </div>',
    '                   <section class="toolbar">',
    '                       <div class="working" v-show="ui.working"></div><button type="submit" v-show="!ui.working" class="primary">{{ui.dictionary.profile.save}}</button>',
    '                   </section>',
    '               </form>',
    '           </section>',
    '       </section>',
    
    '   </section>',
    '</article>'
    ].join('');
    
    
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                working : false,
                step : 1
            },
            profile : {
                name : { value : '', valid : true },
                phone : { value : '', valid : true }
            },
            inviteInfo : InviteTokenModel.getInfo(),
            agree : true,
            registering : false
        };
    };
    
    
    var methods = {
        init : function() {
            this.registering = this.$route.query.type && this.$route.query.type == 'register';
            if (this.inviteInfo.name) {
                this.profile.name.value = this.inviteInfo.name;
            }
        },
        
        triggerClickAppBodyEvent : function() {
            EventBus.$emit('click');
            EventBus.$emit('clickAppBody');
        },
        
        validateName : function(force) {
            if (force || !this.profile.name.valid) {
                this.profile.name.valid = Validator.name(this.profile.name.value, 2);
            }
            
            return this.profile.name.valid;
        },
        
        parseCompanyName : function(string) {
            return string.replace(':company', this.inviteInfo.company_name);
        },
        
        processInvitation : function(agreed) {
            this.ui.working = true;
            
            InviteTokenModel.setConnect(agreed);
            
            if (false && this.inviteInfo.request_erp_approval) {
                InviteTokenModel.approveCompany(agreed)
                    .then(function(res) {
                        this.processInvitationRequest(agreed);
                    }.bind(this));
            } else {
                this.processInvitationRequest(agreed);
            }
        },
        
        processInvitationRequest : function (agreed) {
            
            
            InviteTokenModel.process()
                .then(function(res) {
                    if (res.errors) {
                        Toast.show(this.ui.dictionary.invitations.alreadyConnected , 'warning');
                    }
                                                
                    InviteTokenModel.forget();
                    UserModel.fromSession()
                        .then(function(res) {
                            if (res.contents) {
                                UserModel.construct(res.contents);
                            }
                        });
                        
                    if (agreed && this.registering) {
                        this.ui.working = false;
                        this.ui.step++;
                    } else if (!agreed && this.registering) {
                        this.$router.push('/setup');
                    } else {
                        this.$router.push('/account/overview');
                    }
                }.bind(this));
        },
        
        completeSetup : function() {
            if (!this.validateName(true)) {
                return false;
            }
            
            this.ui.working = true;
            
            var profile = UserModel.profile();
            profile.name = this.profile.name.value;
            profile.phone = this.profile.phone.value;
            UserModel.construct(profile);
            
            UserModel.save()
                .then(function(res) {
                    this.$router.push('/account/overview');
                }.bind(this));
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        mounted : function() {
            this.init();
        }
    });
});
