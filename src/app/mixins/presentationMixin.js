    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import Toast from 'services/Toast'
    import Validator from 'services/Validator'

    export default {
        methods: {
            getShareableLink : function (report, copyOnly) {
                if (!copyOnly && (!this.validateLinkName(true) || !this.validateLinkEmail(true)) ) {
                    return false;
                }

                this.ui.showLink = false;

                PresentationTemplateCollection.getLink(this.presentation.id, this.shareLink.name.value, this.shareLink.email.value, this.shareLink.comment.value, this.ui.dictionary.meta.code, !copyOnly)
                    .then(function (res) {
                        if (copyOnly) {
                            this.shareLinkInfo = res;
                            this.ui.showLinkCopyField = true;
                        } else {
                            Toast.show(this.ui.dictionary.presentations.linkSent);
                        }
                    }.bind(this));
            },

            validateLinkName : function(force) {
                if (force || !this.shareLink.name.valid) {
                    this.shareLink.name.valid = Validator.minLength(this.shareLink.name.value, 2);
                }
                return this.shareLink.name.valid;
            },

            validateLinkEmail : function(force) {
                if (force || !this.shareLink.email.valid) {
                    this.shareLink.email.valid = Validator.email(this.shareLink.email.value);
                }
                return this.shareLink.email.valid;
            },

            sortPages : function (pages) {
                let list = pages.slice();
                let sortedList = list.sort(function (a, b) {
                    return b.number - a.number;
                });

                return sortedList.reverse();
            },

            copyLink : function() {
                var query = '#reportLink';
                let i;
                this.$refs.reporteditor ? i = this.$refs.reporteditor.querySelector(query) : i = this.$refs.reportedPreview.querySelector(query);

                i.select();

                try {
                    document.execCommand('copy');
                    i.blur();
                    this.ui.showCopied = true;

                    setTimeout(function() {
                        this.ui.showCopied = false;
                    }.bind(this), 4000);
                }
                catch (err) {
                    alert(this.ui.dictionary.invitations.copyFail);
                }
            },
        }
    };
