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
            console.log(ctrl.sprints);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC9hcHAuanMiLCJiYWNrbG9nL2JhY2tsb2cuanMiLCJiYWNrbG9nSXRlbS9iYWNrbG9nSXRlbS5qcyIsImJhY2tsb2dGb3JtL2JhY2tsb2dGb3JtLmpzIiwiYmlnc2NyZWVuL2JpZ3NjcmVlbi5qcyIsImNoYXJ0L2NoYXJ0LmpzIiwiZm9vdGVyL2Zvb3Rlci5qcyIsIm92ZXJ2aWV3Rm9vdGVyL292ZXJ2aWV3Rm9vdGVyLmpzIiwicmV0cm8vcmV0cm8uanMiLCJyZXRyb0l0ZW0vcmV0cm9JdGVtLmpzIiwic2lkZU5hdi9zaWRlTmF2LmpzIiwic2lnbmluL3NpZ25pbi5qcyIsInNwcmludEJhY2tsb2cvc3ByaW50QmFja2xvZy5qcyIsInNwcmludFJldHJvL3NwcmludFJldHJvLmpzIiwic3ByaW50cy9zcHJpbnRzLmpzIiwidGV4dE5vdGVzL3RleHROb3Rlcy5qcyIsIkJhY2tsb2dTZXJ2aWNlLmpzIiwiRmlsZVNlcnZpY2UuanMiLCJOb3RlU2VydmljZS5qcyIsIk5vdGlmaWNhdGlvblNlcnZpY2UuanMiLCJSZXRyb1NlcnZpY2UuanMiLCJTZXR0aW5nU2VydmljZS5qcyIsIlNwcmludFNlcnZpY2UuanMiLCJVdGlsaXR5U2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxDQUFDOztBQUVSLElBQUksZUFBZSxJQUFJLFNBQVMsRUFBRTtBQUM5QixXQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDM0MsYUFBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBVztBQUNsRSxlQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0tBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyx5QkFBeUIsRUFBRTtBQUN4QyxlQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hELFdB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VixhQUFLLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFBRSxhQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUEsQUFDbkMsT0FBTyxDQUFDLENBQUM7S0FDWixDQUFDOztBQUVGLFdBQU87QUFDSCxXQUFHLEVBQUgsR0FBRztBQUNILFdBQUcsRUFBSCxHQUFHO0tBQ04sQ0FBQTtDQUNKLENBQUMsQ0FBQSIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHJlZztcblxuaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgc3VwcG9ydGVkJyk7XG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zZXJ2aWNld29ya2VyLmpzJykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlYWR5O1xuICAgIH0pLnRoZW4oZnVuY3Rpb24oc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbikge1xuICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaXMgcmVhZHkgOl4pJywgcmVnKTtcbiAgICAgICAgcmVnID0gc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbjtcbiAgICAgICAgLy8gVE9ET1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBlcnJvciA6XignLCBlcnJvcik7XG4gICAgfSk7XG5cblxuICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmdldFJlZ2lzdHJhdGlvbnMoKS50aGVuKGEgPT4ge1xuICAgICAgICBmb3IgKHZhciBpIGluIGEpIHtcbiAgICAgICAgICAgIGlmIChhW2ldLmFjdGl2ZS5zY3JpcHRVUkwuaW5kZXhPZignL3NjcmlwdHMvc2VyJykgPj0gMCkge1xuICAgICAgICAgICAgICAgIGFbaV0udW5yZWdpc3RlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJhZnRlcmJ1cm5lckFwcFwiLCBbXCJmaXJlYmFzZVwiLCAnbmdUb3VjaCcsICduZ1JvdXRlJywgXCJhbmd1bGFyLmZpbHRlclwiLCAnbmctc29ydGFibGUnLCAndWkucm91dGVyJywgJ21vbm9zcGFjZWQuZWxhc3RpYyddKTtcbmNvbnN0IHRlbXBsYXRlUGF0aCA9ICcuL0Fzc2V0cy9kaXN0L1RlbXBsYXRlcyc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJGxvY2F0aW9uUHJvdmlkZXIsICRmaXJlYmFzZVJlZlByb3ZpZGVyLCAkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxuICAgICAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCI3Njc4MTA0MjkzMDlcIlxuICAgIH07XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgJGZpcmViYXNlUmVmUHJvdmlkZXIucmVnaXN0ZXJVcmwoY29uZmlnLmRhdGFiYXNlVVJMKTtcblxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSh7XG4gICAgICAgICAgICBuYW1lOiAnc2lnbmluJyxcbiAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8c2lnbmluPjwvc2lnbmluPidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdkZWZhdWx0Jywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRPdmVydmlld0NoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIidPdmVydmlldydcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidWZWxvY2l0eSdcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+IFxuICAgICAgICAgICAgICAgIDwvYXBwPmAsXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY3VycmVudC1zcHJpbnQnLCB7XG4gICAgICAgICAgICB1cmw6ICcvY3VycmVudC1zcHJpbnQnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0Q3VycmVudENoYXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8c3ByaW50cyB0aXRsZT1cIiRyZXNvbHZlLmNoYXJ0Lm5hbWVcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidCdXJuZG93bidcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQ9XCIkcmVzb2x2ZS5jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tsb2c9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3NwcmludCcsIHtcbiAgICAgICAgICAgIHVybDogJy9zcHJpbnQvOnNwcmludCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkc3RhdGVQYXJhbXMuc3ByaW50O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRTcHJpbnRDaGFydChzcHJpbnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCIkcmVzb2x2ZS5jaGFydC5uYW1lXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInQnVybmRvd24nXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrbG9nPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwcmludHM+XG4gICAgICAgICAgICAgICAgPC9hcHA+YCxcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiYmlnc2NyZWVuXCIsIHtcbiAgICAgICAgICAgIHVybDogJy9iaWdzY3JlZW4nLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0T3ZlcnZpZXdDaGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGJpZ3NjcmVlbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwcmludHMgdGl0bGU9XCInT3ZlcnZpZXcnXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2stdGl0bGU9XCInVmVsb2NpdHknXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0PVwiJHJlc29sdmUuY2hhcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcHJpbnRzPiBcbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJiaWdzY3JlZW4uY3VycmVudC1zcHJpbnRcIiwge1xuICAgICAgICAgICAgdXJsOiAnL2JpZ3NjcmVlbi9jdXJyZW50LXNwcmludCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgY2hhcnQoU3ByaW50U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3ByaW50U2VydmljZS5nZXRDdXJyZW50Q2hhcnQoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJiaWdzY3JlZW4uc3ByaW50XCIsIHtcbiAgICAgICAgICAgIHVybDogJy9iaWdzY3JlZW4vc3ByaW50LzpzcHJpbnQnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIGNoYXJ0KFNwcmludFNlcnZpY2UsICRyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gJHN0YXRlUGFyYW1zLnNwcmludDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50Q2hhcnQoc3ByaW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxiaWdzY3JlZW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcHJpbnRzIHRpdGxlPVwiJHJlc29sdmUuY2hhcnQubmFtZVwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLXRpdGxlPVwiJ0J1cm5kb3duJ1wiIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFydD1cIiRyZXNvbHZlLmNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2xvZz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ByaW50cz5cbiAgICAgICAgICAgICAgICA8L2JpZ3NjcmVlbj5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJiYWNrbG9nXCIsIHtcbiAgICAgICAgICAgIHVybDogJy9iYWNrbG9nJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbigkZmlyZWJhc2VBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiYmFja2xvZ1wiOiBmdW5jdGlvbihCYWNrbG9nU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmFja2xvZ1NlcnZpY2UuZ2V0QmFja2xvZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHA+XG4gICAgICAgICAgICAgICAgICAgIDxiYWNrbG9nIHRpdGxlPVwiJ0JhY2tsb2cnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidPdmVydmlldydcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaS1pdGVtcz1cIiRyZXNvbHZlLmJhY2tsb2dcIj5cbiAgICAgICAgICAgICAgICAgICAgPC9iYWNrbG9nPiBcbiAgICAgICAgICAgICAgICA8L2FwcD5gLFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJiYWNrbG9nLml0ZW1cIiwge1xuICAgICAgICAgICAgdXJsOiAnLzppdGVtJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbigkZmlyZWJhc2VBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwia2V5XCI6ICgkc3RhdGVQYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5pdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxvYWRPblNlYXJjaDogZmFsc2UsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYCBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtbGctNiBiYWNrbG9nLWZvcm1cIiBuZy1jbGFzcz1cInsnYWN0aXZlJzogJGN0cmwuc2VsZWN0ZWRJdGVtfVwiPiAgICAgICAgICAgICAgIFxuXHRcdFx0PGJhY2tsb2ctZm9ybSBcblx0XHRcdFx0aXRlbT1cIiRjdHJsLnNlbGVjdGVkSXRlbVwiXG4gICAgICAgICAgICAgICAgaXRlbXM9XCIkY3RybC5iaUl0ZW1zXCJcbiAgICAgICAgICAgICAgICBpdGVtLWtleT1cIiRyZXNvbHZlLmtleVwiXG5cdFx0XHRcdGF0dGFjaG1lbnRzPVwiJGN0cmwuc2VsZWN0ZWRJdGVtQXR0YWNobWVudHNcIlxuXHRcdFx0XHRzcHJpbnRzPVwiJGN0cmwuc3ByaW50c1wiIFxuXHRcdFx0XHRvbi1hZGQ9XCIkY3RybC5hZGRJdGVtKClcIiAgICAgICAgICAgICAgICAgXG5cdFx0XHRcdG9uLXNlbGVjdD1cIiRjdHJsLmdldEl0ZW0oJHJlc29sdmUua2V5KVwiIFxuXHRcdFx0XHRvbi1kZWxldGU9XCIkY3RybC5kZWxldGVJdGVtKCRjdHJsLnNlbGVjdGVkSXRlbSlcIiBcblx0XHRcdFx0b24tc2F2ZT1cIiRjdHJsLnNhdmVJdGVtKCRjdHJsLnNlbGVjdGVkSXRlbSlcIj5cblx0XHRcdDwvYmFja2xvZy1mb3JtPlxuICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3JldHJvJywge1xuICAgICAgICAgICAgdXJsOiAnL3JldHJvJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICBcImZpcmViYXNlVXNlclwiOiBmdW5jdGlvbigkZmlyZWJhc2VBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXV0aFNlcnZpY2UuJHdhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwPlxuICAgICAgICAgICAgICAgICAgICA8cmV0cm8gdGl0bGU9XCInUmV0cm8nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjay10aXRsZT1cIidBZnNwcmFrZW4nXCI+XG4gICAgICAgICAgICAgICAgICAgIDwvcmV0cm8+XG4gICAgICAgICAgICAgICAgPC9hcHA+YFxuICAgICAgICB9KTtcbn0pOyIsImFwcC5jb21wb25lbnQoJ2FwcCcsIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXIoJGxvY2F0aW9uLCAkZmlyZWJhc2VBdXRoLCBTcHJpbnRTZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgICAgIFxuICAgICAgICBjdHJsLmF1dGggPSBhdXRoO1xuICAgICAgICBpZighYXV0aC4kZ2V0QXV0aCgpKSAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xuXG4gICAgICAgIGN0cmwubmF2T3BlbiA9IGZhbHNlO1xuICAgICAgICBjdHJsLnNpZ25PdXQgPSgpPT4ge1xuICAgICAgICAgICAgY3RybC5hdXRoLiRzaWduT3V0KCk7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9hcHAuaHRtbGAgICBcbn0pOyAgIiwiYXBwLmNvbXBvbmVudCgnYmFja2xvZycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcbiAgICAgICAgaXRlbUtleTogJzwnLFxuICAgICAgICBiaUl0ZW1zOiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoQmFja2xvZ1NlcnZpY2UsIFNwcmludFNlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCBGaWxlU2VydmljZSwgJHNjb3BlLCBOb3RpZmljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIFNldHRpbmdTZXJ2aWNlKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcbiAgICAgICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAgICAgY3RybC5zZXR0aW5ncyA9IFNldHRpbmdTZXJ2aWNlO1xuXG4gICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcblxuICAgICAgICBjdHJsLnN0YXRlID0ge1xuICAgICAgICAgICAgTmV3OiBcIjBcIixcbiAgICAgICAgICAgIEFwcHJvdmVkOiBcIjFcIixcbiAgICAgICAgICAgIERvbmU6IFwiM1wiLFxuICAgICAgICAgICAgUmVtb3ZlZDogXCI0XCJcbiAgICAgICAgfTtcblxuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xuICAgICAgICBjdHJsLm9wZW4gPSB0cnVlO1xuXG4gICAgICAgIC8vIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAvLyAgICAgY3RybC5iaUl0ZW1zID0gZGF0YTtcbiAgICAgICAgLy8gICAgIGN0cmwucmVPcmRlcigpO1xuICAgICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY3RybC5pdGVtS2V5KSB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGN0cmwuaXRlbUtleSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGN0cmwudmlld01vZGUgPSBjdHJsLnNldHRpbmdzLmdldCgnVmlld01vZGUnLCAwKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgU3ByaW50U2VydmljZS5nZXRTcHJpbnRzKChzcHJpbnRzKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICBjdHJsLmN1c3RvbU9yZGVyID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coY3RybC5zcHJpbnRzKTtcbiAgICAgICAgICAgIGlmICghY3RybC5zcHJpbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWtleS5zcHJpbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC1jdHJsLnNwcmludHMuJGdldFJlY29yZChrZXkuc3ByaW50KS5vcmRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2V0Vmlld01vZGUgPSAobW9kZSkgPT4ge1xuICAgICAgICAgICAgY3RybC52aWV3TW9kZSA9IG1vZGU7XG4gICAgICAgICAgICBjdHJsLnNldHRpbmdzLnNldCgnVmlld01vZGUnLCBtb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwucmVPcmRlciA9IChncm91cCwgYSkgPT4ge1xuICAgICAgICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgY3RybC5yZW9yZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBncm91cC5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGl0ZW0uJGlkKTtcbiAgICAgICAgICAgICAgICAgICAgaS4kcHJpb3JpdHkgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2Uuc2F2ZShpKS50aGVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5zdW1FZmZvcnQgPSAoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBpdGVtcykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBpdGVtc1tpXS5lZmZvcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdW07XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5vcmRlckJ5U3ByaW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gOTk5OTk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3RybC5zcHJpbnRzLiRnZXRSZWNvcmQoa2V5KS5vcmRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2VsZWN0SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICBjdHJsLmZvcm1PcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGN0cmwuc2VsZWN0ZWRJdGVtID0gaXRlbTtcbiAgICAgICAgICAgIEZpbGVTZXJ2aWNlLmdldEF0dGFjaG1lbnRzKGl0ZW0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbUF0dGFjaG1lbnRzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9iYWNrbG9nLyR7aXRlbS4kaWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmV3SXRlbSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk5pZXV3Li4uXCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiAwLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAtMSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogMCxcbiAgICAgICAgICAgICAgICBzcHJpbnQ6IFwiXCJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQmFja2xvZ1NlcnZpY2UuYWRkKG5ld0l0ZW0pLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5zZWxlY3RJdGVtKGN0cmwuYmlJdGVtcy4kZ2V0UmVjb3JkKGRhdGEua2V5KSk7XG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuZGVsZXRlSXRlbSA9IGl0ZW0gPT4ge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gY3RybC5iaUl0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICBsZXQgc2VsZWN0SW5kZXggPSBpbmRleCA9PT0gMCA/IDAgOiBpbmRleCAtIDE7XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLnJlbW92ZShpdGVtKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdGVkSXRlbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgY3RybC5mb3JtT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5zYXZlSXRlbSA9IChpdGVtKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChpdGVtLnN0YXRlID09IGN0cmwuc3RhdGUuRG9uZSkge1xuICAgICAgICAgICAgICAgIGlmICghaXRlbS5yZXNvbHZlZE9uKSB7XG4gICAgICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uubm90aWZ5KCdTbWVsbHMgbGlrZSBmaXJlLi4uJywgYFdvcmsgb24gXCIke2l0ZW0ubmFtZX1cIiBoYXMgYmVlbiBjb21wbGV0ZWQhYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0ucmVzb2x2ZWRPbiA9IGl0ZW0ucmVzb2x2ZWRPbiB8fCBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtLnJlc29sdmVkT24gPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGl0ZW0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuZm9ybU9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZSA/XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfSA6XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5kcmFnT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxQbGFjZWhvbGRlckNsYXNzOiAnc29ydGFibGUtcGxhY2Vob2xkZXInXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnVwZGF0ZU9yZGVyID0gKG1vZGVscywgb2xkSW5kZXgsIG5ld0luZGV4KSA9PiB7XG4gICAgICAgICAgICB2YXIgZnJvbSA9IE1hdGgubWluKG9sZEluZGV4LCBuZXdJbmRleCk7XG4gICAgICAgICAgICB2YXIgdG8gPSBNYXRoLm1heChvbGRJbmRleCwgbmV3SW5kZXgpO1xuXG4gICAgICAgICAgICB2YXIgbW92ZWRVcCA9IG9sZEluZGV4ID4gbmV3SW5kZXg7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBmcm9tOyBpIDw9IHRvOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG1vZGVsc1tpXTtcbiAgICAgICAgICAgICAgICBtLm9yZGVyID0gbS5vcmRlciArIChtb3ZlZFVwID8gMSA6IC0xKTtcbiAgICAgICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtID0gbW9kZWxzW29sZEluZGV4XTtcbiAgICAgICAgICAgIGRyYWdnZWRJdGVtLm9yZGVyID0gbmV3SW5kZXg7XG4gICAgICAgICAgICBCYWNrbG9nU2VydmljZS5zYXZlKGRyYWdnZWRJdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc29ydENvbmZpZyA9IHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuICAgICAgICAgICAgaGFuZGxlOiAnLnNvcnRhYmxlLWhhbmRsZScsXG4gICAgICAgICAgICBvbkFkZChlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZGVsID0gZS5tb2RlbDtcbiAgICAgICAgICAgICAgICBsZXQgc3ByaW50ID0gZS5tb2RlbHNbMF0uc3ByaW50O1xuICAgICAgICAgICAgICAgIGlmIChtb2RlbCAmJiBtb2RlbC5zcHJpbnQgIT0gc3ByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGN0cmwuYmlJdGVtcy4kaW5kZXhGb3IobW9kZWwuJGlkKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iaUl0ZW1zW2luZGV4XS5zcHJpbnQgPSBzcHJpbnQ7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYmlJdGVtcy4kc2F2ZShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVPcmRlcihlLm1vZGVscyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVtb3ZlKGUpIHtcbiAgICAgICAgICAgICAgICBjdHJsLnJlT3JkZXIoZS5tb2RlbHMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25VcGRhdGUoZSkge1xuICAgICAgICAgICAgICAgIGN0cmwudXBkYXRlT3JkZXIoZS5tb2RlbHMsIGUub2xkSW5kZXgsIGUubmV3SW5kZXgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2cuaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ2JhY2tsb2dJdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8JyxcbiAgICAgICAgb25DbGljazogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKEJhY2tsb2dTZXJ2aWNlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmFja2xvZ0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdiYWNrbG9nRm9ybScsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBpdGVtOiBcIj1cIixcbiAgICAgICAgaXRlbXM6IFwiPFwiLFxuICAgICAgICBpdGVtS2V5OiBcIjxcIixcbiAgICAgICAgc3ByaW50czogXCI8XCIsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBcIj1cIixcbiAgICAgICAgb25BZGQ6IFwiJlwiLFxuICAgICAgICBvbkRlbGV0ZTogXCImXCIsXG4gICAgICAgIG9uU2F2ZTogXCImXCIsXG4gICAgICAgIG9uU2VsZWN0OiBcIiZcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgRmlsZVNlcnZpY2UsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsICRsb2NhdGlvbikge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGN0cmwuYXR0YWNobWVudHNUb0FkZDtcbiAgICAgICAgXG4gICAgICAgIGxldCBmaWxlU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZmlsZVNlbGVjdC50eXBlID0gJ2ZpbGUnO1xuICAgICAgICBmaWxlU2VsZWN0Lm11bHRpcGxlID0gJ211bHRpcGxlJztcbiAgICAgICAgZmlsZVNlbGVjdC5vbmNoYW5nZSA9IChldnQpID0+IHtcbiAgICAgICAgICAgIGN0cmwudXBsb2FkRmlsZXMoZmlsZVNlbGVjdC5maWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY3RybC5pdGVtS2V5KSB7XG4gICAgICAgICAgICAgICAgY3RybC5pdGVtID0gY3RybC5pdGVtcy4kZ2V0UmVjb3JkKGN0cmwuaXRlbUtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdHJsLml0ZW0pIHsgXG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvYmFja2xvZ2ApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIEZpbGVTZXJ2aWNlLmdldEF0dGFjaG1lbnRzKGN0cmwuaXRlbSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICBjdHJsLml0ZW0gPSBudWxsO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9iYWNrbG9nYCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWltZU1hcCA9IHt9O1xuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvanBlZ1wiXSA9IFwiZmEtcGljdHVyZS1vXCI7XG4gICAgICAgIG1pbWVNYXBbXCJpbWFnZS9wbmdcIl0gPSBcImZhLXBpY3R1cmUtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiaW1hZ2UvZ2lmXCJdID0gXCJmYS1waWN0dXJlLW9cIjtcbiAgICAgICAgbWltZU1hcFtcImltYWdlL3RpZlwiXSA9IFwiZmEtcGljdHVyZS1vXCI7ICAgICAgICBcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3BkZlwiXSA9IFwiZmEtZmlsZS1wZGYtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXRcIl0gPSBcImZhLWZpbGUtZXhjZWwtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvblwiXSA9IFwiZmEtZmlsZS1wb3dlcnBvaW50LW9cIjtcbiAgICAgICAgbWltZU1hcFtcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCJdID0gXCJmYS1maWxlLXdvcmQtb1wiO1xuICAgICAgICBtaW1lTWFwW1wiYXBwbGljYXRpb24veC16aXAtY29tcHJlc3NlZFwiXSA9IFwiZmEtZmlsZS1hcmNoaXZlLW9cIjtcbiAgICAgICAgbWltZU1hcFtcInZpZGVvL3dlYm1cIl0gPSBcImZhLWZpbGUtdmlkZW8tb1wiO1xuXG4gICAgICAgIGN0cmwuZ2V0RmlsZUljb24gPSAoYSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1pbWVNYXBbYS5taW1ldHlwZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWltZU1hcFthLm1pbWV0eXBlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFwiZmEtZmlsZS1vXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmdldEZpbGVFeHRlbnRpb24gPSAoYSkgPT4ge1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gYS5uYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnNlbGVjdEZpbGVzID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdHJsLml0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU2VsZWN0LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGN0cmwudXBsb2FkRmlsZXMgPSAoZmlsZXMpID0+IHtcbiAgICAgICAgICAgIGZvciAodmFyIGYgaW4gZmlsZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IGZpbGVzW2ZdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwudXBsb2FkRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY3RybC51cGxvYWRGaWxlID0gKGZpbGUpID0+IHtcbiAgICAgICAgICAgIHZhciBwYXRoID0gYCR7Y3RybC5pdGVtLiRpZH0vJHtmaWxlLm5hbWV9YFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBrZXkgPSAtMTtcbiAgICAgICAgICAgIHZhciBhdHRhY2htZW50ID0ge1xuICAgICAgICAgICAgICAgIGJhY2tsb2dJdGVtOiBjdHJsLml0ZW0uJGlkLFxuICAgICAgICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgICAgIG1pbWV0eXBlOiBmaWxlLnR5cGUsXG4gICAgICAgICAgICAgICAgc3RhdGU6IDEsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJGFkZChhdHRhY2htZW50KS50aGVuKChyZWYpID0+IHtcbiAgICAgICAgICAgICAgICBrZXkgPSByZWYua2V5O1xuXG4gICAgICAgICAgICAgICAgbGV0IHN0b3JhZ2VSZWYgPSBmaXJlYmFzZS5zdG9yYWdlKCkucmVmKHBhdGgpO1xuICAgICAgICAgICAgICAgIHZhciB1cGxvYWRUYXNrID0gc3RvcmFnZVJlZi5wdXQoZmlsZSk7XG4gICAgICAgICAgICAgICAgdXBsb2FkVGFzay5vbignc3RhdGVfY2hhbmdlZCcsIGZ1bmN0aW9uIHByb2dyZXNzKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IChzbmFwc2hvdC5ieXRlc1RyYW5zZmVycmVkIC8gc25hcHNob3QudG90YWxCeXRlcykgKiAxMDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcbiAgICAgICAgICAgICAgICAgICAgci5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRzYXZlKHIpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdW5zdWNjZXNzZnVsIHVwbG9hZHNcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWNjZXNzZnVsIHVwbG9hZHMgb24gY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGluc3RhbmNlLCBnZXQgdGhlIGRvd25sb2FkIFVSTDogaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vLi4uXG4gICAgICAgICAgICAgICAgICAgIHZhciBkb3dubG9hZFVSTCA9IHVwbG9hZFRhc2suc25hcHNob3QuZG93bmxvYWRVUkw7XG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY3RybC5hdHRhY2htZW50cy4kZ2V0UmVjb3JkKGtleSlcbiAgICAgICAgICAgICAgICAgICAgci51cmwgPSBkb3dubG9hZFVSTDtcbiAgICAgICAgICAgICAgICAgICAgci5zdGF0ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYXR0YWNobWVudHMuJHNhdmUocik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwucmVtb3ZlQXR0YWNobWVudCA9IChhLGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBjdHJsLmF0dGFjaG1lbnRzLiRyZW1vdmUoYSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2JhY2tsb2dGb3JtLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdiaWdzY3JlZW4nLCB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyKCRsb2NhdGlvbiwgJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBcbiAgICAgICAgY3RybC5hdXRoID0gYXV0aDtcbiAgICAgICAgaWYoIWF1dGguJGdldEF1dGgoKSkgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcblxuICAgICAgICBjdHJsLm5hdk9wZW4gPSBmYWxzZTtcbiAgICAgICAgY3RybC5zaWduT3V0ID0oKT0+IHtcbiAgICAgICAgICAgIGN0cmwuYXV0aC4kc2lnbk91dCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vYmlnc2NyZWVuLmh0bWxgICAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ2NoYXJ0Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIG9wdGlvbnM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBsb2FkZWQ6ICc8JyxcbiAgICAgICAgdHlwZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICR0aW1lb3V0LCAkbG9jYXRpb24sICRyb290U2NvcGUsIFNwcmludFNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgJGNhbnZhcyA9ICRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XG5cbiAgICAgICAgY3RybC5jaGFydDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgaWYgKGN0cmwuY2hhcnQpIGN0cmwuY2hhcnQuZGVzdHJveSgpO1xuXG4gICAgICAgICAgICBjdHJsLmNoYXJ0ID0gbmV3IENoYXJ0KCRjYW52YXMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBjdHJsLnR5cGUsXG4gICAgICAgICAgICAgICAgZGF0YTogY3RybC5kYXRhLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGN0cmwub3B0aW9uc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jaGFydCA9IGN0cmwuY2hhcnQ7XG5cbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24ucGF0aCgpID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAkY2FudmFzLm9uY2xpY2sgPSBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZVBvaW50cyA9IGN0cmwuY2hhcnQuZ2V0RWxlbWVudHNBdEV2ZW50KGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUG9pbnRzICYmIGFjdGl2ZVBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xpY2tlZEluZGV4ID0gYWN0aXZlUG9pbnRzWzFdLl9pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGlja2VkU3ByaW50ID0gU3ByaW50U2VydmljZS5nZXRDYWNoZWRTcHJpbnRzKClbY2xpY2tlZEluZGV4XS5vcmRlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGxvY2F0aW9uLnBhdGgoYC9zcHJpbnQvJHtjbGlja2VkU3ByaW50fWApKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS4kd2F0Y2goKCk9PiBjdHJsLmxvYWRlZCwgbG9hZGVkPT4ge1xuICAgICAgICAgICAgaWYoIWxvYWRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9KVxuXG4gICAgICAgICRyb290U2NvcGUuJG9uKCdzcHJpbnQ6dXBkYXRlJywgKCk9PiB7XG4gICAgICAgICAgICAkdGltZW91dCgoKT0+Y3RybC5jaGFydC51cGRhdGUoKSk7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYDxjYW52YXM+PC9jYW52YXM+YCBcbn0pICIsImFwcC5jb21wb25lbnQoJ2Zvb3RlcicsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBzcHJpbnQ6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIGN0cmwuc3RhdE9wZW4gPSBmYWxzZTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L2Zvb3Rlci5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgnb3ZlcnZpZXdGb290ZXInLCB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgICAgICBjdHJsLnN0YXRPcGVuID0gZmFsc2U7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9mb290ZXIuaHRtbGBcbn0pOyIsImFwcC5jb21wb25lbnQoJ3JldHJvJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIGJhY2tUaXRsZTogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyKFJldHJvU2VydmljZSwgU3ByaW50U2VydmljZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXksIEZpbGVTZXJ2aWNlLCAkc2NvcGUsIE5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgICAgIFNwcmludFNlcnZpY2UuZ2V0U3ByaW50cygoc3ByaW50cykgPT4ge1xuICAgICAgICAgICAgY3RybC5zcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgUmV0cm9TZXJ2aWNlLmdldFJldHJvKCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgIGN0cmwuUmV0cm9BZ3JlZW1lbnRzID0gZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyby5odG1sYFxufSk7IiwiYXBwLmNvbXBvbmVudCgncmV0cm9JdGVtJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW06ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9yZXRyb0l0ZW0uaHRtbGAgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzaWRlTmF2Jywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6ICc8JyxcbiAgICAgICAgb3BlbjogJzwnLFxuICAgICAgICBvblNpZ25PdXQ6ICcmJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoTm90aWZpY2F0aW9uU2VydmljZSwgJHRpbWVvdXQsICRzY29wZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGN0cmwub3BlbiA9IGZhbHNlO1xuICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmhhc1N1YnNjcmlwdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2Uuc3Vic2NyaWJlKCkudGhlbihkID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmNoZWNrU3Vic2NyaXB0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC51bnN1YnNjcmliZSA9ICgpID0+IHtcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblNlcnZpY2UudW5zdWJzY3JpYmUoKS50aGVuKGQgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuY2hlY2tTdWJzY3JpcHRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NpZGVOYXYuaHRtbGAgXG59KTsgICIsImFwcC5jb21wb25lbnQoJ3NpZ25pbicsIHtcbiAgICBjb250cm9sbGVyKCRmaXJlYmFzZUF1dGgsICRsb2NhdGlvbikgeyBcbiAgICAgICAgY29uc3QgY3RybCA9IHRoaXM7XG5cbiAgICAgICAgY3RybC5zaWduSW4gPShuYW1lLCBlbWFpbCk9PiB7XG4gICAgICAgICAgICAkZmlyZWJhc2VBdXRoKCkuJHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKG5hbWUsIGVtYWlsKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc2lnbmluLmh0bWxgXG59KTsiLCJhcHAuY29tcG9uZW50KCdzcHJpbnRCYWNrbG9nJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihCYWNrbG9nU2VydmljZSwgJGZpcmViYXNlQXV0aCkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogYCR7dGVtcGxhdGVQYXRofS9zcHJpbnRCYWNrbG9nLmh0bWxgIFxufSk7ICIsImFwcC5jb21wb25lbnQoJ3NwcmludFJldHJvJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGl0ZW1zOiBcIjxcIlxuICAgIH0sXG4gICAgY29udHJvbGxlcihSZXRyb1NlcnZpY2UsICRmaXJlYmFzZUF1dGgpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vc3ByaW50UmV0cm8uaHRtbGAgXG59KTsgIiwiYXBwLmNvbXBvbmVudCgnc3ByaW50cycsIHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB0aXRsZTogJzwnLFxuICAgICAgICBiYWNrVGl0bGU6ICc8JyxcbiAgICAgICAgYmFja2xvZzogJzwnLFxuICAgICAgICBjaGFydDogJz0nXG4gICAgfSxcblxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgU3ByaW50U2VydmljZSwgQmFja2xvZ1NlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUsICRsb2NhdGlvbiwgU2V0dGluZ1NlcnZpY2UsIFJldHJvU2VydmljZSkge1xuICAgICAgICBsZXQgY3RybCA9IHRoaXM7XG4gICAgICAgIGxldCBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgICAgICBjdHJsLnNldHRpbmdzID0gU2V0dGluZ1NlcnZpY2U7XG5cbiAgICAgICAgY3RybC5zdGF0ZSA9IHtcbiAgICAgICAgICAgIE5ldzogXCIwXCIsXG4gICAgICAgICAgICBBcHByb3ZlZDogXCIxXCIsXG4gICAgICAgICAgICBEb25lOiBcIjNcIixcbiAgICAgICAgICAgIFJlbW92ZWQ6IFwiNFwiXG4gICAgICAgIH07XG5cbiAgICAgICAgY3RybC5zdGF0ZUxvb2t1cCA9IFsnTmV3JywgJ0FwcHJvdmVkJywgJycsICdEb25lJywgJ1JlbW92ZWQnXTtcblxuICAgICAgICBjdHJsLmxvYWRlZCA9IGZhbHNlO1xuICAgICAgICBjdHJsLmZpbHRlciA9IHt9O1xuXG4gICAgICAgIGN0cmwub3Blbkl0ZW0gPSAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9iYWNrbG9nLyR7aXRlbS4kaWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLnN1bUVmZm9ydCA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IGl0ZW1zW2ldLmVmZm9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1bTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQgJiYgY3RybC5iYWNrbG9nKSB7XG5cbiAgICAgICAgICAgIEJhY2tsb2dTZXJ2aWNlLmdldEJhY2tsb2coY3RybC5jaGFydC5zcHJpbnQpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zID0gZGF0YTtcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiBjdHJsLmxvYWRlZCA9IHRydWUpO1xuXG4gICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiRsb2FkZWQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5jaGFydC5zcHJpbnQuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5CaUl0ZW1zLiR3YXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0QnVybmRvd24oY3RybC5jaGFydC5zcHJpbnQuc3RhcnQsIGN0cmwuY2hhcnQuc3ByaW50LmR1cmF0aW9uLCBjdHJsLkJpSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIFJldHJvU2VydmljZS5nZXRSZXRybyhjdHJsLmNoYXJ0LnNwcmludCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLlJldHJvQWdyZWVtZW50cyA9IGRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5maWx0ZXJJdGVtcyA9IHggPT4ge1xuICAgICAgICAgICAgeCA9PSBjdHJsLmZpbHRlci5zdGF0ZSA/XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIgPSB7IG5hbWU6IGN0cmwuZmlsdGVyLm5hbWUgfSA6XG4gICAgICAgICAgICAgICAgY3RybC5maWx0ZXIuc3RhdGUgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdHJsLmNoYXJ0LnNwcmludCB8fCAhY3RybC5iYWNrbG9nKSB7XG4gICAgICAgICAgICAgICAgY3RybC5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3RybC52aWV3TW9kZSA9IGN0cmwuc2V0dGluZ3MuZ2V0KCdWaWV3TW9kZScsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgY3RybC5zZXRWaWV3TW9kZSA9IChtb2RlKSA9PiB7XG4gICAgICAgICAgICBjdHJsLnZpZXdNb2RlID0gbW9kZTtcbiAgICAgICAgICAgIGN0cmwuc2V0dGluZ3Muc2V0KCdWaWV3TW9kZScsIG1vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIFRoaXMgbWV0aG9kIGlzIHJlc3BvbnNpYmxlIGZvciBidWlsZGluZyB0aGUgZ3JhcGhkYXRhIGJ5IGJhY2tsb2cgaXRlbXMgICAgICAgIFxuICAgICAgICBjdHJsLnNldEJ1cm5kb3duID0gKHN0YXJ0LCBkdXJhdGlvbiwgYmFja2xvZykgPT4ge1xuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZShzdGFydCAqIDEwMDApO1xuICAgICAgICAgICAgbGV0IGRhdGVzID0gW107XG4gICAgICAgICAgICBsZXQgYnVybmRvd24gPSBbXTtcbiAgICAgICAgICAgIGxldCBkYXlzVG9BZGQgPSAwO1xuICAgICAgICAgICAgbGV0IHZlbG9jaXR5UmVtYWluaW5nID0gY3RybC5jaGFydC5zcHJpbnQudmVsb2NpdHk7XG4gICAgICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcbiAgICAgICAgICAgIGxldCB0b3RhbEJ1cm5kb3duID0gMDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZHVyYXRpb247IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBuZXdEYXRlID0gc3RhcnQuYWRkRGF5cyhkYXlzVG9BZGQgLSAxKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3RGF0ZSA+IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKFswLCA2XS5pbmRleE9mKG5ld0RhdGUuZ2V0RGF5KCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBzdGFydC5hZGREYXlzKGRheXNUb0FkZCk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3RGF0ZSk7XG4gICAgICAgICAgICAgICAgZGF5c1RvQWRkKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRhdGVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBiZG93biA9IDA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiBpbiBiYWNrbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBibGkgPSBiYWNrbG9nW2kyXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsaS5zdGF0ZSAhPSBcIjNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxpRGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KGJsaS5yZXNvbHZlZE9uKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChibGlEYXRlLmdldERhdGUoKSA9PSBkLmdldERhdGUoKSAmJiBibGlEYXRlLmdldE1vbnRoKCkgPT0gZC5nZXRNb250aCgpICYmIGJsaURhdGUuZ2V0RnVsbFllYXIoKSA9PSBkLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJkb3duICs9IGJsaS5lZmZvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidXJuZG93bi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogZCxcbiAgICAgICAgICAgICAgICAgICAgYnVybmRvd246IGJkb3duXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggaW4gYnVybmRvd24pIHtcbiAgICAgICAgICAgICAgICB0b3RhbEJ1cm5kb3duICs9IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xuICAgICAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IGJ1cm5kb3duW3hdLmJ1cm5kb3duO1xuICAgICAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuYnVybmRvd24gPSB0b3RhbEJ1cm5kb3duO1xuICAgICAgICAgICAgY3RybC5jaGFydC5yZW1haW5pbmcgPSB2ZWxvY2l0eVJlbWFpbmluZztcbiAgICAgICAgICAgIGN0cmwuY2hhcnQuZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBgJHt0ZW1wbGF0ZVBhdGh9L3NwcmludHMuaHRtbGBcbn0pO1xuXG5EYXRlLnByb3RvdHlwZS5hZGREYXlzID0gZnVuY3Rpb24oZGF5cykge1xuICAgIHZhciBkYXQgPSBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSk7XG4gICAgZGF0LnNldERhdGUoZGF0LmdldERhdGUoKSArIGRheXMpO1xuICAgIHJldHVybiBkYXQ7XG59IiwiYXBwLmNvbXBvbmVudCgndGV4dE5vdGVzJywge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHRpdGxlOiAnPCcsXG4gICAgICAgIHR5cGU6ICc8JyxcbiAgICAgICAgc3ByaW50OiAnPCdcbiAgICB9LFxuICAgIGNvbnRyb2xsZXIoJGZpcmViYXNlQXV0aCwgTm90ZVNlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRyb290U2NvcGUpIHtcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzO1xuICAgICAgICBsZXQgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICAgICBjdHJsLm5ld05vdGUgPSB7XG4gICAgICAgICAgICBub3RlOiAnJyxcbiAgICAgICAgICAgIGF1dGhvcjogYXV0aC4kZ2V0QXV0aCgpLnVpZCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgIHNwcmludDogY3RybC5zcHJpbnQuJGlkXG4gICAgICAgIH1cblxuICAgICAgICBjdHJsLmluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBOb3RlU2VydmljZS5nZXROb3RlcyhjdHJsLnR5cGUsIGN0cmwuc3ByaW50KS50aGVuKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5ub3RlcyA9IGQ7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0cmwuc2F2ZU5vdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjdHJsLm5ld05vdGUudGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgTm90ZVNlcnZpY2UuYWRkKGN0cmwudHlwZSwgY3RybC5uZXdOb3RlLCBjdHJsLm5vdGVzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLm5ld05vdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdXRob3I6IGF1dGguJGdldEF1dGgoKS51aWQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50OiBjdHJsLnNwcmludC4kaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGAke3RlbXBsYXRlUGF0aH0vdGV4dE5vdGVzLmh0bWxgICAgXG59KTsiLCJhcHAuZmFjdG9yeSgnQmFja2xvZ1NlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgVXRpbGl0eVNlcnZpY2UsICRxLCAkZmlsdGVyLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgYmFja2xvZztcblxuICAgIGZ1bmN0aW9uIGdldEJhY2tsb2coc3ByaW50KSB7XG4gICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhY2tsb2cgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJiYWNrbG9nXCIpLm9yZGVyQnlDaGlsZCgnc3ByaW50JykuZXF1YWxUbyhzcHJpbnQuJGlkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKGJhY2tsb2cuJGxvYWRlZCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkKGJhY2tsb2dJdGVtKSB7XG4gICAgICAgIHJldHVybiBiYWNrbG9nLiRhZGQoYmFja2xvZ0l0ZW0pO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmUoYmFja2xvZ0l0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGJhY2tsb2cuJHJlbW92ZShiYWNrbG9nSXRlbSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZShiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gYmFja2xvZy4kc2F2ZShiYWNrbG9nSXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0QmFja2xvZyxcbiAgICAgICAgc2F2ZSxcbiAgICAgICAgYWRkLFxuICAgICAgICByZW1vdmVcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ0ZpbGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIFV0aWxpdHlTZXJ2aWNlLCAkcSwgJHRpbWVvdXQsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICBsZXQgYXR0YWNobWVudHM7XG5cbiAgICBmdW5jdGlvbiBnZXRBdHRhY2htZW50cyhiYWNrbG9nSXRlbSkge1xuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKCFiYWNrbG9nSXRlbSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChcIkJhY2tsb2cgaXRlbSBub3QgcHJvdmlkZWRcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwiYXR0YWNobWVudHNcIikub3JkZXJCeUNoaWxkKCdiYWNrbG9nSXRlbScpLmVxdWFsVG8oYmFja2xvZ0l0ZW0uJGlkKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhdHRhY2htZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEF0dGFjaG1lbnRzXG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdOb3RlU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBub3RlcyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Tm90ZXModHlwZSwgc3ByaW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIG4gPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ25vdGVzLycgKyB0eXBlKS5vcmRlckJ5Q2hpbGQoJ3NwcmludCcpLmVxdWFsVG8oc3ByaW50LiRpZCkpO1xuICAgICAgICAgICAgcmVzb2x2ZShuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkKHR5cGUsIG5vdGUsbm90ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRhZGQobm90ZSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZSh0eXBlLCBub3RlLG5vdGVzKSB7XG4gICAgICAgIHJldHVybiBub3Rlcy4kcmVtb3ZlKG5vdGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUodHlwZSwgbm90ZSwgbm90ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5vdGVzLiRzYXZlKG5vdGUpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldE5vdGVzLFxuICAgICAgICBzYXZlLFxuICAgICAgICBhZGQsXG4gICAgICAgIHJlbW92ZVxuICAgIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnTm90aWZpY2F0aW9uU2VydmljZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaXJlYmFzZUF1dGgsICRodHRwKSB7XG4gICAgbGV0IF8gPSBVdGlsaXR5U2VydmljZTtcbiAgICBsZXQgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTsgICAgXG4gICAgbGV0IGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgbGV0IHVzZXJJZCA9IGF1dGguJGdldEF1dGgoKS51aWQ7XG4gICAgbGV0IHJlZyA9IHdpbmRvdy5yZWc7XG4gICAgbGV0IGJhY2tsb2c7XG5cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUoKSB7XG5cbiAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZyk7XG4gICAgICAgICAgICByZWcucHVzaE1hbmFnZXIuZ2V0U3Vic2NyaXB0aW9uKCkudGhlbigoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcblxuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLnN1YnNjcmliZSh7IHVzZXJWaXNpYmxlT25seTogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uIChwdXNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHB1c2hTdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1YnNjcmliZWQhIEVuZHBvaW50OicsIHN1Yi5lbmRwb2ludCk7XG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGxvYWRlZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuJGFkZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRwb2ludDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleXM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocHVzaFN1YnNjcmlwdGlvbikpLmtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGVuZHBvaW50ID0gc3ViLmVuZHBvaW50LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFtlbmRwb2ludC5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpLnRoZW4oZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3Vic2NyaXB0aW9uc1wiKS5vcmRlckJ5Q2hpbGQoJ2VuZHBvaW50JykuZXF1YWxUbyhlbmRwb2ludCkpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zLiRsb2FkZWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy4kcmVtb3ZlKDApOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdGlmeSh0aXRsZSwgbWVzc2FnZSkgeyAgICAgICAgXG4gICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAkaHR0cCh7IFxuICAgICAgICAgICAgICAgIHVybDogYGh0dHBzOi8vbm90aWZpY2F0aW9ucy5ib2VyZGFtZG5zLm5sL2FwaS9ub3RpZnkvcG9zdD90aXRsZT0ke3RpdGxlfSZtZXNzYWdlPSR7bWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICB9KS50aGVuKGEgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlLFxuICAgICAgICB1bnN1YnNjcmliZSxcbiAgICAgICAgbm90aWZ5XG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdSZXRyb1NlcnZpY2UnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCByZXRybztcblxuICAgIGZ1bmN0aW9uIGdldFJldHJvKHNwcmludCkge1xuICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZiAoIXNwcmludCkge1xuICAgICAgICAgICAgICAgIHJldHJvID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwicmV0cm9cIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXRybyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHJvID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwicmV0cm9cIikub3JkZXJCeUNoaWxkKCdzcHJpbnQnKS5lcXVhbFRvKHNwcmludC4kaWQpKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJldHJvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkKHJldHJvQWdyZWVtZW50KSB7XG4gICAgICAgIHJldHVybiByZXRyby4kYWRkKHJldHJvQWdyZWVtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmUocmV0cm9BZ3JlZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHJldHJvLiRyZW1vdmUocmV0cm9BZ3JlZW1lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUocmV0cm9BZ3JlZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHJldHJvLiRzYXZlKHJldHJvQWdyZWVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRSZXRybyxcbiAgICAgICAgc2F2ZSxcbiAgICAgICAgYWRkLFxuICAgICAgICByZW1vdmVcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1NldHRpbmdTZXJ2aWNlJywgZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldChrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSB8fCBkZWZhdWx0VmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0LFxuICAgICAgICBnZXRcbiAgICB9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1NwcmludFNlcnZpY2UnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBVdGlsaXR5U2VydmljZSwgJHEsICRmaWx0ZXIsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICBsZXQgXyA9IFV0aWxpdHlTZXJ2aWNlO1xuICAgIGxldCByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIGxldCBsaW5lQ29sb3IgPSAnI0VCNTFEOCc7XG4gICAgbGV0IGJhckNvbG9yID0gJyM1RkZBRkMnO1xuICAgIGxldCBjaGFydFR5cGUgPSBcImxpbmVcIjtcbiAgICBsZXQgY2FjaGVkU3ByaW50cztcblxuICAgIGxldCBjaGFydE9wdGlvbnMgPSB7XG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICB0b29sdGlwczoge1xuICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXM6IDMsXG4gICAgICAgIH0sXG4gICAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBzY2FsZXM6IHtcbiAgICAgICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHlBeGVzOiBbe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTFcIixcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1pbjogMCxcbiAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxldCBvdmVydmlld0RhdGEgPSB7XG4gICAgICAgIGxhYmVsczogW10sIFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBdmVyYWdlXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM1OEY0ODRcIixcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNThGNDg0XCIsXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNThGNDg0JyxcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzU4RjQ4NCcsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkVzdGltYXRlZFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lQ29sb3IsXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICBob3ZlckJvcmRlckNvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiBiYXJDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgbGV0IGJ1cm5kb3duRGF0YSA9IHtcbiAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGkgXCIsIFwid28gXCIsIFwiZG8gXCIsIFwidnIgXCIsIFwibWEgXCJdLFxuICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkdlaGFhbGRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogbGluZUNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IGxpbmVDb2xvcixcbiAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxuICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiTWVhbiBCdXJuZG93blwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IGJhckNvbG9yLFxuICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogYmFyQ29sb3IsXG4gICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldFNwcmludHMoY2IsIGFsbCkge1xuICAgICAgICBpZiAoYWxsKSB7XG4gICAgICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpKTtcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZChjYiwgKCk9PiAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpKTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgc3ByaW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZChcInNwcmludHNcIikub3JkZXJCeUNoaWxkKCdvcmRlcicpLmxpbWl0VG9MYXN0KDkpKTtcbiAgICAgICAgICAgIHNwcmludHMuJGxvYWRlZChjYiwgKCk9PiAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpKTsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENhY2hlZFNwcmludHMoKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWRTcHJpbnRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE92ZXJ2aWV3Q2hhcnQoKSB7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0U3ByaW50cyhzcHJpbnRzID0+IHtcblxuICAgICAgICAgICAgc3ByaW50cy4kbG9hZGVkKCgpID0+IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjYWNoZWRTcHJpbnRzID0gc3ByaW50cztcbiAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld0NoYXJ0KGRlZmVycmVkLCBzcHJpbnRzKTtcbiAgICAgICAgICAgICAgICBzcHJpbnRzLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlZFNwcmludHMgPSBzcHJpbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3NwcmludDp1cGRhdGUnKTsgICAgXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU92ZXJ2aWV3Q2hhcnQoZGVmZXJyZWQsIHNwcmludHMpO1xuICAgICAgICAgICAgICAgIH0pOyAgICBcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlT3ZlcnZpZXdDaGFydChkZWZlcnJlZCwgc3ByaW50cykge1xuXG4gICAgICAgIGxldCBsYWJlbHM7XG4gICAgICAgIGxldCBlc3RpbWF0ZWQ7XG4gICAgICAgIGxldCBidXJuZWQ7XG4gICAgICAgIGxldCBhdmVyYWdlID0gW107XG5cbiAgICAgICAgbGFiZWxzID0gc3ByaW50cy5tYXAoZCA9PiBgU3ByaW50ICR7Xy5wYWQoZC5vcmRlcil9YCk7XG4gICAgICAgIGVzdGltYXRlZCA9IHNwcmludHMubWFwKGQgPT4gZC52ZWxvY2l0eSk7XG4gICAgICAgIGJ1cm5lZCA9IHNwcmludHMubWFwKGQgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSBpID0gaSArIGQuYnVybmRvd25beF07XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVybmVkLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50KGJ1cm5lZFtpXSwgMTApOyAvL2Rvbid0IGZvcmdldCB0byBhZGQgdGhlIGJhc2VcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXZnID0gc3VtIC8gKGJ1cm5lZC5sZW5ndGggLSAxKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHJpbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhdmVyYWdlLnB1c2goYXZnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRhID0gb3ZlcnZpZXdEYXRhO1xuICAgICAgICBkYXRhLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgZGF0YS5kYXRhc2V0c1syXS5kYXRhID0gYnVybmVkO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBlc3RpbWF0ZWQ7XG4gICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGF2ZXJhZ2U7XG5cbiAgICAgICAgbGV0IG92ZXJ2aWV3Q2hhcnRPcHRpb25zID0gY2hhcnRPcHRpb25zO1xuICAgICAgICBvdmVydmlld0NoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMF0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAwO1xuICAgICAgICAvL292ZXJ2aWV3Q2hhcnRPcHRpb25zLnNjYWxlcy55QXhlc1sxXS50aWNrcy5zdWdnZXN0ZWRNYXggPSAxMDA7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSBzcHJpbnRzW3NwcmludHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgbGV0IGNoYXJ0T2JqID0ge1xuICAgICAgICAgICAgdHlwZTogXCJiYXJcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IG92ZXJ2aWV3Q2hhcnRPcHRpb25zLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiBjdXJyZW50U3ByaW50LnZlbG9jaXR5LFxuICAgICAgICAgICAgYnVybmRvd246IF8uc3VtKGN1cnJlbnRTcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgcmVtYWluaW5nOiBjdXJyZW50U3ByaW50LnZlbG9jaXR5IC0gXy5zdW0oY3VycmVudFNwcmludC5idXJuZG93biksXG4gICAgICAgICAgICBuZWVkZWQ6ICRmaWx0ZXIoJ251bWJlcicpKGN1cnJlbnRTcHJpbnQudmVsb2NpdHkgLyBjdXJyZW50U3ByaW50LmR1cmF0aW9uLCAxKVxuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2hhcnRPYmopO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkQnVybkRvd25DaGFydChzcHJpbnQpIHtcbiAgICAgICAgbGV0IGxhYmVscyA9IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaSBcIiwgXCJ3byBcIiwgXCJkbyBcIiwgXCJ2ciBcIiwgXCJtYSBcIl0uc2xpY2UoMCxzcHJpbnQuZHVyYXRpb24gKzEpXG5cbiAgICAgICAgbGV0IGlkZWFsQnVybmRvd24gPSBsYWJlbHMubWFwKChkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFiZWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5LnRvRml4ZWQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKChzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24pICogaSkudG9GaXhlZCgyKTtcbiAgICAgICAgfSkucmV2ZXJzZSgpO1xuXG4gICAgICAgIGxldCB2ZWxvY2l0eVJlbWFpbmluZyA9IHNwcmludC52ZWxvY2l0eVxuICAgICAgICBsZXQgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCB4IGluIHNwcmludC5idXJuZG93bikge1xuICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gc3ByaW50LmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGEgPSBidXJuZG93bkRhdGE7XG4gICAgICAgIGRhdGEubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcbiAgICAgICAgZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcbiAgICAgICAgbGV0IGJ1cm5kb3duQ2hhcnRPcHRpb25zID0gY2hhcnRPcHRpb25zO1xuICAgICAgICBidXJuZG93bkNoYXJ0T3B0aW9ucy5zY2FsZXMueUF4ZXNbMF0udGlja3Muc3VnZ2VzdGVkTWF4ID0gMTAgKiAoc3ByaW50LmR1cmF0aW9uICsgMSk7XG4gICAgICAgIC8vYnVybmRvd25DaGFydE9wdGlvbnMuc2NhbGVzLnlBeGVzWzFdLnRpY2tzLnN1Z2dlc3RlZE1heCA9IDEwICogKHNwcmludC5kdXJhdGlvbiArIDEpO1xuXG4gICAgICAgIGxldCBjaGFydE9iaiA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZVwiLFxuICAgICAgICAgICAgb3B0aW9uczogYnVybmRvd25DaGFydE9wdGlvbnMsIFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiBzcHJpbnQudmVsb2NpdHksXG4gICAgICAgICAgICBuYW1lOiBzcHJpbnQubmFtZSxcbiAgICAgICAgICAgIGJ1cm5kb3duOiBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgcmVtYWluaW5nOiBzcHJpbnQudmVsb2NpdHkgLSBfLnN1bShzcHJpbnQuYnVybmRvd24pLFxuICAgICAgICAgICAgbmVlZGVkOiAkZmlsdGVyKCdudW1iZXInKShzcHJpbnQudmVsb2NpdHkgLyBzcHJpbnQuZHVyYXRpb24sIDEpLFxuICAgICAgICAgICAgc3ByaW50OiBzcHJpbnRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydE9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudENoYXJ0KCkge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc3ByaW50cy4ka2V5QXQoc3ByaW50cy5sZW5ndGgtMSk7XG4gICAgICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IGN1cnJlbnQuc3BsaXQoXCJzXCIpWzFdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzLyR7Y3VycmVudH1gKSk7XG4gICAgICAgICAgICBjdXJyZW50U3ByaW50LiR3YXRjaChlPT4ge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3ByaW50OnVwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYnVpbGRCdXJuRG93bkNoYXJ0KGN1cnJlbnRTcHJpbnQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNwcmludENoYXJ0KHNwcmludE51bWJlcikge1xuICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGdldFNwcmludHMoc3ByaW50cz0+IHtcbiAgICAgICAgICAgIGxldCBzcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGBzcHJpbnRzL3Mke3NwcmludE51bWJlcn1gKSk7XG5cbiAgICAgICAgICAgIHNwcmludC4kd2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzcHJpbnQ6dXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShidWlsZEJ1cm5Eb3duQ2hhcnQoc3ByaW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTcHJpbnRzLFxuICAgICAgICBnZXRPdmVydmlld0NoYXJ0LFxuICAgICAgICBnZXRDdXJyZW50Q2hhcnQsXG4gICAgICAgIGdldFNwcmludENoYXJ0LFxuICAgICAgICBnZXRDYWNoZWRTcHJpbnRzXG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ1V0aWxpdHlTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFkKG4pIHtcbiAgICAgICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdW0oaXRlbXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB4IGluIGl0ZW1zKSBpICs9IGl0ZW1zW3hdO1xuICAgICAgICByZXR1cm4gaTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFkLFxuICAgICAgICBzdW1cbiAgICB9XG59KSJdfQ==
