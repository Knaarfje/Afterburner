app.component('retro', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(RetroService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope, NotificationService) {
        let ctrl = this;

        SprintService.getSprints((sprints) => {
            ctrl.sprints = sprints;
        });

        RetroService.getRetro().then(data => {
            ctrl.RetroAgreements = data;
        });
    },
    templateUrl: `${templatePath}/retro.html`
});