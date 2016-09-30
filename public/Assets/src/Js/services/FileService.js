app.factory('FileService', function ($rootScope, UtilityService, $q, $timeout, $firebaseArray) {
    let _ = UtilityService;
    let ref = firebase.database().ref();
    let attachments;

    function getAttachments(backlogItem) {
        return $q(function (resolve, reject) {
            if (!backlogItem) {
                reject("Backlog item not provided");
            } else {
                attachments = $firebaseArray(ref.child("attachments").orderByChild('backlogItem').equalTo(backlogItem.$id));
                resolve(attachments);
            }
        });
    }

    return {
        getAttachments
    };
});