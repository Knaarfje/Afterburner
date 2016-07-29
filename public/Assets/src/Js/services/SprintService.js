app.factory('SprintService', function($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    let _ = UtilityService;
    let ref = firebase.database().ref();
    let lineColor = '#EB51D8';
    let barColor = '#5FFAFC';
    let chartType = "line";

    let chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            mode: 'single',
            cornerRadius: 3,
        },
        elements: {
            line: {
                fill: false
            }
        },
        legend: {
            position: 'bottom',
            labels: {
                fontColor: '#fff'
            },
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false,
                    color: "rgba(255,255,255,.1)",
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
                    beginAtZero: true,
                    fontColor: '#fff',
                    suggestedMax: 100,
                },
                gridLines: {
                    display: true,
                    color: "rgba(255,255,255,.1)",
                    drawTicks: false,
                },
                labels: {
                    show: true,
                }
            }, 
            {
                type: "linear",
                display: false,
                position: "right",
                id: "y-axis-2",
                ticks: {
                    stepSize: 10,
                    beginAtZero: true,
                    fontColor: '#fff',
                    suggestedMax: 100,
                },
                gridLines: {
                    display: false
                },
                labels: {
                    show: false,
                }
            }]
        }
    }
    
    let overviewData = {
        labels: [], 
        datasets: [
            {
                type: 'line',
                label: "Estimated",
                data: [],
                fill: false,
                backgroundColor: lineColor,
                borderColor: lineColor,
                hoverBackgroundColor: '#5CE5E7',
                hoverBorderColor: '#5CE5E7',
                yAxisID: 'y-axis-1',
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
                yAxisID: 'y-axis-2',
            }
        ]
    };

    let burndownData = {
        labels: ["di", "wo", "do", "vr", "ma", "di", "wo", "do", "vr", "ma"],
        datasets: [
            {
                label: "Gehaald",
                type: 'line',
                data: [],
                fill: false,
                yAxisID: 'y-axis-2',
                borderColor: lineColor,
                backgroundColor: lineColor,
                pointBorderColor: lineColor,
                pointBackgroundColor: lineColor,
                pointHoverBackgroundColor: lineColor,
                pointHoverBorderColor: lineColor,
                hitRadius: 15,
                lineTension: 0
            }, 
            {
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
            }
        ]
    };

    function getSprints(cb) {
        let sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(15));
        sprints.$loaded(cb, ()=> $location.path('/signin'))
    }

    function getOverviewChart() {
        let deferred = $q.defer();

        getSprints(sprints => {

            sprints.$loaded(() => {
                updateOverviewChart(deferred, sprints);                

                sprints.$watch(() => {
                    $rootScope.$broadcast('sprint:update');    
                    updateOverviewChart(deferred, sprints);
                });    
            });


        });

        return deferred.promise;
    }

    function updateOverviewChart(deferred, sprints) {

        let labels;
        let estimated;
        let burned;

        labels = sprints.map(d => `Sprint ${_.pad(d.order)}`);
        estimated = sprints.map(d => d.velocity);
        burned = sprints.map(d => {
            let i = 0;
            for (var x in d.burndown) i = i + d.burndown[x];
            return i;
        });

        let data = overviewData;
        data.labels = labels;
        data.datasets[1].data = burned;
        data.datasets[0].data = estimated;

        let currentSprint = sprints[sprints.length - 1];

        let chartObj = {
            type: "bar",
            options: chartOptions,
            data: data,
            velocity: currentSprint.velocity,
            burndown: _.sum(currentSprint.burndown),
            remaining: currentSprint.velocity - _.sum(currentSprint.burndown),
            needed: $filter('number')(currentSprint.velocity / currentSprint.duration, 1)
        }
                
        deferred.resolve(chartObj);
    }

    function buildBurnDownChart(sprint) {
        let idealBurndown = burndownData.labels.map((d, i) => {
            if (i === burndownData.labels.length - 1) {
                return sprint.velocity.toFixed(2);
            }
            return ((sprint.velocity / 9) * i).toFixed(2);
        }).reverse();

        let velocityRemaining = sprint.velocity
        let graphableBurndown = [];

        for (let x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };

        let data = burndownData;
        data.datasets[0].data = graphableBurndown;
        data.datasets[1].data = idealBurndown;

        let chartObj = { 
            type: "line",
            options: chartOptions, 
            data: data,
            velocity: sprint.velocity,
            name: sprint.name,
            burndown: _.sum(sprint.burndown),
            remaining: sprint.velocity - _.sum(sprint.burndown),
            needed: $filter('number')(sprint.velocity / sprint.duration, 1)
        }

        return chartObj;
    };

    function getCurrentChart() {
        let deferred = $q.defer();

        getSprints(sprints=> {
            let current = sprints.$keyAt(sprints.length-1);
            let currentNumber = current.split("s")[1];
            let currentSprint = $firebaseObject(ref.child(`sprints/${current}`));
            currentSprint.$watch(e=> {
                $rootScope.$broadcast('sprint:update');
                deferred.resolve(buildBurnDownChart(currentSprint));
            })
        });

        return deferred.promise;
    }

    function getSprintChart(sprintNumber) {
        let deferred = $q.defer();

        getSprints(sprints=> {
            let sprint = $firebaseObject(ref.child(`sprints/s${sprintNumber}`));

            sprint.$watch(e => {
                $rootScope.$broadcast('sprint:update');
                deferred.resolve(buildBurnDownChart(sprint));
            })
        });

        return deferred.promise;
    }

    return {
        getSprints,
        getOverviewChart,
        getCurrentChart,
        getSprintChart
    }
});