define([
  'Vue'
], function (Vue) {
  const template = `
    <div class="start-new-budget-wrapper flex-column">
         <div class="start-new-budget-block flex-row">
            <div class="flex-column">
                <div class="round-button"></div>
                <div class="start-budget-stage">Download the budget template</div>
            </div>
            
            <div class="flex-column">
                <div class="round-button"></div>
                <div class="start-budget-stage">Review and edit your budget</div>
            </div>
            
            <div class="flex-column">
                <div class="round-button"></div>
                <div class="start-budget-stage">Upload the revised budget to see it displayed in</div>
            </div>
         </div>
         <div class="start-new-budget-button">Start now</div>
    </div>
`;

  const data = function () {
    return {

    };
  };

  const methods = {
    init() {}
  };

  return Vue.extend({
    name: 'start-new-budget',
    props: {
      startNewBudget: {
        type: Function,
        required: true,
      }
    },
    template,
    methods,
    data
  });
});
