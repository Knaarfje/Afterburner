app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<',
        itemKey: '<',
        biItems: '<'
    },
    controller(BacklogService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope, NotificationService, $location, SettingService) {
        let ctrl = this;
        let auth = $firebaseAuth();

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
        ctrl.$onInit = () => {
            if (ctrl.itemKey) {
                ctrl.selectItem(ctrl.biItems.$getRecord(ctrl.itemKey));
            };
            ctrl.viewMode = ctrl.settings.get('ViewMode', 0);
        };    
        //     }
        // });

        SprintService.getSprints((sprints) => {
            ctrl.sprints = sprints;
        }, true);

        $scope.customOrder = (key) => {
            if (!ctrl.sprints) {
                return 0;
            }
            if (!key.sprint) {
                return 9999;
            }

            return -ctrl.sprints.$getRecord(key.sprint).order;
        }

        ctrl.setViewMode = (mode) => {
            ctrl.viewMode = mode;
            ctrl.settings.set('ViewMode', mode);
        }

        ctrl.reOrder = (group, a) => {
            if (group) {
                ctrl.reordering = true;
                group.forEach((item, index) => {
                    var i = ctrl.biItems.$getRecord(item.$id);
                    i.$priority = index;
                    BacklogService.save(i).then();
                });
            }
        };

        ctrl.sumEffort = (items) => {
            var sum = 0;
            for (var i in items) {
                sum += items[i].effort;
            }

            return sum;
        };

        ctrl.orderBySprint = (key) => {
            if (!key) {
                return 99999;
            }
            return ctrl.sprints.$getRecord(key).order;
        }

        ctrl.selectItem = (item) => {
            ctrl.formOpen = true;
            ctrl.selectedItem = item;
            FileService.getAttachments(item).then((data) => {
                ctrl.selectedItemAttachments = data;
            });    
            $location.path(`/backlog/${item.$id}`);   
        }

        ctrl.addItem = () => {
            let newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: -1,
                state: 0,
                sprint: ""
            }

            BacklogService.add(newItem).then(data => {
                ctrl.selectItem(ctrl.biItems.$getRecord(data.key));
                ctrl.formOpen = true;
            });
        }

        ctrl.deleteItem = item => {
            let index = ctrl.biItems.indexOf(item);
            let selectIndex = index === 0 ? 0 : index - 1;

            BacklogService.remove(item).then(() => {
                ctrl.selectedItem = null;
                ctrl.formOpen = false;
            });
        };

        ctrl.saveItem = (item) => {

            if (item.state == ctrl.state.Done) {
                if (!item.resolvedOn) {
                    NotificationService.notify('Smells like fire...', `Work on "${item.name}" has been completed!`);
                }
                item.resolvedOn = item.resolvedOn || Date.now();
            }
            else {
                item.resolvedOn = null;
            }

            BacklogService.save(item).then(() => {
                ctrl.formOpen = false;
            });
        }

        ctrl.filterItems = x => {
            x == ctrl.filter.state
                ? ctrl.filter = { name: ctrl.filter.name }
                : ctrl.filter.state = x;
        }

        ctrl.dragOptions = {
            additionalPlaceholderClass: 'sortable-placeholder'
        }
        
        ctrl.updateOrder = (models, oldIndex, newIndex) => {
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
        }

        ctrl.sortConfig = {
            animation: 150,
            handle: '.sortable-handle',
            onAdd(e) {
                let model = e.model;
                let sprint = e.models[0].sprint;
                if (model && model.sprint != sprint) {
                    var index = ctrl.biItems.$indexFor(model.$id);
                    ctrl.biItems[index].sprint = sprint;
                    ctrl.biItems.$save(index);
                    ctrl.reOrder(e.models);
                }
            },
            onRemove(e) {
                ctrl.reOrder(e.models)
            },
            onUpdate(e) {
                ctrl.updateOrder(e.models, e.oldIndex, e.newIndex)
            }
        }
    },
    templateUrl: `${templatePath}/backlog.html`
});