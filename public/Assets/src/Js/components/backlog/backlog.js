app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(BacklogService, SprintService, $firebaseAuth, $firebaseArray, FileService, $scope) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.formOpen = false;

        ctrl.state = {
            New: "0",
            Approved: "1",
            Done: "3",
            Removed: "4"
        };

        ctrl.filter = {};
        ctrl.open = true;

        BacklogService.getBacklog().then(data => {
            ctrl.BiItems = data;
            ctrl.reOrder();
        });

        SprintService.getSprints((sprints) => {
            ctrl.sprints = sprints;
        })

        $scope.customOrder = (key) => { 
            if (!ctrl.sprints) {
                return 0;
            }
            if(!key.sprint){
                return 9999;
            }

            return -ctrl.sprints.$getRecord(key.sprint).order;
        }

        ctrl.reOrder = (group) => {
            if (group) {
                group.forEach((item, index) => {
                    if (item.order !== index) {
                        item.order = index;
                        ctrl.saveItem(item);
                    }
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

        ctrl.selectItem = item => {
                ctrl.formOpen = true;
                ctrl.selectedItem = item;
                FileService.getAttachments(item).then((data) => {
                    ctrl.selectedItemAttachments = data;
                });
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
                ctrl.selectItem(ctrl.BiItems.$getRecord(data.key));
                ctrl.formOpen = true;
            });
        }

        ctrl.deleteItem = item => {
            let index = ctrl.BiItems.indexOf(item);
            let selectIndex = index === 0 ? 0 : index - 1;

            BacklogService.remove(item).then(() => {
                ctrl.selectItem(ctrl.BiItems[selectIndex]);
                ctrl.formOpen = false;
            });
        };

        ctrl.saveItem = (item) => {

            if (item.state == ctrl.state.Done) {
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

        ctrl.sortConfig = {
            animation: 150,
            handle: '.sortable-handle',
            group: 'backlogitems',
            onAdd(e) {
                let model = e.model;
                let sprint = e.models[0].sprint;
                if (model && model.sprint != sprint) {
                    var index = ctrl.BiItems.$indexFor(model.$id);
                    ctrl.BiItems[index].sprint = sprint;
                    ctrl.BiItems.$save(index);
                    ctrl.reOrder(e.models);
                }
            },
            onRemove(e) {
                ctrl.reOrder(e.models)
            },
            onUpdate(e) {
                ctrl.reOrder(e.models)
            }
        }
    },
    templateUrl: `${templatePath}/backlog.html`
});