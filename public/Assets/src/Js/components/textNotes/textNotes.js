app.component('textNotes', {
    bindings: {
        title: '<',
        type: '<',
        sprint: '<'
    },
    controller($firebaseAuth, NoteService, $scope, $timeout, $rootScope) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.newNote = {
            note: '',
            author: auth.$getAuth().uid,
            timestamp: 0,
            sprint: ctrl.sprint.$id
        }

        ctrl.init = () => {
            NoteService.getNotes(ctrl.type, ctrl.sprint).then((d) => {
                ctrl.notes = d;
                console.log(d);
            });
        }

        ctrl.saveNote = () => {
            ctrl.newNote.timestamp = Date.now();

            NoteService.add(ctrl.type, ctrl.newNote, ctrl.notes).then(() => {
                ctrl.newNote = {
                    note: '',
                    author: auth.$getAuth().uid,
                    timestamp: 0,
                    sprint: ctrl.sprint.$id
                }
            });
        }
    },
    templateUrl: `${templatePath}/textNotes.html`   
});