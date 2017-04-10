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

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch', 'ngRoute', "angular.filter", 'ng-sortable', 'ui.router', 'monospaced.elastic']);
var templatePath = './Assets/dist/Templates';

app.config(function ($locationProvider, $firebaseRefProvider, $stateProvider, $urlRouterProvider) {
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
    $urlRouterProvider.otherwise("/");

    $stateProvider.state({
        name: 'signin',
        url: '/signin',
        template: '<signin></signin>'
    }).state('default', {
        url: '/',
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getOverviewChart();
            }
        },
        template: '\n                <app>\n                    <sprints title="\'Overview\'" \n                             back-title="\'Velocity\'" \n                             chart="$resolve.chart">\n                    </sprints> \n                </app>'
    }).state('current-sprint', {
        url: '/current-sprint',
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getCurrentChart();
            }
        },
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="true">\n                    </sprints>\n                </app>'
    }).state('sprint', {
        url: '/sprint/:sprint',
        resolve: {
            chart: function chart(SprintService, $stateParams) {
                var sprint = $stateParams.sprint;
                return SprintService.getSprintChart(sprint);
            }
        },
        template: '\n                <app>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="true">\n                    </sprints>\n                </app>'
    }).state("bigscreen", {
        url: '/bigscreen',
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getOverviewChart();
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="\'Overview\'" \n                             back-title="\'Velocity\'" \n                             chart="$resolve.chart">\n                    </sprints> \n                </bigscreen>'
    }).state("bigscreen.current-sprint", {
        url: '/bigscreen/current-sprint',
        resolve: {
            chart: function chart(SprintService) {
                return SprintService.getCurrentChart();
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="false">\n                    </sprints>\n                </bigscreen>'
    }).state("bigscreen.sprint", {
        url: '/bigscreen/sprint/:sprint',
        resolve: {
            chart: function chart(SprintService, $route) {
                var sprint = $stateParams.sprint;
                return SprintService.getSprintChart(sprint);
            }
        },
        template: '\n                <bigscreen>\n                    <sprints title="$resolve.chart.name" \n                             back-title="\'Burndown\'" \n                             chart="$resolve.chart"\n                             backlog="false">\n                    </sprints>\n                </bigscreen>'
    }).state("backlog", {
        url: '/backlog',
        resolve: {
            "firebaseUser": function firebaseUser($firebaseAuthService) {
                return $firebaseAuthService.$waitForSignIn();
            },
            "backlog": function backlog(BacklogService) {
                return BacklogService.getBacklog();
            }
        },
        template: '\n                <app>\n                    <backlog title="\'Backlog\'"\n                             back-title="\'Overview\'"\n                             bi-items="$resolve.backlog">\n                    </backlog> \n                </app>'
    }).state("backlog.item", {
        url: '/:item',
        resolve: {
            "firebaseUser": function firebaseUser($firebaseAuthService) {
                return $firebaseAuthService.$waitForSignIn();
            },
            "key": function key($stateParams) {
                return $stateParams.item;
            }
        },
        reloadOnSearch: false,
        template: ' \n            <div class="col-lg-6 backlog-form" ng-class="{\'active\': $ctrl.selectedItem}">               \n\t\t\t<backlog-form \n\t\t\t\titem="$ctrl.selectedItem"\n                items="$ctrl.biItems"\n                item-key="$resolve.key"\n\t\t\t\tattachments="$ctrl.selectedItemAttachments"\n\t\t\t\tsprints="$ctrl.sprints" \n\t\t\t\ton-add="$ctrl.addItem()"                 \n\t\t\t\ton-select="$ctrl.getItem($resolve.key)" \n\t\t\t\ton-delete="$ctrl.deleteItem($ctrl.selectedItem)" \n\t\t\t\ton-save="$ctrl.saveItem($ctrl.selectedItem)">\n\t\t\t</backlog-form>\n            </div>'
    });
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
        backTitle: '<',
        itemKey: '<',
        biItems: '<'
    },
    controller: function controller(BacklogService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope, NotificationService, $location, SettingService) {
        var ctrl = this;
        var auth = $firebaseAuth();

        ctrl.settings = SettingService;

        ctrl.formOpen = false;

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.filter = {};
        ctrl.open = true;

        // BacklogService.getBacklog().then(data => {
        //     ctrl.biItems = data;
        //     ctrl.reOrder();
        ctrl.$onInit = function () {
            if (ctrl.itemKey) {
                ctrl.selectItem(ctrl.biItems.$getRecord(ctrl.itemKey));
            };
            ctrl.viewMode = ctrl.settings.get('ViewMode', 0);
        };
        //     }
        // });

        SprintService.getSprints(function (sprints) {
            ctrl.sprints = sprints;
        }, true);

        $scope.customOrder = function (key) {
            if (!ctrl.sprints) {
                return 0;
            }
            if (!key.sprint) {
                return 9999;
            }

            return -ctrl.sprints.$getRecord(key.sprint).order;
        };

        ctrl.setViewMode = function (mode) {
            ctrl.viewMode = mode;
            ctrl.settings.set('ViewMode', mode);
        };

        ctrl.reOrder = function (group, a) {
            if (group) {
                ctrl.reordering = true;
                group.forEach(function (item, index) {
                    var i = ctrl.biItems.$getRecord(item.$id);
                    i.$priority = index;
                    BacklogService.save(i).then();
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
            $location.path('/backlog/' + item.$id);
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
                ctrl.selectItem(ctrl.biItems.$getRecord(data.key));
                ctrl.formOpen = true;
            });
        };

        ctrl.deleteItem = function (item) {
            var index = ctrl.biItems.indexOf(item);
            var selectIndex = index === 0 ? 0 : index - 1;

            BacklogService.remove(item).then(function () {
                ctrl.selectedItem = null;
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

        ctrl.dragOptions = {
            additionalPlaceholderClass: 'sortable-placeholder'
        };

        ctrl.updateOrder = function (models, oldIndex, newIndex) {
            var from = Math.min(oldIndex, newIndex);
            var to = Math.max(oldIndex, newIndex);

            var movedUp = oldIndex > newIndex;

            for (var i = from; i <= to; i++) {
                var m = models[i];
                m.order = m.order + (movedUp ? 1 : -1);
                BacklogService.save(m);
            }
            var draggedItem = models[oldIndex];
            draggedItem.order = newIndex;
            BacklogService.save(draggedItem);
        };

        ctrl.sortConfig = {
            animation: 150,
            handle: '.sortable-handle',
            onAdd: function onAdd(e) {
                var model = e.model;
                var sprint = e.models[0].sprint;
                if (model && model.sprint != sprint) {
                    var index = ctrl.biItems.$indexFor(model.$id);
                    ctrl.biItems[index].sprint = sprint;
                    ctrl.biItems.$save(index);
                    ctrl.reOrder(e.models);
                }
            },
            onRemove: function onRemove(e) {
                ctrl.reOrder(e.models);
            },
            onUpdate: function onUpdate(e) {
                ctrl.updateOrder(e.models, e.oldIndex, e.newIndex);
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
"use strict";

app.component('backlogForm', {
    bindings: {
        item: "=",
        items: "<",
        itemKey: "<",
        sprints: "<",
        attachments: "=",
        onAdd: "&",
        onDelete: "&",
        onSave: "&",
        onSelect: "&"
    },
    controller: function controller(BacklogService, FileService, $firebaseAuth, $firebaseArray, $firebaseObject, $location) {
        var ctrl = this;
        ctrl.attachmentsToAdd;

        var fileSelect = document.createElement('input');
        fileSelect.type = 'file';
        fileSelect.multiple = 'multiple';
        fileSelect.onchange = function (evt) {
            ctrl.uploadFiles(fileSelect.files);
        };

        ctrl.$onInit = function () {
            if (ctrl.itemKey) {
                ctrl.item = ctrl.items.$getRecord(ctrl.itemKey);
                if (!ctrl.item) {
                    $location.path("/backlog");
                    return;
                }
                FileService.getAttachments(ctrl.item).then(function (data) {
                    ctrl.attachments = data;
                });
            }
        };

        ctrl.close = function () {
            ctrl.item = null;
            $location.path("/backlog");
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

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout, $rootScope, $location, SettingService) {
        var ctrl = this;
        var auth = $firebaseAuth();
        ctrl.settings = SettingService;

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.stateLookup = ['New', 'Approved', '', 'Done', 'Removed'];

        ctrl.loaded = false;
        ctrl.filter = {};

        ctrl.openItem = function (item) {
            $location.path('/backlog/' + item.$id);
        };

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
            ctrl.viewMode = ctrl.settings.get('ViewMode', 0);
        };

        ctrl.setViewMode = function (mode) {
            ctrl.viewMode = mode;
            ctrl.settings.set('ViewMode', mode);
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
            } else {
                backlog = $firebaseArray(ref.child("backlog").orderByChild('sprint').equalTo(sprint.$id));
            }
            resolve(backlog.$loaded());
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

app.factory('SettingService', function () {

    function set(key, value) {
        localStorage.setItem(key, value);
    }

    function get(key, defaultValue) {
        return localStorage.getItem(key) || defaultValue;
    }

    return {
        set: set,
        get: get
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

    function getSprints(cb, all) {
        if (all) {
            var sprints = $firebaseArray(ref.child("sprints").orderByChild('order'));
            sprints.$loaded(cb, function () {
                return $location.path('/signin');
            });
        } else {
            var sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(9));
            sprints.$loaded(cb, function () {
                return $location.path('/signin');
            });
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC9hcHAuanMiLCJiYWNrbG9nL2JhY2tsb2cuanMiLCJiYWNrbG9nSXRlbS9iYWNrbG9nSXRlbS5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmlnc2NyZWVuL2JpZ3NjcmVlbi5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJjaGFydC9jaGFydC5qcyIsIm92ZXJ2aWV3Rm9vdGVyL292ZXJ2aWV3Rm9vdGVyLmpzIiwic2lkZU5hdi9zaWRlTmF2LmpzIiwic2lnbmluL3NpZ25pbi5qcyIsInNwcmludEJhY2tsb2cvc3ByaW50QmFja2xvZy5qcyIsInNwcmludHMvc3ByaW50cy5qcyIsInRleHROb3Rlcy90ZXh0Tm90ZXMuanMiLCJCYWNrbG9nU2VydmljZS5qcyIsIkZpbGVTZXJ2aWNlLmpzIiwiTm90ZVNlcnZpY2UuanMiLCJOb3RpZmljYXRpb25TZXJ2aWNlLmpzIiwiU2V0dGluZ1NlcnZpY2UuanMiLCJTcHJpbnRTZXJ2aWNlLmpzIiwiVXRpbGl0eVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLEdBQUcsQ0FBQzs7QUFFUixJQUFJLGVBQWUsSUFBSSxTQUFTLEVBQUU7QUFDOUIsV0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQzNDLGFBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVk7QUFDbkUsZUFBTyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztLQUN4QyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUseUJBQXlCLEVBQUU7QUFDekMsZUFBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoRCxXQUFHLEdBQUcseUJBQXlCLENBQUM7O0tBRW5DLENBQUMsU0FBTSxDQUFDLFVBQVUsS0FBSyxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBC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VUFBVTtBQUNWLHdCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsdUJBQWUsRUFBZixlQUFlO0FBQ2Ysc0JBQWMsRUFBZCxjQUFjO0FBQ2Qsd0JBQWdCLEVBQWhCLGdCQUFnQjtLQUNuQixDQUFBO0NBQ0osQ0FBQyxDQUFDOzs7QUMxU0gsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFXO0FBQ3JDLGFBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNaLGVBQU8sQUFBQyxDQUFDLEdBQUcsRUFBRSxHQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0tBQ25DLENBQUM7O0FBRUYsYUFBUyxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLGFBQUssSUFBSSxDQUFDLElBQUksS0FBSztBQUFFLGFBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxBQUNuQyxPQUFPLENBQUMsQ0FBQztLQUNaLENBQUM7O0FBRUYsV0FBTztBQUNILFdBQUcsRUFBSCxHQUFHO0FBQ0gsV0FBRyxFQUFILEdBQUc7S0FDTixDQUFBO0NBQ0osQ0FBQyxDQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcmVnO1xyXG5cclxuaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpcyBzdXBwb3J0ZWQnKTtcclxuICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcvc2VydmljZXdvcmtlci5qcycpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWFkeTtcclxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHNlcnZpY2VXb3JrZXJSZWdpc3RyYXRpb24pIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgcmVhZHkgOl4pJywgcmVnKTtcclxuICAgICAgICByZWcgPSBzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uO1xyXG4gICAgICAgIC8vIFRPRE9cclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBlcnJvciA6XignLCBlcnJvcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBcclxuICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmdldFJlZ2lzdHJhdGlvbnMoKS50aGVuKGEgPT4ge1xyXG4gICAgICAgIGZvciAodmFyIGkgaW4gYSkge1xyXG4gICAgICAgICAgICBpZiAoYVtpXS5hY3RpdmUuc2NyaXB0VVJMLmluZGV4T2YoJy9zY3JpcHRzL3NlcicpID49IDApIHtcclxuICAgICAgICAgICAgICAgIGFbaV0udW5yZWdpc3RlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCIsICduZ1RvdWNoJywgJ25nUm91dGUnLCBcImFuZ3VsYXIuZmlsdGVyXCIsICduZy1zb3J0YWJsZScsJ3VpLnJvdXRlcicsJ21vbm9zcGFjZWQuZWxhc3RpYyddKTtcclxuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRsb2NhdGlvblByb3ZpZGVyLCRmaXJlYmFzZVJlZlByb3ZpZGVyLCAkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSB7XHJcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNJenlDRVlSalM0dWZoZWR4d0I0dkNDOWxhNTJHc3JYTVwiLFxyXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxyXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXHJcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuYXBwc3BvdC5jb21cIixcclxuICAgICAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCI3Njc4MTA0MjkzMDlcIlxyXG4gICAgfTtcclxuXHJcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7IFxyXG4gICAgJGZpcmViYXNlUmVmUHJvdmlkZXIucmVnaXN0ZXJVcmwoY29uZmlnLmRhdGFiYXNlVVJMKTtcclxuXHJcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcclxuXHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdzaWduaW4nLFxyXG4gICAgICAgICAgICB1cmw6ICcvc2lnbmluJywgXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNpZ25pbj48L3NpZ25pbj4nXHJcbiAgICAgICAgfSkgXHJcbiAgICAgICAgLnN0YXRlKCdkZWZhdWx0Jyx7XHJcbiAgICAgICAgICAgIHVybDonLycsIFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8YXBwPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxyXG4gICAgICAgIH0pICAgICAgICBcclxuICAgICAgICAuc3RhdGUoJ2N1cnJlbnQtc3ByaW50Jyx7XHJcbiAgICAgICAgICAgIHVybDogJy9jdXJyZW50LXNwcmludCcsXHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc3ByaW50Jyx7XHJcbiAgICAgICAgICAgIHVybDogJy9zcHJpbnQvOnNwcmludCcsXHJcbiAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkc3RhdGVQYXJhbXMuc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcclxuICAgICAgICAgICAgICAgIDxhcHA+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoXCJiaWdzY3JlZW5cIix7XHJcbiAgICAgICAgICAgIHVybDogJy9iaWdzY3JlZW4nLFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXHJcbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKFwiYmlnc2NyZWVuLmN1cnJlbnQtc3ByaW50XCIse1xyXG4gICAgICAgICAgICB1cmw6ICcvYmlnc2NyZWVuL2N1cnJlbnQtc3ByaW50JyxcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxyXG4gICAgICAgICAgICAgICAgPC9iaWdzY3JlZW4+YCxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZShcImJpZ3NjcmVlbi5zcHJpbnRcIix7XHJcbiAgICAgICAgICAgIHVybDogJy9iaWdzY3JlZW4vc3ByaW50LzpzcHJpbnQnLCBcclxuICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHJvdXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRzdGF0ZVBhcmFtcy5zcHJpbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJmYWxzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cclxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoXCJiYWNrbG9nXCIse1xyXG4gICAgICAgICAgICB1cmw6ICcvYmFja2xvZycsIFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbiAoJGZpcmViYXNlQXV0aFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgXCJiYWNrbG9nXCI6IGZ1bmN0aW9uIChCYWNrbG9nU2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgICAgICAgICAgPGFwcD5cclxuICAgICAgICAgICAgICAgICAgICA8YmFja2xvZyB0aXRsZT1cIidCYWNrbG9nJ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidPdmVydmlldydcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpLWl0ZW1zPVwiJHJlc29sdmUuYmFja2xvZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYmFja2xvZz4gXHJcbiAgICAgICAgICAgICAgICA8L2FwcD5gLCBcclxuICAgICAgICB9KSBcclxuICAgICAgICAuc3RhdGUoXCJiYWNrbG9nLml0ZW1cIix7XHJcbiAgICAgICAgICAgIHVybDogJy86aXRlbScsIFxyXG4gICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbiAoJGZpcmViYXNlQXV0aFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImtleVwiOiAoJHN0YXRlUGFyYW1zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5pdGVtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZWxvYWRPblNlYXJjaDogZmFsc2UsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgIFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLWxnLTYgYmFja2xvZy1mb3JtXCIgbmctY2xhc3M9XCJ7J2FjdGl2ZSc6ICRjdHJsLnNlbGVjdGVkSXRlbX1cIj4gICAgICAgICAgICAgICBcclxuXHRcdFx0PGJhY2tsb2ctZm9ybSBcclxuXHRcdFx0XHRpdGVtPVwiJGN0cmwuc2VsZWN0ZWRJdGVtXCJcclxuICAgICAgICAgICAgICAgIGl0ZW1zPVwiJGN0cmwuYmlJdGVtc1wiXHJcbiAgICAgICAgICAgICAgICBpdGVtLWtleT1cIiRyZXNvbHZlLmtleVwiXHJcblx0XHRcdFx0YXR0YWNobWVudHM9XCIkY3RybC5zZWxlY3RlZEl0ZW1BdHRhY2htZW50c1wiXHJcblx0XHRcdFx0c3ByaW50cz1cIiRjdHJsLnNwcmludHNcIiBcclxuXHRcdFx0XHRvbi1hZGQ9XCIkY3RybC5hZGRJdGVtKClcIiAgICAgICAgICAgICAgICAgXHJcblx0XHRcdFx0b24tc2VsZWN0PVwiJGN0cmwuZ2V0SXRlbSgkcmVzb2x2ZS5rZXkpXCIgXHJcblx0XHRcdFx0b24tZGVsZXRlPVwiJGN0cmwuZGVsZXRlSXRlbSgkY3RybC5zZWxlY3RlZEl0ZW0pXCIgXHJcblx0XHRcdFx0b24tc2F2ZT1cIiRjdHJsLnNhdmVJdGVtKCRjdHJsLnNlbGVjdGVkSXRlbSlcIj5cclxuXHRcdFx0PC9iYWNrbG9nLWZvcm0+XHJcbiAgICAgICAgICAgIDwvZGl2PmAgXHJcbiAgICAgICAgfSlcclxufSk7ICIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xyXG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcblxyXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9hcHAuaHRtbGAgICBcclxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxyXG4gICAgICAgIGl0ZW1LZXk6ICc8JyxcclxuICAgICAgICBiaUl0ZW1zOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCBTcHJpbnRTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSwgRmlsZVNlcnZpY2UsICRzY29wZSwgTm90aWZpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCBTZXR0aW5nU2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuXHJcbiAgICAgICAgY3RybC5zZXR0aW5ncyA9IFNldHRpbmdTZXJ2aWNlO1xyXG5cclxuICAgICAgICBjdHJsLmZvcm1PcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXHJcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcclxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXHJcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcclxuICAgICAgICBjdHJsLm9wZW4gPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAvLyAgICAgY3RybC5iaUl0ZW1zID0gZGF0YTtcclxuICAgICAgICAvLyAgICAgY3RybC5yZU9yZGVyKCk7XHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY3RybC5pdGVtS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5iaUl0ZW1zLiRnZXRSZWNvcmQoY3RybC5pdGVtS2V5KSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGN0cmwudmlld01vZGUgPSBjdHJsLnNldHRpbmdzLmdldCgnVmlld01vZGUnLCAwKTtcclxuICAgICAgICB9OyAgICBcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICBTcHJpbnRTZXJ2aWNlLmdldFNwcmludHMoKHNwcmludHMpID0+IHtcclxuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmN1c3RvbU9yZGVyID0gKGtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWN0cmwuc3ByaW50cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFrZXkuc3ByaW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIC1jdHJsLnNwcmludHMuJGdldFJlY29yZChrZXkuc3ByaW50KS5vcmRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc2V0Vmlld01vZGUgPSAobW9kZSkgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLnZpZXdNb2RlID0gbW9kZTtcclxuICAgICAgICAgICAgY3RybC5zZXR0aW5ncy5zZXQoJ1ZpZXdNb2RlJywgbW9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnJlT3JkZXIgPSAoZ3JvdXAsIGEpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlb3JkZXJpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGl0ZW0uJGlkKTtcclxuICAgICAgICAgICAgICAgICAgICBpLiRwcmlvcml0eSA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUoaSkudGhlbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLm9yZGVyQnlTcHJpbnQgPSAoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleSkub3JkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNlbGVjdEl0ZW0gPSAoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xyXG4gICAgICAgICAgICBGaWxlU2VydmljZS5nZXRBdHRhY2htZW50cyhpdGVtKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbUF0dGFjaG1lbnRzID0gZGF0YTtcclxuICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChgL2JhY2tsb2cvJHtpdGVtLiRpZH1gKTsgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuYWRkSXRlbSA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5ld0l0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXHJcbiAgICAgICAgICAgICAgICBlZmZvcnQ6IDAsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcclxuICAgICAgICAgICAgICAgIG9yZGVyOiAtMSxcclxuICAgICAgICAgICAgICAgIHN0YXRlOiAwLFxyXG4gICAgICAgICAgICAgICAgc3ByaW50OiBcIlwiXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmFkZChuZXdJdGVtKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmRlbGV0ZUl0ZW0gPSBpdGVtID0+IHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gY3RybC5iaUl0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RJbmRleCA9IGluZGV4ID09PSAwID8gMCA6IGluZGV4IC0gMTtcclxuXHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnJlbW92ZShpdGVtKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY3RybC5zYXZlSXRlbSA9IChpdGVtKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbS5zdGF0ZSA9PSBjdHJsLnN0YXRlLkRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGlmICghaXRlbS5yZXNvbHZlZE9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS5ub3RpZnkoJ1NtZWxscyBsaWtlIGZpcmUuLi4nLCBgV29yayBvbiBcIiR7aXRlbS5uYW1lfVwiIGhhcyBiZWVuIGNvbXBsZXRlZCFgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGl0ZW0ucmVzb2x2ZWRPbiA9IGl0ZW0ucmVzb2x2ZWRPbiB8fCBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5yZXNvbHZlZE9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2Uuc2F2ZShpdGVtKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0geCA9PiB7XHJcbiAgICAgICAgICAgIHggPT0gY3RybC5maWx0ZXIuc3RhdGVcclxuICAgICAgICAgICAgICAgID8gY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfVxyXG4gICAgICAgICAgICAgICAgOiBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLmRyYWdPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhZGRpdGlvbmFsUGxhY2Vob2xkZXJDbGFzczogJ3NvcnRhYmxlLXBsYWNlaG9sZGVyJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjdHJsLnVwZGF0ZU9yZGVyID0gKG1vZGVscywgb2xkSW5kZXgsIG5ld0luZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBmcm9tID0gTWF0aC5taW4ob2xkSW5kZXgsIG5ld0luZGV4KTtcclxuICAgICAgICAgICAgdmFyIHRvID0gTWF0aC5tYXgob2xkSW5kZXgsIG5ld0luZGV4KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtb3ZlZFVwID0gb2xkSW5kZXggPiBuZXdJbmRleDtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBmcm9tOyBpIDw9IHRvOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBtID0gbW9kZWxzW2ldO1xyXG4gICAgICAgICAgICAgICAgbS5vcmRlciA9IG0ub3JkZXIgKyAobW92ZWRVcCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKG0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2VkSXRlbSA9IG1vZGVsc1tvbGRJbmRleF07XHJcbiAgICAgICAgICAgIGRyYWdnZWRJdGVtLm9yZGVyID0gbmV3SW5kZXg7XHJcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUoZHJhZ2dlZEl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5zb3J0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBhbmltYXRpb246IDE1MCxcclxuICAgICAgICAgICAgaGFuZGxlOiAnLnNvcnRhYmxlLWhhbmRsZScsXHJcbiAgICAgICAgICAgIG9uQWRkKGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtb2RlbCA9IGUubW9kZWw7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gZS5tb2RlbHNbMF0uc3ByaW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsICYmIG1vZGVsLnNwcmludCAhPSBzcHJpbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBjdHJsLmJpSXRlbXMuJGluZGV4Rm9yKG1vZGVsLiRpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iaUl0ZW1zW2luZGV4XS5zcHJpbnQgPSBzcHJpbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iaUl0ZW1zLiRzYXZlKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvblJlbW92ZShlKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uVXBkYXRlKGUpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwudXBkYXRlT3JkZXIoZS5tb2RlbHMsIGUub2xkSW5kZXgsIGUubmV3SW5kZXgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nSXRlbScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogJzwnLFxyXG4gICAgICAgIG9uQ2xpY2s6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dJdGVtLmh0bWxgIFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgaXRlbTogXCI9XCIsXHJcbiAgICAgICAgaXRlbXM6IFwiPFwiLFxyXG4gICAgICAgIGl0ZW1LZXk6IFwiPFwiLFxyXG4gICAgICAgIHNwcmludHM6IFwiPFwiLFxyXG4gICAgICAgIGF0dGFjaG1lbnRzOiBcIj1cIixcclxuICAgICAgICBvbkFkZDogXCImXCIsXHJcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxyXG4gICAgICAgIG9uU2F2ZTogXCImXCIsXHJcbiAgICAgICAgb25TZWxlY3Q6IFwiJlwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgRmlsZVNlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsICRsb2NhdGlvbikge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBjdHJsLmF0dGFjaG1lbnRzVG9BZGQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGZpbGVTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIGZpbGVTZWxlY3QudHlwZSA9ICdmaWxlJztcclxuICAgICAgICBmaWxlU2VsZWN0Lm11bHRpcGxlID0gJ211bHRpcGxlJztcclxuICAgICAgICBmaWxlU2VsZWN0Lm9uY2hhbmdlID0gKGV2dCkgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGVzKGZpbGVTZWxlY3QuZmlsZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY3RybC5pdGVtS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLml0ZW0gPSBjdHJsLml0ZW1zLiRnZXRSZWNvcmQoY3RybC5pdGVtS2V5KTtcclxuICAgICAgICAgICAgICAgIGlmICghY3RybC5pdGVtKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvYmFja2xvZ2ApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIEZpbGVTZXJ2aWNlLmdldEF0dGFjaG1lbnRzKGN0cmwuaXRlbSkudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuY2xvc2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwuaXRlbSA9IG51bGw7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvYmFja2xvZ2ApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG1pbWVNYXAgPSB7fTtcclxuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvanBlZ1wiXSA9IFwiZmEtcGljdHVyZS1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImltYWdlL3BuZ1wiXSA9IFwiZmEtcGljdHVyZS1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2dpZlwiXSA9IFwiZmEtcGljdHVyZS1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImltYWdlL3RpZlwiXSA9IFwiZmEtcGljdHVyZS1vXCI7ICAgICAgICBcclxuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vcGRmXCJdID0gXCJmYS1maWxlLXBkZi1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCJdID0gXCJmYS1maWxlLWV4Y2VsLW9cIjtcclxuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvblwiXSA9IFwiZmEtZmlsZS1wb3dlcnBvaW50LW9cIjtcclxuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnRcIl0gPSBcImZhLWZpbGUtd29yZC1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3gtemlwLWNvbXByZXNzZWRcIl0gPSBcImZhLWZpbGUtYXJjaGl2ZS1vXCI7XHJcbiAgICAgICAgbWltZU1hcFtcInZpZGVvL3dlYm1cIl0gPSBcImZhLWZpbGUtdmlkZW8tb1wiO1xyXG5cclxuICAgICAgICBjdHJsLmdldEZpbGVJY29uID0gKGEpID0+IHtcclxuICAgICAgICAgICAgaWYgKG1pbWVNYXBbYS5taW1ldHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtaW1lTWFwW2EubWltZXR5cGVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJmYS1maWxlLW9cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuZ2V0RmlsZUV4dGVudGlvbiA9IChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGEubmFtZS5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNlbGVjdEZpbGVzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWN0cmwuaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbGVTZWxlY3QuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3RybC51cGxvYWRGaWxlcyA9IChmaWxlcykgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBmIGluIGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IGZpbGVzW2ZdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwudXBsb2FkRmlsZShmaWxlKTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZSA9IChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoID0gYCR7Y3RybC5pdGVtLiRpZH0vJHtmaWxlLm5hbWV9YFxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQga2V5ID0gLTE7XHJcbiAgICAgICAgICAgIHZhciBhdHRhY2htZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZ0l0ZW06IGN0cmwuaXRlbS4kaWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxyXG4gICAgICAgICAgICAgICAgbWltZXR5cGU6IGZpbGUudHlwZSxcclxuICAgICAgICAgICAgICAgIHN0YXRlOiAxLFxyXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJGFkZChhdHRhY2htZW50KS50aGVuKChyZWYpID0+IHtcclxuICAgICAgICAgICAgICAgIGtleSA9IHJlZi5rZXk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHN0b3JhZ2VSZWYgPSBmaXJlYmFzZS5zdG9yYWdlKCkucmVmKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVwbG9hZFRhc2sgPSBzdG9yYWdlUmVmLnB1dChmaWxlKTtcclxuICAgICAgICAgICAgICAgIHVwbG9hZFRhc2sub24oJ3N0YXRlX2NoYW5nZWQnLCBmdW5jdGlvbiBwcm9ncmVzcyhzbmFwc2hvdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IChzbmFwc2hvdC5ieXRlc1RyYW5zZmVycmVkIC8gc25hcHNob3QudG90YWxCeXRlcykgKiAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjdHJsLmF0dGFjaG1lbnRzLiRnZXRSZWNvcmQoa2V5KVxyXG4gICAgICAgICAgICAgICAgICAgIHIucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRzYXZlKHIpO1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHVuc3VjY2Vzc2Z1bCB1cGxvYWRzXHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHN1Y2Nlc3NmdWwgdXBsb2FkcyBvbiBjb21wbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZSwgZ2V0IHRoZSBkb3dubG9hZCBVUkw6IGh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tLy4uLlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkb3dubG9hZFVSTCA9IHVwbG9hZFRhc2suc25hcHNob3QuZG93bmxvYWRVUkw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjdHJsLmF0dGFjaG1lbnRzLiRnZXRSZWNvcmQoa2V5KVxyXG4gICAgICAgICAgICAgICAgICAgIHIudXJsID0gZG93bmxvYWRVUkw7XHJcbiAgICAgICAgICAgICAgICAgICAgci5zdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwucmVtb3ZlQXR0YWNobWVudCA9IChhLGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRyZW1vdmUoYSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0Zvcm0uaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmlnc2NyZWVuJywge1xyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXIoJGxvY2F0aW9uLCAkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XHJcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcclxuXHJcbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcclxuICAgICAgICAgICAgY3RybC5hdXRoLiRzaWduT3V0KCk7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JpZ3NjcmVlbi5odG1sYCAgIFxyXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2Zvb3RlcicsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgc3ByaW50OiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuXHJcbiAgICAgICAgY3RybC5zdGF0T3BlbiA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgb3B0aW9uczogJzwnLFxyXG4gICAgICAgIGRhdGE6ICc8JyxcclxuICAgICAgICBsb2FkZWQ6ICc8JyxcclxuICAgICAgICB0eXBlOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUsIFNwcmludFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xyXG5cclxuICAgICAgICBjdHJsLmNoYXJ0O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICBpZiAoY3RybC5jaGFydCkgY3RybC5jaGFydC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGN0cmwudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XHJcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPSBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aXZlUG9pbnRzID0gY3RybC5jaGFydC5nZXRFbGVtZW50c0F0RXZlbnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZEluZGV4ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRTcHJpbnQgPSBTcHJpbnRTZXJ2aWNlLmdldENhY2hlZFNwcmludHMoKVtjbGlja2VkSW5kZXhdLm9yZGVyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xyXG4gICAgICAgICAgICBpZighbG9hZGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcclxufSkgIiwiYXBwLmNvbXBvbmVudCgnb3ZlcnZpZXdGb290ZXInLCB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHNwcmludDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcigpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcclxufSk7IiwiYXBwLmNvbXBvbmVudCgnc2lkZU5hdicsIHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNlcjogJzwnLFxyXG4gICAgICAgIG9wZW46ICc8JyxcclxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKE5vdGlmaWNhdGlvblNlcnZpY2UsICR0aW1lb3V0LCAkc2NvcGUpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5oYXNTdWJzY3JpcHRpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnN1YnNjcmliZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbigpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC51bnN1YnNjcmliZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS51bnN1YnNjcmliZSgpLnRoZW4oZCA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmNoZWNrU3Vic2NyaXB0aW9uKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXHJcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnc2lnbmluJywge1xyXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCAkbG9jYXRpb24pIHsgXHJcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGN0cmwuc2lnbkluID0obmFtZSwgZW1haWwpPT4ge1xyXG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IFxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZ25pbi5odG1sYFxyXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRCYWNrbG9nJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBpdGVtczogXCI8XCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XHJcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludEJhY2tsb2cuaHRtbGAgXHJcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxyXG4gICAgICAgIGJhY2tsb2c6ICc8JyxcclxuICAgICAgICBjaGFydDogJz0nXHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSwgQmFja2xvZ1NlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBTZXR0aW5nU2VydmljZSkge1xyXG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcclxuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcclxuICAgICAgICBjdHJsLnNldHRpbmdzID0gU2V0dGluZ1NlcnZpY2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgTmV3OiBcIjBcIixcclxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxyXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcclxuICAgICAgICAgICAgUmVtb3ZlZDogXCI0XCJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjdHJsLnN0YXRlTG9va3VwID0gWydOZXcnLCAnQXBwcm92ZWQnLCAnJywgJ0RvbmUnLCAnUmVtb3ZlZCddOyAgICAgXHJcblxyXG4gICAgICAgIGN0cmwubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgY3RybC5maWx0ZXIgPSB7fTtcclxuXHJcbiAgICAgICAgY3RybC5vcGVuSXRlbSA9IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvYmFja2xvZy8ke2l0ZW0uJGlkfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludCAmJiBjdHJsLmJhY2tsb2cpIHtcclxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZyhjdHJsLmNoYXJ0LnNwcmludCkudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcyA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiBjdHJsLmxvYWRlZCA9IHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcy4kbG9hZGVkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQuc3RhcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuQmlJdGVtcy4kd2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xyXG4gICAgICAgICAgICB4ID09IGN0cmwuZmlsdGVyLnN0YXRlXHJcbiAgICAgICAgICAgICAgICA/IGN0cmwuZmlsdGVyID0geyBuYW1lOiBjdHJsLmZpbHRlci5uYW1lIH1cclxuICAgICAgICAgICAgICAgIDogY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWN0cmwuY2hhcnQuc3ByaW50IHx8ICFjdHJsLmJhY2tsb2cpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdHJsLnZpZXdNb2RlID0gY3RybC5zZXR0aW5ncy5nZXQoJ1ZpZXdNb2RlJywgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHJsLnNldFZpZXdNb2RlID0gKG1vZGUpID0+IHtcclxuICAgICAgICAgICAgY3RybC52aWV3TW9kZSA9IG1vZGU7XHJcbiAgICAgICAgICAgIGN0cmwuc2V0dGluZ3Muc2V0KCdWaWV3TW9kZScsIG1vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vIFRoaXMgbWV0aG9kIGlzIHJlc3BvbnNpYmxlIGZvciBidWlsZGluZyB0aGUgZ3JhcGhkYXRhIGJ5IGJhY2tsb2cgaXRlbXMgICAgICAgIFxyXG4gICAgICAgIGN0cmwuc2V0QnVybmRvd24gPSAoc3RhcnQsIGR1cmF0aW9uLCBiYWNrbG9nKSA9PiB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoc3RhcnQgKiAxMDAwKTtcclxuICAgICAgICAgICAgbGV0IGRhdGVzID0gW107XHJcbiAgICAgICAgICAgIGxldCBidXJuZG93biA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgZGF5c1RvQWRkID0gMDsgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gY3RybC5jaGFydC5zcHJpbnQudmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgdG90YWxCdXJuZG93biA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBkdXJhdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0ZSA9IHN0YXJ0LmFkZERheXMoZGF5c1RvQWRkIC0gMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3RGF0ZSA+IG5ldyBEYXRlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoWzAsIDZdLmluZGV4T2YobmV3RGF0ZS5nZXREYXkoKSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheXNUb0FkZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF0ZXMucHVzaChuZXdEYXRlKTtcclxuICAgICAgICAgICAgICAgIGRheXNUb0FkZCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRhdGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJkb3duID0gMDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaTIgaW4gYmFja2xvZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibGkgPSBiYWNrbG9nW2kyXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYmxpLnN0YXRlICE9IFwiM1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsaURhdGUgPSBuZXcgRGF0ZShwYXJzZUludChibGkucmVzb2x2ZWRPbikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChibGlEYXRlLmdldERhdGUoKSA9PSBkLmdldERhdGUoKSAmJiBibGlEYXRlLmdldE1vbnRoKCkgPT0gZC5nZXRNb250aCgpICYmIGJsaURhdGUuZ2V0RnVsbFllYXIoKSA9PSBkLmdldEZ1bGxZZWFyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmRvd24gKz0gYmxpLmVmZm9ydDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnVybmRvd24ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogZCxcclxuICAgICAgICAgICAgICAgICAgICBidXJuZG93bjogYmRvd25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4IGluIGJ1cm5kb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbEJ1cm5kb3duICs9IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gYnVybmRvd25beF0uYnVybmRvd247XHJcbiAgICAgICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3RybC5jaGFydC5idXJuZG93biA9IHRvdGFsQnVybmRvd247XHJcbiAgICAgICAgICAgIGN0cmwuY2hhcnQucmVtYWluaW5nID0gdmVsb2NpdHlSZW1haW5pbmc7XHJcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGBcclxufSk7XHJcblxyXG5EYXRlLnByb3RvdHlwZS5hZGREYXlzID0gZnVuY3Rpb24oZGF5cylcclxue1xyXG4gICAgdmFyIGRhdCA9IG5ldyBEYXRlKHRoaXMudmFsdWVPZigpKTtcclxuICAgIGRhdC5zZXREYXRlKGRhdC5nZXREYXRlKCkgKyBkYXlzKTtcclxuICAgIHJldHVybiBkYXQ7XHJcbn1cclxuIiwiYXBwLmNvbXBvbmVudCgndGV4dE5vdGVzJywge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB0aXRsZTogJzwnLFxyXG4gICAgICAgIHR5cGU6ICc8JyxcclxuICAgICAgICBzcHJpbnQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgTm90ZVNlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUpIHtcclxuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XHJcblxyXG4gICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcclxuICAgICAgICAgICAgbm90ZTogJycsXHJcbiAgICAgICAgICAgIGF1dGhvcjogYXV0aC4kZ2V0QXV0aCgpLnVpZCxcclxuICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxyXG4gICAgICAgICAgICBzcHJpbnQ6IGN0cmwuc3ByaW50LiRpZFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3RybC5pbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBOb3RlU2VydmljZS5nZXROb3RlcyhjdHJsLnR5cGUsIGN0cmwuc3ByaW50KS50aGVuKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLm5vdGVzID0gZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0cmwuc2F2ZU5vdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwubmV3Tm90ZS50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICAgICAgTm90ZVNlcnZpY2UuYWRkKGN0cmwudHlwZSwgY3RybC5uZXdOb3RlLCBjdHJsLm5vdGVzKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBub3RlOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3I6IGF1dGguJGdldEF1dGgoKS51aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcmludDogY3RybC5zcHJpbnQuJGlkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS90ZXh0Tm90ZXMuaHRtbGAgICBcclxufSk7IiwiYXBwLmZhY3RvcnkoJ0JhY2tsb2dTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IGJhY2tsb2c7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZShiYWNrbG9nLiRsb2FkZWQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKGJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJGFkZChiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHJlbW92ZShiYWNrbG9nSXRlbSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRyZW1vdmUoYmFja2xvZ0l0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmUoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gYmFja2xvZy4kc2F2ZShiYWNrbG9nSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRCYWNrbG9nLFxyXG4gICAgICAgIHNhdmUsXHJcbiAgICAgICAgYWRkLFxyXG4gICAgICAgIHJlbW92ZVxyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ0ZpbGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJHRpbWVvdXQsICRmaXJlYmFzZUFycmF5KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgYXR0YWNobWVudHM7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QXR0YWNobWVudHMoYmFja2xvZ0l0ZW0pIHtcclxuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBpZiAoIWJhY2tsb2dJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoXCJCYWNrbG9nIGl0ZW0gbm90IHByb3ZpZGVkXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJhdHRhY2htZW50c1wiKS5vcmRlckJ5Q2hpbGQoJ2JhY2tsb2dJdGVtJykuZXF1YWxUbyhiYWNrbG9nSXRlbS4kaWQpKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYXR0YWNobWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRBdHRhY2htZW50c1xyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4gICAgbGV0IG5vdGVzID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Tm90ZXModHlwZSwgc3ByaW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codHlwZSk7XHJcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIG4gPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ25vdGVzLycgKyB0eXBlKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xyXG4gICAgICAgICAgICByZXNvbHZlKG4pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZCh0eXBlLCBub3RlLG5vdGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRhZGQobm90ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHJlbW92ZSh0eXBlLCBub3RlLG5vdGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRyZW1vdmUobm90ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZSh0eXBlLCBub3RlLCBub3Rlcykge1xyXG4gICAgICAgIHJldHVybiBub3Rlcy4kc2F2ZShub3RlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldE5vdGVzLFxyXG4gICAgICAgIHNhdmUsXHJcbiAgICAgICAgYWRkLFxyXG4gICAgICAgIHJlbW92ZVxyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGlmaWNhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlyZWJhc2VBdXRoLCAkaHR0cCkge1xyXG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcclxuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpOyAgICBcclxuICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xyXG4gICAgbGV0IHVzZXJJZCA9IGF1dGguJGdldEF1dGgoKS51aWQ7XHJcbiAgICBsZXQgcmVnID0gd2luZG93LnJlZztcclxuICAgIGxldCBiYWNrbG9nO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZSgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVnKTtcclxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7IFxyXG5cclxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLnN1YnNjcmliZSh7IHVzZXJWaXNpYmxlT25seTogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uIChwdXNoU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gcHVzaFN1YnNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpYmVkISBFbmRwb2ludDonLCBzdWIuZW5kcG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBlbmRwb2ludCA9IGVuZHBvaW50W2VuZHBvaW50Lmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xyXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kbG9hZGVkKCkudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGFkZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aWQ6IHVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRwb2ludDogZW5kcG9pbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5czogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwdXNoU3Vic2NyaXB0aW9uKSkua2V5c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xyXG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghc3ViKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBlbmRwb2ludCA9IHN1Yi5lbmRwb2ludC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgICAgICBzdWIudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGxvYWRlZCgpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kcmVtb3ZlKDApOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG5vdGlmeSh0aXRsZSwgbWVzc2FnZSkgeyAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgJGh0dHAoeyBcclxuICAgICAgICAgICAgICAgIHVybDogYGh0dHBzOi8vbm90aWZpY2F0aW9ucy5ib2VyZGFtZG5zLm5sL2FwaS9ub3RpZnkvcG9zdD90aXRsZT0ke3RpdGxlfSZtZXNzYWdlPSR7bWVzc2FnZX1gLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcclxuICAgICAgICAgICAgfSkudGhlbihhID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc3Vic2NyaWJlLFxyXG4gICAgICAgIHVuc3Vic2NyaWJlLFxyXG4gICAgICAgIG5vdGlmeVxyXG4gICAgfTtcclxufSk7IiwiYXBwLmZhY3RvcnkoJ1NldHRpbmdTZXJ2aWNlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldChrZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpIHx8IGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNldCxcclxuICAgICAgICBnZXRcclxuICAgIH07XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdTcHJpbnRTZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XHJcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xyXG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbiAgICBsZXQgbGluZUNvbG9yID0gJyNFQjUxRDgnO1xyXG4gICAgbGV0IGJhckNvbG9yID0gJyM1RkZBRkMnO1xyXG4gICAgbGV0IGNoYXJ0VHlwZSA9IFwibGluZVwiO1xyXG4gICAgbGV0IGNhY2hlZFNwcmludHM7XHJcblxyXG4gICAgbGV0IGNoYXJ0T3B0aW9ucyA9IHtcclxuICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxyXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxyXG4gICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxyXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbGVtZW50czoge1xyXG4gICAgICAgICAgICBsaW5lOiB7XHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxyXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWluOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcclxuICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgb3ZlcnZpZXdEYXRhID0ge1xyXG4gICAgICAgIGxhYmVsczogW10sIFxyXG4gICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkF2ZXJhZ2VcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzU4RjQ4NFwiLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU4RjQ4NFwiLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNThGNDg0JyxcclxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNThGNDg0JyxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkVzdGltYXRlZFwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzVDRTVFNycsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2JhcicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGJ1cm5kb3duRGF0YSA9IHtcclxuICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaSBcIiwgXCJ3byBcIiwgXCJkbyBcIiwgXCJ2ciBcIiwgXCJtYSBcIl0sXHJcbiAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk1lYW4gQnVybmRvd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcclxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IsIGFsbCkge1xyXG4gICAgICAgIGlmIChhbGwpIHtcclxuICAgICAgICAgICAgbGV0IHNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XHJcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZChjYiwgKCk9PiAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpKTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDkpKTtcclxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDYWNoZWRTcHJpbnRzKCkge1xyXG4gICAgICAgIHJldHVybiBjYWNoZWRTcHJpbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldE92ZXJ2aWV3Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzID0+IHtcclxuXHJcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNhY2hlZFNwcmludHMgPSBzcHJpbnRzO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XHJcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVkU3ByaW50cyA9IHNwcmludHM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XHJcblxyXG4gICAgICAgIGxldCBsYWJlbHM7XHJcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcclxuICAgICAgICBsZXQgYnVybmVkO1xyXG4gICAgICAgIGxldCBhdmVyYWdlID0gW107XHJcblxyXG4gICAgICAgIGxhYmVscyA9IHNwcmludHMubWFwKGQgPT4gYFNwcmludCAke18ucGFkKGQub3JkZXIpfWApO1xyXG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XHJcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1cm5lZC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50KGJ1cm5lZFtpXSwgMTApOyAvL2Rvbid0IGZvcmdldCB0byBhZGQgdGhlIGJhc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGF2ZyA9IHN1bSAvIChidXJuZWQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGF2ZXJhZ2UucHVzaChhdmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XHJcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgZGF0YS5kYXRhc2V0c1syXS5kYXRhID0gYnVybmVkO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGVzdGltYXRlZDtcclxuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBhdmVyYWdlO1xyXG5cclxuICAgICAgICBsZXQgb3ZlcnZpZXdDaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XHJcbiAgICAgICAgb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcclxuICAgICAgICAvL292ZXJ2aWV3Q2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMDA7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50U3ByaW50ID0gc3ByaW50c1tzcHJpbnRzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IG92ZXJ2aWV3Q2hhcnRPcHRpb25zLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogY3VycmVudFNwcmludC52ZWxvY2l0eSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxyXG4gICAgICAgICAgICByZW1haW5pbmc6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLSBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShjdXJyZW50U3ByaW50LnZlbG9jaXR5IC8gY3VycmVudFNwcmludC5kdXJhdGlvbiwgMSlcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNoYXJ0T2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSB7XHJcbiAgICAgICAgbGV0IGxhYmVscyA9IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaSBcIiwgXCJ3byBcIiwgXCJkbyBcIiwgXCJ2ciBcIiwgXCJtYSBcIl0uc2xpY2UoMCxzcHJpbnQuZHVyYXRpb24gKzEpXHJcblxyXG4gICAgICAgIGxldCBpZGVhbEJ1cm5kb3duID0gbGFiZWxzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFiZWxzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcHJpbnQudmVsb2NpdHkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKChzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24pICogaSkudG9GaXhlZCgyKTtcclxuICAgICAgICB9KS5yZXZlcnNlKCk7XHJcblxyXG4gICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IHNwcmludC52ZWxvY2l0eVxyXG4gICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4IGluIHNwcmludC5idXJuZG93bikge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBzcHJpbnQuYnVybmRvd25beF07XHJcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gYnVybmRvd25EYXRhO1xyXG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xyXG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XHJcbiAgICAgICAgbGV0IGJ1cm5kb3duQ2hhcnRPcHRpb25zID0gY2hhcnRPcHRpb25zO1xyXG4gICAgICAgIGJ1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1swXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcclxuICAgICAgICAvL2J1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcImxpbmVcIixcclxuICAgICAgICAgICAgb3B0aW9uczogYnVybmRvd25DaGFydE9wdGlvbnMsIFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eTogc3ByaW50LnZlbG9jaXR5LFxyXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcclxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXHJcbiAgICAgICAgICAgIHJlbWFpbmluZzogc3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oc3ByaW50LmJ1cm5kb3duKSxcclxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpLFxyXG4gICAgICAgICAgICBzcHJpbnQ6IHNwcmludFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYXJ0T2JqO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhcnQoKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNwcmludHMuJGtleUF0KHNwcmludHMubGVuZ3RoLTEpO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvJHtjdXJyZW50fWApKTtcclxuICAgICAgICAgICAgY3VycmVudFNwcmludC4kd2F0Y2goZT0+IHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoY3VycmVudFNwcmludCkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcHJpbnRDaGFydChzcHJpbnROdW1iZXIpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHM9PiB7XHJcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XHJcblxyXG4gICAgICAgICAgICBzcHJpbnQuJHdhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRTcHJpbnRzLFxyXG4gICAgICAgIGdldE92ZXJ2aWV3Q2hhcnQsXHJcbiAgICAgICAgZ2V0Q3VycmVudENoYXJ0LFxyXG4gICAgICAgIGdldFNwcmludENoYXJ0LFxyXG4gICAgICAgIGdldENhY2hlZFNwcmludHNcclxuICAgIH1cclxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBmdW5jdGlvbiBwYWQobikge1xyXG4gICAgICAgIHJldHVybiAobiA8IDEwKSA/IChcIjBcIiArIG4pIDogbjtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gc3VtKGl0ZW1zKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHggaW4gaXRlbXMpIGkgKz0gaXRlbXNbeF07XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcGFkLFxyXG4gICAgICAgIHN1bVxyXG4gICAgfVxyXG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
