app.factory('NotificationService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $firebaseAuth, $http) {
    let _ = UtilityService;
    let ref = firebase.database().ref();    
    let auth = $firebaseAuth();
    let userId = auth.$getAuth().uid;
    let reg = window.reg;
    let backlog;

    function subscribe() {

        return $q((resolve, reject) => {
            console.log(reg);
            reg.pushManager.getSubscription().then((sub) => {
                if (sub) {
                    resolve(false);
                    return;
                }
            });

            reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (pushSubscription) {
                var sub = pushSubscription;
                console.log('Subscribed! Endpoint:', sub.endpoint);
                var endpoint = sub.endpoint.split('/');
                endpoint = endpoint[endpoint.length - 1];

                var subscriptions = $firebaseArray(ref.child("subscriptions").orderByChild('endpoint').equalTo(endpoint));
                subscriptions.$loaded().then((data) => {
                    if (!subscriptions.length > 0) {
                        subscriptions.$add(
                            {
                                uid: userId,
                                endpoint: endpoint
                            }
                        );
                    }
                    
                    resolve(true);
                });
            });
        });
    }

    function unsubscribe() {
        return $q((resolve, reject) => {
            reg.pushManager.getSubscription().then((sub) => {
                if (!sub) {
                    resolve(false);
                    return;
                }

                var endpoint = sub.endpoint.split('/');
                endpoint = endpoint[endpoint.length - 1];

                sub.unsubscribe().then(d => {
                    var subscriptions = $firebaseArray(ref.child("subscriptions").orderByChild('endpoint').equalTo(endpoint));
                    subscriptions.$loaded().then((data) => {
                        if (subscriptions.length > 0) {
                            subscriptions.$remove(0); 
                        }
                        resolve(true);
                    });
                });
            });
        });
    }

    function notify(type) {        
        return $q((resolve, reject) => {
            var subscriptions = $firebaseArray(ref.child("subscriptions").orderByChild('uid'));
            subscriptions.$loaded().then((data) => {
                var endpoints = subscriptions.map((a) => {
                    return a.endpoint;
                });
                    
                $http({
                    url: "https://android.googleapis.com/gcm/send",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AIzaSyBYQol9mz5SfJKG7_X81WPIABHc63IOuIc'
                    },
                    data: JSON.stringify({
                        registration_ids: endpoints,
                        collapse_key: type
                    })
                }).then(a => {                
                    resolve(true);
                });

            });
        });
    }

    return {
        subscribe,
        unsubscribe,
        notify
    };
});