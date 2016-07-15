if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('scripts/serviceworker.js');
}

const app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', 'ng-sortable']);
const templatePath = './Assets/dist/Templates';

app.controller("BacklogController", function ($scope) {

    $scope.BiItems = [
        {name: 'Drempelvrij',               points: 2,      state: 'approved'},
        {name: 'Freewall filter updaten',   points: 5,      state: 'done'},
        {name: 'Sprint 05',                 points: 65,     state: 'sprint'},
        {name: 'Iconen updaten',            points: 8,      state: 'approved'},
        {name: 'Mooi schoon posters',       points: 13,     state: 'new'},
        {name: 'Rova corporate huisstijl',  points: 5,      state: 'new'}
    ];

    $scope.addBI = function() {
        $scope.BiItems.push({name: $scope.newBIname,points: 2,state: 'approved'})
    }

    $scope.filterState;
    $scope.filterStates = function(x) {
        if(x == $scope.filterState){
            $scope.filterState = ""; 
        }else{
            $scope.filterState = x;
        }
    }

    $scope.itemsToAdd = [{
        name: '',
        points: '',
        state: ''
    }];

    $scope.add = function(itemToAdd) {

        var index = $scope.itemsToAdd.indexOf(itemToAdd);

        $scope.itemsToAdd.splice(index, 1);

        $scope.BiItems.push(angular.copy(itemToAdd))
    }

    $scope.addNew = function() {

        $scope.itemsToAdd.push({
            name: '',
            points: '',
            state: ''
        })
    }

});

app.config(function ($locationProvider, $routeProvider) {
    const config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
    };

    $locationProvider.html5Mode(true);

    firebase.initializeApp(config);

    $routeProvider
        .when('/signin', { 
            template: '<signin></signin>'
        }).
        when('/', {
            resolve: {
                chart(SprintService) {
                    return SprintService.getOverviewChart()
                }
            },
            template: `
                <app>
                    <sprints title="'Overview'" 
                             back-title="'Velocity'" 
                             chart="$resolve.chart">
                    </sprints> 
                </app>`,
        }).
        when('/current-sprint', {
            resolve: {
                chart(SprintService) {
                    return SprintService.getCurrentChart()
                }
            },
            template: `
                <app>
                    <sprints title="$resolve.chart.name" 
                             back-title="'Burndown'" 
                             chart="$resolve.chart">
                    </sprints>
                </app>`,
        }).
        when('/sprint/:sprint', {
            resolve: {
                chart(SprintService, $route) {
                    let sprint = $route.current.params.sprint;
                    return SprintService.getSprintChart(sprint)
                }
            },
            template: `
                <app>
                    <sprints title="$resolve.chart.name" 
                             back-title="'Burndown'" 
                             chart="$resolve.chart">
                    </sprints>
                </app>`,
        }).
        when('/backlog', {
            template: `
                <app>
                    <backlog title="'Backlog'"
                                back-title="'Overview'"></backlog>
                </app>`,
        }).
        otherwise('/'); 
});