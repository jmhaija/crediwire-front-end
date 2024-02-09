define([

  'Vue',
  'models/DictionaryModel',
  'models/AssetModel',
  'services/Validator'

], function(Vue, DictionaryModel, AssetModel, Validator) {

  const template = `
    <article class="lone-component large corona-landing" :class="{ embedded : isEmbedded }">
      <header class="logo-header" v-show="!isEmbedded">
        <section class="logo">
          <img :src="crediwireLogo" />
        </section>
        <section class="main-title">
          <h1>{{ui.dictionary.corona.title}}</h1>
        </section>
      </header>
      <section class="landing-body">
        <main class="landing-content">
          <section class="steps" v-show="!isEmbedded">
            <ul class="progressbar">
              <li class="active"><span v-html="parseString(ui.dictionary.corona.progress[0])"></span></li>
              <li class="active"><span v-html="parseString(ui.dictionary.corona.progress[1])"></span></li>
              <li class="active"><span v-html="parseString(ui.dictionary.corona.progress[2])"></span></li>
            </ul>
          </section>
          <section class="main-form">
            <header class="form-header">
              <h2>{{ui.dictionary.corona.form.title}}</h2>
            </header>
            <main class="form-body">
              <div>
                <input type="email" v-model="email" :placeholder="ui.dictionary.corona.form.email" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                <div class="warning" v-show="!emailValid">{{ui.dictionary.corona.form.invalid}}</div>
              </div>
              <div>
                <button class="accent" @click="start">{{ui.dictionary.corona.form.start}}</button>
              </div>
              <section>
                <p v-show="!isEmbedded">
                  {{ui.dictionary.corona.form.description}}
                </p>
                <p>
                  {{ui.dictionary.corona.form.erps}}
                </p>
                <div v-if="ui.dictionary.corona.special[partnerInfo.partner] && !isEmbedded">
                  <p>
                    {{ui.dictionary.corona.special.dinero.description}}
                  </p>
                  <p>
                    <a :href="ui.dictionary.corona.special[partnerInfo.partner].url" target="_blank">{{ui.dictionary.corona.special[partnerInfo.partner].linktext}}</a>
                  </p>
                </div>
              </section>
            </main
            ><aside class="form-image" v-show="!isEmbedded">
              <img src="https://crediwire.com/img/Assets/customer_overview_16_9.png" />
            </aside>
          </section>
        </main
        ><aside class="landing-sidebar" v-show="!isEmbedded">
          <section class="uvp-box">
            <h3>{{ui.dictionary.corona.usp.title}}</h3>
            <ul>
              <li><i class="cwi-approve"></i> {{ui.dictionary.corona.usp.points[0]}}</li>
              <li><i class="cwi-approve"></i> {{ui.dictionary.corona.usp.points[1]}}</li>
              <li><i class="cwi-approve"></i> {{ui.dictionary.corona.usp.points[2]}}</li>
              <li><i class="cwi-approve"></i> {{ui.dictionary.corona.usp.points[3]}}</li>
            </ul>
          </section>
          <section class="partner">
            <img :src="partnerLogo" v-if="partnerInfo" />
          </section>
        </aside>
      </section>
    </article>
    `

    const data = () => ({
      ui : {
        dictionary : DictionaryModel.getHash()
      },
      email : '',
      emailValid : true,
      partnerInfo : null
    })

    const methods = {
      validateEmail (force) {
        if (force || !this.emailValid) {
          this.emailValid = Validator.email(this.email)
        }
        return this.emailValid
      },

      start () {
        if (!this.validateEmail(true)) {
          return false
        }

        sessionStorage.setItem('progLandingEmail', this.email)
        sessionStorage.setItem('progLandingPartner', this.$route.meta.partner)

        if (this.partnerInfo.generic) {
          this.openGenericRegistration()
        } else {
          this.openPartnerRegistration()
        }
      },

      openPartnerRegistration () {
        const partnerSlug = this.$route.meta.partner
        const targetUrl = `/${partnerSlug}/register`
        if (this.isEmbedded) {
          window.open(targetUrl)
        } else {
          this.$router.push(targetUrl)
        }
      },

      openGenericRegistration () {
        const targetUrl = '/register'
        if (this.isEmbedded) {
          window.open(targetUrl)
        } else {
          this.$router.push(targetUrl)
        }
      },

      generatePartnerInfo () {
        this.partnerInfo = this.$route.meta
      },

      parseString (str = '') {
        const lineDelimiter = '  '
        return str.trim().split(lineDelimiter).join('<br />')
      }
    }

    const computed = {
      crediwireLogo () {
        return new AssetModel('/assets/img/logo/default.png').path
      },

      partnerLogo () {
        const logo = `/assets/img/partners/${this.partnerInfo.logo}`
        return new AssetModel(logo).path
      },

      isEmbedded () {
        return this.$route.params && this.$route.params.sub && this.$route.params.sub == 'embed'
      }
    }

    return Vue.extend({
      template,
      data,
      computed,
      methods,
      mounted () {
        this.generatePartnerInfo()
      }
    })
  })
