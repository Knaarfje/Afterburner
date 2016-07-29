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
            ctrl.reOrder();
        });

        ctrl.saveItem = function (item) {
            return BacklogService.save(item);
        };

        ctrl.reOrder = function () {
            return ctrl.BiItems.forEach(function (item, index) {
                if (item.order !== index) {
                    item.order = index;
                    ctrl.saveItem(item);
                }
            });
        };

        ctrl.addBI = function () {
            return ctrl.BiItems.push({
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
            return ctrl.itemsToAdd.push({
                name: '',
                points: '',
                state: ''
            });
        };

        ctrl.selectItem = function (item) {
            return ctrl.selectedItem = item;
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
            var index = ctrl.BiItems.indexOf(item);
            var selectIndex = index === 0 ? 0 : index - 1;

            BacklogService.remove(item).then(function () {
                ctrl.selectItem(ctrl.BiItems[selectIndex]);
            });
        };

        ctrl.filterItems = function (x) {
            x == ctrl.filter.state ? ctrl.filter.state = null : ctrl.filter.state = x;
        };

        ctrl.sortConfig = {
            animation: 150,
            onSort: function onSort(e) {
                ctrl.reOrder();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjaGFydC9jaGFydC5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzcHJpbnRzL3NwcmludHMuanMiLCJzaWduaW4vc2lnbmluLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdBQUc7QUFDWixjQUFRLEVBQUUsS0FBSztBQUNmLFlBQU0sRUFBRTtBQUNOLGdCQUFRLEVBQUUsS0FBSztBQUNmLGVBQU8sRUFBRSxDQUFDO0FBQ1YscUJBQWEsRUFBRSxJQUFJO0FBQ25CLGNBQU0sRUFBRSxLQUFLO09BQ2Q7S0FDRjtBQUNE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Q0FBQTtDQUNKLENBQUMsQ0FBQzs7O0FDaFJILEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsWUFBVztBQUNyQyxhQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDWixlQUFPLEFBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQztLQUNuQyxDQUFDOztBQUVGLGFBQVMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNoQixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixhQUFLLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFBRSxhQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUEsQUFDbkMsT0FBTyxDQUFDLENBQUM7S0FDWixDQUFDOztBQUVGLFdBQU87QUFDSCxXQUFHLEVBQUgsR0FBRztBQUNILFdBQUcsRUFBSCxHQUFHO0tBQ04sQ0FBQTtDQUNKLENBQUMsQ0FBQSIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsicGFydGljbGVzSlMoXCJwYXJ0aWNsZXMtanNcIiwge1xuICBcInBhcnRpY2xlc1wiOiB7XG4gICAgXCJudW1iZXJcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAxMCxcbiAgICAgIFwiZGVuc2l0eVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwidmFsdWVfYXJlYVwiOiA4MDBcbiAgICAgIH1cbiAgICB9LFxuICAgIFwiY29sb3JcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxuICAgIH0sXG4gICAgXCJzaGFwZVwiOiB7XG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcbiAgICAgIFwic3Ryb2tlXCI6IHtcbiAgICAgICAgXCJ3aWR0aFwiOiAwLFxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXG4gICAgICB9LFxuICAgICAgXCJwb2x5Z29uXCI6IHtcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XG4gICAgICB9LFxuICAgICAgXCJpbWFnZVwiOiB7XG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcbiAgICAgICAgXCJ3aWR0aFwiOiAxMDAsXG4gICAgICAgIFwiaGVpZ2h0XCI6IDEwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJvcGFjaXR5XCI6IHtcbiAgICAgIFwidmFsdWVcIjogMC4xLFxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXG4gICAgICBcImFuaW1cIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJzcGVlZFwiOiAxLFxuICAgICAgICBcIm9wYWNpdHlfbWluXCI6IDAuMDEsXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJzaXplXCI6IHtcbiAgICAgIFwidmFsdWVcIjogMyxcbiAgICAgIFwicmFuZG9tXCI6IHRydWUsXG4gICAgICBcImFuaW1cIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJzcGVlZFwiOiAxMCxcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXG4gICAgICBcImNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICAgICAgXCJvcGFjaXR5XCI6IDAuMDUsXG4gICAgICBcIndpZHRoXCI6IDFcbiAgICB9LFxuICAgIFwibW92ZVwiOiB7XG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgXCJzcGVlZFwiOiAyLFxuICAgICAgXCJkaXJlY3Rpb25cIjogXCJub25lXCIsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwic3RyYWlnaHRcIjogZmFsc2UsXG4gICAgICBcIm91dF9tb2RlXCI6IFwib3V0XCIsXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcbiAgICAgIFwiYXR0cmFjdFwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxuICAgICAgICBcInJvdGF0ZVlcIjogMTIwMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJpbnRlcmFjdGl2aXR5XCI6IHtcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxuICAgIFwiZXZlbnRzXCI6IHtcbiAgICAgIFwib25ob3ZlclwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwibW9kZVwiOiBcImdyYWJcIlxuICAgICAgfSxcbiAgICAgIFwib25jbGlja1wiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwibW9kZVwiOiBcInB1c2hcIlxuICAgICAgfSxcbiAgICAgIFwicmVzaXplXCI6IHRydWVcbiAgICB9LFxuICAgIFwibW9kZXNcIjoge1xuICAgICAgXCJncmFiXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAxNDAsXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xuICAgICAgICAgIFwib3BhY2l0eVwiOiAuMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJidWJibGVcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDQwMCxcbiAgICAgICAgXCJzaXplXCI6IDQwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDUsXG4gICAgICAgIFwib3BhY2l0eVwiOiAuMSxcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcbiAgICAgIH0sXG4gICAgICBcInJlcHVsc2VcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcbiAgICAgICAgXCJkdXJhdGlvblwiOiAwLjRcbiAgICAgIH0sXG4gICAgICBcInB1c2hcIjoge1xuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAzXG4gICAgICB9LFxuICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAyXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcInJldGluYV9kZXRlY3RcIjogdHJ1ZVxufSk7IiwiaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3NjcmlwdHMvc2VydmljZXdvcmtlci5qcycpO1xufVxuXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCIsICduZ1RvdWNoJywgJ25nUm91dGUnLCAnbmctc29ydGFibGUnXSk7XG5jb25zdCB0ZW1wbGF0ZVBhdGggPSAnLi9Bc3NldHMvZGlzdC9UZW1wbGF0ZXMnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXG4gICAgfTtcblxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXG5cbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG5cbiAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignL3NpZ25pbicsIHsgXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xuICAgICAgICB9KSBcbiAgICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvY3VycmVudC1zcHJpbnQnLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL3NwcmludC86c3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2JhY2tsb2cnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidPdmVydmlldydcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxuICAgICAgICB9KSBcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdhcHAnLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYXBwLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2cnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgYmFja1RpdGxlOiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLnN0YXRlID0ge1xuICAgICAgICAgICAgTmV3OiAwLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IDEsXG4gICAgICAgICAgICBEb25lOiAzLFxuICAgICAgICAgICAgUmVtb3ZlZDogLTEgXG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcbiAgICAgICAgY3RybC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgY3RybC5maWx0ZXJTdGF0ZTtcblxuICAgICAgICBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCkudGhlbihkYXRhPT4ge1xuICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcbiAgICAgICAgICAgIGN0cmwucmVPcmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjdHJsLnNhdmVJdGVtID1pdGVtPT4gQmFja2xvZ1NlcnZpY2Uuc2F2ZShpdGVtKTtcblxuICAgICAgICBjdHJsLnJlT3JkZXIgPSgpPT4gY3RybC5CaUl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KT0+IHtcbiAgICAgICAgICAgIGlmKGl0ZW0ub3JkZXIgIT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaXRlbS5vcmRlciA9IGluZGV4O1xuICAgICAgICAgICAgICAgIGN0cmwuc2F2ZUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN0cmwuYWRkQkkgPSgpPT4gY3RybC5CaUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogY3RybC5uZXdCSW5hbWUsIFxuICAgICAgICAgICAgcG9pbnRzOiAyLCBcbiAgICAgICAgICAgIHN0YXRlOiAnYXBwcm92ZWQnXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY3RybC5maWx0ZXJTdGF0ZXMgPXg9PiB7XG4gICAgICAgICAgICBjdHJsLmZpbHRlclN0YXRlID0geCA9PSBjdHJsLmZpbHRlclN0YXRlID8gXCJcIiA6IHg7XG4gICAgICAgIH07IFxuXG4gICAgICAgIGN0cmwuaXRlbXNUb0FkZCA9IFt7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIHBvaW50czogJycsXG4gICAgICAgICAgICBzdGF0ZTogJydcbiAgICAgICAgfV07XG5cbiAgICAgICAgY3RybC5hZGQgPWl0ZW1Ub0FkZD0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuaXRlbXNUb0FkZC5pbmRleE9mKGl0ZW1Ub0FkZCk7XG5cbiAgICAgICAgICAgIGN0cmwuaXRlbXNUb0FkZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgY3RybC5CaUl0ZW1zLnB1c2goYW5ndWxhci5jb3B5KGl0ZW1Ub0FkZCkpXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmFkZE5ldyA9KCk9PiBjdHJsLml0ZW1zVG9BZGQucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIHBvaW50czogJycsXG4gICAgICAgICAgICBzdGF0ZTogJydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY3RybC5zZWxlY3RJdGVtID1pdGVtPT4gY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xuXG4gICAgICAgIGN0cmwuYWRkSXRlbSA9KCk9PiB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAwLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAwXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmFkZChuZXdJdGVtKS50aGVuKGRhdGE9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9aXRlbT0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuQmlJdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gaW5kZXggPT09IDAgPyAwIDogaW5kZXgtMTtcblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UucmVtb3ZlKGl0ZW0pLnRoZW4oKCk9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtc1tzZWxlY3RJbmRleF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPXg9PiB7XG4gICAgICAgICAgICB4ID09IGN0cmwuZmlsdGVyLnN0YXRlXG4gICAgICAgICAgICAgICAgPyBjdHJsLmZpbHRlci5zdGF0ZSA9IG51bGxcbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcbiAgICAgICAgfSBcblxuICAgICAgICBjdHJsLnNvcnRDb25maWcgPSB7XG4gICAgICAgICAgICBhbmltYXRpb246IDE1MCxcbiAgICAgICAgICAgIG9uU29ydChlKSB7XG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtOiBcIjxcIixcbiAgICAgICAgb25BZGQ6IFwiJlwiLFxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXG4gICAgICAgIG9uU2F2ZTogXCImXCJcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0Zvcm0uaHRtbGAgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0l0ZW0nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbTogJzwnLFxuICAgICAgICBvbkNsaWNrOiAnJidcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nSXRlbS5odG1sYCBcbn0pOyIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIG9wdGlvbnM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBsb2FkZWQ6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XG5cbiAgICAgICAgY3RybC5jaGFydDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgaWYoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGN0cmwuY2hhcnQgPSBuZXcgQ2hhcnQoJGNhbnZhcywge1xuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHJsLmRhdGEsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY3RybC5vcHRpb25zXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2luZG93LmNoYXJ0ID0gY3RybC5jaGFydDtcblxuICAgICAgICAgICAgaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJykge1xuICAgICAgICAgICAgICAgICRjYW52YXMub25jbGljayA9ZT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZFNwcmludCA9IGFjdGl2ZVBvaW50c1sxXS5faW5kZXggKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCk9PiAkbG9jYXRpb24ucGF0aChgL3NwcmludC8ke2NsaWNrZWRTcHJpbnR9YCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaCgoKT0+IGN0cmwubG9hZGVkLCBsb2FkZWQ9PiB7XG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oJ3NwcmludDp1cGRhdGUnLCAoKT0+IHtcbiAgICAgICAgICAgICR0aW1lb3V0KCgpPT5jdHJsLmNoYXJ0LnVwZGF0ZSgpKTtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBgPGNhbnZhcz48L2NhbnZhcz5gIFxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHNwcmludDogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zdGF0T3BlbiA9IGZhbHNlO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6ICc8JyxcbiAgICAgICAgb3BlbjogJzwnLFxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWRlTmF2Lmh0bWxgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxuICAgICAgICBjaGFydDogJz0nXG4gICAgfSxcblxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSwgJHNjb3BlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgY3RybC5sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgY3RybC4kb25Jbml0ID0oKT0+IGN0cmwubG9hZGVkID0gdHJ1ZTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXG59KTsiLCJhcHAuZmFjdG9yeSgnQmFja2xvZ1NlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgYmFja2xvZztcblxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nKTtcbiAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRhZGQoYmFja2xvZ0l0ZW0pO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmUoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kc2F2ZShiYWNrbG9nSXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0QmFja2xvZyxcbiAgICAgICAgc2F2ZSxcbiAgICAgICAgYWRkLFxuICAgICAgICByZW1vdmVcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1NwcmludFNlcnZpY2UnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBsaW5lQ29sb3IgPSAnI0VCNTFEOCc7XG4gICAgbGV0IGJhckNvbG9yID0gJyM1RkZBRkMnO1xuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcblxuICAgIGxldCBjaGFydE9wdGlvbnMgPSB7XG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICB0b29sdGlwczoge1xuICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDMsXG4gICAgICAgIH0sXG4gICAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTJcIixcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBvdmVydmlld0RhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW10sIFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIl0sXG4gICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50cyhjYikge1xuICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDE1KSk7XG4gICAgICAgIHNwcmludHMuJGxvYWRlZChjYiwgKCk9PiAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE92ZXJ2aWV3Q2hhcnQoKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzID0+IHtcblxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpOyAgICBcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XG4gICAgICAgICAgICAgICAgfSk7ICAgIFxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XG5cbiAgICAgICAgbGV0IGxhYmVscztcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcbiAgICAgICAgbGV0IGJ1cm5lZDtcblxuICAgICAgICBsYWJlbHMgPSBzcHJpbnRzLm1hcChkID0+IGBTcHJpbnQgJHtfLnBhZChkLm9yZGVyKX1gKTtcbiAgICAgICAgZXN0aW1hdGVkID0gc3ByaW50cy5tYXAoZCA9PiBkLnZlbG9jaXR5KTtcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciB4IGluIGQuYnVybmRvd24pIGkgPSBpICsgZC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGF0YSA9IG92ZXJ2aWV3RGF0YTtcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGJ1cm5lZDtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZXN0aW1hdGVkO1xuXG4gICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gc3ByaW50c1tzcHJpbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFydE9wdGlvbnMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgdmVsb2NpdHk6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHksXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICByZW1haW5pbmc6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLSBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoY3VycmVudFNwcmludC52ZWxvY2l0eSAvIGN1cnJlbnRTcHJpbnQuZHVyYXRpb24sIDEpXG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjaGFydE9iaik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkge1xuICAgICAgICBsZXQgaWRlYWxCdXJuZG93biA9IGJ1cm5kb3duRGF0YS5sYWJlbHMubWFwKChkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gYnVybmRvd25EYXRhLmxhYmVscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoc3ByaW50LnZlbG9jaXR5IC8gOSkgKiBpO1xuICAgICAgICB9KS5yZXZlcnNlKCk7XG5cbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XG4gICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBzcHJpbnQuYnVybmRvd25beF07XG4gICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZGF0YSA9IGJ1cm5kb3duRGF0YTtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XG5cbiAgICAgICAgbGV0IGNoYXJ0T2JqID0geyBcbiAgICAgICAgICAgIHR5cGU6IFwibGluZVwiLFxuICAgICAgICAgICAgb3B0aW9uczogY2hhcnRPcHRpb25zLCBcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxuICAgICAgICAgICAgbmFtZTogc3ByaW50Lm5hbWUsXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uLCAxKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoYXJ0T2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhcnQoKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzcHJpbnRzLiRrZXlBdChzcHJpbnRzLmxlbmd0aC0xKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gY3VycmVudC5zcGxpdChcInNcIilbMV07XG4gICAgICAgICAgICBsZXQgY3VycmVudFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvJHtjdXJyZW50fWApKTtcbiAgICAgICAgICAgIGN1cnJlbnRTcHJpbnQuJHdhdGNoKGU9PiB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoY3VycmVudFNwcmludCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50Q2hhcnQoc3ByaW50TnVtYmVyKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xuICAgICAgICAgICAgbGV0IHNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvcyR7c3ByaW50TnVtYmVyfWApKTtcblxuICAgICAgICAgICAgc3ByaW50LiR3YXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFNwcmludHMsXG4gICAgICAgIGdldE92ZXJ2aWV3Q2hhcnQsXG4gICAgICAgIGdldEN1cnJlbnRDaGFydCxcbiAgICAgICAgZ2V0U3ByaW50Q2hhcnRcbiAgICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBwYWQobikge1xuICAgICAgICByZXR1cm4gKG4gPCAxMCkgPyAoXCIwXCIgKyBuKSA6IG47XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHN1bShpdGVtcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHggaW4gaXRlbXMpIGkgKz0gaXRlbXNbeF07XG4gICAgICAgIHJldHVybiBpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBwYWQsXG4gICAgICAgIHN1bVxuICAgIH1cbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
