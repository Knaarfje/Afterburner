app.component('overviewFooter', {
    bindings: {
        sprint: '<'
    },
    controller() {
        let ctrl = this;

        ctrl.statOpen = false;
    },
    templateUrl: `${templatePath}/footer.html`
});