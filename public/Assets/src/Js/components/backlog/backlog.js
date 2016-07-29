app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(BacklogService, $firebaseAuth) {
        let ctrl = this;
<<<<<<< HEAD
=======
        let auth = $firebaseAuth();
>>>>>>> d85e579975611df4c38e4873c573c7bf81e26410

        ctrl.state = {
            New: 0,
            Approved: 1,
            Done: 3,
            Removed: -1
        };

        ctrl.filter = {};
        ctrl.open = true;
        ctrl.filterState;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

<<<<<<< HEAD
        ctrl.addBI =()=> {
            ctrl.BiItems.push({
                name: ctrl.newBIname, 
                points: 2, 
                state: 'approved'
            })
        };
        
        ctrl.filterStates =x=> {
            ctrl.filterState = x == ctrl.filterState ? "" : x;
        };

        ctrl.itemsToAdd = [{
            name: '',
            points: '',
            state: ''
        }];

        ctrl.add =itemToAdd=> {
            let index = ctrl.itemsToAdd.indexOf(itemToAdd);

            ctrl.itemsToAdd.splice(index, 1);
            ctrl.BiItems.push(angular.copy(itemToAdd))
        }

        ctrl.addNew =()=> {
            ctrl.itemsToAdd.push({
                name: '',
                points: '',
                state: ''
            })
        };
=======
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
>>>>>>> d85e579975611df4c38e4873c573c7bf81e26410
    },
    templateUrl: `${templatePath}/backlog.html`
});  