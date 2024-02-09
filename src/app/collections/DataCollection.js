define([

    'q',
    'moment',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DictionaryModel',
    'models/DateRangeModel',
    'models/BudgetFileModel',
    'models/EntryDepartmentModel'

], function(q, moment, API, CompanyModel, ContextModel, DictionaryModel, DateRangeModel, BudgetFileModel, EntryDepartmentModel) {
    return function(interval, kpiCategories) {

        var dictionary = DictionaryModel.getHash();
        var rawData = {};
        var types = ['current-self', 'current-benchmark', 'previous-self', 'currentCashBook-self', 'previousCashBook-self', 'budget-self'];


        var fetchData = function(dashboardID, includeAggregations, previousType, includeBudget, page, budgetType, fromPreset, toPreset, reclassified) {
            var fromDate = fromPreset ? fromPreset : DateRangeModel.getFromString();
            var toDate = toPreset ? toPreset : DateRangeModel.getToString();
            var dataSize = 100;

            //Build URL
            var url = '/company/' + CompanyModel.getCompany().id + '/dashboard/' + dashboardID;

            if (ContextModel.getContext()) {
                url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/dashboard/' + dashboardID;
            }

            url = url + '/data?startDate=' + fromDate + '&endDate=' + toDate + '&page=' + page + '&size=' + dataSize + '&intervals=' + interval + '&aggregations=' + includeAggregations + '&budget=' + includeBudget + '&previous=' + previousType;

            if (BudgetFileModel.getBudgetFile() && budgetType && budgetType == 'file') {
                url = url + '&budgetLoadedFile=true';
            }


            if (reclassified) {
                url = url + '&reclassified=true';
            } else {
                url = url + '&reclassified=false';
            }

            if (EntryDepartmentModel.getEntryDepartment()) {
                url = url + '&departmentId=' + EntryDepartmentModel.getEntryDepartment().id
            }

            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        };

        var checkData = function(data) {
            var difference;

            for (var interval in data) {
                difference = false;

                for (var type in data[interval]) {
                    data[interval][type].current.series.forEach(function(series, i) {
                        data[interval][type].current.series[i].data.forEach(function(dataPoint, j) {
                            if (data[interval][type].current.series[i].data[j] !== data[interval][type].cbCurrent.series[i].data[j]) {
                                difference = true;
                            }
                        });
                    });
                }

                data[interval].hasCB = difference;
            }

            return data;
        };

        var padData = function(points, interval, kpis, predefinedFrom, predefinedTo) {
            //Format map for moment.js: http://momentjs.com/docs/#/parsing/string-format/
            var intsFormatMap = {
                'day': 'YYYY-MM-DD',
                'week': 'YYYY [w]W',
                'month': 'YYYY-MM',
                'quarter': 'YYYY [q]Q',
                'half-year': 'YYYY [h]Q', //This will have to be primitively manipulated since there is no "half year" token
                'year': 'YYYY'
            };

            //Get the intervals and format based on the intervals
            var format = intsFormatMap[interval];

            //Define breakpoints, counters and flags
            var firstDate = predefinedFrom ? moment(moment(predefinedFrom).toDate()) : moment(DateRangeModel.getFromDate());
            var lastDate = predefinedTo ? moment(moment(predefinedTo).toDate()).format(format) : moment(DateRangeModel.getToDate()).format(format);

            //var firstDate = moment(DateRangeModel.getFromDate());
            //var lastDate = moment(DateRangeModel.getToDate()).format(format);

            //Adjust label to support half-years
            if (interval == 'half-year') {
                lastDate = lastDate.replace('h1', '1st');
                lastDate = lastDate.replace('h2', '1st');
                lastDate = lastDate.replace('h3', '2nd');
                lastDate = lastDate.replace('h4', '2nd');
            }

            //Create kpis placeholder object
            //Used when points are undefined
            var kpiValues = {};

            //Create padded points and dates arrays
            //These will hold the final results of the padding
            var prePaddedPoints = {};
            var postPaddedPoints = {};
            var prePaddedDates = [];
            var postPaddedDates = [];
            var actualDates = [];
            var actualPoints = {};
            var sample = {};
            var prePaddedSample = {};
            var postPaddedSample = {};

            kpis.forEach(function(val, key) {
                //Add values to kpi placeholder object
                kpiValues[val] = 0;

                //Create an array for padded points kpi
                prePaddedPoints[val] = [];
                postPaddedPoints[val] = [];
                actualPoints[val] = [];
                sample[val] = [];
                prePaddedSample[val] = [];
                postPaddedSample[val] = [];
            });


            //Points doesn't exist yet
            if (points === undefined) {
                points = [];
            }

            //There is nothing to pad
            if (points.length === 0) {
                points[0] = {
                    key: lastDate,
                    kpi: kpiValues
                };
            }

            //Use matchKey if it exists
            points.forEach(function(point, index) {
                if (point.matchKey) {
                    points[index].key = point.matchKey;
                }

                //Put all data in a child kpi key
                if (!point.kpi) {
                    points[index].kpi = {};

                    //Make sure it's not recursive
                    for (var attrName in point) {
                        var attr = point[attrName];

                        if (attrName != 'key' && attrName != 'kpi') {
                            points[index].kpi[attrName] = attr;
                        }
                    }
                }
            });


            var dataStartsOn = points[0].key;
            var dataEndsOn = points[points.length - 1].key;
            var prePadded = false;
            //var postPadded = false;
            var startPost = false;
            var dateIndex = firstDate;
            var count = 0;
            var limit = 10000; //Last resort, do not loop past this number of points


            //If the first data point happens to be before the set start date, skip pre-padding
            //This is an issue for the week, quarter and half-year intervals.
            if (interval == 'week' && moment(points[0].key, 'YYYY [w]W').unix() < firstDate.unix() ||
                interval == 'quarter' && moment(points[0].key, 'YYYY [q]Q').unix() < firstDate.unix() ||
                interval == 'half-year' && moment(points[0].key, 'YYYY [h]Q').unix() < firstDate.unix()) {

                prePadded = true;

                if (interval == 'quarter' || interval == 'half-year') {
                    points.shift();
                }
            }


            if (interval == 'week' && (moment(points[0].key, 'YYYY [w]W').unix() - firstDate.unix()) < (60 * 60 * 24 * 6)) {
                prePadded = true;
            }


            //Reformat actual data
            points.forEach(function(point) {
                actualDates.push(point.key);

                for (var kpiName in point.kpi) {
                    var value = point.kpi[kpiName];

                    if (actualPoints[kpiName]) {
                        actualPoints[kpiName].push(value);

                        if (point.kpi.benchmarkCount && point.kpi.benchmarkCount[kpiName]) {
                            sample[kpiName].push(point.kpi.benchmarkCount[kpiName]);
                        } else {
                            sample[kpiName].push(null);
                        }
                    }
                }
            });


            //Iterate through dates and pad
            while (count <= limit) {
                var dateLabel = moment(dateIndex).format(format);

                //Adjust label to support half-years
                if (interval == 'half-year') {
                    dateLabel = dateLabel.replace('h1', '1st');
                    dateLabel = dateLabel.replace('h2', '1st');
                    dateLabel = dateLabel.replace('h3', '2nd');
                    dateLabel = dateLabel.replace('h4', '2nd');
                }

                //Do not go past the last date
                if (dateLabel == lastDate) {
                    count = limit;
                }


                //Detected that actual data has begun on this date
                if (dateLabel == dataStartsOn) {
                    prePadded = true;
                //Pre padding has not been completed, keep adding padObject
                } else if (!prePadded) {

                    prePaddedDates.push(dateLabel);
                    for (var key in prePaddedPoints) {
                        prePaddedPoints[key].push(0);
                        prePaddedSample[key].push(null);
                    }

                }

                //Detected that actual data ends on this date
                if (dateLabel == dataEndsOn) {
                    startPost = true;
                } else if (startPost) {

                    postPaddedDates.push(dateLabel);
                    for (var key in postPaddedPoints) {
                        postPaddedPoints[key].push(0);
                        postPaddedSample[key].push(null);
                    }
                }

                //Increment counters/indecies
                var addAmount = 1;
                var addInts = interval + 's'; //Moment accepts pluralized version of string

                //Adjust to half-years
                if (interval == 'half-year') {
                    addAmount = 2;
                    addInts = 'quarters';
                }

                dateIndex = moment(dateIndex).add(addAmount, addInts);
                count++;
            }


            //Return object
            var returnObj = {
                categories : prePaddedDates.concat(actualDates).concat(postPaddedDates),
                series : []
            };


            for (var name in actualPoints) {
                var data = actualPoints[name];
                var sampleData = sample[name];

                //Use locale name if it exists for KPI
                var seriesName = name;
                if (dictionary.kpis[name]) {
                    seriesName = dictionary.kpis[name];
                }

                if (name !== undefined && name != 'undefined') {
                    //Add a series
                    returnObj.series.push({
                        name : translateSeriesName(seriesName),
                        data : prePaddedPoints[name].concat(data).concat(postPaddedPoints[name]),
                        samples : prePaddedSample[name].concat(sampleData).concat(postPaddedSample[name])
                    });
                }
            }

            return returnObj;
        };


        var translateSeriesName = function(key) {
            return key;
        };


        var sortData = function(data) {
            if (!data || data.length == 0) {
                return data;
            }

            return data.sort(function(a, b) {
                return a.key.toLocaleLowerCase()>b.key.toLocaleLowerCase()? 1 : (a.key.toLocaleLowerCase()<b.key.toLocaleLowerCase() ? -1 : 0);
            });
        };


        var formatData = function(data, fromDate, toDate) {
            var formattedData = {};

            formattedData[interval] = {};

            for (var category in kpiCategories) {
                var kpis = kpiCategories[category];

                formattedData[interval][category] = {};

                formattedData[interval][category].current = data && data.current && data.current.self ? padData(sortData(data.current.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
                formattedData[interval][category].previous = data && data.previous && data.previous.self ? padData(sortData(data.previous.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
                formattedData[interval][category].average = data && data.current && data.current.benchmark ? padData(sortData(data.current.benchmark[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
                formattedData[interval][category].budget = data && data.budget && data.budget.self ? padData(sortData(data.budget.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
                formattedData[interval][category].cbCurrent = data && data.currentCashBook && data.currentCashBook.self ? padData(sortData(data.currentCashBook.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
                formattedData[interval][category].cbPrevious = data && data.previousCashBook && data.previousCashBook.self ? padData(sortData(data.previousCashBook.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);

            }

            return checkData(formattedData);
        };



        var combinePromises = function(promises, fromDate, toDate) {
            var response = promises.shift();

            return q.allSettled(promises)
                .then(function(responses) {

                    responses.forEach(function(additionalResp, responseKey) {
                        types.forEach(function(type, typeKey) {
                            var typeSplit = type.split('-');
                            var type1 = typeSplit[0];
                            var type2 = typeSplit[1];

                            if (response.contents[type1] === undefined) {
                                response.contents[type1] = {};
                            }

                            if (response.contents[type1][type2] === undefined) {
                                response.contents[type1][type2] = {};
                            }

                            if (additionalResp.value !== undefined && additionalResp.value.contents !== undefined && additionalResp.value.contents[type1] !== undefined && additionalResp.value.contents[type1][type2] !== undefined) {
                                if (additionalResp.value.contents[type1][type2][interval] !== undefined) {
                                    if (response.contents[type1][type2][interval] === undefined) {
                                        response.contents[type1][type2][interval] = [];
                                    }
                                    response.contents[type1][type2][interval] =
                                        response.contents[type1][type2][interval].concat(
                                            additionalResp.value.contents[type1][type2][interval]
                                        );
                                }
                            }
                        });
                    });

                    rawData = response.contents;
                    return formatData(response.contents, fromDate, toDate);
                });
        };



        return {
            getData : function(dashboardID, includeAggregations, previousType, budgetType, fromDate, toDate, reclassified) {
                var promises = [];

                return fetchData(dashboardID, includeAggregations, previousType, true, 1, budgetType, fromDate, toDate, reclassified)
                    .then(function(data) {
                        if (data.errors) {
                            return false;
                        }

                        promises.push(data);

                        if (data.contents && data.contents.page > 1) {

                            for (var p = 2; p <= data.contents.page; p++) {
                                var nextPromise = fetchData(dashboardID, false, previousType, true, p, budgetType, fromDate, toDate, reclassified);
                                promises.push(nextPromise);
                            }

                        }


                        return combinePromises(promises, fromDate, toDate);
                    });

            },

            formatExistingData : function (data, fromDate, toDate) {
                return formatData(data, fromDate, toDate);
            },

            getRawData : function() {
                return rawData;
            }
        };
    };
});
