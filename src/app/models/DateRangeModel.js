define([
    
    'moment'
    
], function(moment) {
    var now = new Date();
    now.setHours(0,0,0,0);
    
    var defaultFrom = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    var from = defaultFrom;
    var to = now;
    var locked = false;

    return {
        delta : function(interval, customFrom, customTo) {
            var a = customFrom ? moment(customFrom) : moment(from);
            var b = customTo ? moment(customTo) : moment(to);
            
            if (interval) {
                return b.diff(a, interval);
            }
            
            return b.diff(a);
        },
        
        paddedDateString : function (d) {
            var year = String(d.getFullYear());
            var month = String(d.getMonth() + 1);
            var day = String(d.getDate());
            
            if (month.length == 1) {
                month = '0' + month;
            }
            
            if (day.length == 1) {
                day = '0' + day;
            }
            
            return year + '-' + month + '-' + day;
        },
        
        getFromDate : function() {
            return from;
        },
        
        getFromString : function() {
            return from.getFullYear() + '-' + (from.getMonth() + 1) + '-' + from.getDate();
        },
        
        getFromStringPadded : function () {
            var year = String(from.getFullYear());
            var month = String(from.getMonth() + 1);
            var day = String(from.getDate());
            
            if (month.length == 1) {
                month = '0' + month;
            }
            
            if (day.length == 1) {
                day = '0' + day;
            }
            
            return year + '-' + month + '-' + day;
        },
        
        setFromDate : function(f) {
            if (locked) {
                return false;
            }
            
            from = f;
            from.setHours(0,0,0,0);
        },
        
        setFromString : function(s) {
            if (locked) {
                return false;
            }
            
            var parts = s.split('-');
            from = new Date(parts[0], parts[1] - 1, parts[2]);
            from.setHours(0,0,0,0);
        },
        
        getToDate : function() {
            return to;
        },
        
        getToString : function() {
            return to.getFullYear() + '-' + (to.getMonth() + 1) + '-' + to.getDate();
        },
        
        getToStringPadded : function () {
            var year = String(to.getFullYear());
            var month = String(to.getMonth() + 1);
            var day = String(to.getDate());
            
            if (month.length == 1) {
                month = '0' + month;
            }
            
            if (day.length == 1) {
                day = '0' + day;
            }
            
            return year + '-' + month + '-' + day;
        },
        
        setToDate : function(t) {
            if (locked) {
                return false;
            }
            
            to = t;
            to.setHours(0,0,0,0);
        },
        
        setToString : function(s) {
            if (locked) {
                return false;
            }
            
            var parts = s.split('-');
            to = new Date(parts[0], parts[1] - 1, parts[2]);
            to.setHours(0,0,0,0);
        },
        
        setErpDate : function(dateFrom, latestDate) {
            if (locked) {
                return false;
            }
            
            /**
             * dateFrom is present
             * latestDate is present
             * 
             * Use range of dateFrom to latestDate
             * but ensure latest financial year
             * If dateFrom day/month is before today's, then use current year, but dateFrom day/month
             * Otherwise use latestDate year and dateFrom day/month
             */
            if (dateFrom && latestDate) {
                var toRef = now;
            
                var latestToRef = moment.utc(latestDate).toDate();
                latestToRef.setHours(0,0,0,0);
                
                if (moment(latestToRef).unix() < moment(toRef).unix()) {
                    toRef = latestToRef;
                }
                
                var nowDay = toRef.getDate();
                var nowMonth = toRef.getMonth();
                var nowYear = toRef.getFullYear();
                
                var erpDate = moment.utc(dateFrom).toDate();
                erpDate.setHours(0,0,0,0);
                
                var erpDay = erpDate.getDate();
                var erpMonth = erpDate.getMonth();
                
                to = toRef;
                
                if ( (erpMonth < nowMonth) ||
                     (erpMonth == nowMonth && erpDay < nowDay)
                    ) {
                                        
                    from = new Date(
                            nowYear,
                            erpMonth,
                            erpDay
                        );
                                    
                } else {
                        
                    from = new Date(
                        nowYear - 1,
                        erpMonth,
                        erpDay
                    );
                    
                }
            
            /**
             * dateFrom absent
             * latestDate present
             * 
             * Use latestDate and go back one year
             * to determine range
             */
            } else if (!dateFrom && latestDate) {
                var latestToRef = moment.utc(latestDate).toDate();
                latestToRef.setHours(0,0,0,0);
                
                if (moment(latestToRef).unix() > moment().unix()) {
                    latestToRef = moment().toDate();
                }
                
                var day = latestToRef.getDate();
                var month = latestToRef.getMonth();
                var year = latestToRef.getFullYear();
                var prevYear = year - 1;
                
                from = new Date(prevYear, month, day);
                to = new Date(year, month, day);
            
            
            /**
             * Otherwise use default date range
             * (one year ago from today)
             */
            } else {
                from = defaultFrom;
                to = now;
            }

        },
        
        lockDate : function() {
            locked = true;
        },
        
        unlockDate : function() {
            locked = false;
        }
    };
});
