var reg;

if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/serviceworker.js').then(function () {
        return navigator.serviceWorker.ready;
    }).then(function (serviceWorkerRegistration) {
        console.log('Service Worker is ready :^)', reg);
        reg = serviceWorkerRegistration;
        // TODO
    }).catch(function (error) {
        console.log('Service Worker error :^(', error);
    });

    
    navigator.serviceWorker.getRegistrations().then(a => {
        for (var i in a) {
            if (a[i].active.scriptURL.indexOf('/scripts/ser') >= 0) {
                a[i].unregister();
            }
        }
    });
}


const app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', "angular.filter", 'ng-sortable']);
const templatePath = './Assets/dist/Templates';

app.config(function ($locationProvider, $routeProvider) {
    const config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
        messagingSenderId: "767810429309"
    };

    $locationProvider.html5Mode(true); 

    firebase.initializeApp(config);

    $routeProvider
        .when('/signin', { 
            template: '<signin></signin>'
        }) 
        .when('/', {
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
        })        
        .when('/current-sprint', {
            resolve: {
                chart(SprintService) {
                    return SprintService.getCurrentChart()
                }
            },
            template: `
                <app>
                    <sprints title="$resolve.chart.name" 
                             back-title="'Burndown'" 
                             chart="$resolve.chart"
                             backlog="true">
                    </sprints>
                </app>`,
        })
        .when('/sprint/:sprint', {
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
                             chart="$resolve.chart"
                             backlog="true">
                    </sprints>
                </app>`,
        })
        .when('/bigscreen', {
            resolve: {
                chart(SprintService) {
                    return SprintService.getOverviewChart()
                }
            },
            template: `
                <bigscreen>
                    <sprints title="'Overview'" 
                             back-title="'Velocity'" 
                             chart="$resolve.chart">
                    </sprints> 
                </bigscreen>`,
        })
        .when('/bigscreen/current-sprint', {
            resolve: {
                chart(SprintService) {
                    return SprintService.getCurrentChart()
                }
            },
            template: `
                <bigscreen>
                    <sprints title="$resolve.chart.name" 
                             back-title="'Burndown'" 
                             chart="$resolve.chart"
                             backlog="false">
                    </sprints>
                </bigscreen>`,
        })
        .when('/bigscreen/sprint/:sprint', {
            resolve: {
                chart(SprintService, $route) {
                    let sprint = $route.current.params.sprint;
                    return SprintService.getSprintChart(sprint)
                }
            },
            template: `
                <bigscreen>
                    <sprints title="$resolve.chart.name" 
                             back-title="'Burndown'" 
                             chart="$resolve.chart"
                             backlog="false">
                    </sprints>
                </bigscreen>`,
        })
        .when('/backlog', {
            template: `
                <app>
                    <backlog title="'Backlog'"
                             back-title="'Overview'">
                    </backlog>
                </app>`, 
        }) 
        .otherwise('/'); 
}); 