'use strict';

var app = angular.module("afterburnerApp", ["firebase"]);

app.controller("afterburnerCtrl", function($scope, $firebaseAuth) {
  var ref = new Firebase("https://project-7784811851232431954.firebaseio.com");

  // create an instance of the authentication service
  var auth = $firebaseAuth(ref);

  $scope.signin = (email, password) => {
      auth.$authWithPassword({
          email: email,
          password: password
      }).then(function (data) {
          console.log("Logged in as: " + data.uid);
      });
  }  
}); 

function Afterburner() {
    this.initFirebase();
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
Afterburner.prototype.initFirebase = function () {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    // Initiates Firebase auth and listen to auth state changes.
    //this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

    //window.afterburner.signIn();
};

// Signs-in Friendly Chat.
Afterburner.prototype.signIn = function(email, password) {
  // Sign in Firebase using popup auth and Google as the identity provider.
    this.auth.signInWithEmailAndPassword(email, password);
};

window.onload = function() {
    window.afterburner = new Afterburner();
    window.afterburner.signIn('thomas@boerdam.nl', 'Batman01');
};