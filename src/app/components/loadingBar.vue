<template>
    <article
    data-test-id="gatheringDataProgressBar"
    class="loading-bar-container"
    >
       <div class="bar">
           <div class="fill" :style="{ width : percent + '%' }"></div>
       </div>
       <div class="label" v-show="label < 100">
           {{label}}%
       </div>
       <div class="label" v-show="label == 100">
           Done!
       </div>
    </article>
</template>

<script>
    const data = () => ({
        label : 0,
        intervalTimer : null
    });

    export default {
        data,
        props : ['percent'],
        watch : {
            percent(v) {
                var delta = v - this.label;
                var interval = 2000 / delta;

                clearInterval(this.intervalTimer);

                this.intervalTimer = setInterval(function() {
                    if (this.label >= v) {
                        clearInterval(this.intervalTimer);
                        this.label = v;
                        return false;
                    }

                    this.label++;
                }.bind(this), interval);
            }
        }
    }

</script>
