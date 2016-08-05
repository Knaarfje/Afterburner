app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(BacklogService, SprintService, $firebaseAuth) {
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

        BacklogService.getBacklog().then(data=> {
            ctrl.BiItems = data;
            ctrl.reOrder();
        });

        SprintService.getSprints((sprints) => {
            ctrl.sprints = sprints;
        })

        ctrl.reOrder =()=> ctrl.BiItems.forEach((item, index)=> {
            if(item.order !== index) { 
                item.order = index;
                ctrl.saveItem(item);
            }
        });

        ctrl.selectItem =item=> {
            ctrl.formOpen = true;
            ctrl.selectedItem = item;
        }

        ctrl.addItem =()=> {
            let newItem = {
                name: "Nieuw...",
                effort: 0,
                description: "",
                order: 0,
                state: 0,
                sprint: ""
            }

            BacklogService.add(newItem).then(data=> {
                ctrl.selectItem(ctrl.BiItems.$getRecord(data.key));
                ctrl.formOpen = true;
            });
        }

        ctrl.deleteItem =item=> {
            let index = ctrl.BiItems.indexOf(item);
            let selectIndex = index === 0 ? 0 : index-1;

            BacklogService.remove(item).then(()=> {
                ctrl.selectItem(ctrl.BiItems[selectIndex]);
                ctrl.formOpen = false;
            });
        };

        ctrl.saveItem = (item) => {

            if (item.state == ctrl.state.Done) {
                item.resolvedOn = Date.now();
            }
            else{
                item.resolvedOn = null;
            }

            BacklogService.save(item).then(()=> {
                ctrl.formOpen = false;
            });
        }

        ctrl.filterItems =x=> {
            x == ctrl.filter.state
                ? ctrl.filter = {name: ctrl.filter.name}
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