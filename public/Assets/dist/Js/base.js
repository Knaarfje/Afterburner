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

        ctrl.customOrder = function (key) {
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

app.component('retro', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller: function controller(RetroService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope, NotificationService) {
        var ctrl = this;

        SprintService.getSprints(function (sprints) {
            ctrl.sprints = sprints;
        });

        RetroService.getRetro().then(function (data) {
            ctrl.RetroAgreements = data;
        });
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

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout, $rootScope, RetroService) {
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

            RetroService.getRetro(ctrl.chart.sprint).then(function (data) {
                ctrl.RetroAgreements = data;
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

app.factory('RetroService', function ($firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    var _ = UtilityService;
    var ref = firebase.database().ref();
    var retro = undefined;

    function getRetro(sprint) {
        return $q(function (resolve, reject) {
            if (!sprint) {
                retro = $firebaseArray(ref.child("retro").orderByChild('sprint'));
                resolve(retro);
            } else {
                retro = $firebaseArray(ref.child("retro").orderByChild('sprint').equalTo(sprint.$id));
                resolve(retro);
            }
        });
    }

    function add(retroAgreement) {
        return retro.$add(retroAgreement);
    }

    function remove(retroAgreement) {
        return retro.$remove(retroAgreement);
    }

    function save(retroAgreement) {
        return retro.$save(retroAgreement);
    }

    return {
        getRetro: getRetro,
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYXBwLmpzIiwiYXBwL2FwcC5qcyIsImJhY2tsb2cvYmFja2xvZy5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJiaWdzY3JlZW4vYmlnc2NyZWVuLmpzIiwiY2hhcnQvY2hhcnQuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwib3ZlcnZpZXdGb290ZXIvb3ZlcnZpZXdGb290ZXIuanMiLCJyZXRyby9yZXRyby5qcyIsInJldHJvSXRlbS9yZXRyb0l0ZW0uanMiLCJzaWRlTmF2L3NpZGVOYXYuanMiLCJzaWduaW4vc2lnbmluLmpzIiwic3ByaW50QmFja2xvZy9zcHJpbnRCYWNrbG9nLmpzIiwic3ByaW50UmV0cm8vc3ByaW50UmV0cm8uanMiLCJzcHJpbnRzL3NwcmludHMuanMiLCJ0ZXh0Tm90ZXMvdGV4dE5vdGVzLmpzIiwiQmFja2xvZ1NlcnZpY2UuanMiLCJGaWxlU2VydmljZS5qcyIsIk5vdGVTZXJ2aWNlLmpzIiwiTm90aWZpY2F0aW9uU2VydmljZS5qcyIsIlJldHJvU2VydmljZS5qcyIsIlNwcmludFNlcnZpY2UuanMiLCJVdGlsaXR5U2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFdBQVcsQ0FBQyxjQUFjLEVBQUU7QUFDMUIsYUFBVyxFQUFFO0FBQ1gsWUFBUSxFQUFFO0FBQ1IsYUFBTyxFQUFFLEVBQUU7QUFDWCxlQUFTLEVBQUU7QUFDVCxnQkFBUSxFQUFFLElBQUk7QUFDZCxvQkFBWSxFQUFFLEdBQUc7T0FDbEI7S0FDRjtBQUNELFdBQU8sRUFBRTtBQUNQLGFBQU8sRUFBRSxTQUFTO0tBQ25CO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsWUFBTSxFQUFFLFFBQVE7QUFDaEIsY0FBUSxFQUFFO0FBQ1IsZUFBTyxFQUFFLENBQUM7QUFDVixlQUFPLEVBQUUsU0FBUztPQUNuQjtBQUNELGVBQVMsRUFBRTtBQUNULGtCQUFVLEVBQUUs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RyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFXO0FBQ3JDLGFBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNaLGVBQU8sQUFBQyxDQUFDLEdBQUcsRUFBRSxHQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0tBQ25DLENBQUM7O0FBRUYsYUFBUyxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLGFBQUssSUFBSSxDQUFDLElBQUksS0FBSztBQUFFLGFBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxBQUNuQyxPQUFPLENBQUMsQ0FBQztLQUNaLENBQUM7O0FBRUYsV0FBTztBQUNILFdBQUcsRUFBSCxHQUFHO0FBQ0gsV0FBRyxFQUFILEdBQUc7S0FDTixDQUFBO0NBQ0osQ0FBQyxDQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJwYXJ0aWNsZXNKUyhcInBhcnRpY2xlcy1qc1wiLCB7XG4gIFwicGFydGljbGVzXCI6IHtcbiAgICBcIm51bWJlclwiOiB7XG4gICAgICBcInZhbHVlXCI6IDEwLFxuICAgICAgXCJkZW5zaXR5XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJ2YWx1ZV9hcmVhXCI6IDgwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb2xvclwiOiB7XG4gICAgICBcInZhbHVlXCI6IFwiI2ZmZmZmZlwiXG4gICAgfSxcbiAgICBcInNoYXBlXCI6IHtcbiAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxuICAgICAgXCJzdHJva2VcIjoge1xuICAgICAgICBcIndpZHRoXCI6IDAsXG4gICAgICAgIFwiY29sb3JcIjogXCIjMDAwMDAwXCJcbiAgICAgIH0sXG4gICAgICBcInBvbHlnb25cIjoge1xuICAgICAgICBcIm5iX3NpZGVzXCI6IDVcbiAgICAgIH0sXG4gICAgICBcImltYWdlXCI6IHtcbiAgICAgICAgXCJzcmNcIjogXCJpbWcvZ2l0aHViLnN2Z1wiLFxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcbiAgICAgICAgXCJoZWlnaHRcIjogMTAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcIm9wYWNpdHlcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAwLjEsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEsXG4gICAgICAgIFwib3BhY2l0eV9taW5cIjogMC4wMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcInNpemVcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAzLFxuICAgICAgXCJyYW5kb21cIjogdHJ1ZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEwLFxuICAgICAgICBcInNpemVfbWluXCI6IDAuMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcImRpc3RhbmNlXCI6IDE1MCxcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXG4gICAgICBcIm9wYWNpdHlcIjogMC4wNSxcbiAgICAgIFwid2lkdGhcIjogMVxuICAgIH0sXG4gICAgXCJtb3ZlXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcInNwZWVkXCI6IDIsXG4gICAgICBcImRpcmVjdGlvblwiOiBcIm5vbmVcIixcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcbiAgICAgIFwib3V0X21vZGVcIjogXCJvdXRcIixcbiAgICAgIFwiYm91bmNlXCI6IGZhbHNlLFxuICAgICAgXCJhdHRyYWN0XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwicm90YXRlWFwiOiA2MDAsXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImludGVyYWN0aXZpdHlcIjoge1xuICAgIFwiZGV0ZWN0X29uXCI6IFwiY2FudmFzXCIsXG4gICAgXCJldmVudHNcIjoge1xuICAgICAgXCJvbmhvdmVyXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXG4gICAgICB9LFxuICAgICAgXCJvbmNsaWNrXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwicHVzaFwiXG4gICAgICB9LFxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJtb2Rlc1wiOiB7XG4gICAgICBcImdyYWJcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDE0MCxcbiAgICAgICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJ1YmJsZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogNDAwLFxuICAgICAgICBcInNpemVcIjogNDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcbiAgICAgICAgXCJvcGFjaXR5XCI6IC4xLFxuICAgICAgICBcInNwZWVkXCI6IDMwMFxuICAgICAgfSxcbiAgICAgIFwicmVwdWxzZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMjAwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxuICAgICAgfSxcbiAgICAgIFwicHVzaFwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcbiAgICAgIH0sXG4gICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwicmV0aW5hX2RldGVjdFwiOiB0cnVlXG59KTsiLCJ2YXIgcmVnO1xuXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpcyBzdXBwb3J0ZWQnKTtcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2V3b3JrZXIuanMnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlYWR5O1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHNlcnZpY2VXb3JrZXJSZWdpc3RyYXRpb24pIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGlzIHJlYWR5IDpeKScsIHJlZyk7XG4gICAgICAgIHJlZyA9IHNlcnZpY2VXb3JrZXJSZWdpc3RyYXRpb247XG4gICAgICAgIC8vIFRPRE9cbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGVycm9yIDpeKCcsIGVycm9yKTtcbiAgICB9KTtcblxuICAgIFxuICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmdldFJlZ2lzdHJhdGlvbnMoKS50aGVuKGEgPT4ge1xuICAgICAgICBmb3IgKHZhciBpIGluIGEpIHtcbiAgICAgICAgICAgIGlmIChhW2ldLmFjdGl2ZS5zY3JpcHRVUkwuaW5kZXhPZignL3NjcmlwdHMvc2VyJykgPj0gMCkge1xuICAgICAgICAgICAgICAgIGFbaV0udW5yZWdpc3RlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgXCJhbmd1bGFyLmZpbHRlclwiLCAnbmctc29ydGFibGUnXSk7XG5jb25zdCB0ZW1wbGF0ZVBhdGggPSAnLi9Bc3NldHMvZGlzdC9UZW1wbGF0ZXMnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIsJGZpcmViYXNlUmVmUHJvdmlkZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXG4gICAgICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjc2NzgxMDQyOTMwOVwiXG4gICAgfTtcblxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTsgXG4gICAgJGZpcmViYXNlUmVmUHJvdmlkZXIucmVnaXN0ZXJVcmwoY29uZmlnLmRhdGFiYXNlVVJMKTtcbiAgICBcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG5cbiAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignL3NpZ25pbicsIHsgXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xuICAgICAgICB9KSBcbiAgICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pICAgICAgICBcbiAgICAgICAgLndoZW4oJy9jdXJyZW50LXNwcmludCcsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9zcHJpbnQvOnNwcmludCcsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRyb3V0ZS5jdXJyZW50LnBhcmFtcy5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbicsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldE92ZXJ2aWV3Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ1ZlbG9jaXR5J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9iaWdzY3JlZW4vY3VycmVudC1zcHJpbnQnLCB7XG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAud2hlbignL2JpZ3NjcmVlbi9zcHJpbnQvOnNwcmludCcsIHtcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkcm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRyb3V0ZS5jdXJyZW50LnBhcmFtcy5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJmYWxzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9iYWNrbG9nJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIFwiZmlyZWJhc2VVc2VyXCI6IGZ1bmN0aW9uICgkZmlyZWJhc2VBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ092ZXJ2aWV3J1wiPlxuICAgICAgICAgICAgICAgICAgICA8L2JhY2tsb2c+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCwgXG4gICAgICAgIH0pIFxuICAgICAgICAud2hlbignL3JldHJvJywge1xuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIFwiZmlyZWJhc2VVc2VyXCI6IGZ1bmN0aW9uICgkZmlyZWJhc2VBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHJldHJvIHRpdGxlPVwiJ1JldHJvJ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQWZzcHJha2VuJ1wiPlxuICAgICAgICAgICAgICAgICAgICA8L3JldHJvPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsIFxuICAgICAgICB9KSBcbiAgICAgICAgLm90aGVyd2lzZSgnLycpOyBcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdhcHAnLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYXBwLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2cnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgYmFja1RpdGxlOiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIFNwcmludFNlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCBGaWxlU2VydmljZSwgJHNjb3BlLCBOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xuXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XG5cbiAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xuICAgICAgICAgICAgY3RybC5yZU9yZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50cygoc3ByaW50cykgPT4ge1xuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgfSlcblxuICAgICAgICBjdHJsLmN1c3RvbU9yZGVyID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdHJsLnNwcmludHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgha2V5LnNwcmludCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLWN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleS5zcHJpbnQpLm9yZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5yZU9yZGVyID0gKGdyb3VwKSA9PiB7XG4gICAgICAgICAgICBpZiAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBncm91cC5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5vcmRlciAhPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3JkZXIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2F2ZUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLm9yZGVyQnlTcHJpbnQgPSAoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5OTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdHJsLnNwcmludHMuJGdldFJlY29yZChrZXkpLm9yZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZWxlY3RJdGVtID0gaXRlbSA9PiB7XG4gICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gaXRlbTtcbiAgICAgICAgICAgIEZpbGVTZXJ2aWNlLmdldEF0dGFjaG1lbnRzKGl0ZW0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbUF0dGFjaG1lbnRzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5hZGRJdGVtID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld0l0ZW0gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJOaWV1dy4uLlwiLFxuICAgICAgICAgICAgICAgIGVmZm9ydDogMCxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICBvcmRlcjogLTEsXG4gICAgICAgICAgICAgICAgc3RhdGU6IDAsXG4gICAgICAgICAgICAgICAgc3ByaW50OiBcIlwiXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmFkZChuZXdJdGVtKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0SXRlbShjdHJsLkJpSXRlbXMuJGdldFJlY29yZChkYXRhLmtleSkpO1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmRlbGV0ZUl0ZW0gPSBpdGVtID0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGN0cmwuQmlJdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gaW5kZXggPT09IDAgPyAwIDogaW5kZXggLSAxO1xuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5yZW1vdmUoaXRlbSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuQmlJdGVtc1tzZWxlY3RJbmRleF0pO1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuc2F2ZUl0ZW0gPSAoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5zdGF0ZSA9PSBjdHJsLnN0YXRlLkRvbmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0ucmVzb2x2ZWRPbikge1xuICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25TZXJ2aWNlLm5vdGlmeSgnU21lbGxzIGxpa2UgZmlyZS4uLicsIGBXb3JrIG9uIFwiJHtpdGVtLm5hbWV9XCIgaGFzIGJlZW4gY29tcGxldGVkIWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBpdGVtLnJlc29sdmVkT24gfHwgRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2Uuc2F2ZShpdGVtKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZmlsdGVySXRlbXMgPSB4ID0+IHtcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGUgP1xuICAgICAgICAgICAgICAgIGN0cmwuZmlsdGVyID0geyBuYW1lOiBjdHJsLmZpbHRlci5uYW1lIH0gOlxuICAgICAgICAgICAgICAgIGN0cmwuZmlsdGVyLnN0YXRlID0geDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc29ydENvbmZpZyA9IHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuICAgICAgICAgICAgaGFuZGxlOiAnLnNvcnRhYmxlLWhhbmRsZScsXG4gICAgICAgICAgICBvbkFkZChlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZGVsID0gZS5tb2RlbDtcbiAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gZS5tb2RlbHNbMF0uc3ByaW50O1xuICAgICAgICAgICAgICAgIGlmIChtb2RlbCAmJiBtb2RlbC5zcHJpbnQgIT0gc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGN0cmwuQmlJdGVtcy4kaW5kZXhGb3IobW9kZWwuJGlkKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zW2luZGV4XS5zcHJpbnQgPSBzcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcy4kc2F2ZShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVtb3ZlKGUpIHtcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25VcGRhdGUoZSkge1xuICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0Zvcm0nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbTogXCI8XCIsXG4gICAgICAgIHNwcmludHM6IFwiPFwiLFxuICAgICAgICBhdHRhY2htZW50czogXCI8XCIsXG4gICAgICAgIG9uQWRkOiBcIiZcIixcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxuICAgICAgICBvblNhdmU6IFwiJlwiXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgY3RybC5hdHRhY2htZW50c1RvQWRkO1xuICAgICAgICBcbiAgICAgICAgbGV0IGZpbGVTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBmaWxlU2VsZWN0LnR5cGUgPSAnZmlsZSc7XG4gICAgICAgIGZpbGVTZWxlY3QubXVsdGlwbGUgPSAnbXVsdGlwbGUnO1xuICAgICAgICBmaWxlU2VsZWN0Lm9uY2hhbmdlID0gKGV2dCkgPT4ge1xuICAgICAgICAgICAgY3RybC51cGxvYWRGaWxlcyhmaWxlU2VsZWN0LmZpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtaW1lTWFwID0ge307XG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9qcGVnXCJdID0gXCJmYS1waWN0dXJlLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL3BuZ1wiXSA9IFwiZmEtcGljdHVyZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9naWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvdGlmXCJdID0gXCJmYS1waWN0dXJlLW9cIjsgICAgICAgIFxuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vcGRmXCJdID0gXCJmYS1maWxlLXBkZi1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiXSA9IFwiZmEtZmlsZS1leGNlbC1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uXCJdID0gXCJmYS1maWxlLXBvd2VycG9pbnQtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnRcIl0gPSBcImZhLWZpbGUtd29yZC1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi94LXppcC1jb21wcmVzc2VkXCJdID0gXCJmYS1maWxlLWFyY2hpdmUtb1wiO1xuICAgICAgICBtaW1lTWFwW1widmlkZW8vd2VibVwiXSA9IFwiZmEtZmlsZS12aWRlby1vXCI7XG5cbiAgICAgICAgY3RybC5nZXRGaWxlSWNvbiA9IChhKSA9PiB7XG4gICAgICAgICAgICBpZiAobWltZU1hcFthLm1pbWV0eXBlXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtaW1lTWFwW2EubWltZXR5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXCJmYS1maWxlLW9cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZ2V0RmlsZUV4dGVudGlvbiA9IChhKSA9PiB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBhLm5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2VsZWN0RmlsZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWN0cmwuaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGVTZWxlY3QuY2xpY2soKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY3RybC51cGxvYWRGaWxlcyA9IChmaWxlcykgPT4ge1xuICAgICAgICAgICAgZm9yICh2YXIgZiBpbiBmaWxlcykge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlID0gZmlsZXNbZl07XG5cbiAgICAgICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC51cGxvYWRGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnVwbG9hZEZpbGUgPSAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgdmFyIHBhdGggPSBgJHtjdHJsLml0ZW0uJGlkfS8ke2ZpbGUubmFtZX1gXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGtleSA9IC0xO1xuICAgICAgICAgICAgdmFyIGF0dGFjaG1lbnQgPSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZ0l0ZW06IGN0cmwuaXRlbS4kaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICAgICAgbWltZXR5cGU6IGZpbGUudHlwZSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogMSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kYWRkKGF0dGFjaG1lbnQpLnRoZW4oKHJlZikgPT4ge1xuICAgICAgICAgICAgICAgIGtleSA9IHJlZi5rZXk7XG5cbiAgICAgICAgICAgICAgICBsZXQgc3RvcmFnZVJlZiA9IGZpcmViYXNlLnN0b3JhZ2UoKS5yZWYocGF0aCk7XG4gICAgICAgICAgICAgICAgdmFyIHVwbG9hZFRhc2sgPSBzdG9yYWdlUmVmLnB1dChmaWxlKTtcbiAgICAgICAgICAgICAgICB1cGxvYWRUYXNrLm9uKCdzdGF0ZV9jaGFuZ2VkJywgZnVuY3Rpb24gcHJvZ3Jlc3Moc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gKHNuYXBzaG90LmJ5dGVzVHJhbnNmZXJyZWQgLyBzbmFwc2hvdC50b3RhbEJ5dGVzKSAqIDEwMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjdHJsLmF0dGFjaG1lbnRzLiRnZXRSZWNvcmQoa2V5KVxuICAgICAgICAgICAgICAgICAgICByLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJHNhdmUocik7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB1bnN1Y2Nlc3NmdWwgdXBsb2Fkc1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHN1Y2Nlc3NmdWwgdXBsb2FkcyBvbiBjb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGdldCB0aGUgZG93bmxvYWQgVVJMOiBodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS8uLi5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRvd25sb2FkVVJMID0gdXBsb2FkVGFzay5zbmFwc2hvdC5kb3dubG9hZFVSTDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjdHJsLmF0dGFjaG1lbnRzLiRnZXRSZWNvcmQoa2V5KVxuICAgICAgICAgICAgICAgICAgICByLnVybCA9IGRvd25sb2FkVVJMO1xuICAgICAgICAgICAgICAgICAgICByLnN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5yZW1vdmVBdHRhY2htZW50ID0gKGEsZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJHJlbW92ZShhKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0Zvcm0uaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8JyxcbiAgICAgICAgb25DbGljazogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdiaWdzY3JlZW4nLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmlnc2NyZWVuLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIG9wdGlvbnM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBsb2FkZWQ6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XG5cbiAgICAgICAgY3RybC5jaGFydDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgaWYgKGN0cmwuY2hhcnQpIGN0cmwuY2hhcnQuZGVzdHJveSgpO1xuXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBjdHJsLnR5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogY3RybC5kYXRhLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24ucGF0aCgpID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPSBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZEluZGV4ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGlja2VkU3ByaW50ID0gU3ByaW50U2VydmljZS5nZXRDYWNoZWRTcHJpbnRzKClbY2xpY2tlZEluZGV4XS5vcmRlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xuICAgICAgICAgICAgaWYoIWxvYWRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9KVxuXG4gICAgICAgICRyb290U2NvcGUuJG9uKCdzcHJpbnQ6dXBkYXRlJywgKCk9PiB7XG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcbn0pICIsImFwcC5jb21wb25lbnQoJ2Zvb3RlcicsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnb3ZlcnZpZXdGb290ZXInLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ3JldHJvJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKFJldHJvU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXksIEZpbGVTZXJ2aWNlLCAkc2NvcGUsIE5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50cygoc3ByaW50cykgPT4ge1xuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgUmV0cm9TZXJ2aWNlLmdldFJldHJvKCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgIGN0cmwuUmV0cm9BZ3JlZW1lbnRzID0gZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyby5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgncmV0cm9JdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyb0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6ICc8JyxcbiAgICAgICAgb3BlbjogJzwnLFxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoTm90aWZpY2F0aW9uU2VydmljZSwgJHRpbWVvdXQsICRzY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xuICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmNoZWNrU3Vic2NyaXB0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC51bnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2UudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRCYWNrbG9nJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRCYWNrbG9nLmh0bWxgIFxufSk7ICIsImFwcC5jb21wb25lbnQoJ3NwcmludFJldHJvJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50UmV0cm8uaHRtbGAgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50cycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcbiAgICAgICAgYmFja2xvZzogJzwnLFxuICAgICAgICBjaGFydDogJz0nXG4gICAgfSxcblxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSwgQmFja2xvZ1NlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUsIFJldHJvU2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuc3RhdGVMb29rdXAgPSBbJ05ldycsICdBcHByb3ZlZCcsICcnLCAnRG9uZScsICdSZW1vdmVkJ107XG5cbiAgICAgICAgY3RybC5sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcblxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQgJiYgY3RybC5iYWNrbG9nKSB7XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coY3RybC5jaGFydC5zcHJpbnQpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiBjdHJsLmxvYWRlZCA9IHRydWUpO1xuXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRsb2FkZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiR3YXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIFJldHJvU2VydmljZS5nZXRSZXRybyhjdHJsLmNoYXJ0LnNwcmludCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLlJldHJvQWdyZWVtZW50cyA9IGRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZSA/XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfSA6XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdHJsLmNoYXJ0LnNwcmludCB8fCAhY3RybC5iYWNrbG9nKSB7XG4gICAgICAgICAgICAgICAgY3RybC5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8vIFRoaXMgbWV0aG9kIGlzIHJlc3BvbnNpYmxlIGZvciBidWlsZGluZyB0aGUgZ3JhcGhkYXRhIGJ5IGJhY2tsb2cgaXRlbXMgICAgICAgIFxuICAgICAgICBjdHJsLnNldEJ1cm5kb3duID0gKHN0YXJ0LCBkdXJhdGlvbiwgYmFja2xvZykgPT4ge1xuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZShzdGFydCAqIDEwMDApO1xuICAgICAgICAgICAgbGV0IGRhdGVzID0gW107XG4gICAgICAgICAgICBsZXQgYnVybmRvd24gPSBbXTtcbiAgICAgICAgICAgIGxldCBkYXlzVG9BZGQgPSAwO1xuICAgICAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gY3RybC5jaGFydC5zcHJpbnQudmVsb2NpdHk7XG4gICAgICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcbiAgICAgICAgICAgIGxldCB0b3RhbEJ1cm5kb3duID0gMDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZHVyYXRpb247IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBuZXdEYXRlID0gc3RhcnQuYWRkRGF5cyhkYXlzVG9BZGQgLSAxKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3RGF0ZSA+IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKFswLCA2XS5pbmRleE9mKG5ld0RhdGUuZ2V0RGF5KCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3RGF0ZSk7XG4gICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRhdGVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBiZG93biA9IDA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiBpbiBiYWNrbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibGkgPSBiYWNrbG9nW2kyXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaS5zdGF0ZSAhPSBcIjNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxpRGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KGJsaS5yZXNvbHZlZE9uKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChibGlEYXRlLmdldERhdGUoKSA9PSBkLmdldERhdGUoKSAmJiBibGlEYXRlLmdldE1vbnRoKCkgPT0gZC5nZXRNb250aCgpICYmIGJsaURhdGUuZ2V0RnVsbFllYXIoKSA9PSBkLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJkb3duICs9IGJsaS5lZmZvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidXJuZG93bi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogZCxcbiAgICAgICAgICAgICAgICAgICAgYnVybmRvd246IGJkb3duXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggaW4gYnVybmRvd24pIHtcbiAgICAgICAgICAgICAgICB0b3RhbEJ1cm5kb3duICs9IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xuICAgICAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xuICAgICAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuYnVybmRvd24gPSB0b3RhbEJ1cm5kb3duO1xuICAgICAgICAgICAgY3RybC5jaGFydC5yZW1haW5pbmcgPSB2ZWxvY2l0eVJlbWFpbmluZztcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGBcbn0pO1xuXG5EYXRlLnByb3RvdHlwZS5hZGREYXlzID0gZnVuY3Rpb24oZGF5cykge1xuICAgIHZhciBkYXQgPSBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSk7XG4gICAgZGF0LnNldERhdGUoZGF0LmdldERhdGUoKSArIGRheXMpO1xuICAgIHJldHVybiBkYXQ7XG59IiwiYXBwLmNvbXBvbmVudCgndGV4dE5vdGVzJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIHR5cGU6ICc8JyxcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgTm90ZVNlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLm5ld05vdGUgPSB7XG4gICAgICAgICAgICBub3RlOiAnJyxcbiAgICAgICAgICAgIGF1dGhvcjogYXV0aC4kZ2V0QXV0aCgpLnVpZCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgIHNwcmludDogY3RybC5zcHJpbnQuJGlkXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBOb3RlU2VydmljZS5nZXROb3RlcyhjdHJsLnR5cGUsIGN0cmwuc3ByaW50KS50aGVuKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5ub3RlcyA9IGQ7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2F2ZU5vdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjdHJsLm5ld05vdGUudGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgTm90ZVNlcnZpY2UuYWRkKGN0cmwudHlwZSwgY3RybC5uZXdOb3RlLCBjdHJsLm5vdGVzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLm5ld05vdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdXRob3I6IGF1dGguJGdldEF1dGgoKS51aWQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50OiBjdHJsLnNwcmludC4kaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vdGV4dE5vdGVzLmh0bWxgICAgXG59KTsiLCJhcHAuZmFjdG9yeSgnQmFja2xvZ1NlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgYmFja2xvZztcblxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJGFkZChiYWNrbG9nSXRlbSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZShiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kcmVtb3ZlKGJhY2tsb2dJdGVtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRCYWNrbG9nLFxuICAgICAgICBzYXZlLFxuICAgICAgICBhZGQsXG4gICAgICAgIHJlbW92ZVxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnRmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXRpbGl0eVNlcnZpY2UsICRxLCAkdGltZW91dCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBhdHRhY2htZW50cztcblxuICAgIGZ1bmN0aW9uIGdldEF0dGFjaG1lbnRzKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIWJhY2tsb2dJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiQmFja2xvZyBpdGVtIG5vdCBwcm92aWRlZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJhdHRhY2htZW50c1wiKS5vcmRlckJ5Q2hpbGQoJ2JhY2tsb2dJdGVtJykuZXF1YWxUbyhiYWNrbG9nSXRlbS4kaWQpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGF0dGFjaG1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0QXR0YWNobWVudHNcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IG5vdGVzID0ge307XG5cbiAgICBmdW5jdGlvbiBnZXROb3Rlcyh0eXBlLCBzcHJpbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2codHlwZSk7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgbiA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnbm90ZXMvJyArIHR5cGUpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XG4gICAgICAgICAgICByZXNvbHZlKG4pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGQodHlwZSwgbm90ZSxub3Rlcykge1xuICAgICAgICByZXR1cm4gbm90ZXMuJGFkZChub3RlKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlKHR5cGUsIG5vdGUsbm90ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRyZW1vdmUobm90ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZSh0eXBlLCBub3RlLCBub3Rlcykge1xuICAgICAgICByZXR1cm4gbm90ZXMuJHNhdmUobm90ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0Tm90ZXMsXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdOb3RpZmljYXRpb25TZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpcmViYXNlQXV0aCwgJGh0dHApIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpOyAgICBcbiAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICBsZXQgdXNlcklkID0gYXV0aC4kZ2V0QXV0aCgpLnVpZDtcbiAgICBsZXQgcmVnID0gd2luZG93LnJlZztcbiAgICBsZXQgYmFja2xvZztcblxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZSgpIHtcblxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVnKTtcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5zdWJzY3JpYmUoeyB1c2VyVmlzaWJsZU9ubHk6IHRydWUgfSkudGhlbihmdW5jdGlvbiAocHVzaFN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSBwdXNoU3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpYmVkISBFbmRwb2ludDonLCBzdWIuZW5kcG9pbnQpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRwb2ludCA9IHN1Yi5lbmRwb2ludC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIGVuZHBvaW50ID0gZW5kcG9pbnRbZW5kcG9pbnQubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInN1YnNjcmlwdGlvbnNcIikub3JkZXJCeUNoaWxkKCdlbmRwb2ludCcpLmVxdWFsVG8oZW5kcG9pbnQpKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRsb2FkZWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRhZGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnQ6IGVuZHBvaW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHB1c2hTdWJzY3JpcHRpb24pKS5rZXlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXN1Yikge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBlbmRwb2ludCA9IHN1Yi5lbmRwb2ludC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIGVuZHBvaW50ID0gZW5kcG9pbnRbZW5kcG9pbnQubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgICBzdWIudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInN1YnNjcmlwdGlvbnNcIikub3JkZXJCeUNoaWxkKCdlbmRwb2ludCcpLmVxdWFsVG8oZW5kcG9pbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kbG9hZGVkKCkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJHJlbW92ZSgwKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3RpZnkodGl0bGUsIG1lc3NhZ2UpIHsgICAgICAgIFxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgJGh0dHAoeyBcbiAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovL25vdGlmaWNhdGlvbnMuYm9lcmRhbWRucy5ubC9hcGkvbm90aWZ5L3Bvc3Q/dGl0bGU9JHt0aXRsZX0mbWVzc2FnZT0ke21lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICAgICAgfSkudGhlbihhID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHN1YnNjcmliZSxcbiAgICAgICAgdW5zdWJzY3JpYmUsXG4gICAgICAgIG5vdGlmeVxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnUmV0cm9TZXJ2aWNlJywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgcmV0cm87XG5cbiAgICBmdW5jdGlvbiBnZXRSZXRybyhzcHJpbnQpIHtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKCFzcHJpbnQpIHtcbiAgICAgICAgICAgICAgICByZXRybyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInJldHJvXCIpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmV0cm8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXRybyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInJldHJvXCIpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXRybyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZChyZXRyb0FncmVlbWVudCkge1xuICAgICAgICByZXR1cm4gcmV0cm8uJGFkZChyZXRyb0FncmVlbWVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlKHJldHJvQWdyZWVtZW50KSB7XG4gICAgICAgIHJldHVybiByZXRyby4kcmVtb3ZlKHJldHJvQWdyZWVtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlKHJldHJvQWdyZWVtZW50KSB7XG4gICAgICAgIHJldHVybiByZXRyby4kc2F2ZShyZXRyb0FncmVlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0UmV0cm8sXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xuICAgIGxldCBiYXJDb2xvciA9ICcjNUZGQUZDJztcbiAgICBsZXQgY2hhcnRUeXBlID0gXCJsaW5lXCI7XG4gICAgbGV0IGNhY2hlZFNwcmludHM7XG5cbiAgICBsZXQgY2hhcnRPcHRpb25zID0ge1xuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICB9LFxuICAgICAgICBlbGVtZW50czoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNaW46IDAsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IG51bGxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xuICAgICAgICBsYWJlbHM6IFtdLCBcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQXZlcmFnZVwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjNThGNDg0XCIsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU4RjQ4NFwiLFxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzU4RjQ4NCcsXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1OEY0ODQnLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIGxldCBidXJuZG93bkRhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpIFwiLCBcIndvIFwiLCBcImRvIFwiLCBcInZyIFwiLCBcIm1hIFwiXSxcbiAgICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJHZWhhYWxkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRzKGNiKSB7XG4gICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoOSkpO1xuICAgICAgICBzcHJpbnRzLiRsb2FkZWQoY2IsICgpPT4gJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDYWNoZWRTcHJpbnRzKCkge1xuICAgICAgICByZXR1cm4gY2FjaGVkU3ByaW50cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPdmVydmlld0NoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cyA9PiB7XG5cbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2FjaGVkU3ByaW50cyA9IHNwcmludHM7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XG4gICAgICAgICAgICAgICAgc3ByaW50cy4kd2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWNoZWRTcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcbiAgICAgICAgICAgICAgICB9KTsgICAgXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpIHtcblxuICAgICAgICBsZXQgbGFiZWxzO1xuICAgICAgICBsZXQgZXN0aW1hdGVkO1xuICAgICAgICBsZXQgYnVybmVkO1xuICAgICAgICBsZXQgYXZlcmFnZSA9IFtdO1xuXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xuICAgICAgICBlc3RpbWF0ZWQgPSBzcHJpbnRzLm1hcChkID0+IGQudmVsb2NpdHkpO1xuICAgICAgICBidXJuZWQgPSBzcHJpbnRzLm1hcChkID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIHggaW4gZC5idXJuZG93bikgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBwYXJzZUludChidXJuZWRbaV0sIDEwKTsgLy9kb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBiYXNlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF2ZyA9IHN1bSAvIChidXJuZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ByaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXZlcmFnZS5wdXNoKGF2Zyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGF0YSA9IG92ZXJ2aWV3RGF0YTtcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMl0uZGF0YSA9IGJ1cm5lZDtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gZXN0aW1hdGVkO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBhdmVyYWdlO1xuXG4gICAgICAgIGxldCBvdmVydmlld0NoYXJ0T3B0aW9ucyA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcbiAgICAgICAgLy9vdmVydmlld0NoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMV0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAwO1xuXG4gICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gc3ByaW50c1tzcHJpbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBvdmVydmlld0NoYXJ0T3B0aW9ucyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogY3VycmVudFNwcmludC52ZWxvY2l0eSAtIF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XG4gICAgICAgIGxldCBsYWJlbHMgPSBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLnNsaWNlKDAsc3ByaW50LmR1cmF0aW9uICsxKVxuXG4gICAgICAgIGxldCBpZGVhbEJ1cm5kb3duID0gbGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGkgPT09IGxhYmVscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICgoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uKSAqIGkpLnRvRml4ZWQoMik7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcblxuICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcbiAgICAgICAgbGV0IGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhID0gYnVybmRvd25EYXRhO1xuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XG4gICAgICAgIGxldCBidXJuZG93bkNoYXJ0T3B0aW9ucyA9IGNoYXJ0T3B0aW9ucztcbiAgICAgICAgYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xuICAgICAgICAvL2J1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcblxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IGJ1cm5kb3duQ2hhcnRPcHRpb25zLCBcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxuICAgICAgICAgICAgbmFtZTogc3ByaW50Lm5hbWUsXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoc3ByaW50LnZlbG9jaXR5IC8gc3ByaW50LmR1cmF0aW9uLCAxKSxcbiAgICAgICAgICAgIHNwcmludDogc3ByaW50XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hhcnRPYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFydCgpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNwcmludHMuJGtleUF0KHNwcmludHMubGVuZ3RoLTEpO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnROdW1iZXIgPSBjdXJyZW50LnNwbGl0KFwic1wiKVsxXTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy8ke2N1cnJlbnR9YCkpO1xuICAgICAgICAgICAgY3VycmVudFNwcmludC4kd2F0Y2goZT0+IHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChjdXJyZW50U3ByaW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRDaGFydChzcHJpbnROdW1iZXIpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XG4gICAgICAgICAgICBsZXQgc3ByaW50ID0gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChgc3ByaW50cy9zJHtzcHJpbnROdW1iZXJ9YCkpO1xuXG4gICAgICAgICAgICBzcHJpbnQuJHdhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3ByaW50cyxcbiAgICAgICAgZ2V0T3ZlcnZpZXdDaGFydCxcbiAgICAgICAgZ2V0Q3VycmVudENoYXJ0LFxuICAgICAgICBnZXRTcHJpbnRDaGFydCxcbiAgICAgICAgZ2V0Q2FjaGVkU3ByaW50c1xuICAgIH1cbn0pOyIsImFwcC5mYWN0b3J5KCdVdGlsaXR5U2VydmljZScsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHBhZChuKSB7XG4gICAgICAgIHJldHVybiAobiA8IDEwKSA/IChcIjBcIiArIG4pIDogbjtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc3VtKGl0ZW1zKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgeCBpbiBpdGVtcykgaSArPSBpdGVtc1t4XTtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBhZCxcbiAgICAgICAgc3VtXG4gICAgfVxufSkiXX0=
