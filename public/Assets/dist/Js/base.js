"use strict";

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
}*/
"use strict";

particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.1,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.01,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 10,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.05,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": {
          "opacity": .1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 5,
        "opacity": .1,
        "speed": 300
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 3
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJQYXJ0aWNsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3pELEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWTtBQUNuQixRQUFJLE1BQU0sR0FBRztBQUNULGNBQU0sRUFBRSx5Q0FBeUM7QUFDakQsa0JBQVUsRUFBRSw2Q0FBNkM7QUFDekQsbUJBQVcsRUFBRSxvREFBb0Q7QUFDakUscUJBQWEsRUFBRSx5Q0FBeUM7S0FDM0QsQ0FBQztBQUNGLFlBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbEMsQ0FBQyxDQUFDO0FBQ0gsR0FBRyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFVO0FBQ3hDLFdBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7Q0FDdEIsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1hILFdBQVcsQ0FBQyxjQUFjLEVBQUU7QUFDMUIsYUFBVyxFQUFFO0FBQ1gsWUFBUSxFQUFFO0FBQ1IsYUFBTyxFQUFFLEVBQUU7QUFDWCxlQUFTLEVBQUU7QUFDVCxnQkFBUSxFQUFFLElBQUk7QUFDZCxvQkFBWSxFQUFFLEdBQUc7T0FDbEI7S0FDRjtBQUNELFdBQU8sRUFBRTtBQUNQLGFBQU8sRUFBRSxTQUFTO0tBQ25CO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsWUFBTSxFQUFFLFFBQVE7QUFDaEIsY0FBUSxFQUFFO0FBQ1IsZUFBTyxFQUFFLENBQUM7QUFDVixlQUFPLEVBQUUsU0FBUztPQUNuQjtBQUNELGVBQVMsRUFBRTtBQUNULGtCQUFVLEVBQUUsQ0FBQztPQUNkO0FBQ0QsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLGdCQUFnQjtBQUN2QixlQUFPLEVBQUUsR0FBRztBQUNaLGdCQUFRLEVBQUUsR0FBRztPQUNkO0tBQ0Y7QUFDRCxhQUFTLEVBQUU7QUFDVCxhQUFPLEVBQUUsR0FBRztBQUNaLGNBQVEsRUFBRSxLQUFLO0FBQ2YsWUFBTSxFQUFFO0FBQ04sZ0JBQVEsRUFBRSxLQUFLO0FBQ2YsZUFBTyxFQUFFLENBQUM7QUFDVixxQkFBYSxFQUFFLElBQUk7QUFDbkIsY0FBTSxFQUFFLEtBQUs7T0FDZDtLQUNGO0FBQ0QsVUFBTSxFQUFFO0FBQ04sYUFBTyxFQUFFLENBQUM7QUFDVixjQUFRLEVBQUUsSUFBSTtBQUNkLFlBQU0sRUFBRTtBQUNOLGdCQUFRLEVBQUUsS0FBSztBQUNmLGVBQU8sRUFBRSxFQUFFO0FBQ1gsa0JBQVUsRUFBRSxHQUFHO0FBQ2YsY0FBTSxFQUFFLEtBQUs7T0FDZDtLQUNGO0FBQ0QsaUJBQWEsRUFBRTtBQUNiLGNBQVEsRUFBRSxJQUFJO0FBQ2QsZ0JBQVUsRUFBRSxHQUFHO0FBQ2YsYUFBTyxFQUFFLFNBQVM7QUFDbEIsZUFBUyxFQUFFLElBQUk7QUFDZixhQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0QsVUFBTSxFQUFFO0FBQ04sY0FBUSxFQUFFLElBQUk7QUFDZCxhQUFPLEVBQUUsQ0FBQztBQUNWLGlCQUFXLEVBQUUsTUFBTTtBQUNuQixjQUFRLEVBQUUsS0FBSztBQUNmLGdCQUFVLEVBQUUsS0FBSztBQUNqQixnQkFBVSxFQUFFLEtBQUs7QUFDakIsY0FBUSxFQUFFLEtBQUs7QUFDZixlQUFTLEVBQUU7QUFDVCxnQkFBUSxFQUFFLEtBQUs7QUFDZixpQkFBUyxFQUFFLEdBQUc7QUFDZCxpQkFBUyxFQUFFLElBQUk7T0FDaEI7S0FDRjtHQUNGO0FBQ0QsaUJBQWUsRUFBRTtBQUNmLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLFlBQVEsRUFBRTtBQUNSLGVBQVMsRUFBRTtBQUNULGdCQUFRLEVBQUUsSUFBSTtBQUNkLGNBQU0sRUFBRSxNQUFNO09BQ2Y7QUFDRCxlQUFTLEVBQUU7QUFDVCxnQkFBUSxFQUFFLElBQUk7QUFDZCxjQUFNLEVBQUUsTUFBTTtPQUNmO0FBQ0QsY0FBUSxFQUFFLElBQUk7S0FDZjtBQUNELFdBQU8sRUFBRTtBQUNQLFlBQU0sRUFBRTtBQUNOLGtCQUFVLEVBQUUsR0FBRztBQUNmLHFCQUFhLEVBQUU7QUFDYixtQkFBUyxFQUFFLEVBQUU7U0FDZDtPQUNGO0FBQ0QsY0FBUSxFQUFFO0FBQ1Isa0JBQVUsRUFBRSxHQUFHO0FBQ2YsY0FBTSxFQUFFLEVBQUU7QUFDVixrQkFBVSxFQUFFLENBQUM7QUFDYixpQkFBUyxFQUFFLEVBQUU7QUFDYixlQUFPLEVBQUUsR0FBRztPQUNiO0FBQ0QsZUFBUyxFQUFFO0FBQ1Qsa0JBQVUsRUFBRSxHQUFHO0FBQ2Ysa0JBQVUsRUFBRSxHQUFHO09BQ2hCO0FBQ0QsWUFBTSxFQUFFO0FBQ04sc0JBQWMsRUFBRSxDQUFDO09BQ2xCO0FBQ0QsY0FBUSxFQUFFO0FBQ1Isc0JBQWMsRUFBRSxDQUFDO09BQ2xCO0tBQ0Y7R0FDRjtBQUNELGlCQUFlLEVBQUUsSUFBSTtDQUN0QixDQUFDLENBQUMiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCJdKTtcbmFwcC5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcbmFwcC5jb250cm9sbGVyKFwiYWZ0ZXJidXJuZXJDdHJsXCIsIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coJ2luaXQnKVxufSk7ICBcbi8qXG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZShcImFmdGVyYnVybmVyQXBwXCIsIFtcImZpcmViYXNlXCJdKTtcbmFwcC5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDSXp5Q0VZUmpTNHVmaGVkeHdCNHZDQzlsYTUyR3NyWE1cIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJwcm9qZWN0LTc3ODQ4MTE4NTEyMzI0MzE5NTQuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoXCJhZnRlcmJ1cm5lckN0cmxcIiwgZnVuY3Rpb24gKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgJHRpbWVvdXQpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50VXNlciA9IGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlcjtcbiAgICAgICAgJHNjb3BlLmluaXQoKTtcbiAgICB9LCA1MDApO1xuXG5cbiAgICAkc2NvcGUuaW5pdCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCRzY29wZS5jdXJyZW50VXNlcikge1xuICAgICAgICAgICAgJHNjb3BlLmluaXRBcHAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS5zaWduaW4gPSAoZW1haWwsIHBhc3N3b3JkKSA9PiB7XG4gICAgICAgICRzY29wZS5hdXRoRGF0YSA9IG51bGw7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLnNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmF1dGhEYXRhID0gZGF0YTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciA9IGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlcjtcblxuICAgICAgICAgICAgJHNjb3BlLmluaXRBcHAoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmluaXRBcHAgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5pbml0Q2hhcnQoKTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5zcHJpbnRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKFwic3ByaW50c1wiKS5vcmRlckJ5Q2hpbGQoJ29yZGVyJykubGltaXRUb0xhc3QoMTUpKTtcblxuICAgICAgICAkc2NvcGUuc3ByaW50cy4kd2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubXlCYXIgJiYgJHNjb3BlLm15QmFyLmNvbmZpZy50eXBlID09ICdiYXInKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5zcHJpbnRzLiRsb2FkZWQoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBrID0gJHNjb3BlLnNwcmludHMuJGtleUF0KCRzY29wZS5zcHJpbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgJHNjb3BlLmxhc3RTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKFwic3ByaW50cy9cIiArIGspKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnRvT3ZlcnZpZXcgPSAoKSA9PiB7XG4gICAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRTcHJpbnQpIHtcbiAgICAgICAgICAgICRzY29wZS5pbml0Q2hhcnQoKTtcbiAgICAgICAgICAgICRzY29wZS51cGRhdGVDaGFydCgpO1xuICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkU3ByaW50LiRkZXN0cm95KCk7XG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLnNlbGVjdFNwcmludCA9IChpbmRleCkgPT4ge1xuICAgICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkU3ByaW50KSB7XG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQuJGRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGsgPSAkc2NvcGUuc3ByaW50cy4ka2V5QXQoaW5kZXgpO1xuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKFwic3ByaW50cy9cIiArIGspKTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQuJHdhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLm15QmFyICYmICRzY29wZS5teUJhci5jb25maWcudHlwZSA9PSAnbGluZScpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlQnVybmRvd25DaGFydCgkc2NvcGUuc2VsZWN0ZWRTcHJpbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgICAgICAgIFxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmluaXRCdXJuZG93bkNoYXJ0KCRzY29wZS5zZWxlY3RlZFNwcmludCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ3JhcGhcIikub25jbGljayA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgdmFyIGFjdGl2ZVBvaW50cyA9ICRzY29wZS5teUJhci5nZXRFbGVtZW50c0F0RXZlbnQoZXZ0KTtcbiAgICAgICAgdmFyIGluZGV4ID0gKCd0ZXN0OicsIGFjdGl2ZVBvaW50c1sxXS5faW5kZXgpO1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RTcHJpbnQoaW5kZXgpO1xuICAgIH07XG5cblxuICAgICRzY29wZS5hZGRCdXJuZG93biA9IChwb2ludHMsIHNwcmludCkgPT4ge1xuXG4gICAgICAgIHZhciBzcHJpbnRLZXkgPSAkc2NvcGUuc3ByaW50cy4ka2V5QXQoc3ByaW50KTtcbiAgICAgICAgdmFyIGJ1cm5kb3ducyA9ICRzY29wZS5zcHJpbnRzLiRnZXRSZWNvcmQoc3ByaW50S2V5KS5idXJuZG93bjtcbiAgICAgICAgYnVybmRvd25zLiRhZGQocG9pbnRzKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuaW5pdENoYXJ0ID0gKCkgPT4ge1xuICAgICAgICB2YXIgY2hhcnRDdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyYXBoXCIpLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgJHNjb3BlLmJhckNoYXJ0RGF0YSA9IHtcbiAgICAgICAgICAgIGxhYmVsczogW10sXG4gICAgICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiQWNoaWV2ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFQjUxRDgnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMicsXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiRXN0aW1hdGVkXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzVGRkFGQycsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzVGRkFGQycsXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVDRTVFNycsXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyQm9yZGVyQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgkc2NvcGUubXlCYXIpIHtcbiAgICAgICAgICAgICRzY29wZS5teUJhci5kZXN0cm95KCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubXlCYXIgPSBuZXcgQ2hhcnQoY2hhcnRDdHgsIHtcbiAgICAgICAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgICAgICAgZGF0YTogJHNjb3BlLmJhckNoYXJ0RGF0YSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdsYWJlbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmlnaHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnVwZGF0ZUNoYXJ0ID0gKCkgPT4ge1xuXG4gICAgICAgIHZhciBsYWJlbHMgPSAkc2NvcGUuc3ByaW50cy5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlNwcmludCBcIiArIHBhZChkLm9yZGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBlc3RpbWF0ZWQgPSAkc2NvcGUuc3ByaW50cy5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBkLnZlbG9jaXR5O1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJ1cm5lZCA9ICRzY29wZS5zcHJpbnRzLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBkLmJ1cm5kb3duKSB7XG4gICAgICAgICAgICAgICAgaSA9IGkgKyBkLmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5teUJhci5kYXRhLmxhYmVscyA9IGxhYmVscztcbiAgICAgICAgJHNjb3BlLm15QmFyLmRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGJ1cm5lZDtcbiAgICAgICAgJHNjb3BlLm15QmFyLmRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGVzdGltYXRlZDtcblxuICAgICAgICAkc2NvcGUubXlCYXIudXBkYXRlKCk7XG4gICAgfTtcblxuICAgIC8vLyBCVVJORE9XTiBDSEFSVFxuICAgIC8vLyBJTklUXG4gICAgJHNjb3BlLmluaXRCdXJuZG93bkNoYXJ0ID0gKHNwcmludCkgPT4ge1xuICAgICAgICB2YXIgYnVybmRvd25EYXRhID0ge1xuICAgICAgICAgICAgbGFiZWxzOiBbXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiLCBcIm1hXCIsIFwiZGlcIiwgXCJ3b1wiLCBcImRvXCIsIFwidnJcIl0sXG4gICAgICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiR2VoYWFsZFwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzVGRkFGQycsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogJyM1RkZBRkMnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiTWVhbiBCdXJuZG93blwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHlBeGlzSUQ6ICd5LWF4aXMtMScsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFQjUxRDgnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcbiAgICAgICAgXG5cbiAgICAgICAgdmFyIGlkZWFsQnVybmRvd24gPSBidXJuZG93bkRhdGEubGFiZWxzLm1hcChmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgaWYgKGkgPT0gYnVybmRvd25EYXRhLmxhYmVscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoc3ByaW50LnZlbG9jaXR5IC8gOCkgKiBpO1xuICAgICAgICB9KS5yZXZlcnNlKCk7XG4gICAgICAgIGJ1cm5kb3duRGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gaWRlYWxCdXJuZG93bjtcblxuICAgICAgICB2YXIgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcbiAgICAgICAgdmFyIGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgYnVybmRvd25EYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xuICAgICAgICBidXJuZG93bkRhdGEuZGF0YXNldHNbMF0uZGF0YSA9IGdyYXBoYWJsZUJ1cm5kb3duO1xuXG4gICAgICAgIGlmICgkc2NvcGUubXlCYXIpIHtcbiAgICAgICAgICAgICRzY29wZS5teUJhci5kZXN0cm95KCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubXlCYXIgPSBuZXcgQ2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmFwaFwiKS5nZXRDb250ZXh0KFwiMmRcIiksIHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIGRhdGE6IGJ1cm5kb3duRGF0YSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdsYWJlbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvcm5lclJhZGl1czogMyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNjYWxlczoge1xuICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LC4xKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwicmlnaHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogXCJ5LWF4aXMtMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbi8vLyBVUERBVEVcbiAgICAkc2NvcGUudXBkYXRlQnVybmRvd25DaGFydCA9IChzcHJpbnQpID0+IHtcbiAgICAgICAgXG4gICAgICAgIHZhciBpZGVhbEJ1cm5kb3duID0gJHNjb3BlLm15QmFyLmRhdGEubGFiZWxzLm1hcChmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgaWYgKGkgPT0gJHNjb3BlLm15QmFyLmRhdGEubGFiZWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChzcHJpbnQudmVsb2NpdHkgLyA4KSAqIGk7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcblxuICAgICAgICB2YXIgdmVsb2NpdHlSZW1haW5pbmcgPSBzcHJpbnQudmVsb2NpdHlcbiAgICAgICAgdmFyIGdyYXBoYWJsZUJ1cm5kb3duID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCBpbiBzcHJpbnQuYnVybmRvd24pIHtcbiAgICAgICAgICAgIHZlbG9jaXR5UmVtYWluaW5nIC09IHNwcmludC5idXJuZG93blt4XTtcbiAgICAgICAgICAgIGdyYXBoYWJsZUJ1cm5kb3duLnB1c2godmVsb2NpdHlSZW1haW5pbmcpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5teUJhci5kYXRhLmRhdGFzZXRzWzBdLmRhdGEgPSBncmFwaGFibGVCdXJuZG93bjtcbiAgICAgICAgJHNjb3BlLm15QmFyLmRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XG5cbiAgICAgICAgJHNjb3BlLm15QmFyLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc3VtID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgZm9yICh2YXIgeCBpbiBpdGVtcykge1xuICAgICAgICAgICAgaSA9IGkgKyBpdGVtc1t4XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgICByZXR1cm4gKG4gPCAxMCkgPyAoXCIwXCIgKyBuKSA6IG47XG59Ki8gIiwiXG5wYXJ0aWNsZXNKUyhcInBhcnRpY2xlcy1qc1wiLCB7XG4gIFwicGFydGljbGVzXCI6IHtcbiAgICBcIm51bWJlclwiOiB7XG4gICAgICBcInZhbHVlXCI6IDEwLFxuICAgICAgXCJkZW5zaXR5XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJ2YWx1ZV9hcmVhXCI6IDgwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb2xvclwiOiB7XG4gICAgICBcInZhbHVlXCI6IFwiI2ZmZmZmZlwiXG4gICAgfSxcbiAgICBcInNoYXBlXCI6IHtcbiAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxuICAgICAgXCJzdHJva2VcIjoge1xuICAgICAgICBcIndpZHRoXCI6IDAsXG4gICAgICAgIFwiY29sb3JcIjogXCIjMDAwMDAwXCJcbiAgICAgIH0sXG4gICAgICBcInBvbHlnb25cIjoge1xuICAgICAgICBcIm5iX3NpZGVzXCI6IDVcbiAgICAgIH0sXG4gICAgICBcImltYWdlXCI6IHtcbiAgICAgICAgXCJzcmNcIjogXCJpbWcvZ2l0aHViLnN2Z1wiLFxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcbiAgICAgICAgXCJoZWlnaHRcIjogMTAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcIm9wYWNpdHlcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAwLjEsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEsXG4gICAgICAgIFwib3BhY2l0eV9taW5cIjogMC4wMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcInNpemVcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAzLFxuICAgICAgXCJyYW5kb21cIjogdHJ1ZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEwLFxuICAgICAgICBcInNpemVfbWluXCI6IDAuMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcImRpc3RhbmNlXCI6IDE1MCxcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXG4gICAgICBcIm9wYWNpdHlcIjogMC4wNSxcbiAgICAgIFwid2lkdGhcIjogMVxuICAgIH0sXG4gICAgXCJtb3ZlXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcInNwZWVkXCI6IDIsXG4gICAgICBcImRpcmVjdGlvblwiOiBcIm5vbmVcIixcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcbiAgICAgIFwib3V0X21vZGVcIjogXCJvdXRcIixcbiAgICAgIFwiYm91bmNlXCI6IGZhbHNlLFxuICAgICAgXCJhdHRyYWN0XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwicm90YXRlWFwiOiA2MDAsXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImludGVyYWN0aXZpdHlcIjoge1xuICAgIFwiZGV0ZWN0X29uXCI6IFwiY2FudmFzXCIsXG4gICAgXCJldmVudHNcIjoge1xuICAgICAgXCJvbmhvdmVyXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXG4gICAgICB9LFxuICAgICAgXCJvbmNsaWNrXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwicHVzaFwiXG4gICAgICB9LFxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJtb2Rlc1wiOiB7XG4gICAgICBcImdyYWJcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDE0MCxcbiAgICAgICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJ1YmJsZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogNDAwLFxuICAgICAgICBcInNpemVcIjogNDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcbiAgICAgICAgXCJvcGFjaXR5XCI6IC4xLFxuICAgICAgICBcInNwZWVkXCI6IDMwMFxuICAgICAgfSxcbiAgICAgIFwicmVwdWxzZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMjAwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxuICAgICAgfSxcbiAgICAgIFwicHVzaFwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcbiAgICAgIH0sXG4gICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwicmV0aW5hX2RldGVjdFwiOiB0cnVlXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
