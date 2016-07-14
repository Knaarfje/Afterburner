app.component('sideNav', {
    bindings: {
        user: '<',
        open: '<',
        onSignOut: '&',
    },
    controller($timeout, $location, $swipe) {
        let ctrl = this;
        ctrl.open = true;
    },
    templateUrl: `${templatePath}/sideNav.html` 
});  