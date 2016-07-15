'use strict';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('scripts/serviceworker.js');
}

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', 'ng-sortable']);
var templatePath = './Assets/dist/Templates';

app.controller("BacklogController", function ($scope) {

    $scope.BiItems = [{ name: 'Drempelvrij', points: 2, state: 'approved' }, { name: 'Freewall filter updaten', points: 5, state: 'done' }, { name: 'Sprint 05', points: 65, state: 'sprint' }, { name: 'Iconen updaten', points: 8, state: 'approved' }, { name: 'Mooi schoon posters', points: 13, state: 'new' }, { name: 'Rova corporate huisstijl', points: 5, state: 'new' }];

    $scope.addBI = function () {
        $scope.BiItems.push({ name: $scope.newBIname, points: 2, state: 'approved' });
    };

    $scope.filterState;
    $scope.filterStates = function (x) {
        if (x == $scope.filterState) {
            $scope.filterState = "";
        } else {
            $scope.filterState = x;
        }
    };

    $scope.itemsToAdd = [{
        name: '',
        points: '',
        state: ''
    }];

    $scope.add = function (itemToAdd) {

        var index = $scope.itemsToAdd.indexOf(itemToAdd);

        $scope.itemsToAdd.splice(index, 1);

        $scope.BiItems.push(angular.copy(itemToAdd));
    };

    $scope.addNew = function () {

        $scope.itemsToAdd.push({
            name: '',
            points: '',
            state: ''
        });
    };
});

app.config(function ($locationProvider, $routeProvider) {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com"
    };

    $locationProvider.html5Mode(true);

    firebase.initializeApp(config);

    $routeProvider.when('/signin', {
        template: '<signin></signin>'
    }).when('/', {
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getOverviewChart();
            }
        },
        template: '\n                <app>\n                    <sprints title="\'Overview\'" \n                             back-title="\'Velocity\'" \n                             chart="$resolve.chart">\n                    </sprints> \n                </app>'
    }).when('/current-sprint', {
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getCurrentChart();
            }
        },
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart">\n                    </sprints>\n                </app>'
    }).when('/sprint/:sprint', {
        resolve: {
            chart: function chart(SprintService, $route) {
                var sprint = $route.current.params.sprint;
                return SprintService.getSprintChart(sprint);
            }
        },
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart">\n                    </sprints>\n                </app>'
    }).when('/backlog', {
        template: '\n                <app>\n                    <backlog title="\'Backlog\'"\n                                back-title="\'Overview\'"></backlog>\n                </app>'
    }).otherwise('/');
});
"use strict";

particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.1,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.01,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 10,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.05,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": {
          "opacity": .1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 5,
        "opacity": .1,
        "speed": 300
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 3
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});
'use strict';

app.factory('BacklogService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    var _ = UtilityService;
    var ref = firebase.database().ref();

    function getBacklog(sprint) {
        return $q(function (resolve, reject) {
            if (!sprint) {
                var backlog = $firebaseArray(ref.child("backlog").orderByChild('order'));
                resolve(backlog);
            }
        });
    }

    return {
        getBacklog: getBacklog
    };
});
'use strict';

app.factory('SprintService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var lineColor = '#EB51D8';
    var barColor = '#5FFAFC';
    var chartType = "line";

    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            mode: 'single',
            cornerRadius: 3
        },
        elements: {
            line: {
                fill: false
            }
        },
        legend: {
            position: 'bottom',
            labels: {
                fontColor: '#fff'
            }
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false,
                    color: "rgba(255,255,255,.1)"
                },
                ticks: {
                    fontColor: '#fff'
                }
            }],
            yAxes: [{
                type: "linear",
                display: true,
                position: "left",
                id: "y-axis-1",
                ticks: {
                    stepSize: 10,
                    beginAtZero: true,
                    fontColor: '#fff',
                    suggestedMax: 100
                },
                gridLines: {
                    display: true,
                    color: "rgba(255,255,255,.1)",
                    drawTicks: false
                },
                labels: {
                    show: true
                }
            }, {
                type: "linear",
                display: false,
                position: "right",
                id: "y-axis-2",
                ticks: {
                    stepSize: 10,
                    beginAtZero: true,
                    fontColor: '#fff',
                    suggestedMax: 100
                },
                gridLines: {
                    display: false
                },
                labels: {
                    show: false
                }
            }]
        }
    };

    var overviewData = {
        labels: [],
        datasets: [{
            type: 'line',
            label: "Estimated",
            data: [],
            fill: false,
            backgroundColor: lineColor,
            borderColor: lineColor,
            hoverBackgroundColor: '#5CE5E7',
            hoverBorderColor: '#5CE5E7',
            yAxisID: 'y-axis-1'
        }, {
            label: "Achieved",
            type: 'bar',
            data: [],
            fill: false,
            borderColor: barColor,
            backgroundColor: barColor,
            pointBorderColor: barColor,
            pointBackgroundColor: barColor,
            pointHoverBackgroundColor: barColor,
            pointHoverBorderColor: barColor,
            yAxisID: 'y-axis-2'
        }]
    };

    var burndownData = {
        labels: ["di", "wo", "do", "vr", "ma", "di", "wo", "do", "vr", "ma"],
        datasets: [{
            label: "Gehaald",
            type: 'line',
            data: [],
            fill: false,
            yAxisID: 'y-axis-2',
            borderColor: lineColor,
            backgroundColor: lineColor,
            pointBorderColor: lineColor,
            pointBackgroundColor: lineColor,
            pointHoverBackgroundColor: lineColor,
            pointHoverBorderColor: lineColor,
            hitRadius: 15,
            lineTension: 0
        }, {
            type: 'line',
            label: "Mean Burndown",
            data: [],
            fill: false,
            yAxisID: 'y-axis-1',
            borderColor: barColor,
            backgroundColor: barColor,
            pointBorderColor: barColor,
            pointBackgroundColor: barColor,
            pointHoverBackgroundColor: barColor,
            pointHoverBorderColor: barColor,
            hitRadius: 15,
            lineTension: 0
        }]
    };

    function getSprints(cb) {
        var sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(15));
        sprints.$loaded(cb, function () {
            return $location.path('/signin');
        });
    }

    function getOverviewChart() {
        var deferred = $q.defer();

        getSprints(function (sprints) {

            sprints.$loaded(function () {
                updateOverviewChart(deferred, sprints);

                sprints.$watch(function () {
                    $rootScope.$broadcast('sprint:update');
                    updateOverviewChart(deferred, sprints);
                });
            });
        });

        return deferred.promise;
    }

    function updateOverviewChart(deferred, sprints) {

        var labels = undefined;
        var estimated = undefined;
        var burned = undefined;

        labels = sprints.map(function (d) {
            return 'Sprint ' + _.pad(d.order);
        });
        estimated = sprints.map(function (d) {
            return d.velocity;
        });
        burned = sprints.map(function (d) {
            var i = 0;
            for (var x in d.burndown) i = i + d.burndown[x];
            return i;
        });

        var data = overviewData;
        data.labels = labels;
        data.datasets[1].data = burned;
        data.datasets[0].data = estimated;

        var currentSprint = sprints[sprints.length - 1];

        var chartObj = {
            type: "bar",
            options: chartOptions,
            data: data,
            velocity: currentSprint.velocity,
            burndown: _.sum(currentSprint.burndown),
            remaining: currentSprint.velocity - _.sum(currentSprint.burndown),
            needed: $filter('number')(currentSprint.velocity / currentSprint.duration, 1)
        };

        deferred.resolve(chartObj);
    }

    function buildBurnDownChart(sprint) {
        var idealBurndown = burndownData.labels.map(function (d, i) {
            if (i === burndownData.labels.length - 1) {
                return sprint.velocity;
            }
            return sprint.velocity / 9 * i;
        }).reverse();

        var velocityRemaining = sprint.velocity;
        var graphableBurndown = [];

        for (var x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };

        var data = burndownData;
        data.datasets[0].data = graphableBurndown;
        data.datasets[1].data = idealBurndown;

        var chartObj = {
            type: "line",
            options: chartOptions,
            data: data,
            velocity: sprint.velocity,
            name: sprint.name,
            burndown: _.sum(sprint.burndown),
            remaining: sprint.velocity - _.sum(sprint.burndown),
            needed: $filter('number')(sprint.velocity / sprint.duration, 1)
        };

        return chartObj;
    };

    function getCurrentChart() {
        var deferred = $q.defer();

        getSprints(function (sprints) {
            var current = sprints.$keyAt(sprints.length - 1);
            var currentNumber = current.split("s")[1];
            var currentSprint = $firebaseObject(ref.child('sprints/' + current));
            currentSprint.$watch(function (e) {
                $rootScope.$broadcast('sprint:update');
                deferred.resolve(buildBurnDownChart(currentSprint));
            });
        });

        return deferred.promise;
    }

    function getSprintChart(sprintNumber) {
        var deferred = $q.defer();

        getSprints(function (sprints) {
            var sprint = $firebaseObject(ref.child('sprints/s' + sprintNumber));

            sprint.$watch(function (e) {
                $rootScope.$broadcast('sprint:update');
                deferred.resolve(buildBurnDownChart(sprint));
            });
        });

        return deferred.promise;
    }

    return {
        getSprints: getSprints,
        getOverviewChart: getOverviewChart,
        getCurrentChart: getCurrentChart,
        getSprintChart: getSprintChart
    };
});
"use strict";

app.factory('UtilityService', function () {
    function pad(n) {
        return n < 10 ? "0" + n : n;
    };

    function sum(items) {
        var i = 0;
        for (var x in items) {
            i += items[x];
        }return i;
    };

    return {
        pad: pad,
        sum: sum
    };
});
'use strict';

app.component('app', {
    transclude: true,
    controller: function controller($location, $firebaseAuth, SprintService) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.auth = auth;
        if (!auth.$getAuth()) $location.path('/signin');

        ctrl.navOpen = true;
        ctrl.signOut = function () {
            ctrl.auth.$signOut();
            $location.path('/signin');
        };
    },
    templateUrl: templatePath + '/app.html'
});
'use strict';

app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller: function controller(BacklogService) {
        var ctrl = this;
        ctrl.state = {
            New: 0,
            Approved: 1,
            Done: 3,
            Removed: -1
        };

        ctrl.open = true;

        console.log(BacklogService);
        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

        ctrl.addBI = function () {
            ctrl.BiItems.push({ name: ctrl.newBIname, points: 2, state: 'approved' });
        };

        ctrl.filterState;
        ctrl.filterStates = function (x) {
            if (x == ctrl.filterState) {
                ctrl.filterState = "";
            } else {
                ctrl.filterState = x;
            }
        };

        ctrl.itemsToAdd = [{
            name: '',
            points: '',
            state: ''
        }];

        ctrl.add = function (itemToAdd) {

            var index = ctrl.itemsToAdd.indexOf(itemToAdd);

            ctrl.itemsToAdd.splice(index, 1);

            ctrl.BiItems.push(angular.copy(itemToAdd));
        };

        ctrl.addNew = function () {

            ctrl.itemsToAdd.push({
                name: '',
                points: '',
                state: ''
            });
        };
    },
    templateUrl: templatePath + '/backlog.html'
});
'use strict';

app.component('chart', {
    bindings: {
        options: '<',
        data: '<',
        loaded: '<',
        type: '<'
    },
    controller: function controller($element, $scope, $timeout, $location, $rootScope) {
        var ctrl = this;
        var $canvas = $element[0].querySelector("canvas");

        ctrl.chart;

        function init() {
            if (ctrl.chart) ctrl.chart.destroy();

            ctrl.chart = new Chart($canvas, {
                type: ctrl.type,
                data: ctrl.data,
                options: ctrl.options
            });

            window.chart = ctrl.chart;

            if ($location.path() === '/') {
                $canvas.onclick = function (e) {
                    var activePoints = ctrl.chart.getElementsAtEvent(e);
                    if (activePoints && activePoints.length > 1) {
                        (function () {
                            var clickedSprint = activePoints[1]._index + 1;
                            $timeout(function () {
                                return $location.path('/sprint/' + clickedSprint);
                            });
                        })();
                    }
                };
            }
        }

        $scope.$watch(function () {
            return ctrl.loaded;
        }, function (loaded) {
            if (!loaded) return;
            init();
        });

        $rootScope.$on('sprint:update', function () {
            $timeout(function () {
                return ctrl.chart.update();
            });
        });
    },
    template: '<canvas></canvas>'
});
'use strict';

app.component('footer', {
    bindings: {
        sprint: '<'
    },
    controller: function controller() {
        var ctrl = this;

        ctrl.statOpen = false;
    },
    templateUrl: templatePath + '/footer.html'
});
'use strict';

app.component('sideNav', {
    bindings: {
        user: '<',
        open: '<',
        onSignOut: '&'
    },
    controller: function controller() {
        var ctrl = this;
        ctrl.open = true;
    },
    templateUrl: templatePath + '/sideNav.html'
});
'use strict';

app.component('signin', {
    controller: function controller($firebaseAuth, $location) {
        var ctrl = this;

        ctrl.signIn = function (name, email) {
            $firebaseAuth().$signInWithEmailAndPassword(name, email).then(function (data) {
                $location.path('/');
            });
        };
    },
    templateUrl: templatePath + '/signin.html'
});
'use strict';

app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        chart: '='
    },
    controller: function controller($firebaseAuth) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.loaded = false;
        ctrl.$onInit = function () {
            return ctrl.loaded = true;
        };
    },
    templateUrl: templatePath + '/sprints.html'
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlBhcnRpY2xlLmpzIiwic2VydmljZXMvQmFja2xvZ1NlcnZpY2UuanMiLCJzZXJ2aWNlcy9TcHJpbnRTZXJ2aWNlLmpzIiwic2VydmljZXMvVXRpbGl0eVNlcnZpY2UuanMiLCJjb21wb25lbnRzL2FwcC9hcHAuanMiLCJjb21wb25lbnRzL2JhY2tsb2cvYmFja2xvZy5qcyIsImNvbXBvbmVudHMvY2hhcnQvY2hhcnQuanMiLCJjb21wb25lbnRzL2Zvb3Rlci9mb290ZXIuanMiLCJjb21wb25lbnRzL3NpZGVOYXYvc2lkZU5hdi5qcyIsImNvbXBvbmVudHMvc2lnbmluL3NpZ25pbi5qcyIsImNvbXBvbmVudHMvc3ByaW50cy9zcHJpbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxlQUFlLElBQUksU0FBUyxFQUFFO0FBQ2hDLGFBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7Q0FDOUQ7O0FBRUQsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDaEcsSUFBTSxZQUFZLEdBQUcseUJBQXlCLENBQUM7O0FBRS9DLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxNQUFNLEVBQUU7O0FBRWxELFVBQU0sQ0FBQyxPQUFPLEdBQUcsQ0FDYixFQUFDLElBQUksRUFBRSxhQUFhLEVBQWdCLE1BQU0sRUFBRSxDQUFDLEVBQU8sS0FBSyxFQUFFLFVBQVUsRUFBQyxFQUN0RSxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFPLEtBQUssRUFBRSxNQUFNLEVBQUMsRUFDbEUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFrQixNQUFNLEVBQUUsRUFBRSxFQUFNLEtBQUssRUFBRSxRQUFRLEVBQUMsRUFDcEUs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QUksRUFBRSxLQUFLLEVBQUk7QUFDekIseUJBQWEsRUFBRSxDQUFDLDJCQUEyQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDbEUseUJBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdEIsQ0FBQyxDQUFDO1NBQ04sQ0FBQTtLQUNKO0FBQ0QsZUFBVyxFQUFLLFlBQVksaUJBQWM7Q0FDN0MsQ0FBQyxDQUFDOzs7QUNYSCxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtBQUNyQixZQUFRLEVBQUU7QUFDTixhQUFLLEVBQUUsR0FBRztBQUNWLGlCQUFTLEVBQUUsR0FBRztBQUNkLGFBQUssRUFBRSxHQUFHO0tBQ2I7QUFDRCxjQUFVLEVBQUEsb0JBQUMsYUFBYSxFQUFFO0FBQ3RCLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixZQUFJLElBQUksR0FBRyxhQUFhLEVBQUUsQ0FBQzs7QUFFM0IsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBSSxDQUFDLE9BQU8sR0FBRTttQkFBSyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUk7U0FBQSxDQUFDO0tBQ3pDO0FBQ0QsZUFBVyxFQUFLLFlBQVksa0JBQWU7Q0FDOUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCdzY3JpcHRzL3NlcnZpY2V3b3JrZXIuanMnKTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgJ25nLXNvcnRhYmxlJ10pO1xyXG5jb25zdCB0ZW1wbGF0ZVBhdGggPSAnLi9Bc3NldHMvZGlzdC9UZW1wbGF0ZXMnO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJCYWNrbG9nQ29udHJvbGxlclwiLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcblxyXG4gICAgJHNjb3BlLkJpSXRlbXMgPSBbXHJcbiAgICAgICAge25hbWU6ICdEcmVtcGVsdnJpaicsICAgICAgICAgICAgICAgcG9pbnRzOiAyLCAgICAgIHN0YXRlOiAnYXBwcm92ZWQnfSxcclxuICAgICAgICB7bmFtZTogJ0ZyZWV3YWxsIGZpbHRlciB1cGRhdGVuJywgICBwb2ludHM6IDUsICAgICAgc3RhdGU6ICdkb25lJ30sXHJcbiAgICAgICAge25hbWU6ICdTcHJpbnQgMDUnLCAgICAgICAgICAgICAgICAgcG9pbnRzOiA2NSwgICAgIHN0YXRlOiAnc3ByaW50J30sXHJcbiAgICAgICAge25hbWU6ICdJY29uZW4gdXBkYXRlbicsICAgICAgICAgICAgcG9pbnRzOiA4LCAgICAgIHN0YXRlOiAnYXBwcm92ZWQnfSxcclxuICAgICAgICB7bmFtZTogJ01vb2kgc2Nob29uIHBvc3RlcnMnLCAgICAgICBwb2ludHM6IDEzLCAgICAgc3RhdGU6ICduZXcnfSxcclxuICAgICAgICB7bmFtZTogJ1JvdmEgY29ycG9yYXRlIGh1aXNzdGlqbCcsICBwb2ludHM6IDUsICAgICAgc3RhdGU6ICduZXcnfVxyXG4gICAgXTtcclxuXHJcbiAgICAkc2NvcGUuYWRkQkkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuQmlJdGVtcy5wdXNoKHtuYW1lOiAkc2NvcGUubmV3QkluYW1lLHBvaW50czogMixzdGF0ZTogJ2FwcHJvdmVkJ30pXHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmZpbHRlclN0YXRlO1xyXG4gICAgJHNjb3BlLmZpbHRlclN0YXRlcyA9IGZ1bmN0aW9uKHgpIHtcclxuICAgICAgICBpZih4ID09ICRzY29wZS5maWx0ZXJTdGF0ZSl7XHJcbiAgICAgICAgICAgICRzY29wZS5maWx0ZXJTdGF0ZSA9IFwiXCI7IFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlsdGVyU3RhdGUgPSB4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuaXRlbXNUb0FkZCA9IFt7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgcG9pbnRzOiAnJyxcclxuICAgICAgICBzdGF0ZTogJydcclxuICAgIH1dO1xyXG5cclxuICAgICRzY29wZS5hZGQgPSBmdW5jdGlvbihpdGVtVG9BZGQpIHtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLml0ZW1zVG9BZGQuaW5kZXhPZihpdGVtVG9BZGQpO1xyXG5cclxuICAgICAgICAkc2NvcGUuaXRlbXNUb0FkZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cclxuICAgICAgICAkc2NvcGUuQmlJdGVtcy5wdXNoKGFuZ3VsYXIuY29weShpdGVtVG9BZGQpKVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5hZGROZXcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLml0ZW1zVG9BZGQucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICBwb2ludHM6ICcnLFxyXG4gICAgICAgICAgICBzdGF0ZTogJydcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxufSk7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXHJcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXHJcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2Vpby5jb21cIixcclxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxyXG4gICAgfTtcclxuXHJcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XHJcblxyXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xyXG4gICAgICAgIH0pLlxyXG4gICAgICAgIHdoZW4oJy8nLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSkuXHJcbiAgICAgICAgd2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KS5cclxuICAgICAgICB3aGVuKCcvc3ByaW50LzpzcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KS5cclxuICAgICAgICB3aGVuKCcvYmFja2xvZycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+PC9iYWNrbG9nPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KS5cclxuICAgICAgICBvdGhlcndpc2UoJy8nKTsgXHJcbn0pOyIsInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcclxuICBcInBhcnRpY2xlc1wiOiB7XHJcbiAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMTAsXHJcbiAgICAgIFwiZGVuc2l0eVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImNvbG9yXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxyXG4gICAgfSxcclxuICAgIFwic2hhcGVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcclxuICAgICAgXCJzdHJva2VcIjoge1xyXG4gICAgICAgIFwid2lkdGhcIjogMCxcclxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicG9seWdvblwiOiB7XHJcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaW1hZ2VcIjoge1xyXG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcclxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcclxuICAgICAgICBcImhlaWdodFwiOiAxMDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwib3BhY2l0eVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMC4xLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEsXHJcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzaXplXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAzLFxyXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMTAsXHJcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXHJcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxyXG4gICAgICBcIndpZHRoXCI6IDFcclxuICAgIH0sXHJcbiAgICBcIm1vdmVcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcInNwZWVkXCI6IDIsXHJcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcclxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxyXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcclxuICAgICAgXCJhdHRyYWN0XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxyXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XHJcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxyXG4gICAgXCJldmVudHNcIjoge1xyXG4gICAgICBcIm9uaG92ZXJcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwib25jbGlja1wiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcclxuICAgICAgfSxcclxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxyXG4gICAgfSxcclxuICAgIFwibW9kZXNcIjoge1xyXG4gICAgICBcImdyYWJcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxyXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImJ1YmJsZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXHJcbiAgICAgICAgXCJzaXplXCI6IDQwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcclxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcclxuICAgICAgfSxcclxuICAgICAgXCJyZXB1bHNlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxyXG4gICAgICB9LFxyXG4gICAgICBcInB1c2hcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcclxuICAgICAgfSxcclxuICAgICAgXCJyZW1vdmVcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcclxufSk7IiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XHJcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgaWYgKCFzcHJpbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nKTtcclxuICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0QmFja2xvZ1xyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ1NwcmludFNlcnZpY2UnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcclxuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XHJcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuICAgIGxldCBsaW5lQ29sb3IgPSAnI0VCNTFEOCc7XHJcbiAgICBsZXQgYmFyQ29sb3IgPSAnIzVGRkFGQyc7XHJcbiAgICBsZXQgY2hhcnRUeXBlID0gXCJsaW5lXCI7XHJcblxyXG4gICAgbGV0IGNoYXJ0T3B0aW9ucyA9IHtcclxuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxyXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxyXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbGVtZW50czoge1xyXG4gICAgICAgICAgICBsaW5lOiB7XHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxyXG4gICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgeEF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxyXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTFcIixcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcclxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTJcIixcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xyXG4gICAgICAgIGxhYmVsczogW10sIFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkVzdGltYXRlZFwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2JhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGJ1cm5kb3duRGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCJdLFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkdlaGFhbGRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXHJcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XHJcbiAgICAgICAgbGV0IHNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKS5saW1pdFRvTGFzdCgxNSkpO1xyXG4gICAgICAgIHNwcmludHMuJGxvYWRlZChjYiwgKCk9PiAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldE92ZXJ2aWV3Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzID0+IHtcclxuXHJcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTsgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgc3ByaW50cy4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpOyAgICBcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcclxuICAgICAgICAgICAgICAgIH0pOyAgICBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cykge1xyXG5cclxuICAgICAgICBsZXQgbGFiZWxzO1xyXG4gICAgICAgIGxldCBlc3RpbWF0ZWQ7XHJcbiAgICAgICAgbGV0IGJ1cm5lZDtcclxuXHJcbiAgICAgICAgbGFiZWxzID0gc3ByaW50cy5tYXAoZCA9PiBgU3ByaW50ICR7Xy5wYWQoZC5vcmRlcil9YCk7XHJcbiAgICAgICAgZXN0aW1hdGVkID0gc3ByaW50cy5tYXAoZCA9PiBkLnZlbG9jaXR5KTtcclxuICAgICAgICBidXJuZWQgPSBzcHJpbnRzLm1hcChkID0+IHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciB4IGluIGQuYnVybmRvd24pIGkgPSBpICsgZC5idXJuZG93blt4XTtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gb3ZlcnZpZXdEYXRhO1xyXG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGJ1cm5lZDtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBlc3RpbWF0ZWQ7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gc3ByaW50c1tzcHJpbnRzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYXJ0T3B0aW9ucyxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgdmVsb2NpdHk6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHksXHJcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgcmVtYWluaW5nOiBjdXJyZW50U3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoY3VycmVudFNwcmludC52ZWxvY2l0eSAvIGN1cnJlbnRTcHJpbnQuZHVyYXRpb24sIDEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjaGFydE9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkge1xyXG4gICAgICAgIGxldCBpZGVhbEJ1cm5kb3duID0gYnVybmRvd25EYXRhLmxhYmVscy5tYXAoKGQsIGkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IGJ1cm5kb3duRGF0YS5sYWJlbHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKHNwcmludC52ZWxvY2l0eSAvIDkpICogaTtcclxuICAgICAgICB9KS5yZXZlcnNlKCk7XHJcblxyXG4gICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IHNwcmludC52ZWxvY2l0eVxyXG4gICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4IGluIHNwcmludC5idXJuZG93bikge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBzcHJpbnQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gYnVybmRvd25EYXRhO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XHJcblxyXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHsgXHJcbiAgICAgICAgICAgIHR5cGU6IFwibGluZVwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFydE9wdGlvbnMsIFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhcnRPYmo7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFydCgpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc3ByaW50cy4ka2V5QXQoc3ByaW50cy5sZW5ndGgtMSk7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gY3VycmVudC5zcGxpdChcInNcIilbMV07XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy8ke2N1cnJlbnR9YCkpO1xyXG4gICAgICAgICAgICBjdXJyZW50U3ByaW50LiR3YXRjaChlPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChjdXJyZW50U3ByaW50KSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludENoYXJ0KHNwcmludE51bWJlcikge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcclxuICAgICAgICAgICAgbGV0IHNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvcyR7c3ByaW50TnVtYmVyfWApKTtcclxuXHJcbiAgICAgICAgICAgIHNwcmludC4kd2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFNwcmludHMsXHJcbiAgICAgICAgZ2V0T3ZlcnZpZXdDaGFydCxcclxuICAgICAgICBnZXRDdXJyZW50Q2hhcnQsXHJcbiAgICAgICAgZ2V0U3ByaW50Q2hhcnRcclxuICAgIH1cclxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiBwYWQobikge1xyXG4gICAgICAgIHJldHVybiAobiA8IDEwKSA/IChcIjBcIiArIG4pIDogbjtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gc3VtKGl0ZW1zKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHggaW4gaXRlbXMpIGkgKz0gaXRlbXNbeF07XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcGFkLFxyXG4gICAgICAgIHN1bVxyXG4gICAgfVxyXG59KSIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IHRydWU7XHJcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcclxuICAgICAgICAgICAgY3RybC5hdXRoLiRzaWduT3V0KCk7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2FwcC5odG1sYCBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBjdHJsLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBOZXc6IDAsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiAxLFxyXG4gICAgICAgICAgICBEb25lOiAzLFxyXG4gICAgICAgICAgICBSZW1vdmVkOiAtMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XHJcblxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhCYWNrbG9nU2VydmljZSkgICAgICAgIFxyXG4gICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgIGN0cmwuYWRkQkkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBjdHJsLkJpSXRlbXMucHVzaCh7bmFtZTogY3RybC5uZXdCSW5hbWUscG9pbnRzOiAyLHN0YXRlOiAnYXBwcm92ZWQnfSlcclxuICAgIH1cclxuXHJcbiAgICBjdHJsLmZpbHRlclN0YXRlO1xyXG4gICAgY3RybC5maWx0ZXJTdGF0ZXMgPSBmdW5jdGlvbih4KSB7XHJcbiAgICAgICAgaWYoeCA9PSBjdHJsLmZpbHRlclN0YXRlKXtcclxuICAgICAgICAgICAgY3RybC5maWx0ZXJTdGF0ZSA9IFwiXCI7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGN0cmwuZmlsdGVyU3RhdGUgPSB4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjdHJsLml0ZW1zVG9BZGQgPSBbe1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIHBvaW50czogJycsXHJcbiAgICAgICAgc3RhdGU6ICcnXHJcbiAgICB9XTtcclxuXHJcbiAgICBjdHJsLmFkZCA9IGZ1bmN0aW9uKGl0ZW1Ub0FkZCkge1xyXG5cclxuICAgICAgICB2YXIgaW5kZXggPSBjdHJsLml0ZW1zVG9BZGQuaW5kZXhPZihpdGVtVG9BZGQpO1xyXG5cclxuICAgICAgICBjdHJsLml0ZW1zVG9BZGQuc3BsaWNlKGluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgY3RybC5CaUl0ZW1zLnB1c2goYW5ndWxhci5jb3B5KGl0ZW1Ub0FkZCkpXHJcbiAgICB9XHJcblxyXG4gICAgY3RybC5hZGROZXcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgY3RybC5pdGVtc1RvQWRkLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgcG9pbnRzOiAnJyxcclxuICAgICAgICAgICAgc3RhdGU6ICcnXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2cuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnY2hhcnQnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG9wdGlvbnM6ICc8JyxcclxuICAgICAgICBkYXRhOiAnPCcsXHJcbiAgICAgICAgbG9hZGVkOiAnPCcsXHJcbiAgICAgICAgdHlwZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCAkY2FudmFzID0gJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcihcImNhbnZhc1wiKTtcclxuXHJcbiAgICAgICAgY3RybC5jaGFydDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgaWYoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPWU9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVQb2ludHMgJiYgYWN0aXZlUG9pbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBhY3RpdmVQb2ludHNbMV0uX2luZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCk9PiAkbG9jYXRpb24ucGF0aChgL3NwcmludC8ke2NsaWNrZWRTcHJpbnR9YCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgoKT0+IGN0cmwubG9hZGVkLCBsb2FkZWQ9PiB7XHJcbiAgICAgICAgICAgIGlmKCFsb2FkZWQpIHJldHVybjtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCdzcHJpbnQ6dXBkYXRlJywgKCk9PiB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpPT5jdHJsLmNoYXJ0LnVwZGF0ZSgpKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBgPGNhbnZhcz48L2NhbnZhcz5gIFxyXG59KSAiLCJhcHAuY29tcG9uZW50KCdmb290ZXInLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHNwcmludDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnc2lkZU5hdicsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNlcjogJzwnLFxyXG4gICAgICAgIG9wZW46ICc8JyxcclxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBjdHJsLm9wZW4gPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnc2lnbmluJywge1xyXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCAkbG9jYXRpb24pIHsgXHJcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc2lnbkluID0obmFtZSwgZW1haWwpPT4ge1xyXG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IFxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZ25pbi5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxyXG4gICAgICAgIGNoYXJ0OiAnPSdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0oKT0+IGN0cmwubG9hZGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRzLmh0bWxgIFxyXG59KTsgICJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
