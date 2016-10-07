app.component('sideNav', {
    bindings: {
        user: '<',
        open: '<',
        onSignOut: '&',
    },
    controller(NotificationService, $timeout, $scope) {
        let ctrl = this;
        ctrl.open = false;
        ctrl.hasSubscription = false;

        ctrl.checkSubscription = () => {
            reg.pushManager.getSubscription().then((sub) => {
                if (sub) {
                    ctrl.hasSubscription = true;
                }
                else {
                    ctrl.hasSubscription = false;
                }
                $timeout(() => {
                    $scope.$apply();
                })
            });
        }

        ctrl.subscribe = () => {
            NotificationService.subscribe().then(d => {
                ctrl.checkSubscription()
            });
        }

        ctrl.unsubscribe = () => {
            NotificationService.unsubscribe().then(d => {
                ctrl.checkSubscription()
            });
        }
    },
    templateUrl: `${templatePath}/sideNav.html` 
});  