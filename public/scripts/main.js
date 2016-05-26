var app = angular.module("afterburnerApp", ["firebase"]);
app.config(function () {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
    };
    firebase.initializeApp(config);
});

app.controller("afterburnerCtrl", function ($scope, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var ref = firebase.database().ref();

    $scope.init = () => {
        $scope.signin("thomas@boerdam.nl", "Batman01");
    }

    $scope.signin = (email, password) => {
        $scope.authData = null;

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
            $scope.authData = data;
            console.log(data);
            $scope.sprints = $firebaseArray(ref.child("sprints"));
        });
    }

    $scope.addSprint = (velocity) => {
        $scope.sprints.$add({
            duration: 9,
            velocity: velocity
        });
    }

    $scope.addBurndown = (points, sprint) => {

        var sprintKey = $scope.sprints.$keyAt(sprint);        
        var burndowns = $scope.sprints.$getRecord(sprintKey).burndown;
        burndowns.$add(points);
    }
});