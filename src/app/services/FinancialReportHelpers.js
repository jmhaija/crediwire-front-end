define([],
    function() {

        const getChildren = (parentCategory, categories) => {
            const groupCriteria = parentCategory.level === 0 ? 'group' : 'subGroup';

            return  categories.filter(category => category[groupCriteria] === parentCategory[groupCriteria] && category.level === parentCategory.level + 1 && !category.sum)
        };

        const  getChildrenDataArraySum = (children) => {
            const dataArraySum = [];

            children.forEach((child) => {
                child.dataArray.forEach((dataArrayItem, idx) => {
                    if (!dataArraySum[idx]) {
                        dataArraySum[idx] = Object.assign({}, dataArrayItem, {values: [...dataArrayItem.values.map(dataArrayItemVal => Object.assign({}, dataArrayItemVal))]});
                    } else {
                        dataArrayItem.values.forEach((dataArrayItemValue, i) => {
                            dataArraySum[idx].values[i].value = dataArraySum[idx].values[i].value + dataArrayItemValue.value;
                        });
                    }
                });
            });

            return dataArraySum;
        };

        const getChildrenAggDataSum = (children) => {
            let aggDataSum = {
                values: []
            };

            children.forEach((child, idx) => {
                if (idx === 0) {
                    aggDataSum = Object.assign({}, child.aggData, {values: [...child.aggData.values.map(dataArrayItemVal => Object.assign({}, dataArrayItemVal))]});
                } else {
                    child.aggData.values.forEach((dataArrayItem, i) => {
                        aggDataSum.values[i].value = aggDataSum.values[i].value + dataArrayItem.value;
                    });
                }
            });

            return aggDataSum;
        };

    return {
        hasChild(category, index, categories) {
            if (category.level === 0) {
                return categories[index + 1].group === category.group && !categories[index + 1].sum && !categories[index + 1].divider;
            } else {
                return categories[index + 1] && categories[index + 1].subGroup === category.subGroup && categories[index + 1].group === category.group && (categories[index + 1].level === category.level + 1) && !categories[index + 1].sum && !categories[index + 1].divider
            }
        },

        findLastPositionIndex(groupVal, categories, groupingCriteria) {
            let lastGroupValue = groupVal;
            let found = false;

            for (let i = 0; i <= categories.length; i++) {
                const category = categories[i];

                if (category[groupingCriteria] === groupVal) {
                    found = true;
                }

                if (found) {
                    if (lastGroupValue !== category[groupingCriteria] || category.sum) {
                        return i;
                    } else {
                        lastGroupValue = category[groupingCriteria];
                    }}
            }
        },

        calculateUnspecifiedData (categories, parentCategory) {

            const childrenArray = getChildren(parentCategory, categories);
            const childrenDataArraySum = getChildrenDataArraySum(childrenArray);
            const childrenAggDataSum = getChildrenAggDataSum(childrenArray);

            const result = [];
            const aggDataResult = Object.assign({}, parentCategory.aggData, {values: [...parentCategory.aggData.values.map(dataArrayItemVal => Object.assign({}, dataArrayItemVal))]});

            parentCategory.dataArray.forEach(dataArrayItem => {
                result.push(Object.assign({}, dataArrayItem, {values: [...dataArrayItem.values.map(dataArrayItemVal => Object.assign({}, dataArrayItemVal))]}));
            });

            parentCategory.dataArray.forEach((parentDataArrayItem, idx) => {
                parentDataArrayItem.values.forEach((parentDataArrayItemValue, i) => {
                    result[idx].values[i].value = result[idx].values[i].value - childrenDataArraySum[idx].values[i].value;
                });
            });

            childrenAggDataSum.values.forEach((aggDataValue, idx) => {
                aggDataResult.values[idx].value = aggDataResult.values[idx].value - aggDataValue.value;
            });

            return {
                result,
                aggDataResult
            };
        }
    };
});
