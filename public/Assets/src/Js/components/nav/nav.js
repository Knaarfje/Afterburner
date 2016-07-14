app.component('login', {
    binding: {

    },
    controller(UserService, $timeout, $location) {
        const ctrl = this;

        ctrl.signIn = UserService.signIn;
    },
    templateUrl: `${templatePath}/login.html`
});  