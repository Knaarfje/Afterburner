app.factory('SprintService', function($rootScope, $firebaseArray, $firebaseObject, UtilityService, $q, $filter, $location, $timeout) {
    let _ = UtilityService;
    let ref = firebase.database().ref();
    let lineColor = '#EB51D8';
    let barColor = '#5FFAFC';
    let chartType = "line";
    let cachedSprints;

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
            display: false
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
                    suggestedMax: null,
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
                label: "Average",
                data: [],
                fill: false,
                backgroundColor: "#58F484",
                borderColor: "#58F484",
                hoverBackgroundColor: '#58F484',
                hoverBorderColor: '#58F484',
                yAxisID: 'y-axis-1',
            },
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
        labels: ["di", "wo", "do", "vr", "ma", "di ", "wo ", "do ", "vr ", "ma "],
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
        let sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(9));
        sprints.$loaded(cb, ()=> $location.path('/signin'))
    }

    function getCachedSprints() {
        return cachedSprints;
    }

    function getOverviewChart() {
        let deferred = $q.defer();

        getSprints(sprints => {

            sprints.$loaded(() => {
                
                cachedSprints = sprints;
                updateOverviewChart(deferred, sprints);
                sprints.$watch(() => {
                    cachedSprints = sprints;
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
        let average = [];

        labels = sprints.map(d => `Sprint ${_.pad(d.order)}`);
        estimated = sprints.map(d => d.velocity);
        burned = sprints.map(d => {
            let i = 0;
            for (var x in d.burndown) i = i + d.burndown[x];
            return i;
        });

        var sum = 0;
        for (var i = 0; i < burned.length - 1; i++) {
            sum += parseInt(burned[i], 10); //don't forget to add the base
        }
        var avg = sum / (burned.length - 1);
        for (var i = 0; i < sprints.length; i++) {
            average.push(avg);
        }

        let data = overviewData;
        data.labels = labels;
        data.datasets[2].data = burned;
        data.datasets[1].data = estimated;
        data.datasets[0].data = average;

        let overviewChartOptions = chartOptions;
        overviewChartOptions.scales.yAxes[0].ticks.suggestedMax = 100;
        overviewChartOptions.scales.yAxes[1].ticks.suggestedMax = 100;

        let currentSprint = sprints[sprints.length - 1];

        let chartObj = {
            type: "bar",
            options: overviewChartOptions,
            data: data,
            velocity: currentSprint.velocity,
            burndown: _.sum(currentSprint.burndown),
            remaining: currentSprint.velocity - _.sum(currentSprint.burndown),
            needed: $filter('number')(currentSprint.velocity / currentSprint.duration, 1)
        }
                
        deferred.resolve(chartObj);
    }

    function buildBurnDownChart(sprint) {
        let labels = ["di", "wo", "do", "vr", "ma", "di ", "wo ", "do ", "vr ", "ma "].slice(0,sprint.duration +1)

        let idealBurndown = labels.map((d, i) => {
            if (i === labels.length - 1) {
                return sprint.velocity.toFixed(2);
            }
            return ((sprint.velocity / sprint.duration) * i).toFixed(2);
        }).reverse();

        let velocityRemaining = sprint.velocity
        let graphableBurndown = [];

        for (let x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };

        let data = burndownData;
        data.labels = labels;
        data.datasets[0].data = graphableBurndown;
        data.datasets[1].data = idealBurndown;
        let burndownChartOptions = chartOptions;
        burndownChartOptions.scales.yAxes[0].ticks.suggestedMax = 10 * (sprint.duration + 1);
        burndownChartOptions.scales.yAxes[1].ticks.suggestedMax = 10 * (sprint.duration + 1);

        let chartObj = {
            type: "line",
            options: burndownChartOptions, 
            data: data,
            velocity: sprint.velocity,
            name: sprint.name,
            burndown: _.sum(sprint.burndown),
            remaining: sprint.velocity - _.sum(sprint.burndown),
            needed: $filter('number')(sprint.velocity / sprint.duration, 1),
            sprint: sprint
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
        getSprintChart,
        getCachedSprints
    }
});