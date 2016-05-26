var app = angular.module("afterburnerApp", ["firebase"]);
app.config(function () {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com",
    };
    firebase.initializeApp(config);
});

app.controller("afterburnerCtrl", function ($scope, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var ref = firebase.database().ref();

    $scope.init = () => {
        $scope.signin("thomas@boerdam.nl", "Batman01");
        $scope.initChart();
    }

    $scope.signin = (email, password) => {
        $scope.authData = null;

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
            $scope.authData = data;
            $scope.sprints = $firebaseArray(ref.child("sprints").orderByChild('order'));
            console.log($scope.sprints);
            $scope.sprints.$loaded(function () {
                $scope.updateChart();
            })
        });
    }

    $scope.addSprint = (velocity) => {
        $scope.sprints.$add({
            duration: 9,
            velocity: velocity
        });
    }

    $scope.updateChart = () => {
        var labels = $scope.sprints.map(function (d) {
            return d.name;
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
    }

    $scope.addBurndown = (points, sprint) => {

        var sprintKey = $scope.sprints.$keyAt(sprint);        
        var burndowns = $scope.sprints.$getRecord(sprintKey).burndown;
        burndowns.$add(points);
    }

    $scope.initChart = () => {
        $scope.chartCtx = document.getElementById("graph").getContext("2d");
        $scope.barChartData = {
            labels: ["Sprint 01", "Sprint 02", "Sprint 03", "Sprint 04", "Sprint 05", "Sprint 06", "Sprint 07"],
            datasets: [
              {
                label: "Gehaald",
                type:'line',
                data: [70, 75, 70, 55, 85, 50, 55],
                fill: false,
                borderColor: '#EB51D8',
                backgroundColor: '#EB51D8',
                pointBorderColor: '#EB51D8',
                pointBackgroundColor: '#EB51D8',
                pointHoverBackgroundColor: '#EB51D8',
                pointHoverBorderColor: '#EB51D8',
                yAxisID: 'y-axis-2',
            },{
                type: 'bar',
                label: "Geschat",
                data: [75, 80, 62, 70, 80, 50, 60],
                fill: false,
                backgroundColor: '#5FFAFC',
                borderColor: '#5FFAFC',
                hoverBackgroundColor: '#5CE5E7',
                hoverBorderColor: '#5CE5E7',
                yAxisID: 'y-axis-1',
            }]
        };

        $scope.myBar = new Chart($scope.chartCtx, {
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
                            color : "rgba(255,255,255,.1)",
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
                        gridLines:{
                            display: true,
                            color : "rgba(255,255,255,.1)",
                            drawTicks: false,
                        },
                        labels: {
                            show:true,
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
                        gridLines:{
                            display: false
                        },
                        labels: {
                            show:false,
                        }
                    }]
                }
            }
            });

        };
});