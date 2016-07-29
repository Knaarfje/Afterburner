app.component('sideNav', {
    bindings: {
        user: '<',
        open: '<',
        onSignOut: '&',
    },
    controller() {
        let ctrl = this;
        ctrl.open = false;
    },
    templateUrl: `${templatePath}/sideNav.html` 
});  