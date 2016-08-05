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
    controller: function controller(BacklogService, SprintService, $firebaseAuth) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.formOpen = false;

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.filter = {};
        ctrl.open = true;
        ctrl.filterState;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
            ctrl.reOrder();
        });

        SprintService.getSprints(function (sprints) {
            ctrl.sprints = sprints;
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
                state: 0,
                sprint: ""
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
            x == ctrl.filter.state ? ctrl.filter = { name: ctrl.filter.name } : ctrl.filter.state = x;
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
        sprints: "<",
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
"use strict";

app.component('sprintBacklog', {
    bindings: {
        items: "<"
    },
    controller: function controller(BacklogService, $firebaseAuth) {
        var ctrl = this;
    },
    templateUrl: templatePath + "/sprintBacklog.html"
});
'use strict';

app.component('sprints', {
    bindings: {
        title: '<',
        backTitle: '<',
        chart: '='
    },

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.loaded = false;
        ctrl.filter = {};

        if (ctrl.chart.sprint) {
            BacklogService.getBacklog(ctrl.chart.sprint).then(function (data) {
                ctrl.BiItems = data;
                console.log(data);
            });
        }

        ctrl.filterItems = function (x) {
            x == ctrl.filter.state ? ctrl.filter = { name: ctrl.filter.name } : ctrl.filter.state = x;
        };

        ctrl.$onInit = function () {
            ctrl.loaded = true;
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
            } else {
                backlog = $firebaseArray(ref.child("backlog").orderByChild('sprint').equalTo(sprint.$id));
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
            needed: $filter('number')(sprint.velocity / sprint.duration, 1),
            sprint: sprint
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjaGFydC9jaGFydC5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdBQUc7QUFDWixjQUFRLEVBQUUsS0FBSztBQUNmLFlBQU0sRUFBRTtBQUNOLGdCQUFRLEVBQUUsS0FBSztBQUNmLGVBQU8sRUFBRSxDQUFDO0FBQ1YscUJBQWEsRUFBRSxJQUFJO0FB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LENBQUMsQ0FBQztTQUFBLEFBQ25DLE9BQU8sQ0FBQyxDQUFDO0tBQ1osQ0FBQzs7QUFFRixXQUFPO0FBQ0gsV0FBRyxFQUFILEdBQUc7QUFDSCxXQUFHLEVBQUgsR0FBRztLQUNOLENBQUE7Q0FDSixDQUFDLENBQUEiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcclxuICBcInBhcnRpY2xlc1wiOiB7XHJcbiAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMTAsXHJcbiAgICAgIFwiZGVuc2l0eVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImNvbG9yXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxyXG4gICAgfSxcclxuICAgIFwic2hhcGVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcclxuICAgICAgXCJzdHJva2VcIjoge1xyXG4gICAgICAgIFwid2lkdGhcIjogMCxcclxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicG9seWdvblwiOiB7XHJcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaW1hZ2VcIjoge1xyXG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcclxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcclxuICAgICAgICBcImhlaWdodFwiOiAxMDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwib3BhY2l0eVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMC4xLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEsXHJcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzaXplXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAzLFxyXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMTAsXHJcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXHJcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxyXG4gICAgICBcIndpZHRoXCI6IDFcclxuICAgIH0sXHJcbiAgICBcIm1vdmVcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcInNwZWVkXCI6IDIsXHJcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcclxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxyXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcclxuICAgICAgXCJhdHRyYWN0XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxyXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XHJcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxyXG4gICAgXCJldmVudHNcIjoge1xyXG4gICAgICBcIm9uaG92ZXJcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwib25jbGlja1wiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcclxuICAgICAgfSxcclxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxyXG4gICAgfSxcclxuICAgIFwibW9kZXNcIjoge1xyXG4gICAgICBcImdyYWJcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxyXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImJ1YmJsZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXHJcbiAgICAgICAgXCJzaXplXCI6IDQwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcclxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcclxuICAgICAgfSxcclxuICAgICAgXCJyZXB1bHNlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxyXG4gICAgICB9LFxyXG4gICAgICBcInB1c2hcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcclxuICAgICAgfSxcclxuICAgICAgXCJyZW1vdmVcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcclxufSk7IiwiaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcclxuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc2NyaXB0cy9zZXJ2aWNld29ya2VyLmpzJyk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiYWZ0ZXJidXJuZXJBcHBcIiwgW1wiZmlyZWJhc2VcIiwgJ25nVG91Y2gnLCAnbmdSb3V0ZScsICduZy1zb3J0YWJsZSddKTtcclxuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcclxuICAgICAgICBhdXRoRG9tYWluOiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWFwcC5jb21cIixcclxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxyXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXHJcbiAgICB9O1xyXG5cclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXHJcblxyXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xyXG4gICAgICAgIH0pIFxyXG4gICAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9jdXJyZW50LXNwcmludCcsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3NwcmludC86c3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2JhY2tsb2cnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ092ZXJ2aWV3J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYmFja2xvZz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxyXG4gICAgICAgIH0pIFxyXG4gICAgICAgIC5vdGhlcndpc2UoJy8nKTsgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdhcHAnLCB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcclxuICAgICAgICBpZighYXV0aC4kZ2V0QXV0aCgpKSAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG5cclxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcclxuICAgICAgICBjdHJsLnNpZ25PdXQgPSgpPT4ge1xyXG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcclxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYXBwLmh0bWxgICAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrVGl0bGU6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIFNwcmludFNlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgTmV3OiBcIjBcIixcclxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxyXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcclxuICAgICAgICAgICAgUmVtb3ZlZDogXCI0XCIgXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcclxuICAgICAgICBjdHJsLm9wZW4gPSB0cnVlO1xyXG4gICAgICAgIGN0cmwuZmlsdGVyU3RhdGU7XHJcblxyXG4gICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coKS50aGVuKGRhdGE9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XHJcbiAgICAgICAgICAgIGN0cmwucmVPcmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBTcHJpbnRTZXJ2aWNlLmdldFNwcmludHMoKHNwcmludHMpID0+IHtcclxuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjdHJsLnJlT3JkZXIgPSgpPT4gY3RybC5CaUl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KT0+IHtcclxuICAgICAgICAgICAgaWYoaXRlbS5vcmRlciAhPT0gaW5kZXgpIHsgXHJcbiAgICAgICAgICAgICAgICBpdGVtLm9yZGVyID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNhdmVJdGVtKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGN0cmwuYWRkQkkgPSgpPT4gY3RybC5CaUl0ZW1zLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBjdHJsLm5ld0JJbmFtZSwgXHJcbiAgICAgICAgICAgIHBvaW50czogMiwgXHJcbiAgICAgICAgICAgIHN0YXRlOiAnYXBwcm92ZWQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3RybC5maWx0ZXJTdGF0ZXMgPXg9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuZmlsdGVyU3RhdGUgPSB4ID09IGN0cmwuZmlsdGVyU3RhdGUgPyBcIlwiIDogeDtcclxuICAgICAgICB9OyBcclxuXHJcbiAgICAgICAgY3RybC5pdGVtc1RvQWRkID0gW3tcclxuICAgICAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgICAgIHBvaW50czogJycsXHJcbiAgICAgICAgICAgIHN0YXRlOiAnJ1xyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICBjdHJsLmFkZCA9aXRlbVRvQWRkPT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjdHJsLml0ZW1zVG9BZGQuaW5kZXhPZihpdGVtVG9BZGQpO1xyXG5cclxuICAgICAgICAgICAgY3RybC5pdGVtc1RvQWRkLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcy5wdXNoKGFuZ3VsYXIuY29weShpdGVtVG9BZGQpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5hZGROZXcgPSgpPT4gY3RybC5pdGVtc1RvQWRkLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgcG9pbnRzOiAnJyxcclxuICAgICAgICAgICAgc3RhdGU6ICcnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9aXRlbT0+IHtcclxuICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gaXRlbTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuYWRkSXRlbSA9KCk9PiB7XHJcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJOaWV1dy4uLlwiLFxyXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBvcmRlcjogMCxcclxuICAgICAgICAgICAgICAgIHN0YXRlOiAwLFxyXG4gICAgICAgICAgICAgICAgc3ByaW50OiBcIlwiXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmFkZChuZXdJdGVtKS50aGVuKGRhdGE9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zLiRnZXRSZWNvcmQoZGF0YS5rZXkpKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9aXRlbT0+IHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gY3RybC5CaUl0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RJbmRleCA9IGluZGV4ID09PSAwID8gMCA6IGluZGV4LTE7XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5yZW1vdmUoaXRlbSkudGhlbigoKT0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXNbc2VsZWN0SW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5zYXZlSXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUoaXRlbSkudGhlbigoKT0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID14PT4ge1xyXG4gICAgICAgICAgICB4ID09IGN0cmwuZmlsdGVyLnN0YXRlXHJcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0ge25hbWU6IGN0cmwuZmlsdGVyLm5hbWV9XHJcbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBjdHJsLnNvcnRDb25maWcgPSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgICAgICAgICBvblNvcnQoZSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nLmh0bWxgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0Zvcm0nLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGl0ZW06IFwiPFwiLFxyXG4gICAgICAgIHNwcmludHM6IFwiPFwiLFxyXG4gICAgICAgIG9uQWRkOiBcIiZcIixcclxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXHJcbiAgICAgICAgb25TYXZlOiBcIiZcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0Zvcm0uaHRtbGAgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nSXRlbScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogJzwnLFxyXG4gICAgICAgIG9uQ2xpY2s6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dJdGVtLmh0bWxgIFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgb3B0aW9uczogJzwnLFxyXG4gICAgICAgIGRhdGE6ICc8JyxcclxuICAgICAgICBsb2FkZWQ6ICc8JyxcclxuICAgICAgICB0eXBlOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xyXG5cclxuICAgICAgICBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICBpZihjdHJsLmNoYXJ0KSBjdHJsLmNoYXJ0LmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgICAgIGN0cmwuY2hhcnQgPSBuZXcgQ2hhcnQoJGNhbnZhcywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogY3RybC50eXBlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3RybC5kYXRhLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY3RybC5vcHRpb25zXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmNoYXJ0ID0gY3RybC5jaGFydDtcclxuXHJcbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24ucGF0aCgpID09PSAnLycpIHtcclxuICAgICAgICAgICAgICAgICRjYW52YXMub25jbGljayA9ZT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aXZlUG9pbnRzID0gY3RybC5jaGFydC5nZXRFbGVtZW50c0F0RXZlbnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZFNwcmludCA9IGFjdGl2ZVBvaW50c1sxXS5faW5kZXggKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKT0+ICRsb2NhdGlvbi5wYXRoKGAvc3ByaW50LyR7Y2xpY2tlZFNwcmludH1gKSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJHdhdGNoKCgpPT4gY3RybC5sb2FkZWQsIGxvYWRlZD0+IHtcclxuICAgICAgICAgICAgaWYoIWxvYWRlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJ3NwcmludDp1cGRhdGUnLCAoKT0+IHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCk9PmN0cmwuY2hhcnQudXBkYXRlKCkpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGA8Y2FudmFzPjwvY2FudmFzPmAgXHJcbn0pICIsImFwcC5jb21wb25lbnQoJ2Zvb3RlcicsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgc3ByaW50OiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuXHJcbiAgICAgICAgY3RybC5zdGF0T3BlbiA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB1c2VyOiAnPCcsXHJcbiAgICAgICAgb3BlbjogJzwnLFxyXG4gICAgICAgIG9uU2lnbk91dDogJyYnLFxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnc2lnbmluJywge1xyXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCAkbG9jYXRpb24pIHsgXHJcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc2lnbkluID0obmFtZSwgZW1haWwpPT4ge1xyXG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IFxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZ25pbi5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRCYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtczogXCI8XCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludEJhY2tsb2cuaHRtbGAgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxyXG4gICAgICAgIGNoYXJ0OiAnPSdcclxuICAgIH0sXHJcblxyXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlLCBCYWNrbG9nU2VydmljZSwgJHNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxyXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXHJcbiAgICAgICAgICAgIERvbmU6IFwiM1wiLFxyXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGN0cmwuY2hhcnQuc3ByaW50KSB7XHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coY3RybC5jaGFydC5zcHJpbnQpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xyXG4gICAgICAgICAgICB4ID09IGN0cmwuZmlsdGVyLnN0YXRlXHJcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0geyBuYW1lOiBjdHJsLmZpbHRlci5uYW1lIH1cclxuICAgICAgICAgICAgICAgIDogY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGJhY2tsb2c7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZChiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRhZGQoYmFja2xvZ0l0ZW0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiByZW1vdmUoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kcmVtb3ZlKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHNhdmUoYmFja2xvZ0l0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0QmFja2xvZyxcclxuICAgICAgICBzYXZlLFxyXG4gICAgICAgIGFkZCxcclxuICAgICAgICByZW1vdmVcclxuICAgIH07XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xyXG4gICAgbGV0IGJhckNvbG9yID0gJyM1RkZBRkMnO1xyXG4gICAgbGV0IGNoYXJ0VHlwZSA9IFwibGluZVwiO1xyXG5cclxuICAgIGxldCBjaGFydE9wdGlvbnMgPSB7XHJcbiAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICB0b29sdGlwczoge1xyXG4gICAgICAgICAgICBtb2RlOiAnc2luZ2xlJyxcclxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWxlbWVudHM6IHtcclxuICAgICAgICAgICAgbGluZToge1xyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgbGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcclxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0yXCIsXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IG92ZXJ2aWV3RGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtdLCBcclxuICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XHJcbiAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiXSxcclxuICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJHZWhhYWxkXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXHJcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxyXG4gICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiTWVhbiBCdXJuZG93blwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50cyhjYikge1xyXG4gICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoMTUpKTtcclxuICAgICAgICBzcHJpbnRzLiRsb2FkZWQoY2IsICgpPT4gJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRPdmVydmlld0NoYXJ0KCkge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cyA9PiB7XHJcblxyXG4gICAgICAgICAgICBzcHJpbnRzLiRsb2FkZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7ICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgIHNwcmludHMuJHdhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTsgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XHJcbiAgICAgICAgICAgICAgICB9KTsgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpIHtcclxuXHJcbiAgICAgICAgbGV0IGxhYmVscztcclxuICAgICAgICBsZXQgZXN0aW1hdGVkO1xyXG4gICAgICAgIGxldCBidXJuZWQ7XHJcblxyXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xyXG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XHJcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IG92ZXJ2aWV3RGF0YTtcclxuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBidXJuZWQ7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZXN0aW1hdGVkO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudFNwcmludCA9IHNwcmludHNbc3ByaW50cy5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImJhclwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFydE9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBjdXJyZW50U3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLyBjdXJyZW50U3ByaW50LmR1cmF0aW9uLCAxKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2hhcnRPYmopO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpIHtcclxuICAgICAgICBsZXQgaWRlYWxCdXJuZG93biA9IGJ1cm5kb3duRGF0YS5sYWJlbHMubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBidXJuZG93bkRhdGEubGFiZWxzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcHJpbnQudmVsb2NpdHkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKChzcHJpbnQudmVsb2NpdHkgLyA5KSAqIGkpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgfSkucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcclxuICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcclxuICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gc3ByaW50LmJ1cm5kb3duW3hdO1xyXG4gICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IGJ1cm5kb3duRGF0YTtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xyXG5cclxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7IFxyXG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcclxuICAgICAgICAgICAgb3B0aW9uczogY2hhcnRPcHRpb25zLCBcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgdmVsb2NpdHk6IHNwcmludC52ZWxvY2l0eSxcclxuICAgICAgICAgICAgbmFtZTogc3ByaW50Lm5hbWUsXHJcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICByZW1haW5pbmc6IHNwcmludC52ZWxvY2l0eSAtIF8uc3VtKHNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uLCAxKSxcclxuICAgICAgICAgICAgc3ByaW50OiBzcHJpbnRcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzcHJpbnRzLiRrZXlBdChzcHJpbnRzLmxlbmd0aC0xKTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnROdW1iZXIgPSBjdXJyZW50LnNwbGl0KFwic1wiKVsxXTtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTcHJpbnQuJHdhdGNoKGU9PiB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50Q2hhcnQoc3ByaW50TnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgc3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy9zJHtzcHJpbnROdW1iZXJ9YCkpO1xyXG5cclxuICAgICAgICAgICAgc3ByaW50LiR3YXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U3ByaW50cyxcclxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxyXG4gICAgICAgIGdldEN1cnJlbnRDaGFydCxcclxuICAgICAgICBnZXRTcHJpbnRDaGFydFxyXG4gICAgfVxyXG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XHJcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwYWQsXHJcbiAgICAgICAgc3VtXHJcbiAgICB9XHJcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
