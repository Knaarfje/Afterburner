app.component('backlogForm', {
    bindings: {
        item: "<",
        sprints: "<",
        attachments: "<",
        onAdd: "&",
        onDelete: "&",
        onSave: "&"
    },
    controller(BacklogService, $firebaseAuth, $firebaseArray, $firebaseObject) {
        let ctrl = this;
        ctrl.attachmentsToAdd;
        
        let fileSelect = document.createElement('input');
        fileSelect.type = 'file';
        fileSelect.multiple = 'multiple';
        fileSelect.onchange = (evt) => {
            ctrl.uploadFiles(fileSelect.files);
        }
        
        ctrl.selectFiles = () => {
            if (!ctrl.item) {
                return;
            }
            fileSelect.click();
        }
        
        ctrl.uploadFiles = (files) => {
            for (var f in files) {
                var file = files[f];

                if (file instanceof File) {
                    ctrl.uploadFile(file);
                } 
            }
        }

        ctrl.uploadFile = (file) => {
            var path = `${ctrl.item.$id}/${file.name}`
                    
                    let key = -1;
                    var attachment = {
                        backlogItem: ctrl.item.$id,
                        name: file.name,
                        path: path,
                        mimetype: file.type,
                        state: 1,
                        progress: 0
                    };

                    ctrl.attachments.$add(attachment).then((ref) => {
                        key = ref.key;

                        let storageRef = firebase.storage().ref(path);
                        var uploadTask = storageRef.put(file);
                        uploadTask.on('state_changed', function progress(snapshot) {
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            var r = ctrl.attachments.$getRecord(key)
                            r.progress = progress;
                            ctrl.attachments.$save(r);
                            console.log('Upload is ' + progress + '% done');
                        });
                    });
        }
    },
    templateUrl: `${templatePath}/backlogForm.html`
});