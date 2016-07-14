app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        chart: '<'
    },
    controller($firebaseAuth) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.loaded = false;
        ctrl.$onInit =()=> ctrl.loaded = true;
    },
    templateUrl: `${templatePath}/sprints.html` 
});  