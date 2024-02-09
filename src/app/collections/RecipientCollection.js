define([
    
    'q',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(q, API, CompanyModel, ContextModel) {
    var mockData = function() {
        var d = q.defer();
        
        var data = JSON.parse('{"total_items":11,"page_count":100,"page":1,"last_page":1,"items":[{"id":"c42dfe47-2968-437b-9b01-dbebe4eb0e11","name":"Andersens Eftf. A/S","country":null,"city":"København K","ean":null,"vat_number":null,"display_name":"Andersens Eftf. A/S","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":379375},{"id":"14daeb9a-7b68-4af8-a39a-fc0e7e7fec7e","name":"Diverse","country":null,"city":null,"ean":null,"vat_number":null,"display_name":"Diverse","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":0},{"id":"80d27362-d85c-4bf9-a8e7-b23fbbe6e1e3","name":"E-CONOMIC DANMARK A/S","country":"Danmark","city":"København K","ean":null,"vat_number":"29403473","display_name":"E-CONOMIC DANMARK A/S","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":0},{"id":"89f0e975-3478-4e7a-a4ba-4c04e69a6286","name":"Ejendomsmæglerne BoBedre","country":null,"city":"Frederikssund","ean":null,"vat_number":"00004582","display_name":"Ejendomsmæglerne BoBedre","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":853250},{"id":"7cc62d8c-bd40-4262-a8d1-4126126ca134","name":"Fru Møller","country":null,"city":"Odense V","ean":null,"vat_number":null,"display_name":"Fru Møller","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":70443.75},{"id":"78556283-2268-421f-afc6-52ced7b3005d","name":"IT Specialisterne ApS","country":null,"city":"Bjerringbro","ean":null,"vat_number":null,"display_name":"IT Specialisterne ApS","unpaid":47063.13,"overdue":47063.13,"overdue_15_days":47063.13,"total_invoiced":1527508.13},{"id":"602399be-5010-4c75-b3bb-40eb7f24aafd","name":"Lilleskolen","country":null,"city":"Nærum","ean":null,"vat_number":"00006920","display_name":"Lilleskolen","unpaid":0,"overdue":0,"overdue_15_days":0,"total_invoiced":500750},{"id":"ff4d66b2-06aa-4547-afbd-319e4140325a","name":"Møbelfabrikken A/S","country":null,"city":"Ballerup","ean":null,"vat_number":null,"display_name":"Møbelfabrikken A/S","unpaid":32237.33,"overdue":32237.33,"overdue_15_days":32237.33,"total_invoiced":1373174.83},{"id":"d2187c45-4d5d-4f6d-a8f4-60b0f0677ec3","name":"Namesco Ltd.","country":"England","city":"Worcester","ean":null,"vat_number":null,"display_name":"Namesco Ltd.","unpaid":64145.02,"overdue":64145.02,"overdue_15_days":64145.02,"total_invoiced":153799.21},{"id":"9792aff9-24a8-4950-84de-c734ea1ac800","name":"Storeskolen","country":null,"city":"Allerød","ean":null,"vat_number":null,"display_name":"Storeskolen","unpaid":107375,"overdue":107375,"overdue_15_days":107375,"total_invoiced":667768.75},{"id":"6076c824-de47-4262-9350-96e6487b16ec","name":"TopTeam","country":null,"city":"København K","ean":null,"vat_number":null,"display_name":"TopTeam","unpaid":101500,"overdue":101500,"overdue_15_days":101500,"total_invoiced":1674625}],"total_invoiced":7200694.67,"total_revenue":5790635.74}');
        
        d.resolve(data);
        
        return d.promise;
    };
    
    var fetchData = function(url, p) {
        url = url + '&page=' + p;
        
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
    
    var combinePromises = function(promises) {
        var response = promises.shift();
        
        return q.allSettled(promises)
            .then(function(responses) {
                responses.forEach(function(additionalResp, responseKey) {
                    response.items = response.items.concat(additionalResp.value.items);
                });
                
                return response;
            });
    };
    
    return function() {
        return {
            getSummary : function(from, to, p, sort, mock) {
                if (mock) {
                    return mockData();    
                }
                
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invoice/contact/summary';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invoice/contact/summary';
                }
                
                url = url + '?page_size=100';
                
                if (from && to) {
                    url = url + '&from=' + from + '&to=' + to;
                } else if (from) {
                    url = url + '&from=' + from;
                } else if (to) {
                    url = url + '&to=' + to;
                }
                
                
                var sortParam = sort.param;
                
                if (sort.param == 'name') {
                    sortParam = 'display_name';
                } else if (sort.param == 'percent') {
                    sortParam = 'total_invoiced';
                } else if (sort.param == 'outstanding') {
                    sortParam = 'unpaid';
                }
                
                if (sort.direction == 'desc') {
                    sortParam = '-' + sortParam;
                }
                
                
                url = url + '&page=' + p;
                url = url + '&sort=' + sortParam;
        
                return API.retrieve(url)
                    .then(function(data) {
                        if (!data.body) {
                            data.bodyText = '{}';
                        }
                        return data.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
