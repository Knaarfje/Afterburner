app.component('footer', {
    bindings: {
        sprint: '<'
    },
    controller($firebaseObject, $firebaseArray, $firebaseAuth, UtilityService) {
        let ctrl = this;
        let auth = $firebaseAuth();
        let _ = UtilityService;
        
        ctrl.sum = _.sum;
        ctrl.user;
        ctrl.sprints;
        ctrl.lastSprint;
        ctrl.statOpen = false;

        ctrl.$onInit =()=> {
            if(!auth.$getAuth()) return;

            let ref = firebase.database().ref();
            ctrl.sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(15));
            ctrl.sprints.$loaded(e=> {
                let k = ctrl.sprints.$keyAt(ctrl.sprints.length - 1);
                ctrl.lastSprint = $firebaseObject(ref.child("sprints/" + k));
            });
        }
    },
    templateUrl: `${templatePath}/footer.html`
});  