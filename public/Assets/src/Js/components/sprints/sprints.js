app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        backlog: '<',
        chart: '='
    },

    controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout,$rootScope) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };


        ctrl.loaded = false;
        ctrl.filter = {};
        
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
        }

        ctrl.filterItems = x => {
            x == ctrl.filter.state
                ? ctrl.filter = { name: ctrl.filter.name }
                : ctrl.filter.state = x;
        }

        ctrl.$onInit = () => {
            if (!ctrl.chart.sprint || !ctrl.backlog) {
                ctrl.loaded = true;
            }
        }

        /// This method is responsible for building the graphdata by backlog items        
        ctrl.setBurndown = (start, duration, backlog) => {
            start = new Date(start * 1000);
            let dates = [];
            let burndown = [];
            let daysToAdd = 0;            
            let velocityRemaining = ctrl.chart.sprint.velocity;
            let graphableBurndown = [];

            for (var i = 0; i <= duration; i++) {
                var newDate = start.addDays(daysToAdd - 1);
                if (newDate > new Date()) {
                    continue;
                }

                while ([0, 6].indexOf(newDate.getDay()) >= 0) {
                    daysToAdd++;
                    newDate = start.addDays(daysToAdd);
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
                    console.log(bliDate, d);
                    if (bliDate.getDate() == d.getDate() && bliDate.getMonth() == d.getMonth() && bliDate.getFullYear() == d.getFullYear()) {
                        bdown += bli.effort;
                    }
                }

                burndown.push({
                    date: d,
                    burndown: bdown
                });
            }

             console.log(burndown);

            for (let x in burndown) {
                velocityRemaining -= burndown[x].burndown;
                graphableBurndown.push(velocityRemaining);
            };
            ctrl.chart.data.datasets[0].data = graphableBurndown;
        }
    },
    templateUrl: `${templatePath}/sprints.html`
});

Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}
