app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        chart: '='
    },

    controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout) {
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
        
        if (ctrl.chart.sprint) {
            BacklogService.getBacklog(ctrl.chart.sprint).then(data => {
                ctrl.BiItems = data;
                $timeout(()=> ctrl.loaded = true);
            });
        }

        ctrl.filterItems = x => {
            x == ctrl.filter.state
                ? ctrl.filter = { name: ctrl.filter.name }
                : ctrl.filter.state = x;
        }

        ctrl.$onInit = () => {
            if(!ctrl.chart.sprint){
                ctrl.loaded = true;
            }
        }
    },
    templateUrl: `${templatePath}/sprints.html` 
});  