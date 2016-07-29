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
        template: '\n                <app>\n                    <backlog title="\'Backlog\'"\n                             back-title="\'Overview\'">\n                    </backlog>\n                </app>'
    }).otherwise('/');
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
        ctrl.filterState;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

        ctrl.addBI = function () {
            ctrl.BiItems.push({
                name: ctrl.newBIname,
                points: 2,
                state: 'approved'
            });
        };

        ctrl.filterStates = function (x) {
            ctrl.filterState = x == ctrl.filterState ? "" : x;
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

        ctrl.sortConfig = {
            animation: 150,
            onSort: function onSort(e) {
                console.log(e);
            }
        };
    },
    templateUrl: templatePath + '/backlog.html'
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
        ctrl.open = false;
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

    controller: function controller($firebaseAuth, SprintService, $scope) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjaGFydC9jaGFydC5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdBQUc7QUFDWixjQUFRLEVBQUUsS0FBSztBQUNmLFlBQU0sRUFBRTtBQUNOLGdCQUFRLEVBQUUsS0FBSztBQUNmLGVBQU8sRUFBRSxDQUFDO0FBQ1YscUJBQWEsRUFBRSxJQUFJO0FBQ25CLGNBQU0sRUFBRSxLQUFLO09BQ2Q7S0FDRjtBQUNE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aWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcbiAgXCJwYXJ0aWNsZXNcIjoge1xuICAgIFwibnVtYmVyXCI6IHtcbiAgICAgIFwidmFsdWVcIjogMTAsXG4gICAgICBcImRlbnNpdHlcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcImNvbG9yXCI6IHtcbiAgICAgIFwidmFsdWVcIjogXCIjZmZmZmZmXCJcbiAgICB9LFxuICAgIFwic2hhcGVcIjoge1xuICAgICAgXCJ0eXBlXCI6IFwiY2lyY2xlXCIsXG4gICAgICBcInN0cm9rZVwiOiB7XG4gICAgICAgIFwid2lkdGhcIjogMCxcbiAgICAgICAgXCJjb2xvclwiOiBcIiMwMDAwMDBcIlxuICAgICAgfSxcbiAgICAgIFwicG9seWdvblwiOiB7XG4gICAgICAgIFwibmJfc2lkZXNcIjogNVxuICAgICAgfSxcbiAgICAgIFwiaW1hZ2VcIjoge1xuICAgICAgICBcInNyY1wiOiBcImltZy9naXRodWIuc3ZnXCIsXG4gICAgICAgIFwid2lkdGhcIjogMTAwLFxuICAgICAgICBcImhlaWdodFwiOiAxMDBcbiAgICAgIH1cbiAgICB9LFxuICAgIFwib3BhY2l0eVwiOiB7XG4gICAgICBcInZhbHVlXCI6IDAuMSxcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJhbmltXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwic3BlZWRcIjogMSxcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxuICAgICAgICBcInN5bmNcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIFwic2l6ZVwiOiB7XG4gICAgICBcInZhbHVlXCI6IDMsXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxuICAgICAgXCJhbmltXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwic3BlZWRcIjogMTAsXG4gICAgICAgIFwic2l6ZV9taW5cIjogMC4xLFxuICAgICAgICBcInN5bmNcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIFwibGluZV9saW5rZWRcIjoge1xuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgIFwiZGlzdGFuY2VcIjogMTUwLFxuICAgICAgXCJjb2xvclwiOiBcIiNmZmZmZmZcIixcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxuICAgICAgXCJ3aWR0aFwiOiAxXG4gICAgfSxcbiAgICBcIm1vdmVcIjoge1xuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgIFwic3BlZWRcIjogMixcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXG4gICAgICBcInN0cmFpZ2h0XCI6IGZhbHNlLFxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxuICAgICAgXCJib3VuY2VcIjogZmFsc2UsXG4gICAgICBcImF0dHJhY3RcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJyb3RhdGVYXCI6IDYwMCxcbiAgICAgICAgXCJyb3RhdGVZXCI6IDEyMDBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XG4gICAgXCJkZXRlY3Rfb25cIjogXCJjYW52YXNcIixcbiAgICBcImV2ZW50c1wiOiB7XG4gICAgICBcIm9uaG92ZXJcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcIm1vZGVcIjogXCJncmFiXCJcbiAgICAgIH0sXG4gICAgICBcIm9uY2xpY2tcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcbiAgICAgIH0sXG4gICAgICBcInJlc2l6ZVwiOiB0cnVlXG4gICAgfSxcbiAgICBcIm1vZGVzXCI6IHtcbiAgICAgIFwiZ3JhYlwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxuICAgICAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgICAgICBcIm9wYWNpdHlcIjogLjFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiYnViYmxlXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXG4gICAgICAgIFwic2l6ZVwiOiA0MCxcbiAgICAgICAgXCJkdXJhdGlvblwiOiA1LFxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXG4gICAgICAgIFwic3BlZWRcIjogMzAwXG4gICAgICB9LFxuICAgICAgXCJyZXB1bHNlXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAyMDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogMC40XG4gICAgICB9LFxuICAgICAgXCJwdXNoXCI6IHtcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogM1xuICAgICAgfSxcbiAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogMlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcbn0pOyIsImlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCdzY3JpcHRzL3NlcnZpY2V3b3JrZXIuanMnKTtcbn1cblxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgJ25nLXNvcnRhYmxlJ10pO1xuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyKSB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxuICAgIH07XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7IFxuXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8c2lnbmluPjwvc2lnbmluPidcbiAgICAgICAgfSkgXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9zcHJpbnQvOnNwcmludCcsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRyb3V0ZS5jdXJyZW50LnBhcmFtcy5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9iYWNrbG9nJywge1xuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8YmFja2xvZyB0aXRsZT1cIidCYWNrbG9nJ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvYmFja2xvZz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLCBcbiAgICAgICAgfSkgXG4gICAgICAgIC5vdGhlcndpc2UoJy8nKTsgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnYXBwJywge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG5cbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2FwcC5odG1sYCAgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcbiAgICAgICAgICAgIE5ldzogMCxcbiAgICAgICAgICAgIEFwcHJvdmVkOiAxLFxuICAgICAgICAgICAgRG9uZTogMyxcbiAgICAgICAgICAgIFJlbW92ZWQ6IC0xIFxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XG4gICAgICAgIGN0cmwuZmlsdGVyU3RhdGU7XG5cbiAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN0cmwuYWRkQkkgPSgpPT4ge1xuICAgICAgICAgICAgY3RybC5CaUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IGN0cmwubmV3QkluYW1lLCBcbiAgICAgICAgICAgICAgICBwb2ludHM6IDIsIFxuICAgICAgICAgICAgICAgIHN0YXRlOiAnYXBwcm92ZWQnXG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY3RybC5maWx0ZXJTdGF0ZXMgPXg9PiB7XG4gICAgICAgICAgICBjdHJsLmZpbHRlclN0YXRlID0geCA9PSBjdHJsLmZpbHRlclN0YXRlID8gXCJcIiA6IHg7XG4gICAgICAgIH07IFxuXG4gICAgICAgIGN0cmwuaXRlbXNUb0FkZCA9IFt7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIHBvaW50czogJycsXG4gICAgICAgICAgICBzdGF0ZTogJydcbiAgICAgICAgfV07XG5cbiAgICAgICAgY3RybC5hZGQgPWl0ZW1Ub0FkZD0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuaXRlbXNUb0FkZC5pbmRleE9mKGl0ZW1Ub0FkZCk7XG5cbiAgICAgICAgICAgIGN0cmwuaXRlbXNUb0FkZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgY3RybC5CaUl0ZW1zLnB1c2goYW5ndWxhci5jb3B5KGl0ZW1Ub0FkZCkpXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmFkZE5ldyA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLml0ZW1zVG9BZGQucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgcG9pbnRzOiAnJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJydcbiAgICAgICAgICAgIH0pIFxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbSA9IGl0ZW07XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAwLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAwXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmFkZChuZXdJdGVtKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5yZW1vdmUoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnNhdmVJdGVtID0gKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIGlmICh4ID09IGN0cmwuZmlsdGVyLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIuc3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG5cbiAgICAgICAgY3RybC5zb3J0Q29uZmlnID0ge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXG4gICAgICAgICAgICBvblNvcnQoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2cuaHRtbGBcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0Zvcm0nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbTogXCI8XCIsXG4gICAgICAgIG9uQWRkOiBcIiZcIixcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxuICAgICAgICBvblNhdmU6IFwiJlwiXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgIFxufSk7ICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8JyxcbiAgICAgICAgb25DbGljazogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBvcHRpb25zOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgbG9hZGVkOiAnPCcsXG4gICAgICAgIHR5cGU6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xuXG4gICAgICAgIGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIGlmKGN0cmwuY2hhcnQpIGN0cmwuY2hhcnQuZGVzdHJveSgpO1xuXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBjdHJsLnR5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogY3RybC5kYXRhLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24ucGF0aCgpID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPWU9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVQb2ludHMgPSBjdHJsLmNoYXJ0LmdldEVsZW1lbnRzQXRFdmVudChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBhY3RpdmVQb2ludHNbMV0uX2luZGV4ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xuICAgICAgICAgICAgaWYoIWxvYWRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9KVxuXG4gICAgICAgICRyb290U2NvcGUuJG9uKCdzcHJpbnQ6dXBkYXRlJywgKCk9PiB7XG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcbn0pICIsImFwcC5jb21wb25lbnQoJ2Zvb3RlcicsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnc2lkZU5hdicsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiAnPCcsXG4gICAgICAgIG9wZW46ICc8JyxcbiAgICAgICAgb25TaWduT3V0OiAnJicsXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lkZU5hdi5odG1sYCBcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnc2lnbmluJywge1xuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgJGxvY2F0aW9uKSB7IFxuICAgICAgICBjb25zdCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnNpZ25JbiA9KG5hbWUsIGVtYWlsKT0+IHtcbiAgICAgICAgICAgICRmaXJlYmFzZUF1dGgoKS4kc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQobmFtZSwgZW1haWwpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWduaW4uaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NwcmludHMnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgYmFja1RpdGxlOiAnPCcsXG4gICAgICAgIGNoYXJ0OiAnPSdcbiAgICB9LFxuXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlLCAkc2NvcGUpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xuICAgICAgICBjdHJsLiRvbkluaXQgPSgpPT4gY3RybC5sb2FkZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50cy5odG1sYCBcbn0pOyAgIiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IGJhY2tsb2c7XG5cbiAgICBmdW5jdGlvbiBnZXRCYWNrbG9nKHNwcmludCkge1xuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKCFzcHJpbnQpIHtcbiAgICAgICAgICAgICAgICBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XG4gICAgICAgICAgIH0gXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZChiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRyZW1vdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHNhdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEJhY2tsb2csXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcbiAgICBsZXQgY2hhcnRUeXBlID0gXCJsaW5lXCI7XG5cbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICB9LFxuICAgICAgICBlbGVtZW50czoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlczoge1xuICAgICAgICAgICAgeEF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0yXCIsXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xuICAgICAgICBsYWJlbHM6IFtdLCBcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiRXN0aW1hdGVkXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjaGlldmVkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2JhcicsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBsZXQgYnVybmRvd25EYXRhID0ge1xuICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCJdLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkdlaGFhbGRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiTWVhbiBCdXJuZG93blwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IpIHtcbiAgICAgICAgbGV0IHNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKS5saW1pdFRvTGFzdCgxNSkpO1xuICAgICAgICBzcHJpbnRzLiRsb2FkZWQoY2IsICgpPT4gJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPdmVydmlld0NoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cyA9PiB7XG5cbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgc3ByaW50cy4kd2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTsgICAgXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xuICAgICAgICAgICAgICAgIH0pOyAgICBcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cykge1xuXG4gICAgICAgIGxldCBsYWJlbHM7XG4gICAgICAgIGxldCBlc3RpbWF0ZWQ7XG4gICAgICAgIGxldCBidXJuZWQ7XG5cbiAgICAgICAgbGFiZWxzID0gc3ByaW50cy5tYXAoZCA9PiBgU3ByaW50ICR7Xy5wYWQoZC5vcmRlcil9YCk7XG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XG4gICAgICAgIGJ1cm5lZCA9IHNwcmludHMubWFwKGQgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBidXJuZWQ7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGVzdGltYXRlZDtcblxuICAgICAgICBsZXQgY3VycmVudFNwcmludCA9IHNwcmludHNbc3ByaW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XG4gICAgICAgICAgICB0eXBlOiBcImJhclwiLFxuICAgICAgICAgICAgb3B0aW9uczogY2hhcnRPcHRpb25zLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiBjdXJyZW50U3ByaW50LnZlbG9jaXR5LFxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgcmVtYWluaW5nOiBjdXJyZW50U3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLyBjdXJyZW50U3ByaW50LmR1cmF0aW9uLCAxKVxuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2hhcnRPYmopO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpIHtcbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBidXJuZG93bkRhdGEubGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGkgPT09IGJ1cm5kb3duRGF0YS5sYWJlbHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzcHJpbnQudmVsb2NpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKHNwcmludC52ZWxvY2l0eSAvIDkpICogaTtcbiAgICAgICAgfSkucmV2ZXJzZSgpO1xuXG4gICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IHNwcmludC52ZWxvY2l0eVxuICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCB4IGluIHNwcmludC5idXJuZG93bikge1xuICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gc3ByaW50LmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xuXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHsgXG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYXJ0T3B0aW9ucywgXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgdmVsb2NpdHk6IHNwcmludC52ZWxvY2l0eSxcbiAgICAgICAgICAgIG5hbWU6IHNwcmludC5uYW1lLFxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICByZW1haW5pbmc6IHNwcmludC52ZWxvY2l0eSAtIF8uc3VtKHNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbiwgMSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc3ByaW50cy4ka2V5QXQoc3ByaW50cy5sZW5ndGgtMSk7XG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XG4gICAgICAgICAgICBjdXJyZW50U3ByaW50LiR3YXRjaChlPT4ge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNwcmludENoYXJ0KHNwcmludE51bWJlcikge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XG5cbiAgICAgICAgICAgIHNwcmludC4kd2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTcHJpbnRzLFxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxuICAgICAgICBnZXRDdXJyZW50Q2hhcnQsXG4gICAgICAgIGdldFNwcmludENoYXJ0XG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFkKG4pIHtcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB4IGluIGl0ZW1zKSBpICs9IGl0ZW1zW3hdO1xuICAgICAgICByZXR1cm4gaTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFkLFxuICAgICAgICBzdW1cbiAgICB9XG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
