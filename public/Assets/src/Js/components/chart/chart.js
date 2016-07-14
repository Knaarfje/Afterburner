app.component('chart', {
    bindings: {
        options: '<',
        data: '<',
        loaded: '<',
        type: '<'
    },
    controller($element, $scope, $timeout, $location) {
        let ctrl = this;
        let $canvas = $element[0].querySelector("canvas");

        ctrl.chart;

        function init() {
            if(ctrl.chart) ctrl.chart.destroy();

            ctrl.chart = new Chart($canvas, {
                type: ctrl.type,
                data: ctrl.data,
                options: ctrl.options
            });

            if ($location.path() === '/') {
                $canvas.onclick =e=> {
                    let activePoints = ctrl.chart.getElementsAtEvent(e);
                    if (activePoints && activePoints.length > 1) {
                        let clickedSprint = activePoints[1]._index + 1;
                        $timeout(()=> $location.path(`/sprint/${clickedSprint}`))
                    }
                };
            }
        }

        $scope.$watch(()=> ctrl.loaded, loaded=> {
            if(!loaded) return;
            init();
        })
    },
    template: `<canvas></canvas>` 
}) 