app.component('sideNav', {
    bindings: {
        user: '<',
        open: '<',
        onSignOut: '&',
    },
    controller() {
        let ctrl = this;
        ctrl.open = true;
    },
    templateUrl: `${templatePath}/sideNav.html` 
});  