app.component('backlog', {
    bindings: {
        title: '<',
        backTitle: '<'
    },
    controller(BacklogService) {
        let ctrl = this;

        ctrl.state = {
            New: 0,
            Approved: 1,
            Done: 3,
            Removed: -1
        };

        ctrl.open = true;
        ctrl.filterState;

        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });

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
    },
    templateUrl: `${templatePath}/backlog.html` 
});  