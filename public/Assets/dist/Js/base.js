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

var reg;

if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/serviceworker.js').then(function () {
        return navigator.serviceWorker.ready;
    }).then(function (serviceWorkerRegistration) {
        console.log('Service Worker is ready :^)', reg);
        reg = serviceWorkerRegistration;
        // TODO
    })['catch'](function (error) {
        console.log('Service Worker error :^(', error);
    });

    navigator.serviceWorker.getRegistrations().then(function (a) {
        for (var i in a) {
            if (a[i].active.scriptURL.indexOf('/scripts/ser') >= 0) {
                a[i].unregister();
            }
        }
    });
}

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', "angular.filter", 'ng-sortable']);
var templatePath = './Assets/dist/Templates';

app.config(function ($locationProvider, $routeProvider) {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
        messagingSenderId: "767810429309"
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
    controller: function controller(BacklogService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope, NotificationService) {
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

        $scope.customOrder = function (key) {
            if (!ctrl.sprints) {
                return 0;
            }
            if (!key.sprint) {
                return 9999;
            }

            return -ctrl.sprints.$getRecord(key.sprint).order;
        };

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
            FileService.getAttachments(item).then(function (data) {
                ctrl.selectedItemAttachments = data;
            });
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
                NotificationService.notify('Smells like fire...', 'Work on "' + item.name + '" has been completed!');
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
        attachments: "<",
        onAdd: "&",
        onDelete: "&",
        onSave: "&"
    },
    controller: function controller(BacklogService, $firebaseAuth, $firebaseArray, $firebaseObject) {
        var ctrl = this;
        ctrl.attachmentsToAdd;

        var fileSelect = document.createElement('input');
        fileSelect.type = 'file';
        fileSelect.multiple = 'multiple';
        fileSelect.onchange = function (evt) {
            ctrl.uploadFiles(fileSelect.files);
        };

        var mimeMap = {};
        mimeMap["image/jpeg"] = "fa-picture-o";
        mimeMap["image/png"] = "fa-picture-o";
        mimeMap["image/gif"] = "fa-picture-o";
        mimeMap["image/tif"] = "fa-picture-o";
        mimeMap["application/pdf"] = "fa-file-pdf-o";
        mimeMap["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "fa-file-excel-o";
        mimeMap["application/vnd.openxmlformats-officedocument.presentationml.presentation"] = "fa-file-powerpoint-o";
        mimeMap["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "fa-file-word-o";
        mimeMap["application/x-zip-compressed"] = "fa-file-archive-o";
        mimeMap["video/webm"] = "fa-file-video-o";

        ctrl.getFileIcon = function (a) {
            if (mimeMap[a.mimetype]) {
                return mimeMap[a.mimetype];
            }

            return "fa-file-o";
        };

        ctrl.getFileExtention = function (a) {
            var parts = a.name.split('.');
            return parts[parts.length - 1];
        };

        ctrl.selectFiles = function () {
            if (!ctrl.item) {
                return;
            }
            fileSelect.click();
        };

        ctrl.uploadFiles = function (files) {
            for (var f in files) {
                var file = files[f];

                if (file instanceof File) {
                    ctrl.uploadFile(file);
                }
            }
        };

        ctrl.uploadFile = function (file) {
            var path = ctrl.item.$id + "/" + file.name;

            var key = -1;
            var attachment = {
                backlogItem: ctrl.item.$id,
                name: file.name,
                path: path,
                mimetype: file.type,
                state: 1,
                progress: 0
            };

            ctrl.attachments.$add(attachment).then(function (ref) {
                key = ref.key;

                var storageRef = firebase.storage().ref(path);
                var uploadTask = storageRef.put(file);
                uploadTask.on('state_changed', function progress(snapshot) {
                    var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                    var r = ctrl.attachments.$getRecord(key);
                    r.progress = progress;
                    ctrl.attachments.$save(r);
                }, function (error) {
                    // Handle unsuccessful uploads
                }, function () {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    var downloadURL = uploadTask.snapshot.downloadURL;
                    var r = ctrl.attachments.$getRecord(key);
                    r.url = downloadURL;
                    r.state = 0;
                    ctrl.attachments.$save(r);
                });
            });
        };

        ctrl.removeAttachment = function (a, e) {
            e.stopPropagation();
            e.preventDefault();
            ctrl.attachments.$remove(a);
            return false;
        };
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
    controller: function controller($element, $scope, $timeout, $location, $rootScope, SprintService) {
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
                            var clickedIndex = activePoints[1]._index;
                            var clickedSprint = SprintService.getCachedSprints()[clickedIndex].order;

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
    controller: function controller(NotificationService, $timeout, $scope) {
        var ctrl = this;
        ctrl.open = false;
        ctrl.hasSubscription = false;

        ctrl.checkSubscription = function () {
            reg.pushManager.getSubscription().then(function (sub) {
                if (sub) {
                    ctrl.hasSubscription = true;
                } else {
                    ctrl.hasSubscription = false;
                }
                $timeout(function () {
                    $scope.$apply();
                });
            });
        };

        ctrl.subscribe = function () {
            NotificationService.subscribe().then(function (d) {
                ctrl.checkSubscription();
            });
        };

        ctrl.unsubscribe = function () {
            NotificationService.unsubscribe().then(function (d) {
                ctrl.checkSubscription();
            });
        };
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
            var totalBurndown = 0;

            for (var i = 0; i <= duration; i++) {
                var newDate = start.addDays(daysToAdd - 1);
                if (newDate > new Date()) {
                    continue;
                }

                if ([0, 6].indexOf(newDate.getDay()) >= 0) {
                    daysToAdd++;
                    newDate = start.addDays(daysToAdd);
                    i--;
                    continue;
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
                    if (bliDate.getDate() == d.getDate() && bliDate.getMonth() == d.getMonth() && bliDate.getFullYear() == d.getFullYear()) {
                        bdown += bli.effort;
                    }
                }

                burndown.push({
                    date: d,
                    burndown: bdown
                });
            }

            for (var x in burndown) {
                totalBurndown += burndown[x].burndown;
                velocityRemaining -= burndown[x].burndown;
                graphableBurndown.push(velocityRemaining);
            };
            ctrl.chart.burndown = totalBurndown;
            ctrl.chart.remaining = velocityRemaining;
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
"use strict";

app.factory('FileService', function ($rootScope, UtilityService, $q, $timeout, $firebaseArray) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var attachments = undefined;

    function getAttachments(backlogItem) {
        return $q(function (resolve, reject) {
            if (!backlogItem) {
                reject("Backlog item not provided");
            } else {
                attachments = $firebaseArray(ref.child("attachments").orderByChild('backlogItem').equalTo(backlogItem.$id));
                resolve(attachments);
            }
        });
    }

    return {
        getAttachments: getAttachments
    };
});
'use strict';

app.factory('NotificationService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $firebaseAuth, $http) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var auth = $firebaseAuth();
    var userId = auth.$getAuth().uid;
    var reg = window.reg;
    var backlog = undefined;

    function subscribe() {

        return $q(function (resolve, reject) {
            console.log(reg);
            reg.pushManager.getSubscription().then(function (sub) {
                if (sub) {
                    resolve(false);
                    return;
                }
            });

            reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (pushSubscription) {
                var sub = pushSubscription;
                console.log('Subscribed! Endpoint:', sub.endpoint);
                var endpoint = sub.endpoint.split('/');
                endpoint = endpoint[endpoint.length - 1];

                var subscriptions = $firebaseArray(ref.child("subscriptions").orderByChild('endpoint').equalTo(endpoint));
                subscriptions.$loaded().then(function (data) {
                    if (!subscriptions.length > 0) {
                        subscriptions.$add({
                            uid: userId,
                            endpoint: endpoint,
                            keys: JSON.parse(JSON.stringify(pushSubscription)).keys
                        });
                    }

                    resolve(true);
                });
            });
        });
    }

    function unsubscribe() {
        return $q(function (resolve, reject) {
            reg.pushManager.getSubscription().then(function (sub) {
                if (!sub) {
                    resolve(false);
                    return;
                }

                var endpoint = sub.endpoint.split('/');
                endpoint = endpoint[endpoint.length - 1];

                sub.unsubscribe().then(function (d) {
                    var subscriptions = $firebaseArray(ref.child("subscriptions").orderByChild('endpoint').equalTo(endpoint));
                    subscriptions.$loaded().then(function (data) {
                        if (subscriptions.length > 0) {
                            subscriptions.$remove(0);
                        }
                        resolve(true);
                    });
                });
            });
        });
    }

    function notify(title, message) {
        return $q(function (resolve, reject) {
            $http({
                url: 'https://notifications.boerdamdns.nl/api/notify/post?title=' + title + '&message=' + message,
                method: 'POST'
            }).then(function (a) {
                resolve(a);
            });
        });
    }

    return {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        notify: notify
    };
});
'use strict';

app.factory('SprintService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var lineColor = '#EB51D8';
    var barColor = '#5FFAFC';
    var chartType = "line";
    var cachedSprints = undefined;

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
                    suggestedMax: null
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

    function getCachedSprints() {
        return cachedSprints;
    }

    function getOverviewChart() {
        var deferred = $q.defer();

        getSprints(function (sprints) {

            sprints.$loaded(function () {

                cachedSprints = sprints;
                updateOverviewChart(deferred, sprints);
                sprints.$watch(function () {
                    cachedSprints = sprints;
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

        var overviewChartOptions = chartOptions;
        overviewChartOptions.scales.yAxes[0].ticks.suggestedMax = 100;
        overviewChartOptions.scales.yAxes[1].ticks.suggestedMax = 100;

        var currentSprint = sprints[sprints.length - 1];

        var chartObj = {
            type: "bar",
            options: overviewChartOptions,
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
        getSprintChart: getSprintChart,
        getCachedSprints: getCachedSprints
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwib3ZlcnZpZXdGb290ZXIvb3ZlcnZpZXdGb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJGaWxlU2VydmljZS5qcyIsIk5vdGlmaWNhdGlvblNlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdB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QUFVO0FBQ1Ysd0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBZSxFQUFmLGVBQWU7QUFDZixzQkFBYyxFQUFkLGNBQWM7QUFDZCx3QkFBZ0IsRUFBaEIsZ0JBQWdCO0tBQ25CLENBQUE7Q0FDSixDQUFDLENBQUM7OztBQ3RUSCxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFlBQVc7QUFDckMsYUFBUyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ1osZUFBTyxBQUFDLENBQUMsR0FBRyxFQUFFLEdBQUssR0FBRyxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUM7S0FDbkMsQ0FBQzs7QUFFRixhQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUU7QUFDaEIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsYUFBSyxJQUFJLENBQUMsSUFBSSxLQUFLO0FBQUUsYUFBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFBLEFBQ25DLE9BQU8sQ0FBQyxDQUFDO0tBQ1osQ0FBQzs7QUFFRixXQUFPO0FBQ0gsV0FBRyxFQUFILEdBQUc7QUFDSCxXQUFHLEVBQUgsR0FBRztLQUNOLENBQUE7Q0FDSixDQUFDLENBQUEiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcclxuICBcInBhcnRpY2xlc1wiOiB7XHJcbiAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMTAsXHJcbiAgICAgIFwiZGVuc2l0eVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImNvbG9yXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxyXG4gICAgfSxcclxuICAgIFwic2hhcGVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcclxuICAgICAgXCJzdHJva2VcIjoge1xyXG4gICAgICAgIFwid2lkdGhcIjogMCxcclxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicG9seWdvblwiOiB7XHJcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaW1hZ2VcIjoge1xyXG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcclxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcclxuICAgICAgICBcImhlaWdodFwiOiAxMDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwib3BhY2l0eVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMC4xLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEsXHJcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzaXplXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAzLFxyXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMTAsXHJcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXHJcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxyXG4gICAgICBcIndpZHRoXCI6IDFcclxuICAgIH0sXHJcbiAgICBcIm1vdmVcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcInNwZWVkXCI6IDIsXHJcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcclxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxyXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcclxuICAgICAgXCJhdHRyYWN0XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxyXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XHJcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxyXG4gICAgXCJldmVudHNcIjoge1xyXG4gICAgICBcIm9uaG92ZXJcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwib25jbGlja1wiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcclxuICAgICAgfSxcclxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxyXG4gICAgfSxcclxuICAgIFwibW9kZXNcIjoge1xyXG4gICAgICBcImdyYWJcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxyXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImJ1YmJsZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXHJcbiAgICAgICAgXCJzaXplXCI6IDQwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcclxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcclxuICAgICAgfSxcclxuICAgICAgXCJyZXB1bHNlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxyXG4gICAgICB9LFxyXG4gICAgICBcInB1c2hcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcclxuICAgICAgfSxcclxuICAgICAgXCJyZW1vdmVcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcclxufSk7IiwidmFyIHJlZztcclxuXHJcbmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgc3VwcG9ydGVkJyk7XHJcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2V3b3JrZXIuanMnKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVhZHk7XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGlzIHJlYWR5IDpeKScsIHJlZyk7XHJcbiAgICAgICAgcmVnID0gc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbjtcclxuICAgICAgICAvLyBUT0RPXHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgZXJyb3IgOl4oJywgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgXHJcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb25zKCkudGhlbihhID0+IHtcclxuICAgICAgICBmb3IgKHZhciBpIGluIGEpIHtcclxuICAgICAgICAgICAgaWYgKGFbaV0uYWN0aXZlLnNjcmlwdFVSTC5pbmRleE9mKCcvc2NyaXB0cy9zZXInKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBhW2ldLnVucmVnaXN0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgXCJhbmd1bGFyLmZpbHRlclwiLCAnbmctc29ydGFibGUnXSk7XHJcbmNvbnN0IHRlbXBsYXRlUGF0aCA9ICcuL0Fzc2V0cy9kaXN0L1RlbXBsYXRlcyc7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXHJcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXHJcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2Vpby5jb21cIixcclxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxyXG4gICAgICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjc2NzgxMDQyOTMwOVwiXHJcbiAgICB9O1xyXG5cclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXHJcblxyXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xyXG4gICAgICAgIH0pIFxyXG4gICAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pICAgICAgICBcclxuICAgICAgICAud2hlbignL2N1cnJlbnQtc3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3NwcmludC86c3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4nLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcclxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbi9jdXJyZW50LXNwcmludCcsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuL3NwcmludC86c3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHJvdXRlLmN1cnJlbnQucGFyYW1zLnNwcmludDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmFja2xvZycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInT3ZlcnZpZXcnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCwgXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9hcHAuaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXksIEZpbGVTZXJ2aWNlLCAkc2NvcGUsIE5vdGlmaWNhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgTmV3OiBcIjBcIixcclxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxyXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcclxuICAgICAgICAgICAgUmVtb3ZlZDogXCI0XCJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xyXG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xyXG4gICAgICAgICAgICBjdHJsLnJlT3JkZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuc3ByaW50cyA9IHNwcmludHM7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgJHNjb3BlLmN1c3RvbU9yZGVyID0gKGtleSkgPT4geyBcclxuICAgICAgICAgICAgaWYgKCFjdHJsLnNwcmludHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCFrZXkuc3ByaW50KXtcclxuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gLWN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleS5zcHJpbnQpLm9yZGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5yZU9yZGVyID0gKGdyb3VwKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChncm91cCkge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5vcmRlciAhPT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcmRlciA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNhdmVJdGVtKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5zdW1FZmZvcnQgPSAoaXRlbXMpID0+IHtcclxuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIHN1bSArPSBpdGVtc1tpXS5lZmZvcnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdW07ICBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLm9yZGVyQnlTcHJpbnQgPSAoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleSkub3JkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNlbGVjdEl0ZW0gPSBpdGVtID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgRmlsZVNlcnZpY2UuZ2V0QXR0YWNobWVudHMoaXRlbSkudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtQXR0YWNobWVudHMgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmFkZEl0ZW0gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJOaWV1dy4uLlwiLFxyXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBvcmRlcjogLTEsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogMCxcclxuICAgICAgICAgICAgICAgIHNwcmludDogXCJcIlxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5hZGQobmV3SXRlbSkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXMuJGdldFJlY29yZChkYXRhLmtleSkpO1xyXG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5kZWxldGVJdGVtID0gaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuQmlJdGVtcy5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0SW5kZXggPSBpbmRleCA9PT0gMCA/IDAgOiBpbmRleCAtIDE7XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5yZW1vdmUoaXRlbSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zW3NlbGVjdEluZGV4XSk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGN0cmwuc2F2ZUl0ZW0gPSAoaXRlbSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0uc3RhdGUgPT0gY3RybC5zdGF0ZS5Eb25lKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBpdGVtLnJlc29sdmVkT24gfHwgRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uubm90aWZ5KCdTbWVsbHMgbGlrZSBmaXJlLi4uJywgYFdvcmsgb24gXCIke2l0ZW0ubmFtZX1cIiBoYXMgYmVlbiBjb21wbGV0ZWQhYCk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2Uuc2F2ZShpdGVtKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0geCA9PiB7XHJcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcclxuICAgICAgICAgICAgICAgID8gY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfVxyXG4gICAgICAgICAgICAgICAgOiBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNvcnRDb25maWcgPSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgICAgICAgICBoYW5kbGU6ICcuc29ydGFibGUtaGFuZGxlJyxcclxuICAgICAgICAgICAgZ3JvdXA6ICdiYWNrbG9naXRlbXMnLFxyXG4gICAgICAgICAgICBvbkFkZChlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBlLm1vZGVsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwcmludCA9IGUubW9kZWxzWzBdLnNwcmludDtcclxuICAgICAgICAgICAgICAgIGlmIChtb2RlbCAmJiBtb2RlbC5zcHJpbnQgIT0gc3ByaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gY3RybC5CaUl0ZW1zLiRpbmRleEZvcihtb2RlbC4kaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtc1tpbmRleF0uc3ByaW50ID0gc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcy4kc2F2ZShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25SZW1vdmUoZSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvblVwZGF0ZShlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogXCI8XCIsXHJcbiAgICAgICAgc3ByaW50czogXCI8XCIsXHJcbiAgICAgICAgYXR0YWNobWVudHM6IFwiPFwiLFxyXG4gICAgICAgIG9uQWRkOiBcIiZcIixcclxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXHJcbiAgICAgICAgb25TYXZlOiBcIiZcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgY3RybC5hdHRhY2htZW50c1RvQWRkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmaWxlU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBmaWxlU2VsZWN0LnR5cGUgPSAnZmlsZSc7XHJcbiAgICAgICAgZmlsZVNlbGVjdC5tdWx0aXBsZSA9ICdtdWx0aXBsZSc7XHJcbiAgICAgICAgZmlsZVNlbGVjdC5vbmNoYW5nZSA9IChldnQpID0+IHtcclxuICAgICAgICAgICAgY3RybC51cGxvYWRGaWxlcyhmaWxlU2VsZWN0LmZpbGVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtaW1lTWFwID0ge307XHJcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2pwZWdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9wbmdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9naWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS90aWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiOyAgICAgICAgXHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3BkZlwiXSA9IFwiZmEtZmlsZS1wZGYtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiXSA9IFwiZmEtZmlsZS1leGNlbC1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIl0gPSBcImZhLWZpbGUtcG93ZXJwb2ludC1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCJdID0gXCJmYS1maWxlLXdvcmQtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi94LXppcC1jb21wcmVzc2VkXCJdID0gXCJmYS1maWxlLWFyY2hpdmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJ2aWRlby93ZWJtXCJdID0gXCJmYS1maWxlLXZpZGVvLW9cIjtcclxuXHJcbiAgICAgICAgY3RybC5nZXRGaWxlSWNvbiA9IChhKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChtaW1lTWFwW2EubWltZXR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWltZU1hcFthLm1pbWV0eXBlXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFwiZmEtZmlsZS1vXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmdldEZpbGVFeHRlbnRpb24gPSAoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSBhLm5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5zZWxlY3RGaWxlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsLml0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlU2VsZWN0LmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZXMgPSAoZmlsZXMpID0+IHtcclxuICAgICAgICAgICAgZm9yICh2YXIgZiBpbiBmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1tmXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnVwbG9hZEZpbGUgPSAoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IGAke2N0cmwuaXRlbS4kaWR9LyR7ZmlsZS5uYW1lfWBcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGtleSA9IC0xO1xyXG4gICAgICAgICAgICB2YXIgYXR0YWNobWVudCA9IHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2dJdGVtOiBjdHJsLml0ZW0uJGlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcclxuICAgICAgICAgICAgICAgIG1pbWV0eXBlOiBmaWxlLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogMSxcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRhZGQoYXR0YWNobWVudCkudGhlbigocmVmKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSByZWYua2V5O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzdG9yYWdlUmVmID0gZmlyZWJhc2Uuc3RvcmFnZSgpLnJlZihwYXRoKTtcclxuICAgICAgICAgICAgICAgIHZhciB1cGxvYWRUYXNrID0gc3RvcmFnZVJlZi5wdXQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB1cGxvYWRUYXNrLm9uKCdzdGF0ZV9jaGFuZ2VkJywgZnVuY3Rpb24gcHJvZ3Jlc3Moc25hcHNob3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSAoc25hcHNob3QuYnl0ZXNUcmFuc2ZlcnJlZCAvIHNuYXBzaG90LnRvdGFsQnl0ZXMpICogMTAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcclxuICAgICAgICAgICAgICAgICAgICByLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB1bnN1Y2Nlc3NmdWwgdXBsb2Fkc1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWNjZXNzZnVsIHVwbG9hZHMgb24gY29tcGxldGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGdldCB0aGUgZG93bmxvYWQgVVJMOiBodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS8uLi5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZG93bmxvYWRVUkwgPSB1cGxvYWRUYXNrLnNuYXBzaG90LmRvd25sb2FkVVJMO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcclxuICAgICAgICAgICAgICAgICAgICByLnVybCA9IGRvd25sb2FkVVJMO1xyXG4gICAgICAgICAgICAgICAgICAgIHIuc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJHNhdmUocik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnJlbW92ZUF0dGFjaG1lbnQgPSAoYSxlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kcmVtb3ZlKGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtOiAnPCcsXHJcbiAgICAgICAgb25DbGljazogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JpZ3NjcmVlbicsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iaWdzY3JlZW4uaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgb3B0aW9uczogJzwnLFxyXG4gICAgICAgIGRhdGE6ICc8JyxcclxuICAgICAgICBsb2FkZWQ6ICc8JyxcclxuICAgICAgICB0eXBlOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUsIFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xyXG5cclxuICAgICAgICBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICBpZiAoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aXZlUG9pbnRzID0gY3RybC5jaGFydC5nZXRFbGVtZW50c0F0RXZlbnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZEluZGV4ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBTcHJpbnRTZXJ2aWNlLmdldENhY2hlZFNwcmludHMoKVtjbGlja2VkSW5kZXhdLm9yZGVyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xyXG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcclxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ292ZXJ2aWV3Rm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NpZGVOYXYnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzZXI6ICc8JyxcclxuICAgICAgICBvcGVuOiAnPCcsXHJcbiAgICAgICAgb25TaWduT3V0OiAnJicsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihOb3RpZmljYXRpb25TZXJ2aWNlLCAkdGltZW91dCwgJHNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChzdWIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5zdWJzY3JpYmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwudW5zdWJzY3JpYmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2UudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbigpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWRlTmF2Lmh0bWxgIFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcclxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgJGxvY2F0aW9uKSB7IFxyXG4gICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnNpZ25JbiA9KG5hbWUsIGVtYWlsKT0+IHtcclxuICAgICAgICAgICAgJGZpcmViYXNlQXV0aCgpLiRzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChuYW1lLCBlbWFpbCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWduaW4uaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnc3ByaW50QmFja2xvZycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbXM6IFwiPFwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRCYWNrbG9nLmh0bWxgIFxyXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50cycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrbG9nOiAnPCcsXHJcbiAgICAgICAgY2hhcnQ6ICc9J1xyXG4gICAgfSxcclxuXHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UsIEJhY2tsb2dTZXJ2aWNlLCAkc2NvcGUsICR0aW1lb3V0LCRyb290U2NvcGUpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcclxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXHJcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIGN0cmwubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQgJiYgY3RybC5iYWNrbG9nKSB7XHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coY3RybC5jaGFydC5zcHJpbnQpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gY3RybC5sb2FkZWQgPSB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJGxvYWRlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuY2hhcnQuc3ByaW50LnN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJHdhdGNoKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldEJ1cm5kb3duKGN0cmwuY2hhcnQuc3ByaW50LnN0YXJ0LCBjdHJsLmNoYXJ0LnNwcmludC5kdXJhdGlvbiwgY3RybC5CaUl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcclxuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZVxyXG4gICAgICAgICAgICAgICAgPyBjdHJsLmZpbHRlciA9IHsgbmFtZTogY3RybC5maWx0ZXIubmFtZSB9XHJcbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsLmNoYXJ0LnNwcmludCB8fCAhY3RybC5iYWNrbG9nKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLyBUaGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3IgYnVpbGRpbmcgdGhlIGdyYXBoZGF0YSBieSBiYWNrbG9nIGl0ZW1zICAgICAgICBcclxuICAgICAgICBjdHJsLnNldEJ1cm5kb3duID0gKHN0YXJ0LCBkdXJhdGlvbiwgYmFja2xvZykgPT4ge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKHN0YXJ0ICogMTAwMCk7XHJcbiAgICAgICAgICAgIGxldCBkYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgYnVybmRvd24gPSBbXTtcclxuICAgICAgICAgICAgbGV0IGRheXNUb0FkZCA9IDA7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IGN0cmwuY2hhcnQuc3ByaW50LnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcclxuICAgICAgICAgICAgbGV0IHRvdGFsQnVybmRvd24gPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZHVyYXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ld0RhdGUgPiBuZXcgRGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKFswLCA2XS5pbmRleE9mKG5ld0RhdGUuZ2V0RGF5KCkpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXlzVG9BZGQrKztcclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gc3RhcnQuYWRkRGF5cyhkYXlzVG9BZGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBkYXlzVG9BZGQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSBkYXRlc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBiZG93biA9IDA7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyIGluIGJhY2tsb2cpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxpID0gYmFja2xvZ1tpMl07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaS5zdGF0ZSAhPSBcIjNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibGlEYXRlID0gbmV3IERhdGUocGFyc2VJbnQoYmxpLnJlc29sdmVkT24pKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYmxpRGF0ZS5nZXREYXRlKCkgPT0gZC5nZXREYXRlKCkgJiYgYmxpRGF0ZS5nZXRNb250aCgpID09IGQuZ2V0TW9udGgoKSAmJiBibGlEYXRlLmdldEZ1bGxZZWFyKCkgPT0gZC5nZXRGdWxsWWVhcigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJkb3duICs9IGJsaS5lZmZvcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGJ1cm5kb3duLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnVybmRvd246IGJkb3duXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCBpbiBidXJuZG93bikge1xyXG4gICAgICAgICAgICAgICAgdG90YWxCdXJuZG93biArPSBidXJuZG93blt4XS5idXJuZG93bjtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuYnVybmRvd24gPSB0b3RhbEJ1cm5kb3duO1xyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0LnJlbWFpbmluZyA9IHZlbG9jaXR5UmVtYWluaW5nO1xyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0LmRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRzLmh0bWxgXHJcbn0pO1xyXG5cclxuRGF0ZS5wcm90b3R5cGUuYWRkRGF5cyA9IGZ1bmN0aW9uKGRheXMpXHJcbntcclxuICAgIHZhciBkYXQgPSBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSk7XHJcbiAgICBkYXQuc2V0RGF0ZShkYXQuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICByZXR1cm4gZGF0O1xyXG59XHJcbiIsImFwcC5mYWN0b3J5KCdCYWNrbG9nU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcclxuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XHJcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuICAgIGxldCBiYWNrbG9nO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XHJcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgaWYgKCFzcHJpbnQpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEJhY2tsb2csXHJcbiAgICAgICAgc2F2ZSxcclxuICAgICAgICBhZGQsXHJcbiAgICAgICAgcmVtb3ZlXHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnRmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXRpbGl0eVNlcnZpY2UsICRxLCAkdGltZW91dCwgJGZpcmViYXNlQXJyYXkpIHtcclxuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XHJcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuICAgIGxldCBhdHRhY2htZW50cztcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRBdHRhY2htZW50cyhiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmICghYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChcIkJhY2tsb2cgaXRlbSBub3QgcHJvdmlkZWRcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhdHRhY2htZW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImF0dGFjaG1lbnRzXCIpLm9yZGVyQnlDaGlsZCgnYmFja2xvZ0l0ZW0nKS5lcXVhbFRvKGJhY2tsb2dJdGVtLiRpZCkpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhdHRhY2htZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldEF0dGFjaG1lbnRzXHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnTm90aWZpY2F0aW9uU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaXJlYmFzZUF1dGgsICRodHRwKSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7ICAgIFxyXG4gICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcbiAgICBsZXQgdXNlcklkID0gYXV0aC4kZ2V0QXV0aCgpLnVpZDtcclxuICAgIGxldCByZWcgPSB3aW5kb3cucmVnO1xyXG4gICAgbGV0IGJhY2tsb2c7XHJcblxyXG4gICAgZnVuY3Rpb24gc3Vic2NyaWJlKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWcpO1xyXG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3ViKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5zdWJzY3JpYmUoeyB1c2VyVmlzaWJsZU9ubHk6IHRydWUgfSkudGhlbihmdW5jdGlvbiAocHVzaFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHB1c2hTdWJzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaWJlZCEgRW5kcG9pbnQ6Jywgc3ViLmVuZHBvaW50KTtcclxuICAgICAgICAgICAgICAgIHZhciBlbmRwb2ludCA9IHN1Yi5lbmRwb2ludC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInN1YnNjcmlwdGlvbnNcIikub3JkZXJCeUNoaWxkKCdlbmRwb2ludCcpLmVxdWFsVG8oZW5kcG9pbnQpKTtcclxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGxvYWRlZCgpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRhZGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWlkOiB1c2VySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IGVuZHBvaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleXM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocHVzaFN1YnNjcmlwdGlvbikpLmtleXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcclxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXN1Yikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZW5kcG9pbnQgPSBzdWIuZW5kcG9pbnQuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIGVuZHBvaW50ID0gZW5kcG9pbnRbZW5kcG9pbnQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInN1YnNjcmlwdGlvbnNcIikub3JkZXJCeUNoaWxkKCdlbmRwb2ludCcpLmVxdWFsVG8oZW5kcG9pbnQpKTtcclxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRsb2FkZWQoKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJHJlbW92ZSgwKTsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBub3RpZnkodGl0bGUsIG1lc3NhZ2UpIHsgICAgICAgIFxyXG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICRodHRwKHsgXHJcbiAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovL25vdGlmaWNhdGlvbnMuYm9lcmRhbWRucy5ubC9hcGkvbm90aWZ5L3Bvc3Q/dGl0bGU9JHt0aXRsZX0mbWVzc2FnZT0ke21lc3NhZ2V9YCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXHJcbiAgICAgICAgICAgIH0pLnRoZW4oYSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1YnNjcmliZSxcclxuICAgICAgICB1bnN1YnNjcmliZSxcclxuICAgICAgICBub3RpZnlcclxuICAgIH07XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xyXG4gICAgbGV0IGJhckNvbG9yID0gJyM1RkZBRkMnO1xyXG4gICAgbGV0IGNoYXJ0VHlwZSA9IFwibGluZVwiO1xyXG4gICAgbGV0IGNhY2hlZFNwcmludHM7XHJcblxyXG4gICAgbGV0IGNoYXJ0T3B0aW9ucyA9IHtcclxuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxyXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxyXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbGVtZW50czoge1xyXG4gICAgICAgICAgICBsaW5lOiB7XHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcclxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTJcIixcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xyXG4gICAgICAgIGxhYmVsczogW10sIFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkF2ZXJhZ2VcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzU4RjQ4NFwiLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU4RjQ4NFwiLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNThGNDg0JyxcclxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNThGNDg0JyxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkVzdGltYXRlZFwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2JhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGJ1cm5kb3duRGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaSBcIiwgXCJ3byBcIiwgXCJkbyBcIiwgXCJ2ciBcIiwgXCJtYSBcIl0sXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IpIHtcclxuICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDkpKTtcclxuICAgICAgICBzcHJpbnRzLiRsb2FkZWQoY2IsICgpPT4gJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDYWNoZWRTcHJpbnRzKCkge1xyXG4gICAgICAgIHJldHVybiBjYWNoZWRTcHJpbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldE92ZXJ2aWV3Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzID0+IHtcclxuXHJcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNhY2hlZFNwcmludHMgPSBzcHJpbnRzO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XHJcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVkU3ByaW50cyA9IHNwcmludHM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XHJcblxyXG4gICAgICAgIGxldCBsYWJlbHM7XHJcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcclxuICAgICAgICBsZXQgYnVybmVkO1xyXG4gICAgICAgIGxldCBhdmVyYWdlID0gW107XHJcblxyXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xyXG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XHJcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50KGJ1cm5lZFtpXSwgMTApOyAvL2Rvbid0IGZvcmdldCB0byBhZGQgdGhlIGJhc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGF2ZyA9IHN1bSAvIChidXJuZWQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGF2ZXJhZ2UucHVzaChhdmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1syXS5kYXRhID0gYnVybmVkO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGVzdGltYXRlZDtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBhdmVyYWdlO1xyXG5cclxuICAgICAgICBsZXQgb3ZlcnZpZXdDaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XHJcbiAgICAgICAgb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcclxuICAgICAgICBvdmVydmlld0NoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMV0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAwO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudFNwcmludCA9IHNwcmludHNbc3ByaW50cy5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImJhclwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBvdmVydmlld0NoYXJ0T3B0aW9ucyxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgdmVsb2NpdHk6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHksXHJcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgcmVtYWluaW5nOiBjdXJyZW50U3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoY3VycmVudFNwcmludC52ZWxvY2l0eSAvIGN1cnJlbnRTcHJpbnQuZHVyYXRpb24sIDEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjaGFydE9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkge1xyXG4gICAgICAgIGxldCBsYWJlbHMgPSBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLnNsaWNlKDAsc3ByaW50LmR1cmF0aW9uICsxKVxyXG5cclxuICAgICAgICBsZXQgaWRlYWxCdXJuZG93biA9IGxhYmVscy5tYXAoKGQsIGkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxhYmVscy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5LnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICgoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uKSAqIGkpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgfSkucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcclxuICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcclxuICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gc3ByaW50LmJ1cm5kb3duW3hdO1xyXG4gICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IGJ1cm5kb3duRGF0YTtcclxuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xyXG4gICAgICAgIGxldCBidXJuZG93bkNoYXJ0T3B0aW9ucyA9IGNoYXJ0T3B0aW9ucztcclxuICAgICAgICBidXJuZG93bkNoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMF0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAgKiAoc3ByaW50LmR1cmF0aW9uICsgMSk7XHJcbiAgICAgICAgYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzFdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xyXG5cclxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwibGluZVwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBidXJuZG93bkNoYXJ0T3B0aW9ucywgXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBzcHJpbnQudmVsb2NpdHksXHJcbiAgICAgICAgICAgIG5hbWU6IHNwcmludC5uYW1lLFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgcmVtYWluaW5nOiBzcHJpbnQudmVsb2NpdHkgLSBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbiwgMSksXHJcbiAgICAgICAgICAgIHNwcmludDogc3ByaW50XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhcnRPYmo7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFydCgpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc3ByaW50cy4ka2V5QXQoc3ByaW50cy5sZW5ndGgtMSk7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gY3VycmVudC5zcGxpdChcInNcIilbMV07XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy8ke2N1cnJlbnR9YCkpO1xyXG4gICAgICAgICAgICBjdXJyZW50U3ByaW50LiR3YXRjaChlPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChjdXJyZW50U3ByaW50KSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludENoYXJ0KHNwcmludE51bWJlcikge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcclxuICAgICAgICAgICAgbGV0IHNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvcyR7c3ByaW50TnVtYmVyfWApKTtcclxuXHJcbiAgICAgICAgICAgIHNwcmludC4kd2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFNwcmludHMsXHJcbiAgICAgICAgZ2V0T3ZlcnZpZXdDaGFydCxcclxuICAgICAgICBnZXRDdXJyZW50Q2hhcnQsXHJcbiAgICAgICAgZ2V0U3ByaW50Q2hhcnQsXHJcbiAgICAgICAgZ2V0Q2FjaGVkU3ByaW50c1xyXG4gICAgfVxyXG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XHJcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwYWQsXHJcbiAgICAgICAgc3VtXHJcbiAgICB9XHJcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
