app.factory('BacklogService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    let _ = UtilityService;
    let ref = firebase.database().ref();
    let backlog;

    function getBacklog(sprint) {
        return $q(function (resolve, reject) {
            if (!sprint) {
                backlog = $firebaseArray(ref.child("backlog").orderByChild('order'));
            } else {
                backlog = $firebaseArray(ref.child("backlog").orderByChild('sprint').equalTo(sprint.$id));
            }
            resolve(backlog.$loaded());
        });
    }

    function add(backlogItem) {
        return backlog.$add(backlogItem);
    }
    
    function remove(backlogItem) {
        return backlog.$remove(backlogItem);
    }

    function save(backlogItem) {
        return backlog.$save(backlogItem);
    }

    return {
        getBacklog,
        save,
        add,
        remove
    };
});