app.factory('RetroService', function($firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    let _ = UtilityService;
    let ref = firebase.database().ref();
    let retro;

    function getRetro(sprint) {
        return $q(function(resolve, reject) {
            if (!sprint) {
                retro = $firebaseArray(ref.child("retro").orderByChild('sprint'));
                resolve(retro);
            } else {
                retro = $firebaseArray(ref.child("retro").orderByChild('sprint').equalTo(sprint.$id));
                resolve(retro);
            }
        });
    }

    function add(retroAgreement) {
        return retro.$add(retroAgreement);
    }

    function remove(retroAgreement) {
        return retro.$remove(retroAgreement);
    }

    function save(retroAgreement) {
        return retro.$save(retroAgreement);
    }

    return {
        getRetro,
        save,
        add,
        remove
    };
});