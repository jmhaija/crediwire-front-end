define([

    'q',
    'moment',
    'services/API',
    'models/DictionaryModel',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel',
    'models/EntryDepartmentModel'

], function(q, moment, API, DictionaryModel, CompanyModel, ContextModel, DateRangeModel, EntryDepartmentModel) {
    return function(kpiID, interval, category) {
        var dictionary = DictionaryModel.getHash();
        var types = ['current-self', 'current-benchmark', 'previous-self', 'currentCashBook-self', 'previousCashBook-self'];
        var kpis = [];


        var fetchData = function(previousType, page, reclassified) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/company/'+companyID+'/kpi/' + kpiID + '/data';

            var fromDate = DateRangeModel.getFromString();
            var toDate = DateRangeModel.getToString();
            var dataSize = 100;

            if (ContextModel.getContext()) {
                url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi/' + kpiID + '/data';
            }

            url = url + '?startDate=' + fromDate + '&endDate=' + toDate + '&page=' + page + '&size=' + dataSize + '&intervals=' + interval + '&aggregations=false' + '&previous=' + previousType;


            if (reclassified) {
                url = url + '&reclassified=true';
            } else {
                url = url + '&reclassified=false';
            }

            if (EntryDepartmentModel.getEntryDepartment()) {
                url = url + '&departmentId=' + EntryDepartmentModel.getEntryDepartment().id
            }

            return API.retrieve(url)
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
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

            kpis.forEach(function(val, key) {
                //Add values to kpi placeholder object
                kpiValues[val] = 0;

                //Create an array for padded points kpi
                prePaddedPoints[val] = [];
                postPaddedPoints[val] = [];
                actualPoints[val] = [];
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

            //Reformat actual data
            points.forEach(function(point) {
                actualDates.push(point.key);

                if (point.kpi.mappings) {
                    point.kpi.mappings.forEach(function (point) {
                        var value = point.value;
                        var kpiName = point.name;

                        if (actualPoints[kpiName]) {
                            actualPoints[kpiName].push(value);
                        }
                    }.bind(this));
                } else {
                    for (var kpiName in point.kpi) {
                        var value = point.kpi[kpiName];

                        if (actualPoints[kpiName]) {
                            actualPoints[kpiName].push(value);
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
                    }

                }

                //Detected that actual data ends on this date
                if (dateLabel == dataEndsOn) {
                    startPost = true;
                } else if (startPost) {

                    postPaddedDates.push(dateLabel);
                    for (var key in postPaddedPoints) {
                        postPaddedPoints[key].push(0);
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

                //Use locale name if it exists for KPI
                var seriesName = name;
                if (dictionary.kpis[name]) {
                    seriesName = dictionary.kpis[name];
                }


                if (name !== undefined && name != 'undefined') {
                    //Add a series
                    returnObj.series.push({
                        name : translateSeriesName(seriesName),
                        internalName : seriesName,
                        data : prePaddedPoints[name].concat(data).concat(postPaddedPoints[name])
                    });
                }
            }

            return returnObj;
        };


        var translateSeriesName = function(key) {
            return dictionary.systemKpis[key] || key;
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
            formattedData[interval][category] = {};

            formattedData[interval][category].current = data && data.current && data.current.self ? padData(sortData(data.current.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
            formattedData[interval][category].previous = data && data.previous && data.previous.self ? padData(sortData(data.previous.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
            formattedData[interval][category].average = data && data.current && data.current.benchmark ? padData(sortData(data.current.benchmark[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
            formattedData[interval][category].budget = data && data.budget && data.budget.self ? padData(sortData(data.budget.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
            formattedData[interval][category].cbCurrent = data && data.currentCashBook && data.currentCashBook.self ? padData(sortData(data.currentCashBook.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);
            formattedData[interval][category].cbPrevious = data && data.previousCashBook && data.previousCashBook.self ? padData(sortData(data.previousCashBook.self[interval]), interval, kpis, fromDate, toDate) : padData([], interval, kpis, fromDate, toDate);

            return formattedData;
        };



        var reformatToStandard = function(data) {
            types.forEach(function(type, typeKey) {
                var typeSplit = type.split('-');
                var type1 = typeSplit[0];
                var type2 = typeSplit[1];

                if (data[type1] && data[type1][type2] && data[type1][type2][interval]) {
                    data[type1][type2][interval].forEach(function(dataPoint, dataIndex) {
                        if (dataPoint.kpi && dataPoint.kpi.mappings) {
                            dataPoint.kpi.mappings.forEach(function(mapping) {
                                var key = mapping.name;
                                data[type1][type2][interval][dataIndex].kpi[key] = mapping.value;

                                if (!kpis[key]) {
                                    kpis.push(key);
                                }
                            });

                            delete data[type1][type2][interval][dataIndex].kpi.mappings;
                        }
                    });
                }
            });

            return data;
        };


        var combinePromises = function(promises) {
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

                    return formatData(reformatToStandard(response.contents));
                });
        };



        return {
            getData : function(previousType, reclassified) {
                var promises = [];

                return fetchData(previousType, 1, reclassified)
                    .then(function(data) {
                        if (data.errors) {
                            return false;
                        }

                        promises.push(data);

                        if (data.contents && data.contents.page > 1) {

                            for (var p = 2; p <= data.contents.page; p++) {
                                var nextPromise = fetchData(previousType, p, reclassified);
                                promises.push(nextPromise);
                            }

                        }


                        return combinePromises(promises);
                    });

            },

            formatExistingData : function (data, fromDate, toDate) {
                return formatData(reformatToStandard(data), fromDate, toDate);
            }
        };
    };
});
