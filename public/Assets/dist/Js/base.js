'use strict';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('scripts/serviceworker.js');
}

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', 'ng-sortable']);
var templatePath = './Assets/dist/Templates';

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
        template: '\n                <app>\n                    <backlog title="\'Backlog\'" back-title="\'Overview\'"></backlog>\n                </app>'
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
    var backlog = undefined;

    function getBacklog(sprint) {
        return $q(function (resolve, reject) {
            if (!sprint) {
                backlog = $firebaseArray(ref.child("backlog").orderByChild('order'));
                resolve(backlog);
            }
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
        getBacklog: getBacklog,
        save: save,
        add: add,
        remove: remove
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

        ctrl.navOpen = false;
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
    controller: function controller(BacklogService, $firebaseAuth) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.state = {
            New: 0,
            Approved: 1,
            Done: 3,
            Removed: -1
        };

        ctrl.filter = {};
        ctrl.open = true;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

        ctrl.selectItem = function (item) {
            ctrl.selectedItem = item;
        };

        ctrl.addItem = function () {
            var newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: 0,
                state: 0
            };

            BacklogService.add(newItem).then(function (data) {
                ctrl.selectItem(ctrl.BiItems.$getRecord(data.key));
            });
        };

        ctrl.deleteItem = function (item) {
            BacklogService.remove(item);
        };

        ctrl.saveItem = function (item) {
            BacklogService.save(item);
        };

        ctrl.filterItems = function (x) {
            if (x == ctrl.filter.state) {
                ctrl.filter.state = null;
            } else {
                ctrl.filter.state = x;
            }
        };
    },
    templateUrl: templatePath + '/backlog.html'
});
'use strict';

app.component('backlogItem', {
    bindings: {
        item: '<',
        onClick: '&'
    },
    controller: function controller(BacklogService, $firebaseAuth) {
        var ctrl = this;
    },
    templateUrl: templatePath + '/backlogItem.html'
});
"use strict";

app.component('backlogForm', {
    bindings: {
        item: "<",
        onAdd: "&",
        onDelete: "&",
        onSave: "&"
    },
    controller: function controller(BacklogService, $firebaseAuth) {
        var ctrl = this;
    },
    templateUrl: templatePath + "/backlogForm.html"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIlBhcnRpY2xlLmpzIiwic2VydmljZXMvQmFja2xvZ1NlcnZpY2UuanMiLCJzZXJ2aWNlcy9TcHJpbnRTZXJ2aWNlLmpzIiwic2VydmljZXMvVXRpbGl0eVNlcnZpY2UuanMiLCJjb21wb25lbnRzL2FwcC9hcHAuanMiLCJjb21wb25lbnRzL2JhY2tsb2cvYmFja2xvZy5qcyIsImNvbXBvbmVudHMvYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjb21wb25lbnRzL2JhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiY29tcG9uZW50cy9mb290ZXIvZm9vdGVyLmpzIiwiY29tcG9uZW50cy9jaGFydC9jaGFydC5qcyIsImNvbXBvbmVudHMvc2lkZU5hdi9zaWRlTmF2LmpzIiwiY29tcG9uZW50cy9zcHJpbnRzL3NwcmludHMuanMiLCJjb21wb25lbnRzL3NpZ25pbi9zaWduaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLGVBQWUsSUFBSSxTQUFTLEVBQUU7QUFDaEMsYUFBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQztDQUM5RDs7QUFFRCxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNoRyxJQUFNLFlBQVksR0FBRyx5QkFBeUIsQ0FBQzs7QUFFL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLGlCQUFpQixFQUFFLGNBQWMsRUFBRTtBQUNwRCxRQUFNLE1BQU0sR0FBRztBQUNYLGNBQU0sRUFBRSx5Q0FBeUM7QUFDakQsa0JBQVUsRUFBRSw2Q0FBNkM7QUFDekQsbUJBQVcsRUFBRSxvREFBb0Q7QUFDakUscUJBQWEsRUFBRSx5Q0FBeUM7S0FDM0QsQ0FBQzs7QUFFRixxQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7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QUFjO0NBQzdDLENBQUMsQ0FBQyIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcclxuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc2NyaXB0cy9zZXJ2aWNld29ya2VyLmpzJyk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiYWZ0ZXJidXJuZXJBcHBcIiwgW1wiZmlyZWJhc2VcIiwgJ25nVG91Y2gnLCAnbmdSb3V0ZScsICduZy1zb3J0YWJsZSddKTtcclxuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcclxuICAgICAgICBhdXRoRG9tYWluOiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWFwcC5jb21cIixcclxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxyXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXHJcbiAgICB9O1xyXG5cclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuXHJcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblxyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL3NpZ25pbicsIHsgXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNpZ25pbj48L3NpZ25pbj4nXHJcbiAgICAgICAgfSkuXHJcbiAgICAgICAgd2hlbignLycsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldE92ZXJ2aWV3Q2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ1ZlbG9jaXR5J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KS5cclxuICAgICAgICB3aGVuKCcvY3VycmVudC1zcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pLlxyXG4gICAgICAgIHdoZW4oJy9zcHJpbnQvOnNwcmludCcsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHJvdXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRyb3V0ZS5jdXJyZW50LnBhcmFtcy5zcHJpbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pLlxyXG4gICAgICAgIHdoZW4oJy9iYWNrbG9nJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8YmFja2xvZyB0aXRsZT1cIidCYWNrbG9nJ1wiIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+PC9iYWNrbG9nPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KS5cclxuICAgICAgICBvdGhlcndpc2UoJy8nKTsgXHJcbn0pOyIsInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcclxuICBcInBhcnRpY2xlc1wiOiB7XHJcbiAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMTAsXHJcbiAgICAgIFwiZGVuc2l0eVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImNvbG9yXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxyXG4gICAgfSxcclxuICAgIFwic2hhcGVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcclxuICAgICAgXCJzdHJva2VcIjoge1xyXG4gICAgICAgIFwid2lkdGhcIjogMCxcclxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicG9seWdvblwiOiB7XHJcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaW1hZ2VcIjoge1xyXG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcclxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcclxuICAgICAgICBcImhlaWdodFwiOiAxMDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwib3BhY2l0eVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMC4xLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEsXHJcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzaXplXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAzLFxyXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMTAsXHJcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXHJcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxyXG4gICAgICBcIndpZHRoXCI6IDFcclxuICAgIH0sXHJcbiAgICBcIm1vdmVcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcInNwZWVkXCI6IDIsXHJcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcclxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxyXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcclxuICAgICAgXCJhdHRyYWN0XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxyXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XHJcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxyXG4gICAgXCJldmVudHNcIjoge1xyXG4gICAgICBcIm9uaG92ZXJcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwib25jbGlja1wiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcclxuICAgICAgfSxcclxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxyXG4gICAgfSxcclxuICAgIFwibW9kZXNcIjoge1xyXG4gICAgICBcImdyYWJcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxyXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImJ1YmJsZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXHJcbiAgICAgICAgXCJzaXplXCI6IDQwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcclxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcclxuICAgICAgfSxcclxuICAgICAgXCJyZXB1bHNlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxyXG4gICAgICB9LFxyXG4gICAgICBcInB1c2hcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcclxuICAgICAgfSxcclxuICAgICAgXCJyZW1vdmVcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcclxufSk7IiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGJhY2tsb2c7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XHJcbiAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEJhY2tsb2csXHJcbiAgICAgICAgc2F2ZSxcclxuICAgICAgICBhZGQsXHJcbiAgICAgICAgcmVtb3ZlXHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnU3ByaW50U2VydmljZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGxpbmVDb2xvciA9ICcjRUI1MUQ4JztcclxuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcclxuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcclxuXHJcbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xyXG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVsZW1lbnRzOiB7XHJcbiAgICAgICAgICAgIGxpbmU6IHtcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMlwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBvdmVydmlld0RhdGEgPSB7XHJcbiAgICAgICAgbGFiZWxzOiBbXSwgXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiRXN0aW1hdGVkXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNUNFNUU3JyxcclxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNUNFNUU3JyxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjaGlldmVkXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgYnVybmRvd25EYXRhID0ge1xyXG4gICAgICAgIGxhYmVsczogW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIl0sXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IpIHtcclxuICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDE1KSk7XHJcbiAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0T3ZlcnZpZXdDaGFydCgpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHMgPT4ge1xyXG5cclxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpOyAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XHJcblxyXG4gICAgICAgIGxldCBsYWJlbHM7XHJcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcclxuICAgICAgICBsZXQgYnVybmVkO1xyXG5cclxuICAgICAgICBsYWJlbHMgPSBzcHJpbnRzLm1hcChkID0+IGBTcHJpbnQgJHtfLnBhZChkLm9yZGVyKX1gKTtcclxuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xyXG4gICAgICAgIGJ1cm5lZCA9IHNwcmludHMubWFwKGQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gYnVybmVkO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGVzdGltYXRlZDtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSBzcHJpbnRzW3NwcmludHMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJiYXJcIixcclxuICAgICAgICAgICAgb3B0aW9uczogY2hhcnRPcHRpb25zLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICByZW1haW5pbmc6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLSBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XHJcbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBidXJuZG93bkRhdGEubGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gYnVybmRvd25EYXRhLmxhYmVscy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoc3ByaW50LnZlbG9jaXR5IC8gOSkgKiBpO1xyXG4gICAgICAgIH0pLnJldmVyc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XHJcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcclxuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0geyBcclxuICAgICAgICAgICAgdHlwZTogXCJsaW5lXCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYXJ0T3B0aW9ucywgXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBzcHJpbnQudmVsb2NpdHksXHJcbiAgICAgICAgICAgIG5hbWU6IHNwcmludC5uYW1lLFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgcmVtYWluaW5nOiBzcHJpbnQudmVsb2NpdHkgLSBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbiwgMSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzcHJpbnRzLiRrZXlBdChzcHJpbnRzLmxlbmd0aC0xKTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnROdW1iZXIgPSBjdXJyZW50LnNwbGl0KFwic1wiKVsxXTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTcHJpbnQuJHdhdGNoKGU9PiB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50Q2hhcnQoc3ByaW50TnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgc3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy9zJHtzcHJpbnROdW1iZXJ9YCkpO1xyXG5cclxuICAgICAgICAgICAgc3ByaW50LiR3YXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U3ByaW50cyxcclxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxyXG4gICAgICAgIGdldEN1cnJlbnRDaGFydCxcclxuICAgICAgICBnZXRTcHJpbnRDaGFydFxyXG4gICAgfVxyXG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XHJcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwYWQsXHJcbiAgICAgICAgc3VtXHJcbiAgICB9XHJcbn0pIiwiYXBwLmNvbXBvbmVudCgnYXBwJywge1xyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXIoJGxvY2F0aW9uLCAkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XHJcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcclxuXHJcbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcclxuICAgICAgICAgICAgY3RybC5hdXRoLiRzaWduT3V0KCk7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2FwcC5odG1sYCBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuXHJcbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgTmV3OiAwLFxyXG4gICAgICAgICAgICBBcHByb3ZlZDogMSxcclxuICAgICAgICAgICAgRG9uZTogMyxcclxuICAgICAgICAgICAgUmVtb3ZlZDogLTFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xyXG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gaXRlbTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuYWRkSXRlbSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXHJcbiAgICAgICAgICAgICAgICBlZmZvcnQ6IDAsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcclxuICAgICAgICAgICAgICAgIG9yZGVyOiAwLFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IDBcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuYWRkKG5ld0l0ZW0pLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXMuJGdldFJlY29yZChkYXRhLmtleSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnJlbW92ZShpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc2F2ZUl0ZW0gPSAoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgICAgIGlmICh4ID09IGN0cmwuZmlsdGVyLnN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZpbHRlci5zdGF0ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtOiAnPCcsXHJcbiAgICAgICAgb25DbGljazogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nSXRlbS5odG1sYCBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0Zvcm0nLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGl0ZW06IFwiPFwiLFxyXG4gICAgICAgIG9uQWRkOiBcIiZcIixcclxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXHJcbiAgICAgICAgb25TYXZlOiBcIiZcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0Zvcm0uaHRtbGAgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdmb290ZXInLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHNwcmludDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnY2hhcnQnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG9wdGlvbnM6ICc8JyxcclxuICAgICAgICBkYXRhOiAnPCcsXHJcbiAgICAgICAgbG9hZGVkOiAnPCcsXHJcbiAgICAgICAgdHlwZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCAkY2FudmFzID0gJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcihcImNhbnZhc1wiKTtcclxuXHJcbiAgICAgICAgY3RybC5jaGFydDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgaWYoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPWU9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVQb2ludHMgJiYgYWN0aXZlUG9pbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBhY3RpdmVQb2ludHNbMV0uX2luZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCk9PiAkbG9jYXRpb24ucGF0aChgL3NwcmludC8ke2NsaWNrZWRTcHJpbnR9YCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgoKT0+IGN0cmwubG9hZGVkLCBsb2FkZWQ9PiB7XHJcbiAgICAgICAgICAgIGlmKCFsb2FkZWQpIHJldHVybjtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCdzcHJpbnQ6dXBkYXRlJywgKCk9PiB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpPT5jdHJsLmNoYXJ0LnVwZGF0ZSgpKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBgPGNhbnZhcz48L2NhbnZhcz5gIFxyXG59KSAiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB1c2VyOiAnPCcsXHJcbiAgICAgICAgb3BlbjogJzwnLFxyXG4gICAgICAgIG9uU2lnbk91dDogJyYnLFxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lkZU5hdi5odG1sYCBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxyXG4gICAgICAgIGNoYXJ0OiAnPSdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0oKT0+IGN0cmwubG9hZGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRzLmh0bWxgIFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcclxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgJGxvY2F0aW9uKSB7IFxyXG4gICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnNpZ25JbiA9KG5hbWUsIGVtYWlsKT0+IHtcclxuICAgICAgICAgICAgJGZpcmViYXNlQXV0aCgpLiRzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChuYW1lLCBlbWFpbCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWduaW4uaHRtbGBcclxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
