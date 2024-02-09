define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'services/Track'
], function (Vue, modal, DictionaryModel, Track) {
    const template = `
        <modal
            :title="'Tillykke med din dokumentation!'"
            :close="close"
        >
            <template v-slot:content>
                <p>Kender du andre, som kunne havde glæde af samme rapport? Send et tip!</p>
                <p class="flex-row flex-space-between">
                    <input
                        class="flex-1 email-input"
                        type="text"
                        placeholder="indtast e-mailadresse"
                        v-model="emailsList"
                    />
                    <a
                        class="button accent"
                        @click="trackMailToLinkClick"
                        rel="noopener noreferrer"
                        target="_blank"
                        :href="mailToLink"
                    >
                        Send
                    </a>
                </p>
                <div class="flex-row flex-justify-center">
                    Eller
                </div>
                <div class="flex-row flex-justify-center">
                    <button
                        class="button accent margin-auto"
                        @click="copyLinkToClipboard"
                    >
                        Kopier link
                    </button>
                </div>
                <p
                    class="linkCopiedToClipboardFeedback"
                    :class="{visible: wasLinkJustCopiedToClipboard}"
                >
                    Linket blev kopieret til udklipsholderen
                </p>
            </template>
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            emailsList: '',
            wasLinkJustCopiedToClipboard: false
        };
    };

    const methods = {
        trackMailToLinkClick() {
            Track.ga.sendEvent('COVID Report mail invitation', 'initiate')
            return true
        },
        copyLinkToClipboard() {
            // Create a <textarea> element
            const el = document.createElement('textarea')
            // Set its value to the string that you want copied
            el.value = 'https://app.crediwire.com/l/covid-rapporter'
            // Make it readonly to be tamper-proof
            el.setAttribute('readonly', '')
            // Move outside the screen to make it invisible
            el.style.position = 'absolute'
            el.style.left = '-9999px'
            // Append the <textarea> element to the HTML document
            document.body.appendChild(el)
            const selected = (
                // Check if there is any content selected previously
                (document.getSelection().rangeCount > 0)
                    // Store selection if found
                    ? document.getSelection().getRangeAt(0)
                    // Mark as false to know no selection existed before
                    : false
            )
            // Select the <textarea> content
            el.select()
            // Copy - only works as a result of a user action (e.g. click events)
            document.execCommand('copy')
            // Remove the <textarea> element
            document.body.removeChild(el)
            // If a selection existed before copying
            if (selected) {
                // Unselect everything on the HTML document
                document.getSelection().removeAllRanges()
                // Restore the original selection
                document.getSelection().addRange(selected)
            }

            this.wasLinkJustCopiedToClipboard = true
            setTimeout(() => {
                this.wasLinkJustCopiedToClipboard = false
            }, 500)
            Track.ga.sendEvent('COVID Report link invitation', 'initiate')
        },
        close() {
            this.$emit('close');
        }
    };

    const computed = {
        trimmedEmails() {
            return (
                this.emailsList.split(',')
                    .map(chunk => chunk.split(';'))
                    .reduce((arraySoFar, newElement) => arraySoFar.concat(newElement))
                    .map(address => address.trim())
            )
        },
        mailToLink() {
            const emailAddresses = this.trimmedEmails
            const subjectLine = 'Gratis%20hj%C3%A6lp%20fra%20CrediWire%20-%20COVID-19%20hj%C3%A6lpepakker'
            const body = "Hej%0D%0A%0D%0AJeg%20tror%2C%20at%20du%20kan%20spare%20tid%20og%20f%C3%A5%20hurtigere%20adgang%20til%20likviditet%20ved%20at%20hente%20en%20af%20f%C3%B8lgende%20rapporter%20fra%20CrediWire.%20Det%20er%20gratis!%0D%0A%0D%0ASe%20din%20berettigelse%20og%20f%C3%A5%20dokumentation%20til%20f%C3%B8lgende%20st%C3%B8ttepakker%3A%0D%0A%0D%0AKompensation%20for%20faste%20omkostninger%0D%0AKompensation%20for%20selvst%C3%A6ndige%20og%20freelancere%0D%0AL%C3%A5negarantier%0D%0A%0D%0ADet%20er%20helt%20gratis%3A%20https%3A%2F%2Fapp.crediwire.com%2Fj%2Fcovid-rapporter%0D%0A%0D%0ATre%20konkrete%20fordele%3A%0D%0A1.%20Du%20f%C3%A5r%20hurtigt%20svar%20p%C3%A5%20din%20kompensations-%20eller%20l%C3%A5neberettigelse%0D%0A2.%20Du%20f%C3%A5r%20en%20rapport%2C%20som%20du%20kan%20bruge%20med%20din%20revisor%20og%20din%20bank%0D%0A3.%20Spar%20v%C3%A6rdifuld%20tid%20og%20f%C3%A5%20hurtigere%20adgang%20til%20likviditet%0D%0A%0D%0AFungerer%20med%20alle%20banker%20og%20f%C3%B8lgende%20%C3%B8konomisystemer%3A%0D%0Ae-conomic%2C%20Dinero%2C%20Billy%2C%20Microsoft%20Business%20Solutions%2C%20Inventio's%20C5%20og%20NAV%20l%C3%B8sninger%2C%20Exact%2C%20Reviso%2C%20EG%20One%2C%20Sena%2C%20%C3%9890%20og%20Sage%20One%0D%0A%0D%0AMed%20venlig%20hilsen"
            return `mailto:${emailAddresses}?subject=${subjectLine}&body=${body}`
        }
    };

    return Vue.extend({
        name: 'invite-friends',
        template,
        data,
        methods,
        computed,
        props: [],
        components: {
            modal
        }
    });
});
