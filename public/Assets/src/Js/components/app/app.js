app.component('app', {
    binding: {

    },
    transclude: true,
    controller($timeout, $location, $firebaseAuth) {
        let ctrl = this;
        let auth = $firebaseAuth();
        
        ctrl.auth = auth;
        ctrl.navOpen = true;

        ctrl.$onInit =()=> {
            if(!auth.$getAuth()) $location.path('/signin');
        }
    },
    templateUrl: `${templatePath}/app.html` 
});  