app.component('app', {
    transclude: true,
    controller($location, $firebaseAuth, SprintService) {
        let ctrl = this;
        let auth = $firebaseAuth();
        
        ctrl.auth = auth;
        if(!auth.$getAuth()) $location.path('/signin');

        ctrl.navOpen = true;
        ctrl.signOut =()=> {
            ctrl.auth.$signOut();
            $location.path('/signin');
        }
    },
    templateUrl: `${templatePath}/app.html`  
});  