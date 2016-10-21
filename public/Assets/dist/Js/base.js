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

app.config(function ($locationProvider, $routeProvider, $firebaseRefProvider) {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
        messagingSenderId: "767810429309"
    };

    $locationProvider.html5Mode(true);
    $firebaseRefProvider.registerUrl(config.databaseURL);

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
        resolve: {
            "firebaseUser": function firebaseUser($firebaseAuthService) {
                return $firebaseAuthService.$waitForSignIn();
            }
        },
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
                if (!item.resolvedOn) {
                    NotificationService.notify('Smells like fire...', 'Work on "' + item.name + '" has been completed!');
                }
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

        ctrl.stateLookup = ['New', 'Approved', '', 'Done', 'Removed'];

        ctrl.loaded = false;
        ctrl.filter = {};

        ctrl.sumEffort = function (items) {
            var sum = 0;
            for (var i in items) {
                sum += items[i].effort;
            }

            return sum;
        };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwib3ZlcnZpZXdGb290ZXIvb3ZlcnZpZXdGb290ZXIuanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJGaWxlU2VydmljZS5qcyIsIk5vdGlmaWNhdGlvblNlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxXQUFXLENBQUMsY0FBYyxFQUFFO0FBQzFCLGFBQVcsRUFBRTtBQUNYLFlBQVEsRUFBRTtBQUNSLGFBQU8sRUFBRSxFQUFFO0FBQ1gsZUFBUyxFQUFFO0FBQ1QsZ0JBQVEsRUFBRSxJQUFJO0FBQ2Qsb0JBQVksRUFBRSxHQUFHO09BQ2xCO0tBQ0Y7QUFDRCxXQUFPLEVBQUU7QUFDUCxhQUFPLEVBQUUsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRSxRQUFRO0FBQ2hCLGNBQVEsRUFBRTtBQUNSLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLFNBQVM7T0FDbkI7QUFDRCxlQUFTLEVBQUU7QUFDVCxrQkFBVSxFQUFFLENBQUM7T0FDZDtBQUNELGFBQU8sRUFBRTtBQUNQLGFBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBTyxFQUFFLEdBQUc7QUFDWixnQkFBUSxFQUFFLEdBQUc7T0FDZDtLQUNGO0FBQ0QsYUFBUyxFQUFFO0FBQ1QsYUFBTyxFQUFFLEdB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QUFDO0tBQ1osQ0FBQzs7QUFFRixXQUFPO0FBQ0gsV0FBRyxFQUFILEdBQUc7QUFDSCxXQUFHLEVBQUgsR0FBRztLQUNOLENBQUE7Q0FDSixDQUFDLENBQUEiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcclxuICBcInBhcnRpY2xlc1wiOiB7XHJcbiAgICBcIm51bWJlclwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMTAsXHJcbiAgICAgIFwiZGVuc2l0eVwiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImNvbG9yXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxyXG4gICAgfSxcclxuICAgIFwic2hhcGVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcclxuICAgICAgXCJzdHJva2VcIjoge1xyXG4gICAgICAgIFwid2lkdGhcIjogMCxcclxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicG9seWdvblwiOiB7XHJcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaW1hZ2VcIjoge1xyXG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcclxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcclxuICAgICAgICBcImhlaWdodFwiOiAxMDBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwib3BhY2l0eVwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjogMC4xLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJhbmltXCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInNwZWVkXCI6IDEsXHJcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxyXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzaXplXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiAzLFxyXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxyXG4gICAgICBcImFuaW1cIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxyXG4gICAgICAgIFwic3BlZWRcIjogMTAsXHJcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXHJcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcclxuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXHJcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxyXG4gICAgICBcIndpZHRoXCI6IDFcclxuICAgIH0sXHJcbiAgICBcIm1vdmVcIjoge1xyXG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxyXG4gICAgICBcInNwZWVkXCI6IDIsXHJcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcclxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcclxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxyXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcclxuICAgICAgXCJhdHRyYWN0XCI6IHtcclxuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcclxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxyXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XHJcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxyXG4gICAgXCJldmVudHNcIjoge1xyXG4gICAgICBcIm9uaG92ZXJcIjoge1xyXG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXHJcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwib25jbGlja1wiOiB7XHJcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcclxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcclxuICAgICAgfSxcclxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxyXG4gICAgfSxcclxuICAgIFwibW9kZXNcIjoge1xyXG4gICAgICBcImdyYWJcIjoge1xyXG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxyXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xyXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImJ1YmJsZVwiOiB7XHJcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXHJcbiAgICAgICAgXCJzaXplXCI6IDQwLFxyXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcclxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXHJcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcclxuICAgICAgfSxcclxuICAgICAgXCJyZXB1bHNlXCI6IHtcclxuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcclxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxyXG4gICAgICB9LFxyXG4gICAgICBcInB1c2hcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcclxuICAgICAgfSxcclxuICAgICAgXCJyZW1vdmVcIjoge1xyXG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcclxufSk7IiwidmFyIHJlZztcclxuXHJcbmlmICgnc2VydmljZVdvcmtlcicgaW4gbmF2aWdhdG9yKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgc3VwcG9ydGVkJyk7XHJcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2V3b3JrZXIuanMnKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVhZHk7XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGlzIHJlYWR5IDpeKScsIHJlZyk7XHJcbiAgICAgICAgcmVnID0gc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbjtcclxuICAgICAgICAvLyBUT0RPXHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgZXJyb3IgOl4oJywgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgXHJcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb25zKCkudGhlbihhID0+IHtcclxuICAgICAgICBmb3IgKHZhciBpIGluIGEpIHtcclxuICAgICAgICAgICAgaWYgKGFbaV0uYWN0aXZlLnNjcmlwdFVSTC5pbmRleE9mKCcvc2NyaXB0cy9zZXInKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBhW2ldLnVucmVnaXN0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgXCJhbmd1bGFyLmZpbHRlclwiLCAnbmctc29ydGFibGUnXSk7XHJcbmNvbnN0IHRlbXBsYXRlUGF0aCA9ICcuL0Fzc2V0cy9kaXN0L1RlbXBsYXRlcyc7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIsJGZpcmViYXNlUmVmUHJvdmlkZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXHJcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXHJcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2Vpby5jb21cIixcclxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxyXG4gICAgICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjc2NzgxMDQyOTMwOVwiXHJcbiAgICB9O1xyXG5cclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXHJcbiAgICAkZmlyZWJhc2VSZWZQcm92aWRlci5yZWdpc3RlclVybChjb25maWcuZGF0YWJhc2VVUkwpO1xyXG4gICAgXHJcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblxyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL3NpZ25pbicsIHsgXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNpZ25pbj48L3NpZ25pbj4nXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLndoZW4oJy8nLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSkgICAgICAgIFxyXG4gICAgICAgIC53aGVuKCcvY3VycmVudC1zcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvc3ByaW50LzpzcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbicsIHtcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldE92ZXJ2aWV3Q2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ1ZlbG9jaXR5J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuL2N1cnJlbnQtc3ByaW50Jywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4vc3ByaW50LzpzcHJpbnQnLCB7XHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XHJcbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9iYWNrbG9nJywge1xyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbiAoJGZpcmViYXNlQXV0aFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ092ZXJ2aWV3J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYmFja2xvZz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxyXG4gICAgICAgIH0pIFxyXG4gICAgICAgIC5vdGhlcndpc2UoJy8nKTsgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdhcHAnLCB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcclxuICAgICAgICBpZighYXV0aC4kZ2V0QXV0aCgpKSAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG5cclxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcclxuICAgICAgICBjdHJsLnNpZ25PdXQgPSgpPT4ge1xyXG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcclxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYXBwLmh0bWxgICAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrVGl0bGU6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIFNwcmludFNlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCBGaWxlU2VydmljZSwgJHNjb3BlLCBOb3RpZmljYXRpb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG5cclxuICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcclxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXHJcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcclxuICAgICAgICBjdHJsLm9wZW4gPSB0cnVlO1xyXG5cclxuICAgICAgICBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcclxuICAgICAgICAgICAgY3RybC5yZU9yZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50cygoc3ByaW50cykgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgICRzY29wZS5jdXN0b21PcmRlciA9IChrZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsLnNwcmludHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgha2V5LnNwcmludCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDk5OTk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAtY3RybC5zcHJpbnRzLiRnZXRSZWNvcmQoa2V5LnNwcmludCkub3JkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnJlT3JkZXIgPSAoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgaWYgKGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBncm91cC5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9yZGVyICE9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yZGVyID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2F2ZUl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLm9yZGVyQnlTcHJpbnQgPSAoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleSkub3JkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNlbGVjdEl0ZW0gPSBpdGVtID0+IHtcclxuICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gaXRlbTtcclxuICAgICAgICAgICAgRmlsZVNlcnZpY2UuZ2V0QXR0YWNobWVudHMoaXRlbSkudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW1BdHRhY2htZW50cyA9IGRhdGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5hZGRJdGVtID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbmV3SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTmlldXcuLi5cIixcclxuICAgICAgICAgICAgICAgIGVmZm9ydDogMCxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IC0xLFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IDAsXHJcbiAgICAgICAgICAgICAgICBzcHJpbnQ6IFwiXCJcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuYWRkKG5ld0l0ZW0pLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zLiRnZXRSZWNvcmQoZGF0YS5rZXkpKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjdHJsLkJpSXRlbXMuaW5kZXhPZihpdGVtKTtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gaW5kZXggPT09IDAgPyAwIDogaW5kZXggLSAxO1xyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UucmVtb3ZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtc1tzZWxlY3RJbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnNhdmVJdGVtID0gKGl0ZW0pID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLnN0YXRlID09IGN0cmwuc3RhdGUuRG9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtLnJlc29sdmVkT24pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25TZXJ2aWNlLm5vdGlmeSgnU21lbGxzIGxpa2UgZmlyZS4uLicsIGBXb3JrIG9uIFwiJHtpdGVtLm5hbWV9XCIgaGFzIGJlZW4gY29tcGxldGVkIWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gaXRlbS5yZXNvbHZlZE9uIHx8IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcclxuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZVxyXG4gICAgICAgICAgICAgICAgPyBjdHJsLmZpbHRlciA9IHsgbmFtZTogY3RybC5maWx0ZXIubmFtZSB9XHJcbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc29ydENvbmZpZyA9IHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAgICAgICAgIGhhbmRsZTogJy5zb3J0YWJsZS1oYW5kbGUnLFxyXG4gICAgICAgICAgICBvbkFkZChlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBlLm1vZGVsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwcmludCA9IGUubW9kZWxzWzBdLnNwcmludDtcclxuICAgICAgICAgICAgICAgIGlmIChtb2RlbCAmJiBtb2RlbC5zcHJpbnQgIT0gc3ByaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gY3RybC5CaUl0ZW1zLiRpbmRleEZvcihtb2RlbC4kaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtc1tpbmRleF0uc3ByaW50ID0gc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcy4kc2F2ZShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25SZW1vdmUoZSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvblVwZGF0ZShlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogXCI8XCIsXHJcbiAgICAgICAgc3ByaW50czogXCI8XCIsXHJcbiAgICAgICAgYXR0YWNobWVudHM6IFwiPFwiLFxyXG4gICAgICAgIG9uQWRkOiBcIiZcIixcclxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXHJcbiAgICAgICAgb25TYXZlOiBcIiZcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgY3RybC5hdHRhY2htZW50c1RvQWRkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBmaWxlU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBmaWxlU2VsZWN0LnR5cGUgPSAnZmlsZSc7XHJcbiAgICAgICAgZmlsZVNlbGVjdC5tdWx0aXBsZSA9ICdtdWx0aXBsZSc7XHJcbiAgICAgICAgZmlsZVNlbGVjdC5vbmNoYW5nZSA9IChldnQpID0+IHtcclxuICAgICAgICAgICAgY3RybC51cGxvYWRGaWxlcyhmaWxlU2VsZWN0LmZpbGVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtaW1lTWFwID0ge307XHJcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2pwZWdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9wbmdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9naWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS90aWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiOyAgICAgICAgXHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3BkZlwiXSA9IFwiZmEtZmlsZS1wZGYtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiXSA9IFwiZmEtZmlsZS1leGNlbC1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIl0gPSBcImZhLWZpbGUtcG93ZXJwb2ludC1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCJdID0gXCJmYS1maWxlLXdvcmQtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi94LXppcC1jb21wcmVzc2VkXCJdID0gXCJmYS1maWxlLWFyY2hpdmUtb1wiO1xyXG4gICAgICAgIG1pbWVNYXBbXCJ2aWRlby93ZWJtXCJdID0gXCJmYS1maWxlLXZpZGVvLW9cIjtcclxuXHJcbiAgICAgICAgY3RybC5nZXRGaWxlSWNvbiA9IChhKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChtaW1lTWFwW2EubWltZXR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWltZU1hcFthLm1pbWV0eXBlXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFwiZmEtZmlsZS1vXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmdldEZpbGVFeHRlbnRpb24gPSAoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSBhLm5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5zZWxlY3RGaWxlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjdHJsLml0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlU2VsZWN0LmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZXMgPSAoZmlsZXMpID0+IHtcclxuICAgICAgICAgICAgZm9yICh2YXIgZiBpbiBmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1tmXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnVwbG9hZEZpbGUgPSAoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IGAke2N0cmwuaXRlbS4kaWR9LyR7ZmlsZS5uYW1lfWBcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGtleSA9IC0xO1xyXG4gICAgICAgICAgICB2YXIgYXR0YWNobWVudCA9IHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2dJdGVtOiBjdHJsLml0ZW0uJGlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcclxuICAgICAgICAgICAgICAgIG1pbWV0eXBlOiBmaWxlLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogMSxcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRhZGQoYXR0YWNobWVudCkudGhlbigocmVmKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSByZWYua2V5O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzdG9yYWdlUmVmID0gZmlyZWJhc2Uuc3RvcmFnZSgpLnJlZihwYXRoKTtcclxuICAgICAgICAgICAgICAgIHZhciB1cGxvYWRUYXNrID0gc3RvcmFnZVJlZi5wdXQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB1cGxvYWRUYXNrLm9uKCdzdGF0ZV9jaGFuZ2VkJywgZnVuY3Rpb24gcHJvZ3Jlc3Moc25hcHNob3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSAoc25hcHNob3QuYnl0ZXNUcmFuc2ZlcnJlZCAvIHNuYXBzaG90LnRvdGFsQnl0ZXMpICogMTAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcclxuICAgICAgICAgICAgICAgICAgICByLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB1bnN1Y2Nlc3NmdWwgdXBsb2Fkc1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWNjZXNzZnVsIHVwbG9hZHMgb24gY29tcGxldGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGdldCB0aGUgZG93bmxvYWQgVVJMOiBodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS8uLi5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZG93bmxvYWRVUkwgPSB1cGxvYWRUYXNrLnNuYXBzaG90LmRvd25sb2FkVVJMO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcclxuICAgICAgICAgICAgICAgICAgICByLnVybCA9IGRvd25sb2FkVVJMO1xyXG4gICAgICAgICAgICAgICAgICAgIHIuc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJHNhdmUocik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnJlbW92ZUF0dGFjaG1lbnQgPSAoYSxlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kcmVtb3ZlKGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtOiAnPCcsXHJcbiAgICAgICAgb25DbGljazogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JpZ3NjcmVlbicsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iaWdzY3JlZW4uaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgb3B0aW9uczogJzwnLFxyXG4gICAgICAgIGRhdGE6ICc8JyxcclxuICAgICAgICBsb2FkZWQ6ICc8JyxcclxuICAgICAgICB0eXBlOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUsIFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xyXG5cclxuICAgICAgICBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICBpZiAoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aXZlUG9pbnRzID0gY3RybC5jaGFydC5nZXRFbGVtZW50c0F0RXZlbnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZEluZGV4ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBTcHJpbnRTZXJ2aWNlLmdldENhY2hlZFNwcmludHMoKVtjbGlja2VkSW5kZXhdLm9yZGVyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xyXG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcclxufSkgIiwiYXBwLmNvbXBvbmVudCgnZm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ292ZXJ2aWV3Rm9vdGVyJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXHJcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NpZGVOYXYnLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzZXI6ICc8JyxcclxuICAgICAgICBvcGVuOiAnPCcsXHJcbiAgICAgICAgb25TaWduT3V0OiAnJicsXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihOb3RpZmljYXRpb25TZXJ2aWNlLCAkdGltZW91dCwgJHNjb3BlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChzdWIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5zdWJzY3JpYmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwudW5zdWJzY3JpYmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2UudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbigpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWRlTmF2Lmh0bWxgIFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcclxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgJGxvY2F0aW9uKSB7IFxyXG4gICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzO1xyXG5cclxuICAgICAgICBjdHJsLnNpZ25JbiA9KG5hbWUsIGVtYWlsKT0+IHtcclxuICAgICAgICAgICAgJGZpcmViYXNlQXV0aCgpLiRzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChuYW1lLCBlbWFpbCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWduaW4uaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnc3ByaW50QmFja2xvZycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbXM6IFwiPFwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRCYWNrbG9nLmh0bWxgIFxyXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50cycsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcclxuICAgICAgICBiYWNrbG9nOiAnPCcsXHJcbiAgICAgICAgY2hhcnQ6ICc9J1xyXG4gICAgfSxcclxuXHJcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UsIEJhY2tsb2dTZXJ2aWNlLCAkc2NvcGUsICR0aW1lb3V0LCRyb290U2NvcGUpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcclxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXHJcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5zdGF0ZUxvb2t1cCA9IFsnTmV3JywgJ0FwcHJvdmVkJywgJycsICdEb25lJywgJ1JlbW92ZWQnXTsgICAgIFxyXG5cclxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XHJcblxyXG4gICAgICAgIGN0cmwuc3VtRWZmb3J0ID0gKGl0ZW1zKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICBzdW0gKz0gaXRlbXNbaV0uZWZmb3J0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3VtO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGN0cmwuY2hhcnQuc3ByaW50ICYmIGN0cmwuYmFja2xvZykge1xyXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKGN0cmwuY2hhcnQuc3ByaW50KS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGN0cmwubG9hZGVkID0gdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRsb2FkZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludC5zdGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldEJ1cm5kb3duKGN0cmwuY2hhcnQuc3ByaW50LnN0YXJ0LCBjdHJsLmNoYXJ0LnNwcmludC5kdXJhdGlvbiwgY3RybC5CaUl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiR3YXRjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0geCA9PiB7XHJcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcclxuICAgICAgICAgICAgICAgID8gY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfVxyXG4gICAgICAgICAgICAgICAgOiBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghY3RybC5jaGFydC5zcHJpbnQgfHwgIWN0cmwuYmFja2xvZykge1xyXG4gICAgICAgICAgICAgICAgY3RybC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8gVGhpcyBtZXRob2QgaXMgcmVzcG9uc2libGUgZm9yIGJ1aWxkaW5nIHRoZSBncmFwaGRhdGEgYnkgYmFja2xvZyBpdGVtcyAgICAgICAgXHJcbiAgICAgICAgY3RybC5zZXRCdXJuZG93biA9IChzdGFydCwgZHVyYXRpb24sIGJhY2tsb2cpID0+IHtcclxuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZShzdGFydCAqIDEwMDApO1xyXG4gICAgICAgICAgICBsZXQgZGF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGJ1cm5kb3duID0gW107XHJcbiAgICAgICAgICAgIGxldCBkYXlzVG9BZGQgPSAwOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBjdHJsLmNoYXJ0LnNwcmludC52ZWxvY2l0eTtcclxuICAgICAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcbiAgICAgICAgICAgIGxldCB0b3RhbEJ1cm5kb3duID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGR1cmF0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdEYXRlID0gc3RhcnQuYWRkRGF5cyhkYXlzVG9BZGQgLSAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdEYXRlID4gbmV3IERhdGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChbMCwgNl0uaW5kZXhPZihuZXdEYXRlLmdldERheSgpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IHN0YXJ0LmFkZERheXMoZGF5c1RvQWRkKTtcclxuICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkYXRlcy5wdXNoKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0ZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gZGF0ZXNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgYmRvd24gPSAwO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiBpbiBiYWNrbG9nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsaSA9IGJhY2tsb2dbaTJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChibGkuc3RhdGUgIT0gXCIzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxpRGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KGJsaS5yZXNvbHZlZE9uKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaURhdGUuZ2V0RGF0ZSgpID09IGQuZ2V0RGF0ZSgpICYmIGJsaURhdGUuZ2V0TW9udGgoKSA9PSBkLmdldE1vbnRoKCkgJiYgYmxpRGF0ZS5nZXRGdWxsWWVhcigpID09IGQuZ2V0RnVsbFllYXIoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZG93biArPSBibGkuZWZmb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBidXJuZG93bi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlOiBkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ1cm5kb3duOiBiZG93blxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHggaW4gYnVybmRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRvdGFsQnVybmRvd24gKz0gYnVybmRvd25beF0uYnVybmRvd247XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBidXJuZG93blt4XS5idXJuZG93bjtcclxuICAgICAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0LmJ1cm5kb3duID0gdG90YWxCdXJuZG93bjtcclxuICAgICAgICAgICAgY3RybC5jaGFydC5yZW1haW5pbmcgPSB2ZWxvY2l0eVJlbWFpbmluZztcclxuICAgICAgICAgICAgY3RybC5jaGFydC5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50cy5odG1sYFxyXG59KTtcclxuXHJcbkRhdGUucHJvdG90eXBlLmFkZERheXMgPSBmdW5jdGlvbihkYXlzKVxyXG57XHJcbiAgICB2YXIgZGF0ID0gbmV3IERhdGUodGhpcy52YWx1ZU9mKCkpO1xyXG4gICAgZGF0LnNldERhdGUoZGF0LmdldERhdGUoKSArIGRheXMpO1xyXG4gICAgcmV0dXJuIGRhdDtcclxufVxyXG4iLCJhcHAuZmFjdG9yeSgnQmFja2xvZ1NlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgYmFja2xvZztcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRCYWNrbG9nKHNwcmludCkge1xyXG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmICghc3ByaW50KSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJGFkZChiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHJlbW92ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRyZW1vdmUoYmFja2xvZ0l0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmUoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kc2F2ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRCYWNrbG9nLFxyXG4gICAgICAgIHNhdmUsXHJcbiAgICAgICAgYWRkLFxyXG4gICAgICAgIHJlbW92ZVxyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ0ZpbGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJHRpbWVvdXQsICRmaXJlYmFzZUFycmF5KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgYXR0YWNobWVudHM7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QXR0YWNobWVudHMoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIWJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoXCJCYWNrbG9nIGl0ZW0gbm90IHByb3ZpZGVkXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJhdHRhY2htZW50c1wiKS5vcmRlckJ5Q2hpbGQoJ2JhY2tsb2dJdGVtJykuZXF1YWxUbyhiYWNrbG9nSXRlbS4kaWQpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYXR0YWNobWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRBdHRhY2htZW50c1xyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGlmaWNhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlyZWJhc2VBdXRoLCAkaHR0cCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpOyAgICBcclxuICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG4gICAgbGV0IHVzZXJJZCA9IGF1dGguJGdldEF1dGgoKS51aWQ7XHJcbiAgICBsZXQgcmVnID0gd2luZG93LnJlZztcclxuICAgIGxldCBiYWNrbG9nO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZSgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVnKTtcclxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuc3Vic2NyaWJlKHsgdXNlclZpc2libGVPbmx5OiB0cnVlIH0pLnRoZW4oZnVuY3Rpb24gKHB1c2hTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWIgPSBwdXNoU3Vic2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1YnNjcmliZWQhIEVuZHBvaW50OicsIHN1Yi5lbmRwb2ludCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZW5kcG9pbnQgPSBzdWIuZW5kcG9pbnQuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIGVuZHBvaW50ID0gZW5kcG9pbnRbZW5kcG9pbnQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzdWJzY3JpcHRpb25zXCIpLm9yZGVyQnlDaGlsZCgnZW5kcG9pbnQnKS5lcXVhbFRvKGVuZHBvaW50KSk7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRsb2FkZWQoKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kYWRkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpZDogdXNlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZHBvaW50OiBlbmRwb2ludCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHB1c2hTdWJzY3JpcHRpb24pKS5rZXlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XHJcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzdWIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBlbmRwb2ludCA9IGVuZHBvaW50W2VuZHBvaW50Lmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpLnRoZW4oZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzdWJzY3JpcHRpb25zXCIpLm9yZGVyQnlDaGlsZCgnZW5kcG9pbnQnKS5lcXVhbFRvKGVuZHBvaW50KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kbG9hZGVkKCkudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRyZW1vdmUoMCk7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbm90aWZ5KHRpdGxlLCBtZXNzYWdlKSB7ICAgICAgICBcclxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAkaHR0cCh7IFxyXG4gICAgICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly9ub3RpZmljYXRpb25zLmJvZXJkYW1kbnMubmwvYXBpL25vdGlmeS9wb3N0P3RpdGxlPSR7dGl0bGV9Jm1lc3NhZ2U9JHttZXNzYWdlfWAsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgICAgICB9KS50aGVuKGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdWJzY3JpYmUsXHJcbiAgICAgICAgdW5zdWJzY3JpYmUsXHJcbiAgICAgICAgbm90aWZ5XHJcbiAgICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnU3ByaW50U2VydmljZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGxpbmVDb2xvciA9ICcjRUI1MUQ4JztcclxuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcclxuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcclxuICAgIGxldCBjYWNoZWRTcHJpbnRzO1xyXG5cclxuICAgIGxldCBjaGFydE9wdGlvbnMgPSB7XHJcbiAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcclxuICAgICAgICB0b29sdGlwczoge1xyXG4gICAgICAgICAgICBtb2RlOiAnc2luZ2xlJyxcclxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWxlbWVudHM6IHtcclxuICAgICAgICAgICAgbGluZToge1xyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgeEF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxyXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTFcIixcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogbnVsbCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0yXCIsXHJcbiAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IG92ZXJ2aWV3RGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtdLCBcclxuICAgICAgICBkYXRhc2V0czogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBdmVyYWdlXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM1OEY0ODRcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1OEY0ODRcIixcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzU4RjQ4NCcsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzU4RjQ4NCcsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XHJcbiAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkdlaGFhbGRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXHJcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XHJcbiAgICAgICAgbGV0IHNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKS5saW1pdFRvTGFzdCg5KSk7XHJcbiAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q2FjaGVkU3ByaW50cygpIHtcclxuICAgICAgICByZXR1cm4gY2FjaGVkU3ByaW50cztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRPdmVydmlld0NoYXJ0KCkge1xyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cyA9PiB7XHJcblxyXG4gICAgICAgICAgICBzcHJpbnRzLiRsb2FkZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjYWNoZWRTcHJpbnRzID0gc3ByaW50cztcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgc3ByaW50cy4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlZFNwcmludHMgPSBzcHJpbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpOyAgICBcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcclxuICAgICAgICAgICAgICAgIH0pOyAgICBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cykge1xyXG5cclxuICAgICAgICBsZXQgbGFiZWxzO1xyXG4gICAgICAgIGxldCBlc3RpbWF0ZWQ7XHJcbiAgICAgICAgbGV0IGJ1cm5lZDtcclxuICAgICAgICBsZXQgYXZlcmFnZSA9IFtdO1xyXG5cclxuICAgICAgICBsYWJlbHMgPSBzcHJpbnRzLm1hcChkID0+IGBTcHJpbnQgJHtfLnBhZChkLm9yZGVyKX1gKTtcclxuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xyXG4gICAgICAgIGJ1cm5lZCA9IHNwcmludHMubWFwKGQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHN1bSA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXJuZWQubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN1bSArPSBwYXJzZUludChidXJuZWRbaV0sIDEwKTsgLy9kb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBiYXNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhdmcgPSBzdW0gLyAoYnVybmVkLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ByaW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhdmVyYWdlLnB1c2goYXZnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gb3ZlcnZpZXdEYXRhO1xyXG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMl0uZGF0YSA9IGJ1cm5lZDtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBlc3RpbWF0ZWQ7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gYXZlcmFnZTtcclxuXHJcbiAgICAgICAgbGV0IG92ZXJ2aWV3Q2hhcnRPcHRpb25zID0gY2hhcnRPcHRpb25zO1xyXG4gICAgICAgIG92ZXJ2aWV3Q2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1swXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMDA7XHJcbiAgICAgICAgb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzFdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSBzcHJpbnRzW3NwcmludHMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJiYXJcIixcclxuICAgICAgICAgICAgb3B0aW9uczogb3ZlcnZpZXdDaGFydE9wdGlvbnMsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiBjdXJyZW50U3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLyBjdXJyZW50U3ByaW50LmR1cmF0aW9uLCAxKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2hhcnRPYmopO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpIHtcclxuICAgICAgICBsZXQgbGFiZWxzID0gW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpIFwiLCBcIndvIFwiLCBcImRvIFwiLCBcInZyIFwiLCBcIm1hIFwiXS5zbGljZSgwLHNwcmludC5kdXJhdGlvbiArMSlcclxuXHJcbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBsYWJlbHMubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBsYWJlbHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbikgKiBpKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIH0pLnJldmVyc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XHJcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcclxuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcclxuICAgICAgICBsZXQgYnVybmRvd25DaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XHJcbiAgICAgICAgYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xyXG4gICAgICAgIGJ1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcclxuICAgICAgICAgICAgb3B0aW9uczogYnVybmRvd25DaGFydE9wdGlvbnMsIFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpLFxyXG4gICAgICAgICAgICBzcHJpbnQ6IHNwcmludFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYXJ0T2JqO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNwcmludHMuJGtleUF0KHNwcmludHMubGVuZ3RoLTEpO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvJHtjdXJyZW50fWApKTtcclxuICAgICAgICAgICAgY3VycmVudFNwcmludC4kd2F0Y2goZT0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoY3VycmVudFNwcmludCkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRDaGFydChzcHJpbnROdW1iZXIpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XHJcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XHJcblxyXG4gICAgICAgICAgICBzcHJpbnQuJHdhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRTcHJpbnRzLFxyXG4gICAgICAgIGdldE92ZXJ2aWV3Q2hhcnQsXHJcbiAgICAgICAgZ2V0Q3VycmVudENoYXJ0LFxyXG4gICAgICAgIGdldFNwcmludENoYXJ0LFxyXG4gICAgICAgIGdldENhY2hlZFNwcmludHNcclxuICAgIH1cclxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiBwYWQobikge1xyXG4gICAgICAgIHJldHVybiAobiA8IDEwKSA/IChcIjBcIiArIG4pIDogbjtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gc3VtKGl0ZW1zKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHggaW4gaXRlbXMpIGkgKz0gaXRlbXNbeF07XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcGFkLFxyXG4gICAgICAgIHN1bVxyXG4gICAgfVxyXG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
