  import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
  import getLinkModal from 'elements/modals/get-link'

  let reportGeneratingInterval = null;

  export default {
    methods: {
      showLinkModal(report) {
        this.$modal.show(getLinkModal, {
            selectedReport: report,
            reportIsFinalized: report.finalized,
            finalizeReport: (onReportFinalized) => this.setReportFinalization(report, true, onReportFinalized),
            onLinkSent: () => {this.exitReportsEdit ? this.exitReportsEdit() : null}
            },
          {height: 'auto'});
        this.selectedReport = report;
      },

      setReportFinalization(report, finalizing = true, onReportGenerated) {
        if (finalizing) {
          //This i do in order to show the spinner generating spinner immediately
          report.finalized = false;
          report.generating = true;
        }

        PresentationTemplateCollection.finalizeReport(report.id, finalizing)
          .then((updatedReport) => {
            if (finalizing) {
              this.checkIfReportIsGenerating(report, onReportGenerated);
            } else {
              report.generating = updatedReport.generating;
              report.finalized = updatedReport.finalized;
            }
          });
      },

      checkIfReportIsGenerating(report, onReportGenerated = () => {}) {
        const { id } = report;

        const CHECK_INTERVAL = 5000;

        clearInterval(reportGeneratingInterval);
        reportGeneratingInterval =  setInterval(() => {
          PresentationTemplateCollection.checkReportIsGenerating(id)
            .then(checkedReport => {

              report.finalized = checkedReport.finalized;
              report.generating = checkedReport.generating;

              if (checkedReport.finalized && !checkedReport.generating) {
                clearInterval(reportGeneratingInterval);
                onReportGenerated();
              }
            });
        }, CHECK_INTERVAL);
      },
    }
  }
