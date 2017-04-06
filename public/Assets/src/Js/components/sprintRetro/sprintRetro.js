app.component('sprintRetro', {
    bindings: {
        items: "<"
    },
    controller(RetroService, $firebaseAuth) {
        let ctrl = this;
    },
    templateUrl: `${templatePath}/sprintRetro.html` 
}); 