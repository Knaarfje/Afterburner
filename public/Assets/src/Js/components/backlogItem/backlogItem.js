app.component('backlogItem', {
    bindings: {
        item: '<',
        onClick: '&'
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
    },
    templateUrl: `${templatePath}/backlogItem.html` 
});