<template>
    <div class="timeout-popup popup scrollable" style="width: 600px;">
        <h2>{{dictionary.general.willBeLoggedOut}}</h2>
    <div class="time">{{formattedTimeString}}</div>
</div>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import sessionConstants from 'constants/session'

    const data = () => ({
        dictionary: DictionaryModel.getHash()
    });

    const methods = {
      restartTimeout() {
          this.$store.dispatch('startKeepAliveTimeout');
      }
    };

    const computed = {
        keepAliveCountdownTimeout() {
            return this.$store.getters.keepAliveCountdown;
        },
        formattedTimeString() {
            const seconds = new Date(this.keepAliveCountdownTimeout).getSeconds();
            return `${60 - seconds} seconds`;
        }
    };

    const watch = {
        keepAliveCountdownTimeout(timeoutCountdown) {
            const { KEEP_ALIVE_MAX_TIME, KEEP_ALIVE_SHOW_COUNTDOWN_TIME } = sessionConstants;

            if (timeoutCountdown >= KEEP_ALIVE_MAX_TIME){
                this.$router.push('/logout');
            }

            if (timeoutCountdown >= KEEP_ALIVE_SHOW_COUNTDOWN_TIME) {
                this.$emit('showPopup');
            } else {
                this.$emit('hidePopup');
            }
        }
    };

    export default {
        name: 'session-timeout',
        props: {},
        methods,
        data,
        computed,
        watch,
        created() {
            document.body.addEventListener('mousemove', this.restartTimeout);
            document.body.addEventListener('scroll', this.restartTimeout);
            document.body.addEventListener('keydown', this.restartTimeout);
            document.body.addEventListener('click', this.restartTimeout);
            document.body.addEventListener('touchstart', this.restartTimeout);
        }
    }

</script>
