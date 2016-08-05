app.component('backlogForm', {
    bindings: {
        item: "<",
        sprints: "<",
        onAdd: "&",
        onDelete: "&",
        onSave: "&"
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
    },
    templateUrl: `${templatePath}/backlogForm.html` 
}); 