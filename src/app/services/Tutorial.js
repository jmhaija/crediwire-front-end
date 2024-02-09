define([
    
    'Vue',
    'config/tutorials',
    'models/UserModel',
    'models/ErpModel',
    'models/DateRangeModel',
    'models/CompanyModel',
    'services/EventBus'
    
], function(Vue, tutorials, UserModel, ErpModel, DateRangeModel, CompanyModel, EventBus) {
    var router = null;
    var processStep = function(stepObject) {
        if (stepObject.path) {
            router.push(stepObject.path);
        }
        
        if (stepObject.tasks && stepObject.tasks.addPill) {
            EventBus.$emit('addMockPill');
        }
        
        if (stepObject.tasks && stepObject.tasks.removePill) {
            EventBus.$emit('removeMockPill');
        }
    };
    var fromDate, toDate;
    
    return {
        state : {
            step : 0,
            started : false,
            finished : false,
            loading : false,
            startedAt : '/'
        },
        content : null,
        steps : [],
        current : null,
        next : function() {
            if (!this.state.started) {
                return false;
            }
            
            this.state.loading = true;
            
            setTimeout(function() {
                this.steps[this.state.step] = false;
                this.state.step++;
                this.current = this.content[this.state.step];
                this.steps[this.state.step] = true;
                
                processStep(this.current);
                this.state.loading = false;
            }.bind(this), 250);
        },
        previous : function() {
            if (!this.state.started) {
                return false;
            }
            
            this.state.loading = true;
            
            setTimeout(function() {
                this.steps[this.state.step] = false;
                this.state.step--;
                this.current = this.content[this.state.step];
                this.steps[this.state.step] = true;
                
                processStep(this.current);
                this.state.loading = false;
            }.bind(this), 250);
        },
        start : function(type) {
            this.state.startedAt = window.location.pathname;
            this.state.step = 0;
            this.state.started = false;
            this.state.finished = false;
            this.content = tutorials[type];
            this.steps = [];
            this.current = this.content[this.state.step];
            
            for (var i = 0; i < this.content.length; i++) {
                if (i == this.state.step) {
                    this.steps.push(true);
                } else {
                    this.steps.push(false);
                }
            }
            
            
            (function() {
                fromDate = DateRangeModel.getFromString();
                toDate = DateRangeModel.getToString();
            })();
            
            
            this.state.started = true;
            EventBus.$emit('startTutorial');
        },
        end : function(closeBeforeFinish) {
            if (!this.state.started) {
                return false;
            }

            if (closeBeforeFinish) {
                this.current = this.content[16];
                this.steps[16] = true;
            }
            
            this.state.finished = true;
            
            var profile = UserModel.profile();
            var company = CompanyModel.getCompany();
            
            if (!profile.settings.completedTutorial) {
                profile.settings.completedTutorial = true;
                UserModel.construct(profile);
                UserModel.save();
            }
            
            DateRangeModel.unlockDate();
            DateRangeModel.setFromString(fromDate);
            DateRangeModel.setToString(toDate);
            
            sessionStorage.removeItem('firsts_general');
            sessionStorage.removeItem('series_general');
            sessionStorage.removeItem('dash-average');
            
            EventBus.$emit('endTutorial');
            
            if (this.state.step < this.steps.length -1 && this.state.startedAt != '/account/updating') {
                router.push(this.state.startedAt);
            } else if (company && company.settings && company.settings.hide_overview && router.history.current.path == '/account/overview') {
                router.push('/account/connections');
            } else if (router.history.current.path != '/account/updating') {
                setTimeout(function() {
                    EventBus.$emit('tutorialEndUIReady');
                }, 500);
            }
        },
        registerRouter : function(instance) {
            router = instance;
        }
    };
});
