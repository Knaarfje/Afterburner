app.component('signin', {
    binding: {

    }, 
    controller($firebaseAuth, $timeout, $location) { 
        const ctrl = this;

        ctrl.signIn =(name, email)=> {
            $firebaseAuth().$signInWithEmailAndPassword(name, email).then(data => {
                $location.path('/')
            });
        }

        ctrl.signIn('thomas@boerdam.nl', 'Batman01');
    },
    templateUrl: `${templatePath}/signin.html`
});