app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
<<<<<<< HEAD
        chart: '<'

=======
        chart: '='
>>>>>>> 52868f174b20c6cdf3a04800f0f82280fc4a65a0
    },

    controller($firebaseAuth, SprintService, $scope) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.loaded = false;
        ctrl.$onInit =()=> ctrl.loaded = true;
    },
    templateUrl: `${templatePath}/sprints.html` 
});  