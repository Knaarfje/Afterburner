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

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', "angular.filter", 'ng-sortable']);
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

        ctrl.reOrder = function (group) {
            if (group) {
                group.forEach(function (item, index) {
                    if (item.order !== index) {
                        item.order = index;
                        ctrl.saveItem(item);
                    }
                });
            }
        };

        ctrl.sumEffort = function (items) {
            var sum = 0;
            for (var i in items) {
                sum += items[i].effort;
            }

            return sum;
        };

        ctrl.orderBySprint = function (key) {
            if (!key) {
                return 99999;
            }
            return ctrl.sprints.$getRecord(key).order;
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
                item.resolvedOn = item.resolvedOn || Date.now();
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
            group: 'backlogitems',
            onAdd: function onAdd(e) {
                var model = e.model;
                var sprint = e.models[0].sprint;
                if (model && model.sprint != sprint) {
                    var index = ctrl.BiItems.$indexFor(model.$id);
                    ctrl.BiItems[index].sprint = sprint;
                    ctrl.BiItems.$save(index);
                    ctrl.reOrder(e.models);
                }
            },
            onRemove: function onRemove(e) {
                ctrl.reOrder(e.models);
            },
            onUpdate: function onUpdate(e) {
                ctrl.reOrder(e.models);
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

app.component('overviewFooter', {
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

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout, $rootScope) {
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

                ctrl.BiItems.$loaded(function () {
                    if (ctrl.chart.sprint.start) {
                        ctrl.setBurndown(ctrl.chart.sprint.start, ctrl.chart.sprint.duration, ctrl.BiItems);
                        ctrl.BiItems.$watch(function (e) {
                            ctrl.setBurndown(ctrl.chart.sprint.start, ctrl.chart.sprint.duration, ctrl.BiItems);
                            $rootScope.$broadcast('sprint:update');
                        });
                    }
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

        /// This method is responsible for building the graphdata by backlog items       
        ctrl.setBurndown = function (start, duration, backlog) {
            start = new Date(start * 1000);
            var dates = [];
            var burndown = [];
            var daysToAdd = 0;
            var velocityRemaining = ctrl.chart.sprint.velocity;
            var graphableBurndown = [];

            for (var i = 0; i <= duration; i++) {
                var newDate = start.addDays(daysToAdd - 1);
                if (newDate > new Date()) {
                    continue;
                }

                while ([0, 6].indexOf(newDate.getDay()) >= 0) {
                    daysToAdd++;
                    newDate = start.addDays(daysToAdd);
                }
                dates.push(newDate);
                daysToAdd++;
            }

            for (var i in dates) {
                var d = dates[i];
                var bdown = 0;

                for (var i2 in backlog) {
                    var bli = backlog[i2];
                    if (bli.state != "3") {
                        continue;
                    }

                    var bliDate = new Date(parseInt(bli.resolvedOn));
                    console.log(bliDate, d);
                    if (bliDate.getDate() == d.getDate() && bliDate.getMonth() == d.getMonth() && bliDate.getFullYear() == d.getFullYear()) {
                        bdown += bli.effort;
                    }
                }

                burndown.push({
                    date: d,
                    burndown: bdown
                });
            }

            console.log(burndown);

            for (var x in burndown) {
                velocityRemaining -= burndown[x].burndown;
                graphableBurndown.push(velocityRemaining);
            };
            ctrl.chart.data.datasets[0].data = graphableBurndown;
        };
    },
    templateUrl: templatePath + '/sprints.html'
});

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};
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
        labels: ["di", "wo", "do", "vr", "ma", "di ", "wo ", "do ", "vr ", "ma "],
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
        var sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(9));
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
        for (var i = 0; i < burned.length - 1; i++) {
            sum += parseInt(burned[i], 10); //don't forget to add the base
        }
        var avg = sum / (burned.length - 1);
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
        var labels = ["di", "wo", "do", "vr", "ma", "di ", "wo ", "do ", "vr ", "ma "].slice(0, sprint.duration + 1);

        var idealBurndown = labels.map(function (d, i) {
            if (i === labels.length - 1) {
                return sprint.velocity.toFixed(2);
            }
            return (sprint.velocity / sprint.duration * i).toFixed(2);
        }).reverse();

        var velocityRemaining = sprint.velocity;
        var graphableBurndown = [];

        for (var x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };

        var data = burndownData;
        data.labels = labels;
        data.datasets[0].data = graphableBurndown;
        data.datasets[1].data = idealBurndown;
        var burndownChartOptions = chartOptions;
        burndownChartOptions.scales.yAxes[0].ticks.suggestedMax = 10 * (sprint.duration + 1);
        burndownChartOptions.scales.yAxes[1].ticks.suggestedMax = 10 * (sprint.duration + 1);

        var chartObj = {
            type: "line",
            options: burndownChartOptions,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwib3ZlcnZpZXdGb290ZXIvb3ZlcnZpZXdGb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdBQUc7QUFDWixjQUFRLEVBQUUsS0FBSztBQUNmLFlBQU0sRUFBRTtBQUNO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SztBQUFFLGFBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxBQUNuQyxPQUFPLENBQUMsQ0FBQztLQUNaLENBQUM7O0FBRUYsV0FBTztBQUNILFdBQUcsRUFBSCxHQUFHO0FBQ0gsV0FBRyxFQUFILEdBQUc7S0FDTixDQUFBO0NBQ0osQ0FBQyxDQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJwYXJ0aWNsZXNKUyhcInBhcnRpY2xlcy1qc1wiLCB7XHJcbiAgXCJwYXJ0aWNsZXNcIjoge1xyXG4gICAgXCJudW1iZXJcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IDEwLFxyXG4gICAgICBcImRlbnNpdHlcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJ2YWx1ZV9hcmVhXCI6IDgwMFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJjb2xvclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogXCIjZmZmZmZmXCJcclxuICAgIH0sXHJcbiAgICBcInNoYXBlXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiY2lyY2xlXCIsXHJcbiAgICAgIFwic3Ryb2tlXCI6IHtcclxuICAgICAgICBcIndpZHRoXCI6IDAsXHJcbiAgICAgICAgXCJjb2xvclwiOiBcIiMwMDAwMDBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBvbHlnb25cIjoge1xyXG4gICAgICAgIFwibmJfc2lkZXNcIjogNVxyXG4gICAgICB9LFxyXG4gICAgICBcImltYWdlXCI6IHtcclxuICAgICAgICBcInNyY1wiOiBcImltZy9naXRodWIuc3ZnXCIsXHJcbiAgICAgICAgXCJ3aWR0aFwiOiAxMDAsXHJcbiAgICAgICAgXCJoZWlnaHRcIjogMTAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIm9wYWNpdHlcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IDAuMSxcclxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXHJcbiAgICAgIFwiYW5pbVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAxLFxyXG4gICAgICAgIFwib3BhY2l0eV9taW5cIjogMC4wMSxcclxuICAgICAgICBcInN5bmNcIjogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwic2l6ZVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMyxcclxuICAgICAgXCJyYW5kb21cIjogdHJ1ZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEwLFxyXG4gICAgICAgIFwic2l6ZV9taW5cIjogMC4xLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJsaW5lX2xpbmtlZFwiOiB7XHJcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgIFwiZGlzdGFuY2VcIjogMTUwLFxyXG4gICAgICBcImNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICBcIm9wYWNpdHlcIjogMC4wNSxcclxuICAgICAgXCJ3aWR0aFwiOiAxXHJcbiAgICB9LFxyXG4gICAgXCJtb3ZlXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJzcGVlZFwiOiAyLFxyXG4gICAgICBcImRpcmVjdGlvblwiOiBcIm5vbmVcIixcclxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXHJcbiAgICAgIFwic3RyYWlnaHRcIjogZmFsc2UsXHJcbiAgICAgIFwib3V0X21vZGVcIjogXCJvdXRcIixcclxuICAgICAgXCJib3VuY2VcIjogZmFsc2UsXHJcbiAgICAgIFwiYXR0cmFjdFwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXHJcbiAgICAgICAgXCJyb3RhdGVYXCI6IDYwMCxcclxuICAgICAgICBcInJvdGF0ZVlcIjogMTIwMFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcImludGVyYWN0aXZpdHlcIjoge1xyXG4gICAgXCJkZXRlY3Rfb25cIjogXCJjYW52YXNcIixcclxuICAgIFwiZXZlbnRzXCI6IHtcclxuICAgICAgXCJvbmhvdmVyXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICAgIFwibW9kZVwiOiBcImdyYWJcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm9uY2xpY2tcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwicHVzaFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicmVzaXplXCI6IHRydWVcclxuICAgIH0sXHJcbiAgICBcIm1vZGVzXCI6IHtcclxuICAgICAgXCJncmFiXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDE0MCxcclxuICAgICAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgICAgIFwib3BhY2l0eVwiOiAuMVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJidWJibGVcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogNDAwLFxyXG4gICAgICAgIFwic2l6ZVwiOiA0MCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDUsXHJcbiAgICAgICAgXCJvcGFjaXR5XCI6IC4xLFxyXG4gICAgICAgIFwic3BlZWRcIjogMzAwXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicmVwdWxzZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAyMDAsXHJcbiAgICAgICAgXCJkdXJhdGlvblwiOiAwLjRcclxuICAgICAgfSxcclxuICAgICAgXCJwdXNoXCI6IHtcclxuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicmVtb3ZlXCI6IHtcclxuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAyXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwicmV0aW5hX2RldGVjdFwiOiB0cnVlXHJcbn0pOyIsImlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XHJcbiAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3NjcmlwdHMvc2VydmljZXdvcmtlci5qcycpO1xyXG59XHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCIsICduZ1RvdWNoJywgJ25nUm91dGUnLCBcImFuZ3VsYXIuZmlsdGVyXCIsICduZy1zb3J0YWJsZSddKTtcclxuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcclxuICAgICAgICBhdXRoRG9tYWluOiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWFwcC5jb21cIixcclxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxyXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXHJcbiAgICB9O1xyXG5cclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXHJcblxyXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xyXG4gICAgICAgIH0pIFxyXG4gICAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pICAgICAgICBcclxuICAgICAgICAud2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3NwcmludC86c3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4nLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcclxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbi9jdXJyZW50LXNwcmludCcsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuL3NwcmludC86c3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmFja2xvZycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCwgXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9hcHAuaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuXHJcbiAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxyXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXHJcbiAgICAgICAgICAgIERvbmU6IFwiM1wiLFxyXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XHJcbiAgICAgICAgY3RybC5vcGVuID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XHJcbiAgICAgICAgICAgIGN0cmwucmVPcmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBTcHJpbnRTZXJ2aWNlLmdldFNwcmludHMoKHNwcmludHMpID0+IHtcclxuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjdHJsLnJlT3JkZXIgPSAoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgaWYgKGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBncm91cC5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9yZGVyICE9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yZGVyID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2F2ZUl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1bTsgIFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGN0cmwub3JkZXJCeVNwcmludCA9IChrZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5OTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY3RybC5zcHJpbnRzLiRnZXRSZWNvcmQoa2V5KS5vcmRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9IGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5hZGRJdGVtID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbmV3SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTmlldXcuLi5cIixcclxuICAgICAgICAgICAgICAgIGVmZm9ydDogMCxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IC0xLFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IDAsXHJcbiAgICAgICAgICAgICAgICBzcHJpbnQ6IFwiXCJcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuYWRkKG5ld0l0ZW0pLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zLiRnZXRSZWNvcmQoZGF0YS5rZXkpKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjdHJsLkJpSXRlbXMuaW5kZXhPZihpdGVtKTtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gaW5kZXggPT09IDAgPyAwIDogaW5kZXggLSAxO1xyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UucmVtb3ZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtc1tzZWxlY3RJbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnNhdmVJdGVtID0gKGl0ZW0pID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLnN0YXRlID09IGN0cmwuc3RhdGUuRG9uZSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gaXRlbS5yZXNvbHZlZE9uIHx8IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcclxuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZVxyXG4gICAgICAgICAgICAgICAgPyBjdHJsLmZpbHRlciA9IHsgbmFtZTogY3RybC5maWx0ZXIubmFtZSB9XHJcbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc29ydENvbmZpZyA9IHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAgICAgICAgIGhhbmRsZTogJy5zb3J0YWJsZS1oYW5kbGUnLFxyXG4gICAgICAgICAgICBncm91cDogJ2JhY2tsb2dpdGVtcycsXHJcbiAgICAgICAgICAgIG9uQWRkKGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtb2RlbCA9IGUubW9kZWw7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gZS5tb2RlbHNbMF0uc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsICYmIG1vZGVsLnNwcmludCAhPSBzcHJpbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBjdHJsLkJpSXRlbXMuJGluZGV4Rm9yKG1vZGVsLiRpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zW2luZGV4XS5zcHJpbnQgPSBzcHJpbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRzYXZlKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvblJlbW92ZShlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uVXBkYXRlKGUpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dGb3JtJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtOiBcIjxcIixcclxuICAgICAgICBzcHJpbnRzOiBcIjxcIixcclxuICAgICAgICBvbkFkZDogXCImXCIsXHJcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxyXG4gICAgICAgIG9uU2F2ZTogXCImXCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgIFxyXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0l0ZW0nLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGl0ZW06ICc8JyxcclxuICAgICAgICBvbkNsaWNrOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nSXRlbS5odG1sYCBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmlnc2NyZWVuJywge1xyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXIoJGxvY2F0aW9uLCAkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XHJcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcclxuXHJcbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcclxuICAgICAgICAgICAgY3RybC5hdXRoLiRzaWduT3V0KCk7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JpZ3NjcmVlbi5odG1sYCAgIFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBvcHRpb25zOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIGxvYWRlZDogJzwnLFxyXG4gICAgICAgIHR5cGU6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQsICRzY29wZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XHJcblxyXG4gICAgICAgIGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgIGlmKGN0cmwuY2hhcnQpIGN0cmwuY2hhcnQuZGVzdHJveSgpO1xyXG5cclxuICAgICAgICAgICAgY3RybC5jaGFydCA9IG5ldyBDaGFydCgkY2FudmFzLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBjdHJsLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHJsLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjdHJsLm9wdGlvbnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuY2hhcnQgPSBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICAgICAgaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgJGNhbnZhcy5vbmNsaWNrID1lPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVQb2ludHMgPSBjdHJsLmNoYXJ0LmdldEVsZW1lbnRzQXRFdmVudChlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGlja2VkU3ByaW50ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xyXG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcclxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ292ZXJ2aWV3Rm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NpZGVOYXYnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzZXI6ICc8JyxcclxuICAgICAgICBvcGVuOiAnPCcsXHJcbiAgICAgICAgb25TaWduT3V0OiAnJicsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lkZU5hdi5odG1sYCBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdzaWduaW4nLCB7XHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcclxuICAgICAgICBjb25zdCBjdHJsID0gdGhpcztcclxuXHJcbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XHJcbiAgICAgICAgICAgICRmaXJlYmFzZUF1dGgoKS4kc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQobmFtZSwgZW1haWwpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NwcmludEJhY2tsb2cnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGl0ZW1zOiBcIjxcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50QmFja2xvZy5odG1sYCBcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ3NwcmludHMnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHRpdGxlOiAnPCcsXHJcbiAgICAgICAgYmFja1RpdGxlOiAnPCcsXHJcbiAgICAgICAgYmFja2xvZzogJzwnLFxyXG4gICAgICAgIGNoYXJ0OiAnPSdcclxuICAgIH0sXHJcblxyXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlLCBCYWNrbG9nU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxyXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXHJcbiAgICAgICAgICAgIERvbmU6IFwiM1wiLFxyXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGN0cmwuY2hhcnQuc3ByaW50ICYmIGN0cmwuYmFja2xvZykge1xyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKGN0cmwuY2hhcnQuc3ByaW50KS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGN0cmwubG9hZGVkID0gdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRsb2FkZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludC5zdGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldEJ1cm5kb3duKGN0cmwuY2hhcnQuc3ByaW50LnN0YXJ0LCBjdHJsLmNoYXJ0LnNwcmludC5kdXJhdGlvbiwgY3RybC5CaUl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiR3YXRjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0geCA9PiB7XHJcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcclxuICAgICAgICAgICAgICAgID8gY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfVxyXG4gICAgICAgICAgICAgICAgOiBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghY3RybC5jaGFydC5zcHJpbnQgfHwgIWN0cmwuYmFja2xvZykge1xyXG4gICAgICAgICAgICAgICAgY3RybC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8gVGhpcyBtZXRob2QgaXMgcmVzcG9uc2libGUgZm9yIGJ1aWxkaW5nIHRoZSBncmFwaGRhdGEgYnkgYmFja2xvZyBpdGVtcyAgICAgICAgXHJcbiAgICAgICAgY3RybC5zZXRCdXJuZG93biA9IChzdGFydCwgZHVyYXRpb24sIGJhY2tsb2cpID0+IHtcclxuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZShzdGFydCAqIDEwMDApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGJ1cm5kb3duID0gW107XHJcbiAgICAgICAgICAgIGxldCBkYXlzVG9BZGQgPSAwOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBjdHJsLmNoYXJ0LnNwcmludC52ZWxvY2l0eTtcclxuICAgICAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBkdXJhdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0ZSA9IHN0YXJ0LmFkZERheXMoZGF5c1RvQWRkIC0gMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3RGF0ZSA+IG5ldyBEYXRlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoWzAsIDZdLmluZGV4T2YobmV3RGF0ZS5nZXREYXkoKSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheXNUb0FkZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkYXRlcy5wdXNoKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gZGF0ZXNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgYmRvd24gPSAwO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiBpbiBiYWNrbG9nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsaSA9IGJhY2tsb2dbaTJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChibGkuc3RhdGUgIT0gXCIzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxpRGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KGJsaS5yZXNvbHZlZE9uKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYmxpRGF0ZSwgZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaURhdGUuZ2V0RGF0ZSgpID09IGQuZ2V0RGF0ZSgpICYmIGJsaURhdGUuZ2V0TW9udGgoKSA9PSBkLmdldE1vbnRoKCkgJiYgYmxpRGF0ZS5nZXRGdWxsWWVhcigpID09IGQuZ2V0RnVsbFllYXIoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZG93biArPSBibGkuZWZmb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBidXJuZG93bi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlOiBkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ1cm5kb3duOiBiZG93blxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhidXJuZG93bik7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4IGluIGJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBidXJuZG93blt4XS5idXJuZG93bjtcclxuICAgICAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0LmRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRzLmh0bWxgXHJcbn0pO1xyXG5cclxuRGF0ZS5wcm90b3R5cGUuYWRkRGF5cyA9IGZ1bmN0aW9uKGRheXMpXHJcbntcclxuICAgIHZhciBkYXQgPSBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSk7XHJcbiAgICBkYXQuc2V0RGF0ZShkYXQuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICByZXR1cm4gZGF0O1xyXG59XHJcbiIsImFwcC5mYWN0b3J5KCdCYWNrbG9nU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcclxuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XHJcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuICAgIGxldCBiYWNrbG9nO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XHJcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgaWYgKCFzcHJpbnQpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEJhY2tsb2csXHJcbiAgICAgICAgc2F2ZSxcclxuICAgICAgICBhZGQsXHJcbiAgICAgICAgcmVtb3ZlXHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnU3ByaW50U2VydmljZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGxpbmVDb2xvciA9ICcjRUI1MUQ4JztcclxuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcclxuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcclxuXHJcbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xyXG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXHJcbiAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVsZW1lbnRzOiB7XHJcbiAgICAgICAgICAgIGxpbmU6IHtcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgIHhBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgeUF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcclxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0yXCIsXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IG92ZXJ2aWV3RGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtdLCBcclxuICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBdmVyYWdlXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM1OEY0ODRcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1OEY0ODRcIixcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzU4RjQ4NCcsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzU4RjQ4NCcsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XHJcbiAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkdlaGFhbGRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXHJcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XHJcbiAgICAgICAgbGV0IHNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKS5saW1pdFRvTGFzdCg5KSk7XHJcbiAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0T3ZlcnZpZXdDaGFydCgpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHMgPT4ge1xyXG5cclxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpOyAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XHJcblxyXG4gICAgICAgIGxldCBsYWJlbHM7XHJcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcclxuICAgICAgICBsZXQgYnVybmVkO1xyXG4gICAgICAgIGxldCBhdmVyYWdlID0gW107XHJcblxyXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xyXG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XHJcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50KGJ1cm5lZFtpXSwgMTApOyAvL2Rvbid0IGZvcmdldCB0byBhZGQgdGhlIGJhc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGF2ZyA9IHN1bSAvIChidXJuZWQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGF2ZXJhZ2UucHVzaChhdmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1syXS5kYXRhID0gYnVybmVkO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGVzdGltYXRlZDtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBhdmVyYWdlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudFNwcmludCA9IHNwcmludHNbc3ByaW50cy5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImJhclwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBjaGFydE9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBjdXJyZW50U3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLyBjdXJyZW50U3ByaW50LmR1cmF0aW9uLCAxKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2hhcnRPYmopO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpIHtcclxuICAgICAgICBsZXQgbGFiZWxzID0gW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpIFwiLCBcIndvIFwiLCBcImRvIFwiLCBcInZyIFwiLCBcIm1hIFwiXS5zbGljZSgwLHNwcmludC5kdXJhdGlvbiArMSlcclxuXHJcbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBsYWJlbHMubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBsYWJlbHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbikgKiBpKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIH0pLnJldmVyc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XHJcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcclxuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcclxuICAgICAgICBsZXQgYnVybmRvd25DaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XHJcbiAgICAgICAgYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xyXG4gICAgICAgIGJ1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcclxuICAgICAgICAgICAgb3B0aW9uczogYnVybmRvd25DaGFydE9wdGlvbnMsIFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpLFxyXG4gICAgICAgICAgICBzcHJpbnQ6IHNwcmludFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYXJ0T2JqO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNwcmludHMuJGtleUF0KHNwcmludHMubGVuZ3RoLTEpO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvJHtjdXJyZW50fWApKTtcclxuICAgICAgICAgICAgY3VycmVudFNwcmludC4kd2F0Y2goZT0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoY3VycmVudFNwcmludCkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRDaGFydChzcHJpbnROdW1iZXIpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XHJcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XHJcblxyXG4gICAgICAgICAgICBzcHJpbnQuJHdhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRTcHJpbnRzLFxyXG4gICAgICAgIGdldE92ZXJ2aWV3Q2hhcnQsXHJcbiAgICAgICAgZ2V0Q3VycmVudENoYXJ0LFxyXG4gICAgICAgIGdldFNwcmludENoYXJ0XHJcbiAgICB9XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdVdGlsaXR5U2VydmljZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcGFkKG4pIHtcclxuICAgICAgICByZXR1cm4gKG4gPCAxMCkgPyAoXCIwXCIgKyBuKSA6IG47XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHN1bShpdGVtcykge1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBmb3IgKGxldCB4IGluIGl0ZW1zKSBpICs9IGl0ZW1zW3hdO1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHBhZCxcclxuICAgICAgICBzdW1cclxuICAgIH1cclxufSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
