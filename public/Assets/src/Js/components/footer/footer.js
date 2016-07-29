app.component('footer', {
    bindings: {
        sprint: '<'
    },
    controller() {
        let ctrl = this;

        ctrl.statOpen = false;
    },
    templateUrl: `${templatePath}/footer.html`
});