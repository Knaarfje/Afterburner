app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
        let auth = $firebaseAuth();

        ctrl.state = {
            New: 0,
            Approved: 1,
            Done: 3,
            Removed: -1
        };

        ctrl.filter = {};
        ctrl.open = true;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

        ctrl.selectItem = (item) => {
            ctrl.selectedItem = item;
        }

        ctrl.addItem = () => {
            var newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: 0,
                state: 0
            }

            BacklogService.add(newItem).then((data) => {
                ctrl.selectItem(ctrl.BiItems.$getRecord(data.key));
            });
        }

        ctrl.deleteItem = (item) => {
            BacklogService.remove(item);
        }

        ctrl.saveItem = (item) => {
            BacklogService.save(item);
        }

        ctrl.filterItems = function (x) {
            if (x == ctrl.filter.state) {
                ctrl.filter.state = null;
            } else {
                ctrl.filter.state = x;
            }
        }
    },
    templateUrl: `${templatePath}/backlog.html`
});  