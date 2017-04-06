app.component('retroItem', {
    bindings: {
        item: '<'
    },
    controller(RetroService, $firebaseAuth) {
        let ctrl = this;

    },
    templateUrl: `${templatePath}/retroItem.html` 
});