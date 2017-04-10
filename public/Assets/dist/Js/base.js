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
    }).state('retro', {
        url: '/retro',
        resolve: {
            "firebaseUser": function firebaseUser($firebaseAuthService) {
                return $firebaseAuthService.$waitForSignIn();
            }
        },
        template: '\n                <app>\n                    <retro title="\'Retro\'"\n                             back-title="\'Afspraken\'">\n                    </retro>\n                </app>'
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

        ctrl.customOrder = function (key) {
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

    controller: function controller($firebaseAuth, SprintService, BacklogService, $scope, $timeout, $rootScope, $location, SettingService, RetroService) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC9hcHAuanMiLCJiYWNrbG9nL2JhY2tsb2cuanMiLCJiYWNrbG9nRm9ybS9iYWNrbG9nRm9ybS5qcyIsImJpZ3NjcmVlbi9iaWdzY3JlZW4uanMiLCJmb290ZXIvZm9vdGVyLmpzIiwiYmFja2xvZ0l0ZW0vYmFja2xvZ0l0ZW0uanMiLCJjaGFydC9jaGFydC5qcyIsIm92ZXJ2aWV3Rm9vdGVyL292ZXJ2aWV3Rm9vdGVyLmpzIiwicmV0cm8vcmV0cm8uanMiLCJyZXRyb0l0ZW0vcmV0cm9JdGVtLmpzIiwic2lkZU5hdi9zaWRlTmF2LmpzIiwic2lnbmluL3NpZ25pbi5qcyIsInNwcmludEJhY2tsb2cvc3ByaW50QmFja2xvZy5qcyIsInNwcmludFJldHJvL3NwcmludFJldHJvLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwidGV4dE5vdGVzL3RleHROb3Rlcy5qcyIsIkJhY2tsb2dTZXJ2aWNlLmpzIiwiRmlsZVNlcnZpY2UuanMiLCJOb3RlU2VydmljZS5qcyIsIk5vdGlmaWNhdGlvblNlcnZpY2UuanMiLCJSZXRyb1NlcnZpY2UuanMiLCJTZXR0aW5nU2VydmljZS5qcyIsIlNwcmludFNlcnZpY2UuanMiLCJVdGlsaXR5U2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxDQUFDOztBQUVSLElBQUksZUFBZSxJQUFJLFNBQVMsRUFBRTtBQUM5QixXQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDM0MsYUFBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBVztBQUNsRSxlQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0tBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyx5QkFBeUIsRUFBRTtBQUN4QyxlQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hELFdB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Q0FBQyxDQUFDLENBQUM7U0FBQSxBQUNuQyxPQUFPLENBQUMsQ0FBQztLQUNaLENBQUM7O0FBRUYsV0FBTztBQUNILFdBQUcsRUFBSCxHQUFHO0FBQ0gsV0FBRyxFQUFILEdBQUc7S0FDTixDQUFBO0NBQ0osQ0FBQyxDQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcmVnO1xuXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpcyBzdXBwb3J0ZWQnKTtcbiAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2V3b3JrZXIuanMnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVhZHk7XG4gICAgfSkudGhlbihmdW5jdGlvbihzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpcyByZWFkeSA6XiknLCByZWcpO1xuICAgICAgICByZWcgPSBzZXJ2aWNlV29ya2VyUmVnaXN0cmF0aW9uO1xuICAgICAgICAvLyBUT0RPXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGVycm9yIDpeKCcsIGVycm9yKTtcbiAgICB9KTtcblxuXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuZ2V0UmVnaXN0cmF0aW9ucygpLnRoZW4oYSA9PiB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gYSkge1xuICAgICAgICAgICAgaWYgKGFbaV0uYWN0aXZlLnNjcmlwdFVSTC5pbmRleE9mKCcvc2NyaXB0cy9zZXInKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgYVtpXS51bnJlZ2lzdGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCIsICduZ1RvdWNoJywgJ25nUm91dGUnLCBcImFuZ3VsYXIuZmlsdGVyXCIsICduZy1zb3J0YWJsZScsICd1aS5yb3V0ZXInLCAnbW9ub3NwYWNlZC5lbGFzdGljJ10pO1xuY29uc3QgdGVtcGxhdGVQYXRoID0gJy4vQXNzZXRzL2Rpc3QvVGVtcGxhdGVzJztcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJGZpcmViYXNlUmVmUHJvdmlkZXIsICRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXG4gICAgICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjc2NzgxMDQyOTMwOVwiXG4gICAgfTtcblxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkZmlyZWJhc2VSZWZQcm92aWRlci5yZWdpc3RlclVybChjb25maWcuZGF0YWJhc2VVUkwpO1xuXG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xuXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKHtcbiAgICAgICAgICAgIG5hbWU6ICdzaWduaW4nLFxuICAgICAgICAgICAgdXJsOiAnL3NpZ25pbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzaWduaW4+PC9zaWduaW4+J1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2RlZmF1bHQnLCB7XG4gICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldE92ZXJ2aWV3Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJ092ZXJ2aWV3J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ1ZlbG9jaXR5J1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz4gXG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjdXJyZW50LXNwcmludCcsIHtcbiAgICAgICAgICAgIHVybDogJy9jdXJyZW50LXNwcmludCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3ByaW50Jywge1xuICAgICAgICAgICAgdXJsOiAnL3NwcmludC86c3ByaW50JyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcmludCA9ICRzdGF0ZVBhcmFtcy5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldFNwcmludENoYXJ0KHNwcmludClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJiaWdzY3JlZW5cIiwge1xuICAgICAgICAgICAgdXJsOiAnL2JpZ3NjcmVlbicsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8Ymlnc2NyZWVuPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImJpZ3NjcmVlbi5jdXJyZW50LXNwcmludFwiLCB7XG4gICAgICAgICAgICB1cmw6ICcvYmlnc2NyZWVuL2N1cnJlbnQtc3ByaW50JyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBjaGFydChTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTcHJpbnRTZXJ2aWNlLmdldEN1cnJlbnRDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImJpZ3NjcmVlbi5zcHJpbnRcIiwge1xuICAgICAgICAgICAgdXJsOiAnL2JpZ3NjcmVlbi9zcHJpbnQvOnNwcmludCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkc3RhdGVQYXJhbXMuc3ByaW50O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPlxuICAgICAgICAgICAgICAgIDwvYmlnc2NyZWVuPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImJhY2tsb2dcIiwge1xuICAgICAgICAgICAgdXJsOiAnL2JhY2tsb2cnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIFwiZmlyZWJhc2VVc2VyXCI6IGZ1bmN0aW9uKCRmaXJlYmFzZUF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZmlyZWJhc2VBdXRoU2VydmljZS4kd2FpdEZvclNpZ25JbigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJiYWNrbG9nXCI6IGZ1bmN0aW9uKEJhY2tsb2dTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCYWNrbG9nU2VydmljZS5nZXRCYWNrbG9nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPGJhY2tsb2cgdGl0bGU9XCInQmFja2xvZydcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ092ZXJ2aWV3J1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpLWl0ZW1zPVwiJHJlc29sdmUuYmFja2xvZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8L2JhY2tsb2c+IFxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImJhY2tsb2cuaXRlbVwiLCB7XG4gICAgICAgICAgICB1cmw6ICcvOml0ZW0nLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIFwiZmlyZWJhc2VVc2VyXCI6IGZ1bmN0aW9uKCRmaXJlYmFzZUF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZmlyZWJhc2VBdXRoU2VydmljZS4kd2FpdEZvclNpZ25JbigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJrZXlcIjogKCRzdGF0ZVBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHN0YXRlUGFyYW1zLml0ZW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbG9hZE9uU2VhcmNoOiBmYWxzZSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgIFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1sZy02IGJhY2tsb2ctZm9ybVwiIG5nLWNsYXNzPVwieydhY3RpdmUnOiAkY3RybC5zZWxlY3RlZEl0ZW19XCI+ICAgICAgICAgICAgICAgXG5cdFx0XHQ8YmFja2xvZy1mb3JtIFxuXHRcdFx0XHRpdGVtPVwiJGN0cmwuc2VsZWN0ZWRJdGVtXCJcbiAgICAgICAgICAgICAgICBpdGVtcz1cIiRjdHJsLmJpSXRlbXNcIlxuICAgICAgICAgICAgICAgIGl0ZW0ta2V5PVwiJHJlc29sdmUua2V5XCJcblx0XHRcdFx0YXR0YWNobWVudHM9XCIkY3RybC5zZWxlY3RlZEl0ZW1BdHRhY2htZW50c1wiXG5cdFx0XHRcdHNwcmludHM9XCIkY3RybC5zcHJpbnRzXCIgXG5cdFx0XHRcdG9uLWFkZD1cIiRjdHJsLmFkZEl0ZW0oKVwiICAgICAgICAgICAgICAgICBcblx0XHRcdFx0b24tc2VsZWN0PVwiJGN0cmwuZ2V0SXRlbSgkcmVzb2x2ZS5rZXkpXCIgXG5cdFx0XHRcdG9uLWRlbGV0ZT1cIiRjdHJsLmRlbGV0ZUl0ZW0oJGN0cmwuc2VsZWN0ZWRJdGVtKVwiIFxuXHRcdFx0XHRvbi1zYXZlPVwiJGN0cmwuc2F2ZUl0ZW0oJGN0cmwuc2VsZWN0ZWRJdGVtKVwiPlxuXHRcdFx0PC9iYWNrbG9nLWZvcm0+XG4gICAgICAgICAgICA8L2Rpdj5gXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncmV0cm8nLCB7XG4gICAgICAgICAgICB1cmw6ICcvcmV0cm8nLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIFwiZmlyZWJhc2VVc2VyXCI6IGZ1bmN0aW9uKCRmaXJlYmFzZUF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZmlyZWJhc2VBdXRoU2VydmljZS4kd2FpdEZvclNpZ25JbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxyZXRybyB0aXRsZT1cIidSZXRybydcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0Fmc3ByYWtlbidcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9yZXRybz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gXG4gICAgICAgIH0pO1xufSk7IiwiYXBwLmNvbXBvbmVudCgnYXBwJywge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG5cbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2FwcC5odG1sYCAgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxuICAgICAgICBpdGVtS2V5OiAnPCcsXG4gICAgICAgIGJpSXRlbXM6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXksIEZpbGVTZXJ2aWNlLCAkc2NvcGUsIE5vdGlmaWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgU2V0dGluZ1NlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLnNldHRpbmdzID0gU2V0dGluZ1NlcnZpY2U7XG5cbiAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xuXG4gICAgICAgIGN0cmwuc3RhdGUgPSB7XG4gICAgICAgICAgICBOZXc6IFwiMFwiLFxuICAgICAgICAgICAgQXBwcm92ZWQ6IFwiMVwiLFxuICAgICAgICAgICAgRG9uZTogXCIzXCIsXG4gICAgICAgICAgICBSZW1vdmVkOiBcIjRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XG4gICAgICAgIGN0cmwub3BlbiA9IHRydWU7XG5cbiAgICAgICAgLy8gQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIC8vICAgICBjdHJsLmJpSXRlbXMgPSBkYXRhO1xuICAgICAgICAvLyAgICAgY3RybC5yZU9yZGVyKCk7XG4gICAgICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChjdHJsLml0ZW1LZXkpIHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdEl0ZW0oY3RybC5iaUl0ZW1zLiRnZXRSZWNvcmQoY3RybC5pdGVtS2V5KSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY3RybC52aWV3TW9kZSA9IGN0cmwuc2V0dGluZ3MuZ2V0KCdWaWV3TW9kZScsIDApO1xuICAgICAgICB9OyAgICBcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICBjdHJsLmN1c3RvbU9yZGVyID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdHJsLnNwcmludHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgha2V5LnNwcmludCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLWN0cmwuc3ByaW50cy4kZ2V0UmVjb3JkKGtleS5zcHJpbnQpLm9yZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZXRWaWV3TW9kZSA9IChtb2RlKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnZpZXdNb2RlID0gbW9kZTtcbiAgICAgICAgICAgIGN0cmwuc2V0dGluZ3Muc2V0KCdWaWV3TW9kZScsIG1vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5yZU9yZGVyID0gKGdyb3VwLCBhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBjdHJsLnJlb3JkZXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGdyb3VwLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gY3RybC5iaUl0ZW1zLiRnZXRSZWNvcmQoaXRlbS4kaWQpO1xuICAgICAgICAgICAgICAgICAgICBpLiRwcmlvcml0eSA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGkpLnRoZW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLm9yZGVyQnlTcHJpbnQgPSAoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5OTk5OTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdHJsLnNwcmludHMuJGdldFJlY29yZChrZXkpLm9yZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZWxlY3RJdGVtID0gKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSB0cnVlO1xuICAgICAgICAgICAgY3RybC5zZWxlY3RlZEl0ZW0gPSBpdGVtO1xuICAgICAgICAgICAgRmlsZVNlcnZpY2UuZ2V0QXR0YWNobWVudHMoaXRlbSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtQXR0YWNobWVudHMgPSBkYXRhO1xuICAgICAgICAgICAgfSk7ICAgIFxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9iYWNrbG9nLyR7aXRlbS4kaWR9YCk7ICAgXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmV3SXRlbSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAtMSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogMCxcbiAgICAgICAgICAgICAgICBzcHJpbnQ6IFwiXCJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuYWRkKG5ld0l0ZW0pLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IGl0ZW0gPT4ge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gY3RybC5iaUl0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICBsZXQgc2VsZWN0SW5kZXggPSBpbmRleCA9PT0gMCA/IDAgOiBpbmRleCAtIDE7XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnJlbW92ZShpdGVtKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5zYXZlSXRlbSA9IChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChpdGVtLnN0YXRlID09IGN0cmwuc3RhdGUuRG9uZSkge1xuICAgICAgICAgICAgICAgIGlmICghaXRlbS5yZXNvbHZlZE9uKSB7XG4gICAgICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uubm90aWZ5KCdTbWVsbHMgbGlrZSBmaXJlLi4uJywgYFdvcmsgb24gXCIke2l0ZW0ubmFtZX1cIiBoYXMgYmVlbiBjb21wbGV0ZWQhYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0ucmVzb2x2ZWRPbiA9IGl0ZW0ucmVzb2x2ZWRPbiB8fCBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZSA/XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfSA6XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5kcmFnT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxQbGFjZWhvbGRlckNsYXNzOiAnc29ydGFibGUtcGxhY2Vob2xkZXInXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGN0cmwudXBkYXRlT3JkZXIgPSAobW9kZWxzLCBvbGRJbmRleCwgbmV3SW5kZXgpID0+IHtcbiAgICAgICAgICAgIHZhciBmcm9tID0gTWF0aC5taW4ob2xkSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgICAgICAgIHZhciB0byA9IE1hdGgubWF4KG9sZEluZGV4LCBuZXdJbmRleCk7XG5cbiAgICAgICAgICAgIHZhciBtb3ZlZFVwID0gb2xkSW5kZXggPiBuZXdJbmRleDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGZyb207IGkgPD0gdG87IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBtID0gbW9kZWxzW2ldO1xuICAgICAgICAgICAgICAgIG0ub3JkZXIgPSBtLm9yZGVyICsgKG1vdmVkVXAgPyAxIDogLTEpO1xuICAgICAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUobSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZHJhZ2dlZEl0ZW0gPSBtb2RlbHNbb2xkSW5kZXhdO1xuICAgICAgICAgICAgZHJhZ2dlZEl0ZW0ub3JkZXIgPSBuZXdJbmRleDtcbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnNhdmUoZHJhZ2dlZEl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zb3J0Q29uZmlnID0ge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXG4gICAgICAgICAgICBoYW5kbGU6ICcuc29ydGFibGUtaGFuZGxlJyxcbiAgICAgICAgICAgIG9uQWRkKGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBlLm1vZGVsO1xuICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSBlLm1vZGVsc1swXS5zcHJpbnQ7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsICYmIG1vZGVsLnNwcmludCAhPSBzcHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gY3RybC5iaUl0ZW1zLiRpbmRleEZvcihtb2RlbC4kaWQpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmJpSXRlbXNbaW5kZXhdLnNwcmludCA9IHNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iaUl0ZW1zLiRzYXZlKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZU9yZGVyKGUubW9kZWxzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZW1vdmUoZSkge1xuICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblVwZGF0ZShlKSB7XG4gICAgICAgICAgICAgICAgY3RybC51cGRhdGVPcmRlcihlLm1vZGVscywgZS5vbGRJbmRleCwgZS5uZXdJbmRleClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZy5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZ0Zvcm0nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbTogXCI9XCIsXG4gICAgICAgIGl0ZW1zOiBcIjxcIixcbiAgICAgICAgaXRlbUtleTogXCI8XCIsXG4gICAgICAgIHNwcmludHM6IFwiPFwiLFxuICAgICAgICBhdHRhY2htZW50czogXCI9XCIsXG4gICAgICAgIG9uQWRkOiBcIiZcIixcbiAgICAgICAgb25EZWxldGU6IFwiJlwiLFxuICAgICAgICBvblNhdmU6IFwiJlwiLFxuICAgICAgICBvblNlbGVjdDogXCImXCJcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIEZpbGVTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCAkbG9jYXRpb24pIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBjdHJsLmF0dGFjaG1lbnRzVG9BZGQ7XG4gICAgICAgIFxuICAgICAgICBsZXQgZmlsZVNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGZpbGVTZWxlY3QudHlwZSA9ICdmaWxlJztcbiAgICAgICAgZmlsZVNlbGVjdC5tdWx0aXBsZSA9ICdtdWx0aXBsZSc7XG4gICAgICAgIGZpbGVTZWxlY3Qub25jaGFuZ2UgPSAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGVzKGZpbGVTZWxlY3QuZmlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGN0cmwuaXRlbUtleSkge1xuICAgICAgICAgICAgICAgIGN0cmwuaXRlbSA9IGN0cmwuaXRlbXMuJGdldFJlY29yZChjdHJsLml0ZW1LZXkpO1xuICAgICAgICAgICAgICAgIGlmICghY3RybC5pdGVtKSB7IFxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChgL2JhY2tsb2dgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBGaWxlU2VydmljZS5nZXRBdHRhY2htZW50cyhjdHJsLml0ZW0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgY3RybC5pdGVtID0gbnVsbDtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvYmFja2xvZ2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1pbWVNYXAgPSB7fTtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2pwZWdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvcG5nXCJdID0gXCJmYS1waWN0dXJlLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL2dpZlwiXSA9IFwiZmEtcGljdHVyZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS90aWZcIl0gPSBcImZhLXBpY3R1cmUtb1wiOyAgICAgICAgXG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi9wZGZcIl0gPSBcImZhLWZpbGUtcGRmLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCJdID0gXCJmYS1maWxlLWV4Y2VsLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIl0gPSBcImZhLWZpbGUtcG93ZXJwb2ludC1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFwiXSA9IFwiZmEtZmlsZS13b3JkLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3gtemlwLWNvbXByZXNzZWRcIl0gPSBcImZhLWZpbGUtYXJjaGl2ZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJ2aWRlby93ZWJtXCJdID0gXCJmYS1maWxlLXZpZGVvLW9cIjtcblxuICAgICAgICBjdHJsLmdldEZpbGVJY29uID0gKGEpID0+IHtcbiAgICAgICAgICAgIGlmIChtaW1lTWFwW2EubWltZXR5cGVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1pbWVNYXBbYS5taW1ldHlwZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBcImZhLWZpbGUtb1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5nZXRGaWxlRXh0ZW50aW9uID0gKGEpID0+IHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGEubmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZWxlY3RGaWxlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghY3RybC5pdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVNlbGVjdC5jbGljaygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjdHJsLnVwbG9hZEZpbGVzID0gKGZpbGVzKSA9PiB7XG4gICAgICAgICAgICBmb3IgKHZhciBmIGluIGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1tmXTtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVwbG9hZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZSA9IChmaWxlKSA9PiB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9IGAke2N0cmwuaXRlbS4kaWR9LyR7ZmlsZS5uYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5ID0gLTE7XG4gICAgICAgICAgICB2YXIgYXR0YWNobWVudCA9IHtcbiAgICAgICAgICAgICAgICBiYWNrbG9nSXRlbTogY3RybC5pdGVtLiRpZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgICAgICBtaW1ldHlwZTogZmlsZS50eXBlLFxuICAgICAgICAgICAgICAgIHN0YXRlOiAxLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRhZGQoYXR0YWNobWVudCkudGhlbigocmVmKSA9PiB7XG4gICAgICAgICAgICAgICAga2V5ID0gcmVmLmtleTtcblxuICAgICAgICAgICAgICAgIGxldCBzdG9yYWdlUmVmID0gZmlyZWJhc2Uuc3RvcmFnZSgpLnJlZihwYXRoKTtcbiAgICAgICAgICAgICAgICB2YXIgdXBsb2FkVGFzayA9IHN0b3JhZ2VSZWYucHV0KGZpbGUpO1xuICAgICAgICAgICAgICAgIHVwbG9hZFRhc2sub24oJ3N0YXRlX2NoYW5nZWQnLCBmdW5jdGlvbiBwcm9ncmVzcyhzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSAoc25hcHNob3QuYnl0ZXNUcmFuc2ZlcnJlZCAvIHNuYXBzaG90LnRvdGFsQnl0ZXMpICogMTAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGN0cmwuYXR0YWNobWVudHMuJGdldFJlY29yZChrZXkpXG4gICAgICAgICAgICAgICAgICAgIHIucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kc2F2ZShyKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHVuc3VjY2Vzc2Z1bCB1cGxvYWRzXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc3VjY2Vzc2Z1bCB1cGxvYWRzIG9uIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZSwgZ2V0IHRoZSBkb3dubG9hZCBVUkw6IGh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tLy4uLlxuICAgICAgICAgICAgICAgICAgICB2YXIgZG93bmxvYWRVUkwgPSB1cGxvYWRUYXNrLnNuYXBzaG90LmRvd25sb2FkVVJMO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGN0cmwuYXR0YWNobWVudHMuJGdldFJlY29yZChrZXkpXG4gICAgICAgICAgICAgICAgICAgIHIudXJsID0gZG93bmxvYWRVUkw7XG4gICAgICAgICAgICAgICAgICAgIHIuc3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRzYXZlKHIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnJlbW92ZUF0dGFjaG1lbnQgPSAoYSxlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY3RybC5hdHRhY2htZW50cy4kcmVtb3ZlKGEpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9iYWNrbG9nRm9ybS5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnYmlnc2NyZWVuJywge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcigkbG9jYXRpb24sICRmaXJlYmFzZUF1dGgsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgXG4gICAgICAgIGN0cmwuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmKCFhdXRoLiRnZXRBdXRoKCkpICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG5cbiAgICAgICAgY3RybC5uYXZPcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuc2lnbk91dCA9KCk9PiB7XG4gICAgICAgICAgICBjdHJsLmF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JpZ3NjcmVlbi5odG1sYCAgIFxufSk7ICAiLCJhcHAuY29tcG9uZW50KCdmb290ZXInLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8JyxcbiAgICAgICAgb25DbGljazogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdjaGFydCcsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBvcHRpb25zOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgbG9hZGVkOiAnPCcsXG4gICAgICAgIHR5cGU6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlLCBTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0ICRjYW52YXMgPSAkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xuXG4gICAgICAgIGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0KSBjdHJsLmNoYXJ0LmRlc3Ryb3koKTtcblxuICAgICAgICAgICAgY3RybC5jaGFydCA9IG5ldyBDaGFydCgkY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogY3RybC50eXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IGN0cmwuZGF0YSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjdHJsLm9wdGlvbnNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB3aW5kb3cuY2hhcnQgPSBjdHJsLmNoYXJ0O1xuXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgJGNhbnZhcy5vbmNsaWNrID0gZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVQb2ludHMgPSBjdHJsLmNoYXJ0LmdldEVsZW1lbnRzQXRFdmVudChlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBvaW50cyAmJiBhY3RpdmVQb2ludHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaWNrZWRJbmRleCA9IGFjdGl2ZVBvaW50c1sxXS5faW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZFNwcmludCA9IFNwcmludFNlcnZpY2UuZ2V0Q2FjaGVkU3ByaW50cygpW2NsaWNrZWRJbmRleF0ub3JkZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICRsb2NhdGlvbi5wYXRoKGAvc3ByaW50LyR7Y2xpY2tlZFNwcmludH1gKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuJHdhdGNoKCgpPT4gY3RybC5sb2FkZWQsIGxvYWRlZD0+IHtcbiAgICAgICAgICAgIGlmKCFsb2FkZWQpIHJldHVybjtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfSlcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbignc3ByaW50OnVwZGF0ZScsICgpPT4ge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCk9PmN0cmwuY2hhcnQudXBkYXRlKCkpO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGA8Y2FudmFzPjwvY2FudmFzPmAgXG59KSAiLCJhcHAuY29tcG9uZW50KCdvdmVydmlld0Zvb3RlcicsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgncmV0cm8nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgYmFja1RpdGxlOiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoUmV0cm9TZXJ2aWNlLCBTcHJpbnRTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSwgRmlsZVNlcnZpY2UsICRzY29wZSwgTm90aWZpY2F0aW9uU2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICB9KTtcblxuICAgICAgICBSZXRyb1NlcnZpY2UuZ2V0UmV0cm8oKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgY3RybC5SZXRyb0FncmVlbWVudHMgPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3JldHJvLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdyZXRyb0l0ZW0nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKFJldHJvU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3JldHJvSXRlbS5odG1sYCBcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NpZGVOYXYnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdXNlcjogJzwnLFxuICAgICAgICBvcGVuOiAnPCcsXG4gICAgICAgIG9uU2lnbk91dDogJyYnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcihOb3RpZmljYXRpb25TZXJ2aWNlLCAkdGltZW91dCwgJHNjb3BlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgY3RybC5vcGVuID0gZmFsc2U7XG4gICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gZmFsc2U7XG5cbiAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuaGFzU3Vic2NyaXB0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc3Vic2NyaWJlID0gKCkgPT4ge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnVuc3Vic2NyaWJlID0gKCkgPT4ge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uU2VydmljZS51bnN1YnNjcmliZSgpLnRoZW4oZCA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5jaGVja1N1YnNjcmlwdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lkZU5hdi5odG1sYCBcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnc2lnbmluJywge1xuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgJGxvY2F0aW9uKSB7IFxuICAgICAgICBjb25zdCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnNpZ25JbiA9KG5hbWUsIGVtYWlsKT0+IHtcbiAgICAgICAgICAgICRmaXJlYmFzZUF1dGgoKS4kc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQobmFtZSwgZW1haWwpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zaWduaW4uaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ3NwcmludEJhY2tsb2cnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbXM6IFwiPFwiXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludEJhY2tsb2cuaHRtbGAgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50UmV0cm8nLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaXRlbXM6IFwiPFwiXG4gICAgfSxcbiAgICBjb250cm9sbGVyKFJldHJvU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRSZXRyby5odG1sYCBcbn0pOyAiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRzJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnLFxuICAgICAgICBiYWNrbG9nOiAnPCcsXG4gICAgICAgIGNoYXJ0OiAnPSdcbiAgICB9LFxuXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlLCBCYWNrbG9nU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBTZXR0aW5nU2VydmljZSwgUmV0cm9TZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgICAgIGN0cmwuc2V0dGluZ3MgPSBTZXR0aW5nU2VydmljZTtcblxuICAgICAgICBjdHJsLnN0YXRlID0ge1xuICAgICAgICAgICAgTmV3OiBcIjBcIixcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcbiAgICAgICAgICAgIERvbmU6IFwiM1wiLFxuICAgICAgICAgICAgUmVtb3ZlZDogXCI0XCJcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLnN0YXRlTG9va3VwID0gWydOZXcnLCAnQXBwcm92ZWQnLCAnJywgJ0RvbmUnLCAnUmVtb3ZlZCddO1xuXG4gICAgICAgIGN0cmwubG9hZGVkID0gZmFsc2U7XG4gICAgICAgIGN0cmwuZmlsdGVyID0ge307XG5cbiAgICAgICAgY3RybC5vcGVuSXRlbSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChgL2JhY2tsb2cvJHtpdGVtLiRpZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc3VtRWZmb3J0ID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gaXRlbXNbaV0uZWZmb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VtO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludCAmJiBjdHJsLmJhY2tsb2cpIHtcblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZyhjdHJsLmNoYXJ0LnNwcmludCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMgPSBkYXRhO1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGN0cmwubG9hZGVkID0gdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJGxvYWRlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmNoYXJ0LnNwcmludC5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLkJpSXRlbXMuJHdhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRCdXJuZG93bihjdHJsLmNoYXJ0LnNwcmludC5zdGFydCwgY3RybC5jaGFydC5zcHJpbnQuZHVyYXRpb24sIGN0cmwuQmlJdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgUmV0cm9TZXJ2aWNlLmdldFJldHJvKGN0cmwuY2hhcnQuc3ByaW50KS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuUmV0cm9BZ3JlZW1lbnRzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmZpbHRlckl0ZW1zID0geCA9PiB7XG4gICAgICAgICAgICB4ID09IGN0cmwuZmlsdGVyLnN0YXRlID9cbiAgICAgICAgICAgICAgICBjdHJsLmZpbHRlciA9IHsgbmFtZTogY3RybC5maWx0ZXIubmFtZSB9IDpcbiAgICAgICAgICAgICAgICBjdHJsLmZpbHRlci5zdGF0ZSA9IHg7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWN0cmwuY2hhcnQuc3ByaW50IHx8ICFjdHJsLmJhY2tsb2cpIHtcbiAgICAgICAgICAgICAgICBjdHJsLmxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHJsLnZpZXdNb2RlID0gY3RybC5zZXR0aW5ncy5nZXQoJ1ZpZXdNb2RlJywgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnNldFZpZXdNb2RlID0gKG1vZGUpID0+IHtcbiAgICAgICAgICAgIGN0cmwudmlld01vZGUgPSBtb2RlO1xuICAgICAgICAgICAgY3RybC5zZXR0aW5ncy5zZXQoJ1ZpZXdNb2RlJywgbW9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gVGhpcyBtZXRob2QgaXMgcmVzcG9uc2libGUgZm9yIGJ1aWxkaW5nIHRoZSBncmFwaGRhdGEgYnkgYmFja2xvZyBpdGVtcyAgICAgICAgXG4gICAgICAgIGN0cmwuc2V0QnVybmRvd24gPSAoc3RhcnQsIGR1cmF0aW9uLCBiYWNrbG9nKSA9PiB7XG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKHN0YXJ0ICogMTAwMCk7XG4gICAgICAgICAgICBsZXQgZGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCBidXJuZG93biA9IFtdO1xuICAgICAgICAgICAgbGV0IGRheXNUb0FkZCA9IDA7XG4gICAgICAgICAgICBsZXQgdmVsb2NpdHlSZW1haW5pbmcgPSBjdHJsLmNoYXJ0LnNwcmludC52ZWxvY2l0eTtcbiAgICAgICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xuICAgICAgICAgICAgbGV0IHRvdGFsQnVybmRvd24gPSAwO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBkdXJhdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCAtIDEpO1xuICAgICAgICAgICAgICAgIGlmIChuZXdEYXRlID4gbmV3IERhdGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoWzAsIDZdLmluZGV4T2YobmV3RGF0ZS5nZXREYXkoKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBkYXlzVG9BZGQrKztcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IHN0YXJ0LmFkZERheXMoZGF5c1RvQWRkKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0ZXMucHVzaChuZXdEYXRlKTtcbiAgICAgICAgICAgICAgICBkYXlzVG9BZGQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRlcykge1xuICAgICAgICAgICAgICAgIHZhciBkID0gZGF0ZXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIGJkb3duID0gMDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyIGluIGJhY2tsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsaSA9IGJhY2tsb2dbaTJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmxpLnN0YXRlICE9IFwiM1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBibGlEYXRlID0gbmV3IERhdGUocGFyc2VJbnQoYmxpLnJlc29sdmVkT24pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaURhdGUuZ2V0RGF0ZSgpID09IGQuZ2V0RGF0ZSgpICYmIGJsaURhdGUuZ2V0TW9udGgoKSA9PSBkLmdldE1vbnRoKCkgJiYgYmxpRGF0ZS5nZXRGdWxsWWVhcigpID09IGQuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmRvd24gKz0gYmxpLmVmZm9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1cm5kb3duLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBkLFxuICAgICAgICAgICAgICAgICAgICBidXJuZG93bjogYmRvd25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgeCBpbiBidXJuZG93bikge1xuICAgICAgICAgICAgICAgIHRvdGFsQnVybmRvd24gKz0gYnVybmRvd25beF0uYnVybmRvd247XG4gICAgICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gYnVybmRvd25beF0uYnVybmRvd247XG4gICAgICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY3RybC5jaGFydC5idXJuZG93biA9IHRvdGFsQnVybmRvd247XG4gICAgICAgICAgICBjdHJsLmNoYXJ0LnJlbWFpbmluZyA9IHZlbG9jaXR5UmVtYWluaW5nO1xuICAgICAgICAgICAgY3RybC5jaGFydC5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50cy5odG1sYFxufSk7XG5cbkRhdGUucHJvdG90eXBlLmFkZERheXMgPSBmdW5jdGlvbihkYXlzKSB7XG4gICAgdmFyIGRhdCA9IG5ldyBEYXRlKHRoaXMudmFsdWVPZigpKTtcbiAgICBkYXQuc2V0RGF0ZShkYXQuZ2V0RGF0ZSgpICsgZGF5cyk7XG4gICAgcmV0dXJuIGRhdDtcbn0iLCJhcHAuY29tcG9uZW50KCd0ZXh0Tm90ZXMnLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdGl0bGU6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnLFxuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigkZmlyZWJhc2VBdXRoLCBOb3RlU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwgJHJvb3RTY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcbiAgICAgICAgICAgIG5vdGU6ICcnLFxuICAgICAgICAgICAgYXV0aG9yOiBhdXRoLiRnZXRBdXRoKCkudWlkLFxuICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgc3ByaW50OiBjdHJsLnNwcmludC4kaWRcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuaW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGVTZXJ2aWNlLmdldE5vdGVzKGN0cmwudHlwZSwgY3RybC5zcHJpbnQpLnRoZW4oKGQpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLm5vdGVzID0gZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zYXZlTm90ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGN0cmwubmV3Tm90ZS50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICBOb3RlU2VydmljZS5hZGQoY3RybC50eXBlLCBjdHJsLm5ld05vdGUsIGN0cmwubm90ZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwubmV3Tm90ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcjogYXV0aC4kZ2V0QXV0aCgpLnVpZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnQ6IGN0cmwuc3ByaW50LiRpZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS90ZXh0Tm90ZXMuaHRtbGAgICBcbn0pOyIsImFwcC5mYWN0b3J5KCdCYWNrbG9nU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBiYWNrbG9nO1xuXG4gICAgZnVuY3Rpb24gZ2V0QmFja2xvZyhzcHJpbnQpIHtcbiAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFja2xvZyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcImJhY2tsb2dcIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoYmFja2xvZy4kbG9hZGVkKCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGQoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJGFkZChiYWNrbG9nSXRlbSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZShiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kcmVtb3ZlKGJhY2tsb2dJdGVtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRzYXZlKGJhY2tsb2dJdGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRCYWNrbG9nLFxuICAgICAgICBzYXZlLFxuICAgICAgICBhZGQsXG4gICAgICAgIHJlbW92ZVxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnRmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgVXRpbGl0eVNlcnZpY2UsICRxLCAkdGltZW91dCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBhdHRhY2htZW50cztcblxuICAgIGZ1bmN0aW9uIGdldEF0dGFjaG1lbnRzKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIWJhY2tsb2dJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiQmFja2xvZyBpdGVtIG5vdCBwcm92aWRlZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJhdHRhY2htZW50c1wiKS5vcmRlckJ5Q2hpbGQoJ2JhY2tsb2dJdGVtJykuZXF1YWxUbyhiYWNrbG9nSXRlbS4kaWQpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGF0dGFjaG1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0QXR0YWNobWVudHNcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ05vdGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IG5vdGVzID0ge307XG5cbiAgICBmdW5jdGlvbiBnZXROb3Rlcyh0eXBlLCBzcHJpbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2codHlwZSk7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgbiA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnbm90ZXMvJyArIHR5cGUpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XG4gICAgICAgICAgICByZXNvbHZlKG4pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGQodHlwZSwgbm90ZSxub3Rlcykge1xuICAgICAgICByZXR1cm4gbm90ZXMuJGFkZChub3RlKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlKHR5cGUsIG5vdGUsbm90ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRyZW1vdmUobm90ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZSh0eXBlLCBub3RlLCBub3Rlcykge1xuICAgICAgICByZXR1cm4gbm90ZXMuJHNhdmUobm90ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0Tm90ZXMsXG4gICAgICAgIHNhdmUsXG4gICAgICAgIGFkZCxcbiAgICAgICAgcmVtb3ZlXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdOb3RpZmljYXRpb25TZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpcmViYXNlQXV0aCwgJGh0dHApIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpOyAgICBcbiAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICBsZXQgdXNlcklkID0gYXV0aC4kZ2V0QXV0aCgpLnVpZDtcbiAgICBsZXQgcmVnID0gd2luZG93LnJlZztcbiAgICBsZXQgYmFja2xvZztcblxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZSgpIHtcblxuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVnKTtcbiAgICAgICAgICAgIHJlZy5wdXNoTWFuYWdlci5nZXRTdWJzY3JpcHRpb24oKS50aGVuKChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IFxuXG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuc3Vic2NyaWJlKHsgdXNlclZpc2libGVPbmx5OiB0cnVlIH0pLnRoZW4oZnVuY3Rpb24gKHB1c2hTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gcHVzaFN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaWJlZCEgRW5kcG9pbnQ6Jywgc3ViLmVuZHBvaW50KTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kcG9pbnQgPSBzdWIuZW5kcG9pbnQuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICBlbmRwb2ludCA9IGVuZHBvaW50W2VuZHBvaW50Lmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzdWJzY3JpcHRpb25zXCIpLm9yZGVyQnlDaGlsZCgnZW5kcG9pbnQnKS5lcXVhbFRvKGVuZHBvaW50KSk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kbG9hZGVkKCkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kYWRkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWlkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZHBvaW50OiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5czogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwdXNoU3Vic2NyaXB0aW9uKSkua2V5c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZW5kcG9pbnQgPSBzdWIuZW5kcG9pbnQuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICBlbmRwb2ludCA9IGVuZHBvaW50W2VuZHBvaW50Lmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzdWJzY3JpcHRpb25zXCIpLm9yZGVyQnlDaGlsZCgnZW5kcG9pbnQnKS5lcXVhbFRvKGVuZHBvaW50KSk7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGxvYWRlZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRyZW1vdmUoMCk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm90aWZ5KHRpdGxlLCBtZXNzYWdlKSB7ICAgICAgICBcbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICRodHRwKHsgXG4gICAgICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly9ub3RpZmljYXRpb25zLmJvZXJkYW1kbnMubmwvYXBpL25vdGlmeS9wb3N0P3RpdGxlPSR7dGl0bGV9Jm1lc3NhZ2U9JHttZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgIH0pLnRoZW4oYSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmUsXG4gICAgICAgIHVuc3Vic2NyaWJlLFxuICAgICAgICBub3RpZnlcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1JldHJvU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IHJldHJvO1xuXG4gICAgZnVuY3Rpb24gZ2V0UmV0cm8oc3ByaW50KSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmICghc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0cm8gPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJyZXRyb1wiKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJldHJvKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0cm8gPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJyZXRyb1wiKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmV0cm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGQocmV0cm9BZ3JlZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHJldHJvLiRhZGQocmV0cm9BZ3JlZW1lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZShyZXRyb0FncmVlbWVudCkge1xuICAgICAgICByZXR1cm4gcmV0cm8uJHJlbW92ZShyZXRyb0FncmVlbWVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZShyZXRyb0FncmVlbWVudCkge1xuICAgICAgICByZXR1cm4gcmV0cm8uJHNhdmUocmV0cm9BZ3JlZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFJldHJvLFxuICAgICAgICBzYXZlLFxuICAgICAgICBhZGQsXG4gICAgICAgIHJlbW92ZVxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnU2V0dGluZ1NlcnZpY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0KGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpIHx8IGRlZmF1bHRWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXQsXG4gICAgICAgIGdldFxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnU3ByaW50U2VydmljZScsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJGZpbHRlciwgJGxvY2F0aW9uLCAkdGltZW91dCkge1xuICAgIGxldCBfID0gVXRpbGl0eVNlcnZpY2U7XG4gICAgbGV0IHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgbGV0IGxpbmVDb2xvciA9ICcjRUI1MUQ4JztcbiAgICBsZXQgYmFyQ29sb3IgPSAnIzVGRkFGQyc7XG4gICAgbGV0IGNoYXJ0VHlwZSA9IFwibGluZVwiO1xuICAgIGxldCBjYWNoZWRTcHJpbnRzO1xuXG4gICAgbGV0IGNoYXJ0T3B0aW9ucyA9IHtcbiAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgIHRvb2x0aXBzOiB7XG4gICAgICAgICAgICBtb2RlOiAnc2luZ2xlJyxcbiAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcbiAgICAgICAgfSxcbiAgICAgICAgZWxlbWVudHM6IHtcbiAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlczoge1xuICAgICAgICAgICAgeEF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxuICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWluOiAwLFxuICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbGV0IG92ZXJ2aWV3RGF0YSA9IHtcbiAgICAgICAgbGFiZWxzOiBbXSwgXG4gICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkF2ZXJhZ2VcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzU4RjQ4NFwiLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1OEY0ODRcIixcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1OEY0ODQnLFxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNThGNDg0JyxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiRXN0aW1hdGVkXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFjaGlldmVkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2JhcicsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBsZXQgYnVybmRvd25EYXRhID0ge1xuICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaSBcIiwgXCJ3byBcIiwgXCJkbyBcIiwgXCJ2ciBcIiwgXCJtYSBcIl0sXG4gICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGhpdFJhZGl1czogMTUsXG4gICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50cyhjYiwgYWxsKSB7XG4gICAgICAgIGlmIChhbGwpIHtcbiAgICAgICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykpO1xuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpOyBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBzcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoOSkpO1xuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKGNiLCAoKT0+ICRsb2NhdGlvbi5wYXRoKCcvc2lnbmluJykpOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2FjaGVkU3ByaW50cygpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNwcmludHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0T3ZlcnZpZXdDaGFydCgpIHtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRTcHJpbnRzKHNwcmludHMgPT4ge1xuXG4gICAgICAgICAgICBzcHJpbnRzLiRsb2FkZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNhY2hlZFNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xuICAgICAgICAgICAgICAgIHNwcmludHMuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVkU3ByaW50cyA9IHNwcmludHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpOyAgICBcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cyk7XG4gICAgICAgICAgICAgICAgfSk7ICAgIFxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKSB7XG5cbiAgICAgICAgbGV0IGxhYmVscztcbiAgICAgICAgbGV0IGVzdGltYXRlZDtcbiAgICAgICAgbGV0IGJ1cm5lZDtcbiAgICAgICAgbGV0IGF2ZXJhZ2UgPSBbXTtcblxuICAgICAgICBsYWJlbHMgPSBzcHJpbnRzLm1hcChkID0+IGBTcHJpbnQgJHtfLnBhZChkLm9yZGVyKX1gKTtcbiAgICAgICAgZXN0aW1hdGVkID0gc3ByaW50cy5tYXAoZCA9PiBkLnZlbG9jaXR5KTtcbiAgICAgICAgYnVybmVkID0gc3ByaW50cy5tYXAoZCA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciB4IGluIGQuYnVybmRvd24pIGkgPSBpICsgZC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXJuZWQubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gcGFyc2VJbnQoYnVybmVkW2ldLCAxMCk7IC8vZG9uJ3QgZm9yZ2V0IHRvIGFkZCB0aGUgYmFzZVxuICAgICAgICB9XG4gICAgICAgIHZhciBhdmcgPSBzdW0gLyAoYnVybmVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwcmludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGF2ZXJhZ2UucHVzaChhdmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRhdGEgPSBvdmVydmlld0RhdGE7XG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzJdLmRhdGEgPSBidXJuZWQ7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGVzdGltYXRlZDtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gYXZlcmFnZTtcblxuICAgICAgICBsZXQgb3ZlcnZpZXdDaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XG4gICAgICAgIG92ZXJ2aWV3Q2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1swXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMDA7XG4gICAgICAgIC8vb3ZlcnZpZXdDaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzFdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwMDtcblxuICAgICAgICBsZXQgY3VycmVudFNwcmludCA9IHNwcmludHNbc3ByaW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICBsZXQgY2hhcnRPYmogPSB7XG4gICAgICAgICAgICB0eXBlOiBcImJhclwiLFxuICAgICAgICAgICAgb3B0aW9uczogb3ZlcnZpZXdDaGFydE9wdGlvbnMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgdmVsb2NpdHk6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHksXG4gICAgICAgICAgICBidXJuZG93bjogXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICByZW1haW5pbmc6IGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLSBfLnN1bShjdXJyZW50U3ByaW50LmJ1cm5kb3duKSxcbiAgICAgICAgICAgIG5lZWRlZDogJGZpbHRlcignbnVtYmVyJykoY3VycmVudFNwcmludC52ZWxvY2l0eSAvIGN1cnJlbnRTcHJpbnQuZHVyYXRpb24sIDEpXG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjaGFydE9iaik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRCdXJuRG93bkNoYXJ0KHNwcmludCkge1xuICAgICAgICBsZXQgbGFiZWxzID0gW1wiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIiwgXCJtYVwiLCBcImRpIFwiLCBcIndvIFwiLCBcImRvIFwiLCBcInZyIFwiLCBcIm1hIFwiXS5zbGljZSgwLHNwcmludC5kdXJhdGlvbiArMSlcblxuICAgICAgICBsZXQgaWRlYWxCdXJuZG93biA9IGxhYmVscy5tYXAoKGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmIChpID09PSBsYWJlbHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzcHJpbnQudmVsb2NpdHkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbikgKiBpKS50b0ZpeGVkKDIpO1xuICAgICAgICB9KS5yZXZlcnNlKCk7XG5cbiAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XG4gICAgICAgIGxldCBncmFwaGFibGVCdXJuZG93biA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBzcHJpbnQuYnVybmRvd25beF07XG4gICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZGF0YSA9IGJ1cm5kb3duRGF0YTtcbiAgICAgICAgZGF0YS5sYWJlbHMgPSBsYWJlbHM7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xuICAgICAgICBsZXQgYnVybmRvd25DaGFydE9wdGlvbnMgPSBjaGFydE9wdGlvbnM7XG4gICAgICAgIGJ1cm5kb3duQ2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1swXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMCAqIChzcHJpbnQuZHVyYXRpb24gKyAxKTtcbiAgICAgICAgLy9idXJuZG93bkNoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMV0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAgKiAoc3ByaW50LmR1cmF0aW9uICsgMSk7XG5cbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lXCIsXG4gICAgICAgICAgICBvcHRpb25zOiBidXJuZG93bkNoYXJ0T3B0aW9ucywgXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgdmVsb2NpdHk6IHNwcmludC52ZWxvY2l0eSxcbiAgICAgICAgICAgIG5hbWU6IHNwcmludC5uYW1lLFxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKHNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICByZW1haW5pbmc6IHNwcmludC52ZWxvY2l0eSAtIF8uc3VtKHNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKHNwcmludC52ZWxvY2l0eSAvIHNwcmludC5kdXJhdGlvbiwgMSksXG4gICAgICAgICAgICBzcHJpbnQ6IHNwcmludFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoYXJ0T2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhcnQoKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzcHJpbnRzLiRrZXlBdChzcHJpbnRzLmxlbmd0aC0xKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gY3VycmVudC5zcGxpdChcInNcIilbMV07XG4gICAgICAgICAgICBsZXQgY3VycmVudFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvJHtjdXJyZW50fWApKTtcbiAgICAgICAgICAgIGN1cnJlbnRTcHJpbnQuJHdhdGNoKGU9PiB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoY3VycmVudFNwcmludCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3ByaW50Q2hhcnQoc3ByaW50TnVtYmVyKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzPT4ge1xuICAgICAgICAgICAgbGV0IHNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoYHNwcmludHMvcyR7c3ByaW50TnVtYmVyfWApKTtcblxuICAgICAgICAgICAgc3ByaW50LiR3YXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFNwcmludHMsXG4gICAgICAgIGdldE92ZXJ2aWV3Q2hhcnQsXG4gICAgICAgIGdldEN1cnJlbnRDaGFydCxcbiAgICAgICAgZ2V0U3ByaW50Q2hhcnQsXG4gICAgICAgIGdldENhY2hlZFNwcmludHNcbiAgICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnVXRpbGl0eVNlcnZpY2UnLCBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBwYWQobikge1xuICAgICAgICByZXR1cm4gKG4gPCAxMCkgPyAoXCIwXCIgKyBuKSA6IG47XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHN1bShpdGVtcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHggaW4gaXRlbXMpIGkgKz0gaXRlbXNbeF07XG4gICAgICAgIHJldHVybiBpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBwYWQsXG4gICAgICAgIHN1bVxuICAgIH1cbn0pIl19
