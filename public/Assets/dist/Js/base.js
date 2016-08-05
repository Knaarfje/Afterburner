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
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="true">\n                    </sprints>\n                </app>'
    }).when('/sprint/:sprint', {
        resolve: {
            chart: function chart(SprintService, $route) {
                var sprint = $route.current.params.sprint;
                return SprintService.getSprintChart(sprint);
            }
        },
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="true">\n                    </sprints>\n                </app>'
    }).when('/bigscreen', {
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getOverviewChart();
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="\'Overview\'" \n                             back-title="\'Velocity\'" \n                             chart="$resolve.chart">\n                    </sprints> \n                </bigscreen>'
    }).when('/bigscreen/current-sprint', {
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getCurrentChart();
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="false">\n                    </sprints>\n                </bigscreen>'
    }).when('/bigscreen/sprint/:sprint', {
        resolve: {
            chart: function chart(SprintService, $route) {
                var sprint = $route.current.params.sprint;
                return SprintService.getSprintChart(sprint);
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="false">\n                    </sprints>\n                </bigscreen>'
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

        ctrl.selectItem = function (item) {
            ctrl.formOpen = true;
            ctrl.selectedItem = item;
        };

        ctrl.addItem = function () {
            var newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: -1,
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

            if (item.state == ctrl.state.Done) {
                item.resolvedOn = Date.now();
            } else {
                item.resolvedOn = null;
            }

            BacklogService.save(item).then(function () {
                ctrl.formOpen = false;
            });
        };

        ctrl.filterItems = function (x) {
            x == ctrl.filter.state ? ctrl.filter = { name: ctrl.filter.name } : ctrl.filter.state = x;
        };

        ctrl.sortConfig = {
            animation: 150,
            handle: '.sortable-handle',
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

app.component('bigscreen', {
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
    templateUrl: templatePath + '/bigscreen.html'
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
        backlog: '<',
        chart: '='
    },

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout) {
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

        if (ctrl.chart.sprint && ctrl.backlog) {
            BacklogService.getBacklog(ctrl.chart.sprint).then(function (data) {
                ctrl.BiItems = data;
                $timeout(function () {
                    return ctrl.loaded = true;
                });
            });
        }

        ctrl.filterItems = function (x) {
            x == ctrl.filter.state ? ctrl.filter = { name: ctrl.filter.name } : ctrl.filter.state = x;
        };

        ctrl.$onInit = function () {
            if (!ctrl.chart.sprint || !ctrl.backlog) {
                ctrl.loaded = true;
            }
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
            display: false
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
            label: "Average",
            data: [],
            fill: false,
            backgroundColor: "#58F484",
            borderColor: "#58F484",
            hoverBackgroundColor: '#58F484',
            hoverBorderColor: '#58F484',
            yAxisID: 'y-axis-1'
        }, {
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
        var average = [];

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

        var sum = 0;
        for (var i = 0; i < burned.length; i++) {
            sum += parseInt(burned[i], 10); //don't forget to add the base
        }
        var avg = sum / burned.length;
        for (var i = 0; i < sprints.length; i++) {
            average.push(avg);
        }

        var data = overviewData;
        data.labels = labels;
        data.datasets[2].data = burned;
        data.datasets[1].data = estimated;
        data.datasets[0].data = average;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwic2lkZU5hdi9zaWRlTmF2LmpzIiwic2lnbmluL3NpZ25pbi5qcyIsInNwcmludEJhY2tsb2cvc3ByaW50QmFja2xvZy5qcyIsInNwcmludHMvc3ByaW50cy5qcyIsIkJhY2tsb2dTZXJ2aWNlLmpzIiwiU3ByaW50U2VydmljZS5qcyIsIlV0aWxpdHlTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsV0FBVyxDQUFDLGNBQWMsRUFBRTtBQUMxQixhQUFXLEVBQUU7QUFDWCxZQUFRLEVBQUU7QUFDUixhQUFPLEVBQUUsRUFBRTtBQUNYLGVBQVMsRUFBRTtBQUNULGdCQUFRLEVBQUUsSUFBSTtBQUNkLG9CQUFZLEVBQUUsR0FBRztPQUNsQjtLQUNGO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsYUFBTyxFQUFFLFNBQVM7S0FDbkI7QUFDRCxXQUFPLEVBQUU7QUFDUCxZQUFNLEVBQUUsUUFBUTtBQUNoQixjQUFRLEVBQUU7QUFDUixlQUFPLEVBQUUsQ0FBQztBQUNWLGVBQU8sRUFBRSxTQUFTO09BQ25CO0FBQ0QsZUFBUyxFQUFFO0FBQ1Qsa0JBQVUsRUFBRSxDQUFDO09BQ2Q7QUFDRCxhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGVBQU8sRUFBRSxHQUFHO0FBQ1osZ0JBQVEsRUFBRSxHQUFHO09BQ2Q7S0FDRjtBQUNELGFBQVMsRUFBRTtBQUNULGFBQU8sRUFBRSxHQUFHO0FBQ1osY0FBUSxFQUFFLEtBQUs7QUFDZixZQUFNLEVBQUU7QUFDTixnQkFBUSxFQUFFLEtBQUs7QUFDZixlQUFPLEVBQUUsQ0FB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QixDQUFBO0NBQ0osQ0FBQyxDQUFDOzs7QUNwU0gsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFXO0FBQ3JDLGFBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNaLGVBQU8sQUFBQyxDQUFDLEdBQUcsRUFBRSxHQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0tBQ25DLENBQUM7O0FBRUYsYUFBUyxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLGFBQUssSUFBSSxDQUFDLElBQUksS0FBSztBQUFFLGFBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxBQUNuQyxPQUFPLENBQUMsQ0FBQztLQUNaLENBQUM7O0FBRUYsV0FBTztBQUNILFdBQUcsRUFBSCxHQUFHO0FBQ0gsV0FBRyxFQUFILEdBQUc7S0FDTixDQUFBO0NBQ0osQ0FBQyxDQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJwYXJ0aWNsZXNKUyhcInBhcnRpY2xlcy1qc1wiLCB7XG4gIFwicGFydGljbGVzXCI6IHtcbiAgICBcIm51bWJlclwiOiB7XG4gICAgICBcInZhbHVlXCI6IDEwLFxuICAgICAgXCJkZW5zaXR5XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJ2YWx1ZV9hcmVhXCI6IDgwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb2xvclwiOiB7XG4gICAgICBcInZhbHVlXCI6IFwiI2ZmZmZmZlwiXG4gICAgfSxcbiAgICBcInNoYXBlXCI6IHtcbiAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxuICAgICAgXCJzdHJva2VcIjoge1xuICAgICAgICBcIndpZHRoXCI6IDAsXG4gICAgICAgIFwiY29sb3JcIjogXCIjMDAwMDAwXCJcbiAgICAgIH0sXG4gICAgICBcInBvbHlnb25cIjoge1xuICAgICAgICBcIm5iX3NpZGVzXCI6IDVcbiAgICAgIH0sXG4gICAgICBcImltYWdlXCI6IHtcbiAgICAgICAgXCJzcmNcIjogXCJpbWcvZ2l0aHViLnN2Z1wiLFxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcbiAgICAgICAgXCJoZWlnaHRcIjogMTAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcIm9wYWNpdHlcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAwLjEsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEsXG4gICAgICAgIFwib3BhY2l0eV9taW5cIjogMC4wMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcInNpemVcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAzLFxuICAgICAgXCJyYW5kb21cIjogdHJ1ZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEwLFxuICAgICAgICBcInNpemVfbWluXCI6IDAuMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcImRpc3RhbmNlXCI6IDE1MCxcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXG4gICAgICBcIm9wYWNpdHlcIjogMC4wNSxcbiAgICAgIFwid2lkdGhcIjogMVxuICAgIH0sXG4gICAgXCJtb3ZlXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcInNwZWVkXCI6IDIsXG4gICAgICBcImRpcmVjdGlvblwiOiBcIm5vbmVcIixcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcbiAgICAgIFwib3V0X21vZGVcIjogXCJvdXRcIixcbiAgICAgIFwiYm91bmNlXCI6IGZhbHNlLFxuICAgICAgXCJhdHRyYWN0XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwicm90YXRlWFwiOiA2MDAsXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImludGVyYWN0aXZpdHlcIjoge1xuICAgIFwiZGV0ZWN0X29uXCI6IFwiY2FudmFzXCIsXG4gICAgXCJldmVudHNcIjoge1xuICAgICAgXCJvbmhvdmVyXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXG4gICAgICB9LFxuICAgICAgXCJvbmNsaWNrXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwicHVzaFwiXG4gICAgICB9LFxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJtb2Rlc1wiOiB7XG4gICAgICBcImdyYWJcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDE0MCxcbiAgICAgICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJ1YmJsZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogNDAwLFxuICAgICAgICBcInNpemVcIjogNDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcbiAgICAgICAgXCJvcGFjaXR5XCI6IC4xLFxuICAgICAgICBcInNwZWVkXCI6IDMwMFxuICAgICAgfSxcbiAgICAgIFwicmVwdWxzZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMjAwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxuICAgICAgfSxcbiAgICAgIFwicHVzaFwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcbiAgICAgIH0sXG4gICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwicmV0aW5hX2RldGVjdFwiOiB0cnVlXG59KTsiLCJpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc2NyaXB0cy9zZXJ2aWNld29ya2VyLmpzJyk7XG59XG5cbmNvbnN0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiYWZ0ZXJidXJuZXJBcHBcIiwgW1wiZmlyZWJhc2VcIiwgJ25nVG91Y2gnLCAnbmdSb3V0ZScsICduZy1zb3J0YWJsZSddKTtcbmNvbnN0IHRlbXBsYXRlUGF0aCA9ICcuL0Fzc2V0cy9kaXN0L1RlbXBsYXRlcyc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikge1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNJenlDRVlSalM0dWZoZWR4d0I0dkNDOWxhNTJHc3JYTVwiLFxuICAgICAgICBhdXRoRG9tYWluOiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuYXBwc3BvdC5jb21cIixcbiAgICB9O1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpOyBcblxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvc2lnbmluJywgeyBcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNpZ25pbj48L3NpZ25pbj4nXG4gICAgICAgIH0pIFxuICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldE92ZXJ2aWV3Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ1ZlbG9jaXR5J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSkgICAgICAgIFxuICAgICAgICAud2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL3NwcmludC86c3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbi9jdXJyZW50LXNwcmludCcsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuL3NwcmludC86c3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2JhY2tsb2cnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidPdmVydmlldydcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxuICAgICAgICB9KSBcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdhcHAnLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYXBwLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2cnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgYmFja1RpdGxlOiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIFNwcmludFNlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XG5cbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiIFxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XG5cbiAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZGF0YT0+IHtcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XG4gICAgICAgICAgICBjdHJsLnJlT3JkZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICB9KVxuXG4gICAgICAgIGN0cmwucmVPcmRlciA9KCk9PiBjdHJsLkJpSXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpPT4ge1xuICAgICAgICAgICAgaWYoaXRlbS5vcmRlciAhPT0gaW5kZXgpIHsgXG4gICAgICAgICAgICAgICAgaXRlbS5vcmRlciA9IGluZGV4O1xuICAgICAgICAgICAgICAgIGN0cmwuc2F2ZUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9aXRlbT0+IHtcbiAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5hZGRJdGVtID0oKT0+IHtcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiTmlldXcuLi5cIixcbiAgICAgICAgICAgICAgICBlZmZvcnQ6IDAsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IC0xLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAwLFxuICAgICAgICAgICAgICAgIHNwcmludDogXCJcIlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5hZGQobmV3SXRlbSkudGhlbihkYXRhPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXMuJGdldFJlY29yZChkYXRhLmtleSkpO1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmRlbGV0ZUl0ZW0gPWl0ZW09PiB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjdHJsLkJpSXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgIGxldCBzZWxlY3RJbmRleCA9IGluZGV4ID09PSAwID8gMCA6IGluZGV4LTE7XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnJlbW92ZShpdGVtKS50aGVuKCgpPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXNbc2VsZWN0SW5kZXhdKTtcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLnNhdmVJdGVtID0gKGl0ZW0pID0+IHtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uc3RhdGUgPT0gY3RybC5zdGF0ZS5Eb25lKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2Uuc2F2ZShpdGVtKS50aGVuKCgpPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9eD0+IHtcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0ge25hbWU6IGN0cmwuZmlsdGVyLm5hbWV9XG4gICAgICAgICAgICAgICAgOiBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XG4gICAgICAgIH0gXG5cbiAgICAgICAgY3RybC5zb3J0Q29uZmlnID0ge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXG4gICAgICAgICAgICBoYW5kbGU6ICcuc29ydGFibGUtaGFuZGxlJyxcbiAgICAgICAgICAgIG9uU29ydChlKSB7XG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtOiBcIjxcIixcbiAgICAgICAgc3ByaW50czogXCI8XCIsXG4gICAgICAgIG9uQWRkOiBcIiZcIixcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxuICAgICAgICBvblNhdmU6IFwiJlwiXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgIFxufSk7ICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8JyxcbiAgICAgICAgb25DbGljazogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdiaWdzY3JlZW4nLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmlnc2NyZWVuLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIG9wdGlvbnM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBsb2FkZWQ6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XG5cbiAgICAgICAgY3RybC5jaGFydDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgaWYoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGN0cmwuY2hhcnQgPSBuZXcgQ2hhcnQoJGNhbnZhcywge1xuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHJsLmRhdGEsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY3RybC5vcHRpb25zXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2luZG93LmNoYXJ0ID0gY3RybC5jaGFydDtcblxuICAgICAgICAgICAgaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJykge1xuICAgICAgICAgICAgICAgICRjYW52YXMub25jbGljayA9ZT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZFNwcmludCA9IGFjdGl2ZVBvaW50c1sxXS5faW5kZXggKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCk9PiAkbG9jYXRpb24ucGF0aChgL3NwcmludC8ke2NsaWNrZWRTcHJpbnR9YCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaCgoKT0+IGN0cmwubG9hZGVkLCBsb2FkZWQ9PiB7XG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oJ3NwcmludDp1cGRhdGUnLCAoKT0+IHtcbiAgICAgICAgICAgICR0aW1lb3V0KCgpPT5jdHJsLmNoYXJ0LnVwZGF0ZSgpKTtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBgPGNhbnZhcz48L2NhbnZhcz5gIFxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHNwcmludDogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zdGF0T3BlbiA9IGZhbHNlO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6ICc8JyxcbiAgICAgICAgb3BlbjogJzwnLFxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWRlTmF2Lmh0bWxgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdzaWduaW4nLCB7XG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCAkbG9jYXRpb24pIHsgXG4gICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIGN0cmwuc2lnbkluID0obmFtZSwgZW1haWwpPT4ge1xuICAgICAgICAgICAgJGZpcmViYXNlQXV0aCgpLiRzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChuYW1lLCBlbWFpbCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZ25pbi5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnc3ByaW50QmFja2xvZycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtczogXCI8XCJcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50QmFja2xvZy5odG1sYCBcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxuICAgICAgICBiYWNrbG9nOiAnPCcsXG4gICAgICAgIGNoYXJ0OiAnPSdcbiAgICB9LFxuXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlLCBCYWNrbG9nU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxuICAgICAgICB9O1xuXG5cbiAgICAgICAgY3RybC5sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludCAmJiBjdHJsLmJhY2tsb2cpIHtcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coY3RybC5jaGFydC5zcHJpbnQpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKT0+IGN0cmwubG9hZGVkID0gdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0geyBuYW1lOiBjdHJsLmZpbHRlci5uYW1lIH1cbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmKCFjdHJsLmNoYXJ0LnNwcmludCB8fCAhY3RybC5iYWNrbG9nKXtcbiAgICAgICAgICAgICAgICBjdHJsLmxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGAgXG59KTsgICIsImFwcC5mYWN0b3J5KCdCYWNrbG9nU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBiYWNrbG9nO1xuXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZChiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRyZW1vdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHNhdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEJhY2tsb2csXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcbiAgICBsZXQgY2hhcnRUeXBlID0gXCJsaW5lXCI7XG5cbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICB9LFxuICAgICAgICBlbGVtZW50czoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTJcIixcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBvdmVydmlld0RhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW10sIFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBdmVyYWdlXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM1OEY0ODRcIixcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNThGNDg0XCIsXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNThGNDg0JyxcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzU4RjQ4NCcsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkVzdGltYXRlZFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgbGV0IGJ1cm5kb3duRGF0YSA9IHtcbiAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiXSxcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJHZWhhYWxkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XG4gICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoMTUpKTtcbiAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0T3ZlcnZpZXdDaGFydCgpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHMgPT4ge1xuXG4gICAgICAgICAgICBzcHJpbnRzLiRsb2FkZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpOyAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIHNwcmludHMuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcbiAgICAgICAgICAgICAgICB9KTsgICAgXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpIHtcblxuICAgICAgICBsZXQgbGFiZWxzO1xuICAgICAgICBsZXQgZXN0aW1hdGVkO1xuICAgICAgICBsZXQgYnVybmVkO1xuICAgICAgICBsZXQgYXZlcmFnZSA9IFtdO1xuXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xuICAgICAgICBidXJuZWQgPSBzcHJpbnRzLm1hcChkID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50KGJ1cm5lZFtpXSwgMTApOyAvL2Rvbid0IGZvcmdldCB0byBhZGQgdGhlIGJhc2VcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXZnID0gc3VtIC8gYnVybmVkLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhdmVyYWdlLnB1c2goYXZnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRhID0gb3ZlcnZpZXdEYXRhO1xuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgZGF0YS5kYXRhc2V0c1syXS5kYXRhID0gYnVybmVkO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBlc3RpbWF0ZWQ7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGF2ZXJhZ2U7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSBzcHJpbnRzW3NwcmludHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xuICAgICAgICAgICAgdHlwZTogXCJiYXJcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNoYXJ0T3B0aW9ucyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XG4gICAgICAgIGxldCBpZGVhbEJ1cm5kb3duID0gYnVybmRvd25EYXRhLmxhYmVscy5tYXAoKGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmIChpID09PSBidXJuZG93bkRhdGEubGFiZWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5LnRvRml4ZWQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKChzcHJpbnQudmVsb2NpdHkgLyA5KSAqIGkpLnRvRml4ZWQoMik7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcblxuICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhID0gYnVybmRvd25EYXRhO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcblxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7IFxuICAgICAgICAgICAgdHlwZTogXCJsaW5lXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFydE9wdGlvbnMsIFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiBzcHJpbnQudmVsb2NpdHksXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgcmVtYWluaW5nOiBzcHJpbnQudmVsb2NpdHkgLSBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpLFxuICAgICAgICAgICAgc3ByaW50OiBzcHJpbnRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc3ByaW50cy4ka2V5QXQoc3ByaW50cy5sZW5ndGgtMSk7XG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XG4gICAgICAgICAgICBjdXJyZW50U3ByaW50LiR3YXRjaChlPT4ge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNwcmludENoYXJ0KHNwcmludE51bWJlcikge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XG5cbiAgICAgICAgICAgIHNwcmludC4kd2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTcHJpbnRzLFxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxuICAgICAgICBnZXRDdXJyZW50Q2hhcnQsXG4gICAgICAgIGdldFNwcmludENoYXJ0XG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFkKG4pIHtcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB4IGluIGl0ZW1zKSBpICs9IGl0ZW1zW3hdO1xuICAgICAgICByZXR1cm4gaTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFkLFxuICAgICAgICBzdW1cbiAgICB9XG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
