<template>
    <article class="easy-view">
       <section class="single container" v-if="icon == 'liquidity.png'">
           <div class="symbol" :style="{ backgroundImage : 'url(' + getScaleImage(kpi.rawKpi, kpi.benchmark) + ')', height: '220px', backgroundSize: 'contain' }"></div>
       </section>

       <section class="separated container" v-if="icon != 'liquidity.png'">
           <div class="symbol" :style="{ backgroundImage : 'url(' + getImage('orange', kpi.rawKpi) + ')', backgroundSize : getBackgroundSize(kpi.rawKpi), backgroundPosition : getBackgroundPosition() }"></div>
           <div class="symbol" :style="{ backgroundImage : 'url(' + getImage('blue', kpi.rawPrevious) + ')', backgroundSize : getBackgroundSize(kpi.rawPrevious), backgroundPosition : getBackgroundPosition() }" v-show="kpi.rawPrevious"></div>
           <div class="symbol" :style="{ backgroundImage : 'url(' + getImage('grey', kpi.rawAverage) + ')', backgroundSize : getBackgroundSize(kpi.rawAverage), backgroundPosition : getBackgroundPosition() }" v-show="kpi.rawAverage"></div>
       </section>
    </article>
</template>

<script>
    import AssetModel from 'models/AssetModel'

    const data = () => ({});

    const methods = {
        getBackgroundPosition() {
            if (this.icon == 'solvency.png') {
                return 'bottom';
            }

            return 'top';
        },

        getBackgroundSize(value) {
            if (this.icon != 'solvency.png') {
                return 'contain';
            }

            var delta = value - (this.kpi.benchmark / 100);

            if (value == 0 && this.kpi.benchmark == 0) {
                return '25%';
            } else if (delta >= 1) {
                return '90%';
            } else if (delta > 0) {
                return '75%';
            } else if (delta == 0) {
                return '50%';
            } else if (delta < 0) {
                return '25%';
            }
        },

        getScaleImage(value, benchmark) {
            benchmark = Math.round(benchmark / 10) / 10;
            var color = 'black';
            var balance = 'equal';

            if (benchmark < value) {
                balance = 'left';
            } else if (benchmark > value) {
                balance = 'right';
            }

            if (benchmark == this.kpi.rawPrevious && benchmark != this.kpi.rawAverage) {
                color = 'blue';
            }

            return AssetModel('/assets/img/easyview/scale_' + balance + '_' + color + '.svg').path;
        },

        getImage(color, value) {
            if (!this.icon) {
                this.icon = 'profit.png';
            }

            var image = this.icon.replace('.png', '_' + color);
            image = image.replace('profit', 'pig');
            image = image.replace('solvency', 'factory');
            image = image.replace('activity', 'gear');

            var type = 'zero';

            if (this.percent) {
                if (value > 91) {
                    type = 'high';
                } else if (value > 51) {
                    type = 'mid';
                } else if (value > 11) {
                    type = 'low';
                } else if (value > -5) {
                    type = 'zero';
                } else if (value < -5) {
                    type = 'negative';
                }
            } else {
                var delta = value - (this.kpi.benchmark / 100);

                if (value == 0 && this.kpi.benchmark == 0) {
                    type = 'zero';
                } else if (delta >= 1) {
                    type = 'high';
                } else if (delta > 0) {
                    type = 'mid';
                } else if (delta == 0) {
                    type = 'low';
                } else if (delta < 0) {
                    type = 'negative';
                }
            }

            return AssetModel('/assets/img/easyview/' + image + '_' + type + '.svg').path;
        }
    }

    export default {
        name: 'easy-view',
        data,
        methods,
        props : ['icon', 'kpi', 'percent']
    }
</script>
