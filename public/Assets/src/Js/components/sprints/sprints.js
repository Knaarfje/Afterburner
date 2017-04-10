app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        backlog: '<',
        chart: '='
    },

<<<<<<< HEAD
    controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout, $rootScope, RetroService) {
=======
    controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout,$rootScope, $location, SettingService) {
>>>>>>> 7a66df816f5405b00ddba4e12f0c409e2816f439
        let ctrl = this;
        let auth = $firebaseAuth();
        ctrl.settings = SettingService;
        
        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.stateLookup = ['New', 'Approved', '', 'Done', 'Removed'];

        ctrl.loaded = false;
        ctrl.filter = {};

        ctrl.openItem = (item) => {
            $location.path(`/backlog/${item.$id}`);
        }
        
        ctrl.sumEffort = (items) => {
            var sum = 0;
            for (var i in items) {
                sum += items[i].effort;
            }

            return sum;
        };

        if (ctrl.chart.sprint && ctrl.backlog) {

            BacklogService.getBacklog(ctrl.chart.sprint).then(data => {
                ctrl.BiItems = data;
                $timeout(() => ctrl.loaded = true);

                ctrl.BiItems.$loaded(() => {
                    if (ctrl.chart.sprint.start) {
                        ctrl.setBurndown(ctrl.chart.sprint.start, ctrl.chart.sprint.duration, ctrl.BiItems);
                        ctrl.BiItems.$watch((e) => {
                            ctrl.setBurndown(ctrl.chart.sprint.start, ctrl.chart.sprint.duration, ctrl.BiItems);
                            $rootScope.$broadcast('sprint:update');
                        });
                    }
                })
            });

            RetroService.getRetro(ctrl.chart.sprint).then(data => {
                ctrl.RetroAgreements = data;
            });

        }

        ctrl.filterItems = x => {
            x == ctrl.filter.state ?
                ctrl.filter = { name: ctrl.filter.name } :
                ctrl.filter.state = x;
        }

        ctrl.$onInit = () => {
            if (!ctrl.chart.sprint || !ctrl.backlog) {
                ctrl.loaded = true;
            }
            ctrl.viewMode = ctrl.settings.get('ViewMode', 0);
        }

        ctrl.setViewMode = (mode) => {
            ctrl.viewMode = mode;
            ctrl.settings.set('ViewMode', mode);
        }

        /// This method is responsible for building the graphdata by backlog items        
        ctrl.setBurndown = (start, duration, backlog) => {
            start = new Date(start * 1000);
            let dates = [];
            let burndown = [];
            let daysToAdd = 0;
            let velocityRemaining = ctrl.chart.sprint.velocity;
            let graphableBurndown = [];
            let totalBurndown = 0;

            for (var i = 0; i <= duration; i++) {
                var newDate = start.addDays(daysToAdd - 1);
                if (newDate > new Date()) {
                    continue;
                }

                if ([0, 6].indexOf(newDate.getDay()) >= 0) {
                    daysToAdd++;
                    newDate = start.addDays(daysToAdd);
                    i--;
                    continue;
                }
                dates.push(newDate);
                daysToAdd++;
            }

            for (var i in dates) {
                var d = dates[i];
                var bdown = 0;

                for (var i2 in backlog) {
                    var bli = backlog[i2];
                    if (bli.state != "3") {
                        continue;
                    }

                    var bliDate = new Date(parseInt(bli.resolvedOn));
                    if (bliDate.getDate() == d.getDate() && bliDate.getMonth() == d.getMonth() && bliDate.getFullYear() == d.getFullYear()) {
                        bdown += bli.effort;
                    }
                }

                burndown.push({
                    date: d,
                    burndown: bdown
                });
            }

            for (let x in burndown) {
                totalBurndown += burndown[x].burndown;
                velocityRemaining -= burndown[x].burndown;
                graphableBurndown.push(velocityRemaining);
            };
            ctrl.chart.burndown = totalBurndown;
            ctrl.chart.remaining = velocityRemaining;
            ctrl.chart.data.datasets[0].data = graphableBurndown;
        }
    },
    templateUrl: `${templatePath}/sprints.html`
});

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}