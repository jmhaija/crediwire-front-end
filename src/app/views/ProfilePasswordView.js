import Vue from 'vue/dist/vue.js'
import DictionaryModel from 'models/DictionaryModel'
import UserModel from 'models/UserModel'
import Validator from 'services/Validator'
import Toast from 'services/Toast'

const template = `
    <article>
       <header class="section-heading">{{ui.dictionary.profile.password}}</header>
           <section class="form">
               <form v-on:submit.prevent="savePassword()">
                   <div class="input-field">
                       <input type="password" v-model="profile.password.value" v-bind:class="{ invalid : !profile.password.valid }" v-on:keyup="validatePassword()" v-on:blur="validatePassword(true)">
                       <label v-bind:class="{ filled: profile.password.value.length > 0 }">{{ui.dictionary.register.password}}</label>
                       <div class="warning" v-bind:class="{ show : !profile.password.valid }">{{ui.dictionary.general.validation.passwordEntropy}}</div>
                   </div>
                   <div class="input-field">
                       <input type="password" v-model="profile.password2.value" v-bind:class="{ invalid : !profile.password2.valid }" v-on:keyup="verifyPassword()" v-on:blur="verifyPassword(true)">
                       <label v-bind:class="{ filled: profile.password2.value.length > 0 }">{{ui.dictionary.register.password2}}</label>
                       <div class="warning" v-bind:class="{ show : !profile.password2.valid }">{{ui.dictionary.register.passwordMatch}}</div>
                   </div>
                   <section class="toolbar">
                        <div class="working" v-show="ui.working"></div><button v-show="!ui.working" type="submit" class="primary">{{ui.dictionary.profile.savePassword}}</button>
                   </section>
               </form>
           </section>
    </article>
`;

const data = () => ({
    ui : {
        dictionary : DictionaryModel.getHash(),
        working : false
    },
    profile : {
        password : { value : '', valid : true },
        password2 : { value : '', valid : true }
    },
})

const methods = {

    validatePassword(force) {
        if (force || !this.profile.password.valid) {
            this.profile.password.valid = Validator.password(this.profile.password.value);
        }

        return this.profile.password.valid;
    },
    /**
     * Validate verification password
     * Make sure it matches the chosen password.
     */
    verifyPassword(force) {
        if (force || !this.profile.password2.valid) {
            this.profile.password2.valid = this.profile.password.value == this.profile.password2.value;
        }

        return this.profile.password2.valid;
    },

    /**
     * Save new password
     */
    savePassword() {
        if ( !this.validatePassword(true) || !this.verifyPassword(true) ) {
            return false;
        }

        var scope = this;
        var user = UserModel.profile();

        scope.ui.working = true;

        user.password = this.profile.password.value;

        UserModel.construct(user);
        UserModel.save()
            .then(function(res) {
                if (res.success) {
                    Toast.show(scope.ui.dictionary.profile.passwordChanged);
                    scope.profile.password.value = '';
                    scope.profile.password2.value = '';
                } else {
                    Toast.show(scope.ui.dictionary.profile.passwordUnchanged, 'warning');
                }

                scope.ui.working = false;
            });
    }
}

export default Vue.extend({
    name: 'profile-password-view',
    template,
    data,
    methods
})
