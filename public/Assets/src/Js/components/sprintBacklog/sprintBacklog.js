app.component('sprintBacklog', {
    bindings: {
        items: "<"
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
    },
    templateUrl: `${templatePath}/sprintBacklog.html` 
}); 