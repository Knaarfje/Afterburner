app.component('sprints', {
    bindings: {
        title: '@',
        backTitle: '@',
        type: '@',
        chart: '<'
    },
    controller() {
        let ctrl = this;
        ctrl.loaded = true;
    },
    templateUrl: `${templatePath}/sprints.html` 
});  