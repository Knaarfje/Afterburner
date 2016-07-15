app.factory('BacklogService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    let _ = UtilityService;
    let ref = firebase.database().ref();

    function getBacklog(sprint) {
        return $q(function (resolve, reject) {
            if (!sprint) {
                let backlog = $firebaseArray(ref.child("backlog").orderByChild('order'));
                resolve(backlog);
           } 
        });
    }

    return {
        getBacklog
    };
});