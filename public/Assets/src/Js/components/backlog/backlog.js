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


        console.log(BacklogService)        
        BacklogService.getBacklog().then(function (data) {
            ctrl.BiItems = data;
        });


    ctrl.addBI = function() {
        ctrl.BiItems.push({name: ctrl.newBIname,points: 2,state: 'approved'})
    }

    ctrl.filterState;
    ctrl.filterStates = function(x) {
        if(x == ctrl.filterState){
            ctrl.filterState = "";
        }else{
            ctrl.filterState = x;
        }
    }

    ctrl.itemsToAdd = [{
        name: '',
        points: '',
        state: ''
    }];

    ctrl.add = function(itemToAdd) {

        var index = ctrl.itemsToAdd.indexOf(itemToAdd);

        ctrl.itemsToAdd.splice(index, 1);

        ctrl.BiItems.push(angular.copy(itemToAdd))
    }

    ctrl.addNew = function() {

        ctrl.itemsToAdd.push({
            name: '',
            points: '',
            state: ''
        })
    }


    },
    templateUrl: `${templatePath}/backlog.html` 
});  