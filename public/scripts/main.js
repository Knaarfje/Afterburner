var app = angular.module("afterburnerApp", ["firebase", 'ngTouch']);
app.config(function () {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
    };
    firebase.initializeApp(config);
});

app.controller("afterburnerCtrl", function ($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $timeout) {
    var ref = firebase.database().ref();
    $timeout(function () {
        $scope.currentUser = firebase.auth().currentUser;
        $scope.init();
    }, 500);


    $scope.init = () => {
        if ($scope.currentUser) {
            $scope.initApp();
        }
    }

    $scope.signin = (email, password) => {
        $scope.authData = null;

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
            $scope.authData = data;
            $scope.currentUser = firebase.auth().currentUser;

            $scope.initApp();
        });
    }

    $scope.initApp = () => {
        $scope.initChart();
        
        $scope.sprints = $firebaseArray(ref.child("sprints").orderByChild('order').limitToLast(15));

        $scope.sprints.$watch(function (e) {
            if ($scope.myBar && $scope.myBar.config.type == 'bar') {
                $scope.updateChart();
            }
        });

        $scope.sprints.$loaded(function (e) {
            var k = $scope.sprints.$keyAt($scope.sprints.length - 1);
            $scope.lastSprint = $firebaseObject(ref.child("sprints/" + k));
        });
    }

    $scope.toOverview = () => {
        if ($scope.selectedSprint) {
            $scope.initChart();
            $scope.updateChart();
            $scope.selectedSprint.$destroy();
            $scope.selectedSprint = null;
        }
    }

    $scope.selectSprint = (index) => {
        if ($scope.selectedSprint) {
            $scope.selectedSprint.$destroy();
        }
        
        var k = $scope.sprints.$keyAt(index);
        $scope.selectedSprint = $firebaseObject(ref.child("sprints/" + k));

        $scope.selectedSprint.$watch(function (e) {
            if ($scope.myBar && $scope.myBar.config.type == 'line') {
                $scope.updateBurndownChart($scope.selectedSprint);
            }
        });        
        $scope.selectedSprint.$loaded().then(function () {
            $scope.initBurndownChart($scope.selectedSprint);
        });
    }

    document.getElementById("graph").onclick = function (evt) {
        var activePoints = $scope.myBar.getElementsAtEvent(evt);
        var index = ('test:', activePoints[1]._index);

        $scope.selectSprint(index);
    };


    $scope.addBurndown = (points, sprint) => {

        var sprintKey = $scope.sprints.$keyAt(sprint);
        var burndowns = $scope.sprints.$getRecord(sprintKey).burndown;
        burndowns.$add(points);
    }

    $scope.initChart = () => {
        var chartCtx = document.getElementById("graph").getContext("2d");
        $scope.barChartData = {
            labels: [],
            datasets: [
                {
                    label: "Achieved",
                    type: 'line',
                    data: [],
                    fill: false,
                    borderColor: '#EB51D8',
                    backgroundColor: '#EB51D8',
                    pointBorderColor: '#EB51D8',
                    pointBackgroundColor: '#EB51D8',
                    pointHoverBackgroundColor: '#EB51D8',
                    pointHoverBorderColor: '#EB51D8',
                    yAxisID: 'y-axis-2',
                }, {
                    type: 'bar',
                    label: "Estimated",
                    data: [],
                    fill: false,
                    backgroundColor: '#5FFAFC',
                    borderColor: '#5FFAFC',
                    hoverBackgroundColor: '#5CE5E7',
                    hoverBorderColor: '#5CE5E7',
                    yAxisID: 'y-axis-1',
                }]
        };

        if ($scope.myBar) {
            $scope.myBar.destroy();
        }

        $scope.myBar = new Chart(chartCtx, {
            type: 'bar',
            data: $scope.barChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'label',
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
                    }, {
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
        });
    };

    $scope.updateChart = () => {

        var labels = $scope.sprints.map(function (d) {
            return "Sprint " + pad(d.order);
        });
        var estimated = $scope.sprints.map(function (d) {
            return d.velocity;
        });
        var burned = $scope.sprints.map(function (d) {
            var i = 0;
            for (var x in d.burndown) {
                i = i + d.burndown[x];
            }
            return i;
        });

        $scope.myBar.data.labels = labels;
        $scope.myBar.data.datasets[0].data = burned;
        $scope.myBar.data.datasets[1].data = estimated;

        $scope.myBar.update();
    };

    /// BURNDOWN CHART
    /// INIT
    $scope.initBurndownChart = (sprint) => {
        var burndownData = {
            labels: ["di", "wo", "do", "vr", "ma", "di", "wo", "do", "vr"],
            datasets: [
                {
                    label: "Gehaald",
                    type: 'line',
                    data: [],
                    fill: false,
                    yAxisID: 'y-axis-2',
                    borderColor: '#5FFAFC',
                    backgroundColor: '#5FFAFC',
                    pointBorderColor: '#5FFAFC',
                    pointBackgroundColor: '#5FFAFC',
                    pointHoverBackgroundColor: '#5FFAFC',
                    pointHoverBorderColor: '#5FFAFC',
                    hitRadius: 15,
                    lineTension: 0
                }, {
                    type: 'line',
                    label: "Mean Burndown",
                    data: [],
                    fill: false,
                    yAxisID: 'y-axis-1',
                    borderColor: '#EB51D8',
                    backgroundColor: '#EB51D8',
                    pointBorderColor: '#EB51D8',
                    pointBackgroundColor: '#EB51D8',
                    pointHoverBackgroundColor: '#EB51D8',
                    pointHoverBorderColor: '#EB51D8',
                    hitRadius: 15,
                    lineTension: 0
                }]
        };
        

        var idealBurndown = burndownData.labels.map(function (d, i) {
            if (i == burndownData.labels.length - 1) {
                return sprint.velocity;
            }
            return (sprint.velocity / 8) * i;
        }).reverse();
        burndownData.datasets[1].data = idealBurndown;

        var velocityRemaining = sprint.velocity
        var graphableBurndown = [];

        for (var x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };


        burndownData.datasets[1].data = idealBurndown;
        burndownData.datasets[0].data = graphableBurndown;

        if ($scope.myBar) {
            $scope.myBar.destroy();
        }

        $scope.myBar = new Chart(document.getElementById("graph").getContext("2d"), {
            type: 'line',
            data: burndownData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'label',
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
                    }, {
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
        });
    }

/// UPDATE
    $scope.updateBurndownChart = (sprint) => {
        
        var idealBurndown = $scope.myBar.data.labels.map(function (d, i) {
            if (i == $scope.myBar.data.labels.length - 1) {
                return sprint.velocity;
            }
            return (sprint.velocity / 8) * i;
        }).reverse();

        var velocityRemaining = sprint.velocity
        var graphableBurndown = [];

        for (var x in sprint.burndown) {
            velocityRemaining -= sprint.burndown[x];
            graphableBurndown.push(velocityRemaining);
        };

        $scope.myBar.data.datasets[0].data = graphableBurndown;
        $scope.myBar.data.datasets[1].data = idealBurndown;

        $scope.myBar.update();
    };

    $scope.sum = function (items) {
        var i = 0;
        for (var x in items) {
            i = i + items[x];
        }
        return i;
    }
});

function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

// box-shadow: 0px 2px 6px 0px rgba(95,250,252,0.37), 
//             0px 2px 24px 0px rgba(95,250,252,0.48), 
//             -5px 9px 14px 0px rgba(0,0,0,0.50), 
//             0px 2px 4px 0px rgba(0,0,0,0.50);