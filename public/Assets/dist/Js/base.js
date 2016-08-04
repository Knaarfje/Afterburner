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

        ctrl.formOpen = false;

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
            ctrl.formOpen = true;
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
                ctrl.formOpen = true;
            });
        };

        ctrl.deleteItem = function (item) {
            var index = ctrl.BiItems.indexOf(item);
            var selectIndex = index === 0 ? 0 : index - 1;

            BacklogService.remove(item).then(function () {
                ctrl.selectItem(ctrl.BiItems[selectIndex]);
                ctrl.formOpen = false;
            });
        };

        ctrl.saveItem = function (item) {
            BacklogService.save(item).then(function () {
                ctrl.formOpen = false;
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
                return sprint.velocity.toFixed(2);
            }
            return (sprint.velocity / 9 * i).toFixed(2);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjaGFydC9jaGFydC5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdBQUc7QUFDWixjQUFRLEVBQUUsS0FBSztBQUNmLFlBQU0sRUFBRTtBQUNOLGdCQUFRLEVBQUUsS0FBSztBQUNmLGVBQU8sRUFBRSxDQUFDO0FBQ1YscUJBQWEsRUFBRSxJQUFJO0FBQ25CLGNBQU0sRUFBRSxLQUFLO09BQ2Q7S0FDRjtBQUNE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QU0sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUNmLDBCQUFVLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLHdCQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDaEQsQ0FBQyxDQUFBO1NBQ0wsQ0FBQyxDQUFDOztBQUVILGVBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztLQUMzQjs7QUFFRCxXQUFPO0FBQ0gsa0JBQVUsRUFBVixVQUFVO0FBQ1Ysd0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBZSxFQUFmLGVBQWU7QUFDZixzQkFBYyxFQUFkLGNBQWM7S0FDakIsQ0FBQTtDQUNKLENBQUMsQ0FBQzs7O0FDaFJILEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsWUFBVztBQUNyQyxhQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDWixlQUFPLEFBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQztLQUNuQyxDQUFDOztBQUVGLGFBQVMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNoQixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixhQUFLLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFBRSxhQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUEsQUFDbkMsT0FBTyxDQUFDLENBQUM7S0FDWixDQUFDOztBQUVGLFdBQU87QUFDSCxXQUFHLEVBQUgsR0FBRztBQUNILFdBQUcsRUFBSCxHQUFHO0tBQ04sQ0FBQTtDQUNKLENBQUMsQ0FBQSIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsicGFydGljbGVzSlMoXCJwYXJ0aWNsZXMtanNcIiwge1xyXG4gIFwicGFydGljbGVzXCI6IHtcclxuICAgIFwibnVtYmVyXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAxMCxcclxuICAgICAgXCJkZW5zaXR5XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICAgIFwidmFsdWVfYXJlYVwiOiA4MDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiY29sb3JcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IFwiI2ZmZmZmZlwiXHJcbiAgICB9LFxyXG4gICAgXCJzaGFwZVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxyXG4gICAgICBcInN0cm9rZVwiOiB7XHJcbiAgICAgICAgXCJ3aWR0aFwiOiAwLFxyXG4gICAgICAgIFwiY29sb3JcIjogXCIjMDAwMDAwXCJcclxuICAgICAgfSxcclxuICAgICAgXCJwb2x5Z29uXCI6IHtcclxuICAgICAgICBcIm5iX3NpZGVzXCI6IDVcclxuICAgICAgfSxcclxuICAgICAgXCJpbWFnZVwiOiB7XHJcbiAgICAgICAgXCJzcmNcIjogXCJpbWcvZ2l0aHViLnN2Z1wiLFxyXG4gICAgICAgIFwid2lkdGhcIjogMTAwLFxyXG4gICAgICAgIFwiaGVpZ2h0XCI6IDEwMFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJvcGFjaXR5XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAwLjEsXHJcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMSxcclxuICAgICAgICBcIm9wYWNpdHlfbWluXCI6IDAuMDEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInNpemVcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IDMsXHJcbiAgICAgIFwicmFuZG9tXCI6IHRydWUsXHJcbiAgICAgIFwiYW5pbVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAxMCxcclxuICAgICAgICBcInNpemVfbWluXCI6IDAuMSxcclxuICAgICAgICBcInN5bmNcIjogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcImRpc3RhbmNlXCI6IDE1MCxcclxuICAgICAgXCJjb2xvclwiOiBcIiNmZmZmZmZcIixcclxuICAgICAgXCJvcGFjaXR5XCI6IDAuMDUsXHJcbiAgICAgIFwid2lkdGhcIjogMVxyXG4gICAgfSxcclxuICAgIFwibW92ZVwiOiB7XHJcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgIFwic3BlZWRcIjogMixcclxuICAgICAgXCJkaXJlY3Rpb25cIjogXCJub25lXCIsXHJcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxyXG4gICAgICBcInN0cmFpZ2h0XCI6IGZhbHNlLFxyXG4gICAgICBcIm91dF9tb2RlXCI6IFwib3V0XCIsXHJcbiAgICAgIFwiYm91bmNlXCI6IGZhbHNlLFxyXG4gICAgICBcImF0dHJhY3RcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwicm90YXRlWFwiOiA2MDAsXHJcbiAgICAgICAgXCJyb3RhdGVZXCI6IDEyMDBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJpbnRlcmFjdGl2aXR5XCI6IHtcclxuICAgIFwiZGV0ZWN0X29uXCI6IFwiY2FudmFzXCIsXHJcbiAgICBcImV2ZW50c1wiOiB7XHJcbiAgICAgIFwib25ob3ZlclwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJncmFiXCJcclxuICAgICAgfSxcclxuICAgICAgXCJvbmNsaWNrXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICAgIFwibW9kZVwiOiBcInB1c2hcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInJlc2l6ZVwiOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgXCJtb2Rlc1wiOiB7XHJcbiAgICAgIFwiZ3JhYlwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAxNDAsXHJcbiAgICAgICAgXCJsaW5lX2xpbmtlZFwiOiB7XHJcbiAgICAgICAgICBcIm9wYWNpdHlcIjogLjFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYnViYmxlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDQwMCxcclxuICAgICAgICBcInNpemVcIjogNDAsXHJcbiAgICAgICAgXCJkdXJhdGlvblwiOiA1LFxyXG4gICAgICAgIFwib3BhY2l0eVwiOiAuMSxcclxuICAgICAgICBcInNwZWVkXCI6IDMwMFxyXG4gICAgICB9LFxyXG4gICAgICBcInJlcHVsc2VcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMjAwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogMC40XHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHVzaFwiOiB7XHJcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogM1xyXG4gICAgICB9LFxyXG4gICAgICBcInJlbW92ZVwiOiB7XHJcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogMlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInJldGluYV9kZXRlY3RcIjogdHJ1ZVxyXG59KTsiLCJpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCdzY3JpcHRzL3NlcnZpY2V3b3JrZXIuanMnKTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgJ25nLXNvcnRhYmxlJ10pO1xyXG5jb25zdCB0ZW1wbGF0ZVBhdGggPSAnLi9Bc3NldHMvZGlzdC9UZW1wbGF0ZXMnO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSB7XHJcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNJenlDRVlSalM0dWZoZWR4d0I0dkNDOWxhNTJHc3JYTVwiLFxyXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxyXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXHJcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuYXBwc3BvdC5jb21cIixcclxuICAgIH07XHJcblxyXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpOyBcclxuXHJcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblxyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL3NpZ25pbicsIHsgXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNpZ25pbj48L3NpZ25pbj4nXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLndoZW4oJy8nLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvc3ByaW50LzpzcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmFja2xvZycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCwgXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9hcHAuaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuXHJcbiAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBOZXc6IDAsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiAxLFxyXG4gICAgICAgICAgICBEb25lOiAzLFxyXG4gICAgICAgICAgICBSZW1vdmVkOiAtMSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xyXG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XHJcbiAgICAgICAgY3RybC5maWx0ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZGF0YT0+IHtcclxuICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcclxuICAgICAgICAgICAgY3RybC5yZU9yZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGN0cmwucmVPcmRlciA9KCk9PiBjdHJsLkJpSXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpPT4ge1xyXG4gICAgICAgICAgICBpZihpdGVtLm9yZGVyICE9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5vcmRlciA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgY3RybC5zYXZlSXRlbShpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjdHJsLmFkZEJJID0oKT0+IGN0cmwuQmlJdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogY3RybC5uZXdCSW5hbWUsIFxyXG4gICAgICAgICAgICBwb2ludHM6IDIsIFxyXG4gICAgICAgICAgICBzdGF0ZTogJ2FwcHJvdmVkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwuZmlsdGVyU3RhdGVzID14PT4ge1xyXG4gICAgICAgICAgICBjdHJsLmZpbHRlclN0YXRlID0geCA9PSBjdHJsLmZpbHRlclN0YXRlID8gXCJcIiA6IHg7XHJcbiAgICAgICAgfTsgXHJcblxyXG4gICAgICAgIGN0cmwuaXRlbXNUb0FkZCA9IFt7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICBwb2ludHM6ICcnLFxyXG4gICAgICAgICAgICBzdGF0ZTogJydcclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgY3RybC5hZGQgPWl0ZW1Ub0FkZD0+IHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gY3RybC5pdGVtc1RvQWRkLmluZGV4T2YoaXRlbVRvQWRkKTtcclxuXHJcbiAgICAgICAgICAgIGN0cmwuaXRlbXNUb0FkZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBjdHJsLkJpSXRlbXMucHVzaChhbmd1bGFyLmNvcHkoaXRlbVRvQWRkKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuYWRkTmV3ID0oKT0+IGN0cmwuaXRlbXNUb0FkZC5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgICAgIHBvaW50czogJycsXHJcbiAgICAgICAgICAgIHN0YXRlOiAnJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjdHJsLnNlbGVjdEl0ZW0gPWl0ZW09PiB7XHJcbiAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbSA9IGl0ZW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmFkZEl0ZW0gPSgpPT4ge1xyXG4gICAgICAgICAgICBsZXQgbmV3SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTmlldXcuLi5cIixcclxuICAgICAgICAgICAgICAgIGVmZm9ydDogMCxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IDAsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogMFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5hZGQobmV3SXRlbSkudGhlbihkYXRhPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmRlbGV0ZUl0ZW0gPWl0ZW09PiB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuQmlJdGVtcy5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0SW5kZXggPSBpbmRleCA9PT0gMCA/IDAgOiBpbmRleC0xO1xyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UucmVtb3ZlKGl0ZW0pLnRoZW4oKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zW3NlbGVjdEluZGV4XSk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGN0cmwuc2F2ZUl0ZW0gPSAoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9eD0+IHtcclxuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZVxyXG4gICAgICAgICAgICAgICAgPyBjdHJsLmZpbHRlci5zdGF0ZSA9IG51bGxcclxuICAgICAgICAgICAgICAgIDogY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGN0cmwuc29ydENvbmZpZyA9IHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAgICAgICAgIG9uU29ydChlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2cuaHRtbGBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogXCI8XCIsXHJcbiAgICAgICAgb25BZGQ6IFwiJlwiLFxyXG4gICAgICAgIG9uRGVsZXRlOiBcIiZcIixcclxuICAgICAgICBvblNhdmU6IFwiJlwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nRm9ybS5odG1sYCBcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtOiAnPCcsXHJcbiAgICAgICAgb25DbGljazogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBvcHRpb25zOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIGxvYWRlZDogJzwnLFxyXG4gICAgICAgIHR5cGU6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XHJcblxyXG4gICAgICAgIGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgIGlmKGN0cmwuY2hhcnQpIGN0cmwuY2hhcnQuZGVzdHJveSgpO1xyXG5cclxuICAgICAgICAgICAgY3RybC5jaGFydCA9IG5ldyBDaGFydCgkY2FudmFzLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBjdHJsLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHJsLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjdHJsLm9wdGlvbnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuY2hhcnQgPSBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICAgICAgaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgJGNhbnZhcy5vbmNsaWNrID1lPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVQb2ludHMgPSBjdHJsLmNoYXJ0LmdldEVsZW1lbnRzQXRFdmVudChlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGlja2VkU3ByaW50ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xyXG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcclxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NpZGVOYXYnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzZXI6ICc8JyxcclxuICAgICAgICBvcGVuOiAnPCcsXHJcbiAgICAgICAgb25TaWduT3V0OiAnJicsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lkZU5hdi5odG1sYCBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdzaWduaW4nLCB7XHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcclxuICAgICAgICBjb25zdCBjdHJsID0gdGhpcztcclxuXHJcbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XHJcbiAgICAgICAgICAgICRmaXJlYmFzZUF1dGgoKS4kc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQobmFtZSwgZW1haWwpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NwcmludHMnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHRpdGxlOiAnPCcsXHJcbiAgICAgICAgYmFja1RpdGxlOiAnPCcsXHJcbiAgICAgICAgY2hhcnQ6ICc9J1xyXG4gICAgfSxcclxuXHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UsICRzY29wZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuXHJcbiAgICAgICAgY3RybC5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICBjdHJsLiRvbkluaXQgPSgpPT4gY3RybC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGJhY2tsb2c7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XHJcbiAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEJhY2tsb2csXHJcbiAgICAgICAgc2F2ZSxcclxuICAgICAgICBhZGQsXHJcbiAgICAgICAgcmVtb3ZlXHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnU3ByaW50U2VydmljZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGxpbmVDb2xvciA9ICcjRUI1MUQ4JztcclxuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcclxuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcclxuXHJcbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xyXG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVsZW1lbnRzOiB7XHJcbiAgICAgICAgICAgIGxpbmU6IHtcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMlwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBvdmVydmlld0RhdGEgPSB7XHJcbiAgICAgICAgbGFiZWxzOiBbXSwgXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiRXN0aW1hdGVkXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNUNFNUU3JyxcclxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNUNFNUU3JyxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjaGlldmVkXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgYnVybmRvd25EYXRhID0ge1xyXG4gICAgICAgIGxhYmVsczogW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIl0sXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IpIHtcclxuICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDE1KSk7XHJcbiAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0T3ZlcnZpZXdDaGFydCgpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHMgPT4ge1xyXG5cclxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpOyAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XHJcblxyXG4gICAgICAgIGxldCBsYWJlbHM7XHJcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcclxuICAgICAgICBsZXQgYnVybmVkO1xyXG5cclxuICAgICAgICBsYWJlbHMgPSBzcHJpbnRzLm1hcChkID0+IGBTcHJpbnQgJHtfLnBhZChkLm9yZGVyKX1gKTtcclxuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xyXG4gICAgICAgIGJ1cm5lZCA9IHNwcmludHMubWFwKGQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gYnVybmVkO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGVzdGltYXRlZDtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSBzcHJpbnRzW3NwcmludHMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJiYXJcIixcclxuICAgICAgICAgICAgb3B0aW9uczogY2hhcnRPcHRpb25zLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICByZW1haW5pbmc6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLSBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XHJcbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBidXJuZG93bkRhdGEubGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gYnVybmRvd25EYXRhLmxhYmVscy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5LnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICgoc3ByaW50LnZlbG9jaXR5IC8gOSkgKiBpKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIH0pLnJldmVyc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XHJcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcclxuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0geyBcclxuICAgICAgICAgICAgdHlwZTogXCJsaW5lXCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYXJ0T3B0aW9ucywgXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBzcHJpbnQudmVsb2NpdHksXHJcbiAgICAgICAgICAgIG5hbWU6IHNwcmludC5uYW1lLFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgcmVtYWluaW5nOiBzcHJpbnQudmVsb2NpdHkgLSBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbiwgMSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzcHJpbnRzLiRrZXlBdChzcHJpbnRzLmxlbmd0aC0xKTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnROdW1iZXIgPSBjdXJyZW50LnNwbGl0KFwic1wiKVsxXTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTcHJpbnQuJHdhdGNoKGU9PiB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50Q2hhcnQoc3ByaW50TnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgc3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy9zJHtzcHJpbnROdW1iZXJ9YCkpO1xyXG5cclxuICAgICAgICAgICAgc3ByaW50LiR3YXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U3ByaW50cyxcclxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxyXG4gICAgICAgIGdldEN1cnJlbnRDaGFydCxcclxuICAgICAgICBnZXRTcHJpbnRDaGFydFxyXG4gICAgfVxyXG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XHJcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwYWQsXHJcbiAgICAgICAgc3VtXHJcbiAgICB9XHJcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
