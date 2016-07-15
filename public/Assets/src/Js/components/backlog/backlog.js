app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller() {
        let ctrl = this;
        ctrl.open = true;
    },
    templateUrl: `${templatePath}/backlog.html` 
});  