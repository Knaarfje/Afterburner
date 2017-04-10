var reg;

if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/serviceworker.js').then(function() {
        return navigator.serviceWorker.ready;
    }).then(function(serviceWorkerRegistration) {
        console.log('Service Worker is ready :^)', reg);
        reg = serviceWorkerRegistration;
        // TODO
    }).catch(function(error) {
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


const app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', "angular.filter", 'ng-sortable', 'ui.router', 'monospaced.elastic']);
const templatePath = './Assets/dist/Templates';

app.config(function($locationProvider, $firebaseRefProvider, $stateProvider, $urlRouterProvider) {
    const config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
        messagingSenderId: "767810429309"
    };

    $locationProvider.html5Mode(true);
    $firebaseRefProvider.registerUrl(config.databaseURL);

    firebase.initializeApp(config);
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state({
            name: 'signin',
            url: '/signin',
            template: '<signin></signin>'
        })
        .state('default', {
            url: '/',
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
        .state('current-sprint', {
            url: '/current-sprint',
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
        .state('sprint', {
            url: '/sprint/:sprint',
            resolve: {
                chart(SprintService, $stateParams) {
                    let sprint = $stateParams.sprint;
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
        .state("bigscreen", {
            url: '/bigscreen',
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
        .state("bigscreen.current-sprint", {
            url: '/bigscreen/current-sprint',
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
        .state("bigscreen.sprint", {
            url: '/bigscreen/sprint/:sprint',
            resolve: {
                chart(SprintService, $route) {
                    let sprint = $stateParams.sprint;
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
        .state("backlog", {
            url: '/backlog',
            resolve: {
                "firebaseUser": function($firebaseAuthService) {
                    return $firebaseAuthService.$waitForSignIn();
                },
                "backlog": function(BacklogService) {
                    return BacklogService.getBacklog();
                }
            },
            template: `
                <app>
                    <backlog title="'Backlog'"
                             back-title="'Overview'"
                             bi-items="$resolve.backlog">
                    </backlog> 
                </app>`,
        })
        .state("backlog.item", {
            url: '/:item',
            resolve: {
                "firebaseUser": function($firebaseAuthService) {
                    return $firebaseAuthService.$waitForSignIn();
                },
                "key": ($stateParams) => {
                    return $stateParams.item;
                }
            },
            reloadOnSearch: false,
            template: ` 
            <div class="col-lg-6 backlog-form" ng-class="{'active': $ctrl.selectedItem}">               
			<backlog-form 
				item="$ctrl.selectedItem"
                items="$ctrl.biItems"
                item-key="$resolve.key"
				attachments="$ctrl.selectedItemAttachments"
				sprints="$ctrl.sprints" 
				on-add="$ctrl.addItem()"                 
				on-select="$ctrl.getItem($resolve.key)" 
				on-delete="$ctrl.deleteItem($ctrl.selectedItem)" 
				on-save="$ctrl.saveItem($ctrl.selectedItem)">
			</backlog-form>
            </div>`
        })
        .state('retro', {
            url: '/retro',
            resolve: {
                "firebaseUser": function($firebaseAuthService) {
                    return $firebaseAuthService.$waitForSignIn();
                }
            },
            template: `
                <app>
                    <retro title="'Retro'"
                             back-title="'Afspraken'">
                    </retro>
                </app>`
        });
});