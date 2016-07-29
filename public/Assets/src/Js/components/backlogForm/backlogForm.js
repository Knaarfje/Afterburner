app.component('backlogForm', {
    bindings: {
        item: "<",
        onAdd: "&",
        onDelete: "&",
        onSave: "&"
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
    },
    templateUrl: `${templatePath}/backlogForm.html` 
}); 