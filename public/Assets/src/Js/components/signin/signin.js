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
    },
    templateUrl: `${templatePath}/signin.html`
});