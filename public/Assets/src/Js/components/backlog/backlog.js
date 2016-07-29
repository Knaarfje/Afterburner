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
        ctrl.filterState;

        BacklogService.getBacklog().then(data=> {
            ctrl.BiItems = data;
            ctrl.reOrder();
        });

        ctrl.saveItem =item=> BacklogService.save(item);

        ctrl.reOrder =()=> ctrl.BiItems.forEach((item, index)=> {
            if(item.order !== index) {
                item.order = index;
                ctrl.saveItem(item);
            }
        });

        ctrl.addBI =()=> ctrl.BiItems.push({
            name: ctrl.newBIname, 
            points: 2, 
            state: 'approved'
        });
        
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

        ctrl.addNew =()=> ctrl.itemsToAdd.push({
            name: '',
            points: '',
            state: ''
        });

        ctrl.selectItem =item=> ctrl.selectedItem = item;

        ctrl.addItem =()=> {
            var newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: 0,
                state: 0
            }

            BacklogService.add(newItem).then(data=> {
                ctrl.selectItem(ctrl.BiItems.$getRecord(data.key));
            });
        }

        ctrl.deleteItem =item=> {
            let index = ctrl.BiItems.indexOf(item);
            let selectIndex = index === 0 ? 0 : index-1;

            BacklogService.remove(item).then(()=> {
                ctrl.selectItem(ctrl.BiItems[selectIndex])
            });
        }

        ctrl.filterItems =x=> {
            x == ctrl.filter.state
                ? ctrl.filter.state = null
                : ctrl.filter.state = x;
        } 

        ctrl.sortConfig = {
            animation: 150,
            onSort(e) {
                ctrl.reOrder()
            }
        }
    },
    templateUrl: `${templatePath}/backlog.html`
});  