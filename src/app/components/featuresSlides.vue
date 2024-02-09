<template>
    <article class="features-slides" ref="slideshow" :style="{ maxWidth : maxContainerWidth + 'px'}">

       <main class="reel" :style="{ marginLeft : reelMargin + 'px' }">
           <section class="slide"
                :style="{ backgroundImage : 'url(' + getImage(slide.image) + ')', width : slideWidth + 'px' }"
                v-for="slide in ui.dictionary.erpSlideshow">

               <div class="content">
                   <div class="title">{{slide.title}}</div>
                   <div class="mobile-image" :style="{ backgroundImage : 'url(' + getImage(slide.image) + ')', width : slideWidth + 'px' }"></div>
                   <div v-for="section in slide.sections" :class="section.type" v-on:click="doAction(section)">
                       {{section.text}}
                   </div>
               </div>

           </section>

       </main>

       <div class="nav">
           <span class="dot"
                 :class="{ active : index == slideIndex }"
                 v-on:click="gotoSlide(index)"
                 v-for="(slide, index) in ui.dictionary.erpSlideshow">
           </span>
       </div>

    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import EventBus from 'services/EventBus'
    import UserModel from 'models/UserModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        },
        slideWidth : 0,
        maxContainerWidth : 9999,
        slideTotal : 5,
        slideIndex : 0,
        slideDelay : 16000,
        reelMargin : 0,
        slideTimer : null,
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        lastSlide : null
    });


    const methods = {
        init() {
            this.slideWidth = this.$refs.slideshow.clientWidth;
            this.maxContainerWidth = this.slideWidth;
            this.nextSlide();

            if (!this.permissions || !this.permissions.owner) {
                this.ui.dictionary.erpSlideshow.pop();
            } else if (this.ui.dictionary.erpSlideshow.length < this.slideTotal && this.lastSlide) {
                this.ui.dictionary.erpSlideshow.push(this.lastSlide);
            }
        },

        getImage(file) {
            return new AssetModel('/assets/img/slideshow/' + file).path;
        },

        doAction(element) {
            if (element.action) {
                EventBus.$emit(element.action);
            }
        },

        nextSlide() {
            this.slideTimer = setTimeout(function() {
                if (this.slideIndex === this.slideTotal) {
                    this.reelMargin = 0;
                    this.slideIndex = 0;
                } else {
                    this.reelMargin -= this.slideWidth;
                    this.slideIndex++;
                }

                this.nextSlide();
            }.bind(this), this.slideDelay);
        },

        gotoSlide(slide) {
            this.slideIndex = slide;
            this.reelMargin = 0 - (slide * this.slideWidth);
            clearTimeout(this.slideTimer);
            this.nextSlide();
        }
    };

    export default {
        data,
        methods,
        mounted() {
            this.init();
        }
    }
</script>
