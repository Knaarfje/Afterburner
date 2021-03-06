if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('scripts/serviceworker.js');
}

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

app.controller("AfterburnerCtrl", function ($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $timeout) {
    const ctrl = this;
   
    var ref = firebase.database().ref();
    $timeout(function () {
        $scope.currentUser = firebase.auth().currentUser;
        ctrl.init();
    }, 500);


    ctrl.init = () => {
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

    $scope.signout = () => {
        firebase.auth().signOut().then(function () {
            $scope.currentUser = null;
        }, function (error) {
            // An error happened.
        });
    }

    $scope.initApp = () => {
        $timeout(function(){
            $scope.initChart();    
        });
        
        
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
            
        $timeout(function(){
            $scope.initChart();
            $scope.updateChart();
        });
            $scope.selectedSprint.$destroy();
            $scope.selectedSprint = null;
        }
    }

    $scope.selectSprint = (index) => {
        if (index < 0) {
            return;
        }

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
        if ($scope.selectedSprint) {
            return;
        }
        
        var activePoints = $scope.myBar.getElementsAtEvent(evt);
        if (activePoints && activePoints.length > 1) {
            var index = activePoints[1]._index;
            $scope.selectSprint(index);
        }
    };


    $scope.addBurndown = (points, sprint) => {
        var sprintKey = $scope.sprints.$keyAt(sprint);
        var burndowns = $scope.sprints.$getRecord(sprintKey).burndown;
        burndowns.$add(points);
    }
    
    var lineColor = '#EB51D8',
        barColor = '#5FFAFC';

    $scope.initChart = () => {
        var chartCtx = document.getElementById("graph").getContext("2d");
        $scope.barChartData = {
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
                },{
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
        $scope.myBar.data.datasets[1].data = burned;
        $scope.myBar.data.datasets[0].data = estimated;

        $scope.myBar.update();
    };

    /// BURNDOWN CHART
    /// INIT
    $scope.initBurndownChart = (sprint) => {
        var burndownData = {
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
                }, {
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
                }]
        };
        

        var idealBurndown = burndownData.labels.map(function (d, i) {
            if (i == burndownData.labels.length - 1) {
                return sprint.velocity;
            }
            return (sprint.velocity / 9) * i;
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
                            maxTicksLimit: 20
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