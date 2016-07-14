app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        chart: '<'
    },
    controller() {
        let ctrl = this;

        ctrl.loaded = false;
        ctrl.$onInit =()=> ctrl.loaded = true;
    },
    templateUrl: `${templatePath}/sprints.html` 
});  