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
    }).when('/retro', {
        resolve: {
            "firebaseUser": function firebaseUser($firebaseAuthService) {
                return $firebaseAuthService.$waitForSignIn();
            }
        },
        template: '\n                <app>\n                    <retro title="\'Retro\'"\n                             back-title="\'Afspraken\'">\n                    </retro>\n                </app>'
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

app.component('retro', {
    bindings: {
        title: '<',
        backTitle: '<'
    },

    templateUrl: templatePath + '/retro.html'
});
'use strict';

app.component('retroItem', {
    bindings: {
        item: '<'
    },
    controller: function controller(RetroService, $firebaseAuth) {
        var ctrl = this;
    },
    templateUrl: templatePath + '/retroItem.html'
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
"use strict";

app.component('sprintRetro', {
    bindings: {
        items: "<"
    },
    controller: function controller(RetroService, $firebaseAuth) {
        var ctrl = this;
    },
    templateUrl: templatePath + "/sprintRetro.html"
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

app.component('textNotes', {
    bindings: {
        title: '<',
        type: '<',
        sprint: '<'
    },
    controller: function controller($firebaseAuth, NoteService, $scope, $timeout, $rootScope) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.newNote = {
            note: '',
            author: auth.$getAuth().uid,
            timestamp: 0,
            sprint: ctrl.sprint.$id
        };

        ctrl.init = function () {
            NoteService.getNotes(ctrl.type, ctrl.sprint).then(function (d) {
                ctrl.notes = d;
                console.log(d);
            });
        };

        ctrl.saveNote = function () {
            ctrl.newNote.timestamp = Date.now();

            NoteService.add(ctrl.type, ctrl.newNote, ctrl.notes).then(function () {
                ctrl.newNote = {
                    note: '',
                    author: auth.$getAuth().uid,
                    timestamp: 0,
                    sprint: ctrl.sprint.$id
                };
            });
        };
    },
    templateUrl: templatePath + '/textNotes.html'
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

app.factory('NoteService', function ($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var notes = {};

    function getNotes(type, sprint) {
        console.log(type);
        return $q(function (resolve, reject) {
            var n = $firebaseArray(ref.child('notes/' + type).orderByChild('sprint').equalTo(sprint.$id));
            resolve(n);
        });
    }

    function add(type, note, notes) {
        return notes.$add(note);
    }

    function remove(type, note, notes) {
        return notes.$remove(note);
    }

    function save(type, note, notes) {
        return notes.$save(note);
    }

    return {
        getNotes: getNotes,
        save: save,
        add: add,
        remove: remove
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
                    suggestedMin: 0,
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
            yAxisID: 'y-axis-1'
        }]
    };

    var burndownData = {
        labels: ["di", "wo", "do", "vr", "ma", "di ", "wo ", "do ", "vr ", "ma "],
        datasets: [{
            label: "Gehaald",
            type: 'line',
            data: [],
            fill: false,
            yAxisID: 'y-axis-1',
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
        //overviewChartOptions.scales.yAxes[1].ticks.suggestedMax = 100;

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
        //burndownChartOptions.scales.yAxes[1].ticks.suggestedMax = 10 * (sprint.duration + 1);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZy9iYWNrbG9nLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwib3ZlcnZpZXdGb290ZXIvb3ZlcnZpZXdGb290ZXIuanMiLCJyZXRyby9yZXRyby5qcyIsInJldHJvSXRlbS9yZXRyb0l0ZW0uanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50UmV0cm8vc3ByaW50UmV0cm8uanMiLCJzcHJpbnRzL3NwcmludHMuanMiLCJ0ZXh0Tm90ZXMvdGV4dE5vdGVzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJGaWxlU2VydmljZS5qcyIsIk5vdGVTZXJ2aWNlLmpzIiwiTm90aWZpY2F0aW9uU2VydmljZS5qcyIsIlNwcmludFNlcnZpY2UuanMiLCJVdGlsaXR5U2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFdBQVcsQ0FBQyxjQUFjLEVBQUU7QUFDMUIsYUFBVyxFQUFFO0FBQ1gsWUFBUSxFQUFFO0FBQ1IsYUFBTyxFQUFFLEVBQUU7QUFDWCxlQUFTLEVBQUU7QUFDVCxnQkFBUSxFQUFFLElBQUk7QUFDZCxvQkFBWSxFQUFFLEdBQUc7T0FDbEI7S0FDRjtBQUNELFdBQU8sRUFBRTtBQUNQLGFBQU8sRUFBRSxTQUFTO0tBQ25CO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsWUFBTSxFQUFFLFFBQVE7QUFDaEIsY0FBUSxFQUFFO0FBQ1IsZUFBTyxFQUFFLENBQUM7QUFDVixlQUFPLEVBQUUsU0FBUztPQUNuQjtBQUNELGVBQVMsRUFBRTtBQUNULGtCQUFVLEVBQUUsQ0FBQztPQUNkO0FBQ0QsYUFB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Q0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNoRCxDQUFDLENBQUE7U0FDTCxDQUFDLENBQUM7O0FBRUgsZUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQzNCOztBQUVELFdBQU87QUFDSCxrQkFBVSxFQUFWLFVBQVU7QUFDVix3QkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHVCQUFlLEVBQWYsZUFBZTtBQUNmLHNCQUFjLEVBQWQsY0FBYztBQUNkLHdCQUFnQixFQUFoQixnQkFBZ0I7S0FDbkIsQ0FBQTtDQUNKLENBQUMsQ0FBQzs7O0FDcFNILEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsWUFBVztBQUNyQyxhQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDWixlQUFPLEFBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQztLQUNuQyxDQUFDOztBQUVGLGFBQVMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNoQixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixhQUFLLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFBRSxhQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUEsQUFDbkMsT0FBTyxDQUFDLENBQUM7S0FDWixDQUFDOztBQUVGLFdBQU87QUFDSCxXQUFHLEVBQUgsR0FBRztBQUNILFdBQUcsRUFBSCxHQUFHO0tBQ04sQ0FBQTtDQUNKLENBQUMsQ0FBQSIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsicGFydGljbGVzSlMoXCJwYXJ0aWNsZXMtanNcIiwge1xuICBcInBhcnRpY2xlc1wiOiB7XG4gICAgXCJudW1iZXJcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAxMCxcbiAgICAgIFwiZGVuc2l0eVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwidmFsdWVfYXJlYVwiOiA4MDBcbiAgICAgIH1cbiAgICB9LFxuICAgIFwiY29sb3JcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiBcIiNmZmZmZmZcIlxuICAgIH0sXG4gICAgXCJzaGFwZVwiOiB7XG4gICAgICBcInR5cGVcIjogXCJjaXJjbGVcIixcbiAgICAgIFwic3Ryb2tlXCI6IHtcbiAgICAgICAgXCJ3aWR0aFwiOiAwLFxuICAgICAgICBcImNvbG9yXCI6IFwiIzAwMDAwMFwiXG4gICAgICB9LFxuICAgICAgXCJwb2x5Z29uXCI6IHtcbiAgICAgICAgXCJuYl9zaWRlc1wiOiA1XG4gICAgICB9LFxuICAgICAgXCJpbWFnZVwiOiB7XG4gICAgICAgIFwic3JjXCI6IFwiaW1nL2dpdGh1Yi5zdmdcIixcbiAgICAgICAgXCJ3aWR0aFwiOiAxMDAsXG4gICAgICAgIFwiaGVpZ2h0XCI6IDEwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJvcGFjaXR5XCI6IHtcbiAgICAgIFwidmFsdWVcIjogMC4xLFxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXG4gICAgICBcImFuaW1cIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJzcGVlZFwiOiAxLFxuICAgICAgICBcIm9wYWNpdHlfbWluXCI6IDAuMDEsXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJzaXplXCI6IHtcbiAgICAgIFwidmFsdWVcIjogMyxcbiAgICAgIFwicmFuZG9tXCI6IHRydWUsXG4gICAgICBcImFuaW1cIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJzcGVlZFwiOiAxMCxcbiAgICAgICAgXCJzaXplX21pblwiOiAwLjEsXG4gICAgICAgIFwic3luY1wiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgXCJkaXN0YW5jZVwiOiAxNTAsXG4gICAgICBcImNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICAgICAgXCJvcGFjaXR5XCI6IDAuMDUsXG4gICAgICBcIndpZHRoXCI6IDFcbiAgICB9LFxuICAgIFwibW92ZVwiOiB7XG4gICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgXCJzcGVlZFwiOiAyLFxuICAgICAgXCJkaXJlY3Rpb25cIjogXCJub25lXCIsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwic3RyYWlnaHRcIjogZmFsc2UsXG4gICAgICBcIm91dF9tb2RlXCI6IFwib3V0XCIsXG4gICAgICBcImJvdW5jZVwiOiBmYWxzZSxcbiAgICAgIFwiYXR0cmFjdFwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInJvdGF0ZVhcIjogNjAwLFxuICAgICAgICBcInJvdGF0ZVlcIjogMTIwMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJpbnRlcmFjdGl2aXR5XCI6IHtcbiAgICBcImRldGVjdF9vblwiOiBcImNhbnZhc1wiLFxuICAgIFwiZXZlbnRzXCI6IHtcbiAgICAgIFwib25ob3ZlclwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwibW9kZVwiOiBcImdyYWJcIlxuICAgICAgfSxcbiAgICAgIFwib25jbGlja1wiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICAgIFwibW9kZVwiOiBcInB1c2hcIlxuICAgICAgfSxcbiAgICAgIFwicmVzaXplXCI6IHRydWVcbiAgICB9LFxuICAgIFwibW9kZXNcIjoge1xuICAgICAgXCJncmFiXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAxNDAsXG4gICAgICAgIFwibGluZV9saW5rZWRcIjoge1xuICAgICAgICAgIFwib3BhY2l0eVwiOiAuMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJidWJibGVcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDQwMCxcbiAgICAgICAgXCJzaXplXCI6IDQwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDUsXG4gICAgICAgIFwib3BhY2l0eVwiOiAuMSxcbiAgICAgICAgXCJzcGVlZFwiOiAzMDBcbiAgICAgIH0sXG4gICAgICBcInJlcHVsc2VcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDIwMCxcbiAgICAgICAgXCJkdXJhdGlvblwiOiAwLjRcbiAgICAgIH0sXG4gICAgICBcInB1c2hcIjoge1xuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAzXG4gICAgICB9LFxuICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICBcInBhcnRpY2xlc19uYlwiOiAyXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcInJldGluYV9kZXRlY3RcIjogdHJ1ZVxufSk7IiwidmFyIHJlZztcblxuaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgc3VwcG9ydGVkJyk7XG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zZXJ2aWNld29ya2VyLmpzJykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWFkeTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpcyByZWFkeSA6XiknLCByZWcpO1xuICAgICAgICByZWcgPSBzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uO1xuICAgICAgICAvLyBUT0RPXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBlcnJvciA6XignLCBlcnJvcik7XG4gICAgfSk7XG5cbiAgICBcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb25zKCkudGhlbihhID0+IHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBhKSB7XG4gICAgICAgICAgICBpZiAoYVtpXS5hY3RpdmUuc2NyaXB0VVJMLmluZGV4T2YoJy9zY3JpcHRzL3NlcicpID49IDApIHtcbiAgICAgICAgICAgICAgICBhW2ldLnVucmVnaXN0ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5cbmNvbnN0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiYWZ0ZXJidXJuZXJBcHBcIiwgW1wiZmlyZWJhc2VcIiwgJ25nVG91Y2gnLCAnbmdSb3V0ZScsIFwiYW5ndWxhci5maWx0ZXJcIiwgJ25nLXNvcnRhYmxlJ10pO1xuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyLCRmaXJlYmFzZVJlZlByb3ZpZGVyKSB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxuICAgICAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCI3Njc4MTA0MjkzMDlcIlxuICAgIH07XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7IFxuICAgICRmaXJlYmFzZVJlZlByb3ZpZGVyLnJlZ2lzdGVyVXJsKGNvbmZpZy5kYXRhYmFzZVVSTCk7XG4gICAgXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgLndoZW4oJy9zaWduaW4nLCB7IFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8c2lnbmluPjwvc2lnbmluPidcbiAgICAgICAgfSkgXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KSAgICAgICAgXG4gICAgICAgIC53aGVuKCcvY3VycmVudC1zcHJpbnQnLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvc3ByaW50LzpzcHJpbnQnLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4nLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvYmlnc2NyZWVuL2N1cnJlbnQtc3ByaW50Jywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJmYWxzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4vc3ByaW50LzpzcHJpbnQnLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkcm91dGUuY3VycmVudC5wYXJhbXMuc3ByaW50O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvYmFja2xvZycsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbiAoJGZpcmViYXNlQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRmaXJlYmFzZUF1dGhTZXJ2aWNlLiR3YWl0Rm9yU2lnbkluKCk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidPdmVydmlldydcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxuICAgICAgICB9KSBcbiAgICAgICAgLndoZW4oJy9yZXRybycsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbiAoJGZpcmViYXNlQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRmaXJlYmFzZUF1dGhTZXJ2aWNlLiR3YWl0Rm9yU2lnbkluKCk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxyZXRybyB0aXRsZT1cIidSZXRybydcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0Fmc3ByYWtlbidcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9yZXRybz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLCBcbiAgICAgICAgfSkgXG4gICAgICAgIC5vdGhlcndpc2UoJy8nKTsgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnYXBwJywge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG5cbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2FwcC5odG1sYCAgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtOiBcIjxcIixcbiAgICAgICAgc3ByaW50czogXCI8XCIsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBcIjxcIixcbiAgICAgICAgb25BZGQ6IFwiJlwiLFxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXG4gICAgICAgIG9uU2F2ZTogXCImXCJcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBjdHJsLmF0dGFjaG1lbnRzVG9BZGQ7XG4gICAgICAgIFxuICAgICAgICBsZXQgZmlsZVNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGZpbGVTZWxlY3QudHlwZSA9ICdmaWxlJztcbiAgICAgICAgZmlsZVNlbGVjdC5tdWx0aXBsZSA9ICdtdWx0aXBsZSc7XG4gICAgICAgIGZpbGVTZWxlY3Qub25jaGFuZ2UgPSAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGVzKGZpbGVTZWxlY3QuZmlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1pbWVNYXAgPSB7fTtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2pwZWdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvcG5nXCJdID0gXCJmYS1waWN0dXJlLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2dpZlwiXSA9IFwiZmEtcGljdHVyZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS90aWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiOyAgICAgICAgXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi9wZGZcIl0gPSBcImZhLWZpbGUtcGRmLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCJdID0gXCJmYS1maWxlLWV4Y2VsLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIl0gPSBcImZhLWZpbGUtcG93ZXJwb2ludC1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFwiXSA9IFwiZmEtZmlsZS13b3JkLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3gtemlwLWNvbXByZXNzZWRcIl0gPSBcImZhLWZpbGUtYXJjaGl2ZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJ2aWRlby93ZWJtXCJdID0gXCJmYS1maWxlLXZpZGVvLW9cIjtcblxuICAgICAgICBjdHJsLmdldEZpbGVJY29uID0gKGEpID0+IHtcbiAgICAgICAgICAgIGlmIChtaW1lTWFwW2EubWltZXR5cGVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1pbWVNYXBbYS5taW1ldHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBcImZhLWZpbGUtb1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5nZXRGaWxlRXh0ZW50aW9uID0gKGEpID0+IHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGEubmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZWxlY3RGaWxlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghY3RybC5pdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVNlbGVjdC5jbGljaygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjdHJsLnVwbG9hZEZpbGVzID0gKGZpbGVzKSA9PiB7XG4gICAgICAgICAgICBmb3IgKHZhciBmIGluIGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1tmXTtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZSA9IChmaWxlKSA9PiB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9IGAke2N0cmwuaXRlbS4kaWR9LyR7ZmlsZS5uYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5ID0gLTE7XG4gICAgICAgICAgICB2YXIgYXR0YWNobWVudCA9IHtcbiAgICAgICAgICAgICAgICBiYWNrbG9nSXRlbTogY3RybC5pdGVtLiRpZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgICAgICBtaW1ldHlwZTogZmlsZS50eXBlLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAxLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRhZGQoYXR0YWNobWVudCkudGhlbigocmVmKSA9PiB7XG4gICAgICAgICAgICAgICAga2V5ID0gcmVmLmtleTtcblxuICAgICAgICAgICAgICAgIGxldCBzdG9yYWdlUmVmID0gZmlyZWJhc2Uuc3RvcmFnZSgpLnJlZihwYXRoKTtcbiAgICAgICAgICAgICAgICB2YXIgdXBsb2FkVGFzayA9IHN0b3JhZ2VSZWYucHV0KGZpbGUpO1xuICAgICAgICAgICAgICAgIHVwbG9hZFRhc2sub24oJ3N0YXRlX2NoYW5nZWQnLCBmdW5jdGlvbiBwcm9ncmVzcyhzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSAoc25hcHNob3QuYnl0ZXNUcmFuc2ZlcnJlZCAvIHNuYXBzaG90LnRvdGFsQnl0ZXMpICogMTAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGN0cmwuYXR0YWNobWVudHMuJGdldFJlY29yZChrZXkpXG4gICAgICAgICAgICAgICAgICAgIHIucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHVuc3VjY2Vzc2Z1bCB1cGxvYWRzXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc3VjY2Vzc2Z1bCB1cGxvYWRzIG9uIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZSwgZ2V0IHRoZSBkb3dubG9hZCBVUkw6IGh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tLy4uLlxuICAgICAgICAgICAgICAgICAgICB2YXIgZG93bmxvYWRVUkwgPSB1cGxvYWRUYXNrLnNuYXBzaG90LmRvd25sb2FkVVJMO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGN0cmwuYXR0YWNobWVudHMuJGdldFJlY29yZChrZXkpXG4gICAgICAgICAgICAgICAgICAgIHIudXJsID0gZG93bmxvYWRVUkw7XG4gICAgICAgICAgICAgICAgICAgIHIuc3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRzYXZlKHIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnJlbW92ZUF0dGFjaG1lbnQgPSAoYSxlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kcmVtb3ZlKGEpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nRm9ybS5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXksIEZpbGVTZXJ2aWNlLCAkc2NvcGUsIE5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XG5cbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcbiAgICAgICAgY3RybC5vcGVuID0gdHJ1ZTtcblxuICAgICAgICBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XG4gICAgICAgICAgICBjdHJsLnJlT3JkZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICB9KVxuXG4gICAgICAgICRzY29wZS5jdXN0b21PcmRlciA9IChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmICghY3RybC5zcHJpbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWtleS5zcHJpbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC1jdHJsLnNwcmludHMuJGdldFJlY29yZChrZXkuc3ByaW50KS5vcmRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwucmVPcmRlciA9IChncm91cCkgPT4ge1xuICAgICAgICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ub3JkZXIgIT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yZGVyID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNhdmVJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5zdW1FZmZvcnQgPSAoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBpdGVtc1tpXS5lZmZvcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdW07XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5vcmRlckJ5U3ByaW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3RybC5zcHJpbnRzLiRnZXRSZWNvcmQoa2V5KS5vcmRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9IGl0ZW0gPT4ge1xuICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XG4gICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbSA9IGl0ZW07XG4gICAgICAgICAgICBGaWxlU2VydmljZS5nZXRBdHRhY2htZW50cyhpdGVtKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW1BdHRhY2htZW50cyA9IGRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuYWRkSXRlbSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiTmlldXcuLi5cIixcbiAgICAgICAgICAgICAgICBlZmZvcnQ6IDAsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXG4gICAgICAgICAgICAgICAgb3JkZXI6IC0xLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAwLFxuICAgICAgICAgICAgICAgIHNwcmludDogXCJcIlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5hZGQobmV3SXRlbSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5CaUl0ZW1zLiRnZXRSZWNvcmQoZGF0YS5rZXkpKTtcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5kZWxldGVJdGVtID0gaXRlbSA9PiB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjdHJsLkJpSXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgIGxldCBzZWxlY3RJbmRleCA9IGluZGV4ID09PSAwID8gMCA6IGluZGV4IC0gMTtcblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UucmVtb3ZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXNbc2VsZWN0SW5kZXhdKTtcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLnNhdmVJdGVtID0gKGl0ZW0pID0+IHtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uc3RhdGUgPT0gY3RybC5zdGF0ZS5Eb25lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtLnJlc29sdmVkT24pIHtcbiAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS5ub3RpZnkoJ1NtZWxscyBsaWtlIGZpcmUuLi4nLCBgV29yayBvbiBcIiR7aXRlbS5uYW1lfVwiIGhhcyBiZWVuIGNvbXBsZXRlZCFgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gaXRlbS5yZXNvbHZlZE9uIHx8IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZVxuICAgICAgICAgICAgICAgID8gY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfVxuICAgICAgICAgICAgICAgIDogY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zb3J0Q29uZmlnID0ge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXG4gICAgICAgICAgICBoYW5kbGU6ICcuc29ydGFibGUtaGFuZGxlJyxcbiAgICAgICAgICAgIG9uQWRkKGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBlLm1vZGVsO1xuICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSBlLm1vZGVsc1swXS5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsICYmIG1vZGVsLnNwcmludCAhPSBzcHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gY3RybC5CaUl0ZW1zLiRpbmRleEZvcihtb2RlbC4kaWQpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXNbaW5kZXhdLnNwcmludCA9IHNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRzYXZlKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZW1vdmUoZSkge1xuICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblVwZGF0ZShlKSB7XG4gICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nSXRlbScsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtOiAnPCcsXG4gICAgICAgIG9uQ2xpY2s6ICcmJ1xuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dJdGVtLmh0bWxgIFxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmlnc2NyZWVuJywge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG5cbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JpZ3NjcmVlbi5odG1sYCAgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBvcHRpb25zOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgbG9hZGVkOiAnPCcsXG4gICAgICAgIHR5cGU6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlLCBTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xuXG4gICAgICAgIGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0KSBjdHJsLmNoYXJ0LmRlc3Ryb3koKTtcblxuICAgICAgICAgICAgY3RybC5jaGFydCA9IG5ldyBDaGFydCgkY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogY3RybC50eXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjdHJsLm9wdGlvbnNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB3aW5kb3cuY2hhcnQgPSBjdHJsLmNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgJGNhbnZhcy5vbmNsaWNrID0gZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVQb2ludHMgPSBjdHJsLmNoYXJ0LmdldEVsZW1lbnRzQXRFdmVudChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRJbmRleCA9IGFjdGl2ZVBvaW50c1sxXS5faW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZFNwcmludCA9IFNwcmludFNlcnZpY2UuZ2V0Q2FjaGVkU3ByaW50cygpW2NsaWNrZWRJbmRleF0ub3JkZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICRsb2NhdGlvbi5wYXRoKGAvc3ByaW50LyR7Y2xpY2tlZFNwcmludH1gKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuJHdhdGNoKCgpPT4gY3RybC5sb2FkZWQsIGxvYWRlZD0+IHtcbiAgICAgICAgICAgIGlmKCFsb2FkZWQpIHJldHVybjtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfSlcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCk9PmN0cmwuY2hhcnQudXBkYXRlKCkpO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGA8Y2FudmFzPjwvY2FudmFzPmAgXG59KSAiLCJhcHAuY29tcG9uZW50KCdmb290ZXInLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ292ZXJ2aWV3Rm9vdGVyJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHNwcmludDogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zdGF0T3BlbiA9IGZhbHNlO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vZm9vdGVyLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdyZXRybycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8J1xuICAgIH0sXG5cbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyby5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgncmV0cm9JdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyb0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6ICc8JyxcbiAgICAgICAgb3BlbjogJzwnLFxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoTm90aWZpY2F0aW9uU2VydmljZSwgJHRpbWVvdXQsICRzY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xuICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmNoZWNrU3Vic2NyaXB0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC51bnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2UudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRCYWNrbG9nJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRCYWNrbG9nLmh0bWxgIFxufSk7ICIsImFwcC5jb21wb25lbnQoJ3NwcmludFJldHJvJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50UmV0cm8uaHRtbGAgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50cycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcbiAgICAgICAgYmFja2xvZzogJzwnLFxuICAgICAgICBjaGFydDogJz0nXG4gICAgfSxcblxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSwgQmFja2xvZ1NlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsJHJvb3RTY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuc3RhdGVMb29rdXAgPSBbJ05ldycsICdBcHByb3ZlZCcsICcnLCAnRG9uZScsICdSZW1vdmVkJ107ICAgICBcblxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xuXG4gICAgICAgIGN0cmwuc3VtRWZmb3J0ID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gaXRlbXNbaV0uZWZmb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VtO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgaWYgKGN0cmwuY2hhcnQuc3ByaW50ICYmIGN0cmwuYmFja2xvZykge1xuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZyhjdHJsLmNoYXJ0LnNwcmludCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGN0cmwubG9hZGVkID0gdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJGxvYWRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludC5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJHdhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0geyBuYW1lOiBjdHJsLmZpbHRlci5uYW1lIH1cbiAgICAgICAgICAgICAgICA6IGN0cmwuZmlsdGVyLnN0YXRlID0geDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghY3RybC5jaGFydC5zcHJpbnQgfHwgIWN0cmwuYmFja2xvZykge1xuICAgICAgICAgICAgICAgIGN0cmwubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyBUaGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3IgYnVpbGRpbmcgdGhlIGdyYXBoZGF0YSBieSBiYWNrbG9nIGl0ZW1zICAgICAgICBcbiAgICAgICAgY3RybC5zZXRCdXJuZG93biA9IChzdGFydCwgZHVyYXRpb24sIGJhY2tsb2cpID0+IHtcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoc3RhcnQgKiAxMDAwKTtcbiAgICAgICAgICAgIGxldCBkYXRlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGJ1cm5kb3duID0gW107XG4gICAgICAgICAgICBsZXQgZGF5c1RvQWRkID0gMDsgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IGN0cmwuY2hhcnQuc3ByaW50LnZlbG9jaXR5O1xuICAgICAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG4gICAgICAgICAgICBsZXQgdG90YWxCdXJuZG93biA9IDA7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGR1cmF0aW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0ZSA9IHN0YXJ0LmFkZERheXMoZGF5c1RvQWRkIC0gMSk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0RhdGUgPiBuZXcgRGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChbMCwgNl0uaW5kZXhPZihuZXdEYXRlLmdldERheSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXNUb0FkZCsrO1xuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gc3RhcnQuYWRkRGF5cyhkYXlzVG9BZGQpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRlcy5wdXNoKG5ld0RhdGUpO1xuICAgICAgICAgICAgICAgIGRheXNUb0FkZCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSBkYXRlc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgYmRvd24gPSAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyIGluIGJhY2tsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsaSA9IGJhY2tsb2dbaTJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmxpLnN0YXRlICE9IFwiM1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBibGlEYXRlID0gbmV3IERhdGUocGFyc2VJbnQoYmxpLnJlc29sdmVkT24pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaURhdGUuZ2V0RGF0ZSgpID09IGQuZ2V0RGF0ZSgpICYmIGJsaURhdGUuZ2V0TW9udGgoKSA9PSBkLmdldE1vbnRoKCkgJiYgYmxpRGF0ZS5nZXRGdWxsWWVhcigpID09IGQuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmRvd24gKz0gYmxpLmVmZm9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1cm5kb3duLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBkLFxuICAgICAgICAgICAgICAgICAgICBidXJuZG93bjogYmRvd25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgeCBpbiBidXJuZG93bikge1xuICAgICAgICAgICAgICAgIHRvdGFsQnVybmRvd24gKz0gYnVybmRvd25beF0uYnVybmRvd247XG4gICAgICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gYnVybmRvd25beF0uYnVybmRvd247XG4gICAgICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY3RybC5jaGFydC5idXJuZG93biA9IHRvdGFsQnVybmRvd247XG4gICAgICAgICAgICBjdHJsLmNoYXJ0LnJlbWFpbmluZyA9IHZlbG9jaXR5UmVtYWluaW5nO1xuICAgICAgICAgICAgY3RybC5jaGFydC5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50cy5odG1sYFxufSk7XG5cbkRhdGUucHJvdG90eXBlLmFkZERheXMgPSBmdW5jdGlvbihkYXlzKVxue1xuICAgIHZhciBkYXQgPSBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSk7XG4gICAgZGF0LnNldERhdGUoZGF0LmdldERhdGUoKSArIGRheXMpO1xuICAgIHJldHVybiBkYXQ7XG59XG4iLCJhcHAuY29tcG9uZW50KCd0ZXh0Tm90ZXMnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnLFxuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBOb3RlU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwgJHJvb3RTY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcbiAgICAgICAgICAgIG5vdGU6ICcnLFxuICAgICAgICAgICAgYXV0aG9yOiBhdXRoLiRnZXRBdXRoKCkudWlkLFxuICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgc3ByaW50OiBjdHJsLnNwcmludC4kaWRcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuaW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGVTZXJ2aWNlLmdldE5vdGVzKGN0cmwudHlwZSwgY3RybC5zcHJpbnQpLnRoZW4oKGQpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLm5vdGVzID0gZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zYXZlTm90ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGN0cmwubmV3Tm90ZS50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICBOb3RlU2VydmljZS5hZGQoY3RybC50eXBlLCBjdHJsLm5ld05vdGUsIGN0cmwubm90ZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcjogYXV0aC4kZ2V0QXV0aCgpLnVpZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnQ6IGN0cmwuc3ByaW50LiRpZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS90ZXh0Tm90ZXMuaHRtbGAgICBcbn0pOyIsImFwcC5mYWN0b3J5KCdCYWNrbG9nU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBiYWNrbG9nO1xuXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYWNrbG9nID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYmFja2xvZ1wiKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZChiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kYWRkKGJhY2tsb2dJdGVtKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRyZW1vdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHNhdmUoYmFja2xvZ0l0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEJhY2tsb2csXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdGaWxlU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBVdGlsaXR5U2VydmljZSwgJHEsICR0aW1lb3V0LCAkZmlyZWJhc2VBcnJheSkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IGF0dGFjaG1lbnRzO1xuXG4gICAgZnVuY3Rpb24gZ2V0QXR0YWNobWVudHMoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgICAgICAgICByZWplY3QoXCJCYWNrbG9nIGl0ZW0gbm90IHByb3ZpZGVkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRhY2htZW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImF0dGFjaG1lbnRzXCIpLm9yZGVyQnlDaGlsZCgnYmFja2xvZ0l0ZW0nKS5lcXVhbFRvKGJhY2tsb2dJdGVtLiRpZCkpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYXR0YWNobWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRBdHRhY2htZW50c1xuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnTm90ZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxKSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgbm90ZXMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGdldE5vdGVzKHR5cGUsIHNwcmludCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBuID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdub3Rlcy8nICsgdHlwZSkub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcbiAgICAgICAgICAgIHJlc29sdmUobik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZCh0eXBlLCBub3RlLG5vdGVzKSB7XG4gICAgICAgIHJldHVybiBub3Rlcy4kYWRkKG5vdGUpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmUodHlwZSwgbm90ZSxub3Rlcykge1xuICAgICAgICByZXR1cm4gbm90ZXMuJHJlbW92ZShub3RlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlKHR5cGUsIG5vdGUsIG5vdGVzKSB7XG4gICAgICAgIHJldHVybiBub3Rlcy4kc2F2ZShub3RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXROb3RlcyxcbiAgICAgICAgc2F2ZSxcbiAgICAgICAgYWRkLFxuICAgICAgICByZW1vdmVcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGlmaWNhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlyZWJhc2VBdXRoLCAkaHR0cCkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7ICAgIFxuICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIGxldCB1c2VySWQgPSBhdXRoLiRnZXRBdXRoKCkudWlkO1xuICAgIGxldCByZWcgPSB3aW5kb3cucmVnO1xuICAgIGxldCBiYWNrbG9nO1xuXG4gICAgZnVuY3Rpb24gc3Vic2NyaWJlKCkge1xuXG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWcpO1xuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLnN1YnNjcmliZSh7IHVzZXJWaXNpYmxlT25seTogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uIChwdXNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHB1c2hTdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1YnNjcmliZWQhIEVuZHBvaW50OicsIHN1Yi5lbmRwb2ludCk7XG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGxvYWRlZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGFkZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRwb2ludDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleXM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocHVzaFN1YnNjcmlwdGlvbikpLmtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpLnRoZW4oZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRsb2FkZWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kcmVtb3ZlKDApOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdGlmeSh0aXRsZSwgbWVzc2FnZSkgeyAgICAgICAgXG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAkaHR0cCh7IFxuICAgICAgICAgICAgICAgIHVybDogYGh0dHBzOi8vbm90aWZpY2F0aW9ucy5ib2VyZGFtZG5zLm5sL2FwaS9ub3RpZnkvcG9zdD90aXRsZT0ke3RpdGxlfSZtZXNzYWdlPSR7bWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICB9KS50aGVuKGEgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlLFxuICAgICAgICB1bnN1YnNjcmliZSxcbiAgICAgICAgbm90aWZ5XG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcbiAgICBsZXQgY2hhcnRUeXBlID0gXCJsaW5lXCI7XG4gICAgbGV0IGNhY2hlZFNwcmludHM7XG5cbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICB9LFxuICAgICAgICBlbGVtZW50czoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNaW46IDAsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IG51bGxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xuICAgICAgICBsYWJlbHM6IFtdLCBcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQXZlcmFnZVwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjNThGNDg0XCIsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU4RjQ4NFwiLFxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzU4RjQ4NCcsXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1OEY0ODQnLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpIFwiLCBcIndvIFwiLCBcImRvIFwiLCBcInZyIFwiLCBcIm1hIFwiXSxcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJHZWhhYWxkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XG4gICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoOSkpO1xuICAgICAgICBzcHJpbnRzLiRsb2FkZWQoY2IsICgpPT4gJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDYWNoZWRTcHJpbnRzKCkge1xuICAgICAgICByZXR1cm4gY2FjaGVkU3ByaW50cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPdmVydmlld0NoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cyA9PiB7XG5cbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2FjaGVkU3ByaW50cyA9IHNwcmludHM7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XG4gICAgICAgICAgICAgICAgc3ByaW50cy4kd2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWNoZWRTcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcbiAgICAgICAgICAgICAgICB9KTsgICAgXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpIHtcblxuICAgICAgICBsZXQgbGFiZWxzO1xuICAgICAgICBsZXQgZXN0aW1hdGVkO1xuICAgICAgICBsZXQgYnVybmVkO1xuICAgICAgICBsZXQgYXZlcmFnZSA9IFtdO1xuXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xuICAgICAgICBidXJuZWQgPSBzcHJpbnRzLm1hcChkID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBwYXJzZUludChidXJuZWRbaV0sIDEwKTsgLy9kb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBiYXNlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF2ZyA9IHN1bSAvIChidXJuZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ByaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXZlcmFnZS5wdXNoKGF2Zyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGF0YSA9IG92ZXJ2aWV3RGF0YTtcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMl0uZGF0YSA9IGJ1cm5lZDtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gZXN0aW1hdGVkO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBhdmVyYWdlO1xuXG4gICAgICAgIGxldCBvdmVydmlld0NoYXJ0T3B0aW9ucyA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcbiAgICAgICAgLy9vdmVydmlld0NoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMV0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAwO1xuXG4gICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gc3ByaW50c1tzcHJpbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBvdmVydmlld0NoYXJ0T3B0aW9ucyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XG4gICAgICAgIGxldCBsYWJlbHMgPSBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLnNsaWNlKDAsc3ByaW50LmR1cmF0aW9uICsxKVxuXG4gICAgICAgIGxldCBpZGVhbEJ1cm5kb3duID0gbGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGkgPT09IGxhYmVscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICgoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uKSAqIGkpLnRvRml4ZWQoMik7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcblxuICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhID0gYnVybmRvd25EYXRhO1xuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XG4gICAgICAgIGxldCBidXJuZG93bkNoYXJ0T3B0aW9ucyA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xuICAgICAgICAvL2J1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcblxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IGJ1cm5kb3duQ2hhcnRPcHRpb25zLCBcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxuICAgICAgICAgICAgbmFtZTogc3ByaW50Lm5hbWUsXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uLCAxKSxcbiAgICAgICAgICAgIHNwcmludDogc3ByaW50XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hhcnRPYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFydCgpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNwcmludHMuJGtleUF0KHNwcmludHMubGVuZ3RoLTEpO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnROdW1iZXIgPSBjdXJyZW50LnNwbGl0KFwic1wiKVsxXTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy8ke2N1cnJlbnR9YCkpO1xuICAgICAgICAgICAgY3VycmVudFNwcmludC4kd2F0Y2goZT0+IHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChjdXJyZW50U3ByaW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRDaGFydChzcHJpbnROdW1iZXIpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XG4gICAgICAgICAgICBsZXQgc3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy9zJHtzcHJpbnROdW1iZXJ9YCkpO1xuXG4gICAgICAgICAgICBzcHJpbnQuJHdhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3ByaW50cyxcbiAgICAgICAgZ2V0T3ZlcnZpZXdDaGFydCxcbiAgICAgICAgZ2V0Q3VycmVudENoYXJ0LFxuICAgICAgICBnZXRTcHJpbnRDaGFydCxcbiAgICAgICAgZ2V0Q2FjaGVkU3ByaW50c1xuICAgIH1cbn0pOyIsImFwcC5mYWN0b3J5KCdVdGlsaXR5U2VydmljZScsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHBhZChuKSB7XG4gICAgICAgIHJldHVybiAobiA8IDEwKSA/IChcIjBcIiArIG4pIDogbjtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc3VtKGl0ZW1zKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBhZCxcbiAgICAgICAgc3VtXG4gICAgfVxufSkiXX0=
