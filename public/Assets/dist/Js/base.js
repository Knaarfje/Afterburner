"use strict";

var app = angular.module("afterburnerApp", ["firebase", 'ngTouch']);
app.config(function () {
    var config = {
        apiKey: "AIzaSyCIzyCEYRjS4ufhedxwB4vCC9la52GsrXM",
        authDomain: "project-7784811851232431954.firebaseapp.com",
        databaseURL: "https://project-7784811851232431954.firebaseio.com",
        storageBucket: "project-7784811851232431954.appspot.com"
    };
    firebase.initializeApp(config);
});

app.controller("afterburnerCtrl", function ($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $timeout) {
    var ref = firebase.database().ref();
    $timeout(function () {
        $scope.currentUser = firebase.auth().currentUser;
        $scope.init();
    }, 500);

    $scope.init = function () {
        if ($scope.currentUser) {
            $scope.initApp();
        }
    };

    $scope.signin = function (email, password) {
        $scope.authData = null;

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
            $scope.authData = data;
            $scope.currentUser = firebase.auth().currentUser;

            $scope.initApp();
        });
    };

    $scope.signout = function () {
        firebase.auth().signOut().then(function () {
            $scope.currentUser = null;
        }, function (error) {
            // An error happened.
        });
    };

    $scope.initApp = function () {
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
    };

    $scope.toOverview = function () {
        if ($scope.selectedSprint) {
            $scope.initChart();
            $scope.updateChart();
            $scope.selectedSprint.$destroy();
            $scope.selectedSprint = null;
        }
    };

    $scope.selectSprint = function (index) {
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
    };

    document.getElementById("graph").onclick = function (evt) {
        if ($scope.selectedSprint) {
            return;
        }

        var activePoints = $scope.myBar.getElementsAtEvent(evt);
        var index = ('test:', activePoints[1]._index);
        $scope.selectSprint(index);
    };

    $scope.addBurndown = function (points, sprint) {

        var sprintKey = $scope.sprints.$keyAt(sprint);
        var burndowns = $scope.sprints.$getRecord(sprintKey).burndown;
        burndowns.$add(points);
    };

    $scope.initChart = function () {
        var chartCtx = document.getElementById("graph").getContext("2d");
        $scope.barChartData = {
            labels: [],
            datasets: [{
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
                yAxisID: 'y-axis-2'
            }, {
                type: 'bar',
                label: "Estimated",
                data: [],
                fill: false,
                backgroundColor: '#5FFAFC',
                borderColor: '#5FFAFC',
                hoverBackgroundColor: '#5CE5E7',
                hoverBorderColor: '#5CE5E7',
                yAxisID: 'y-axis-1'
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
                    cornerRadius: 3
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
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: false,
                            color: "rgba(255,255,255,.1)"
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
                            suggestedMax: 100
                        },
                        gridLines: {
                            display: true,
                            color: "rgba(255,255,255,.1)",
                            drawTicks: false
                        },
                        labels: {
                            show: true
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
                            suggestedMax: 100
                        },
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: false
                        }
                    }]
                }
            }
        });
    };

    $scope.updateChart = function () {

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
    $scope.initBurndownChart = function (sprint) {
        var burndownData = {
            labels: ["di", "wo", "do", "vr", "ma", "di", "wo", "do", "vr"],
            datasets: [{
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
            return sprint.velocity / 8 * i;
        }).reverse();
        burndownData.datasets[1].data = idealBurndown;

        var velocityRemaining = sprint.velocity;
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
                    cornerRadius: 3
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
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: false,
                            color: "rgba(255,255,255,.1)"
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
                            drawTicks: false
                        },
                        labels: {
                            show: true
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
                            suggestedMax: 100
                        },
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: false
                        }
                    }]
                }
            }
        });
    };

    /// UPDATE
    $scope.updateBurndownChart = function (sprint) {

        var idealBurndown = $scope.myBar.data.labels.map(function (d, i) {
            if (i == $scope.myBar.data.labels.length - 1) {
                return sprint.velocity;
            }
            return sprint.velocity / 8 * i;
        }).reverse();

        var velocityRemaining = sprint.velocity;
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
    };
});

function pad(n) {
    return n < 10 ? "0" + n : n;
}

// box-shadow: 0px 2px 6px 0px rgba(95,250,252,0.37),
//             0px 2px 24px 0px rgba(95,250,252,0.48),
//             -5px 9px 14px 0px rgba(0,0,0,0.50),
//             0px 2px 4px 0px rgba(0,0,0,0.50);
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
//# sourceMappingURL=data:application/json;base64,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QUFDVCxrQkFBVSxFQUFFLEdBQUc7QUFDZixrQkFBVSxFQUFFLEdBQUc7T0FDaEI7QUFDRCxZQUFNLEVBQUU7QUFDTixzQkFBYyxFQUFFLENBQUM7T0FDbEI7QUFDRCxjQUFRLEVBQUU7QUFDUixzQkFBYyxFQUFFLENBQUM7T0FDbEI7S0FDRjtHQUNGO0FBQ0QsaUJBQWUsRUFBRSxJQUFJO0NBQ3RCLENBQUMsQ0FBQyIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiYWZ0ZXJidXJuZXJBcHBcIiwgW1wiZmlyZWJhc2VcIiwgJ25nVG91Y2gnXSk7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0l6eUNFWVJqUzR1ZmhlZHh3QjR2Q0M5bGE1MkdzclhNXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwicHJvamVjdC03Nzg0ODExODUxMjMyNDMxOTU0LmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Byb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInByb2plY3QtNzc4NDgxMTg1MTIzMjQzMTk1NC5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKFwiYWZ0ZXJidXJuZXJDdHJsXCIsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksICR0aW1lb3V0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgPSBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXI7XG4gICAgICAgICRzY29wZS5pbml0KCk7XG4gICAgfSwgNTAwKTtcblxuXG4gICAgJHNjb3BlLmluaXQgPSAoKSA9PiB7XG4gICAgICAgIGlmICgkc2NvcGUuY3VycmVudFVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS5pbml0QXBwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUuc2lnbmluID0gKGVtYWlsLCBwYXNzd29yZCkgPT4ge1xuICAgICAgICAkc2NvcGUuYXV0aERhdGEgPSBudWxsO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5zaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICRzY29wZS5hdXRoRGF0YSA9IGRhdGE7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgPSBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXI7XG5cbiAgICAgICAgICAgICRzY29wZS5pbml0QXBwKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5zaWdub3V0ID0gKCkgPT4ge1xuICAgICAgICBmaXJlYmFzZS5hdXRoKCkuc2lnbk91dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyID0gbnVsbDtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBBbiBlcnJvciBoYXBwZW5lZC5cbiAgICAgICAgfSk7XG59XG5cbiAgICAkc2NvcGUuaW5pdEFwcCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLmluaXRDaGFydCgpO1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnNwcmludHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoXCJzcHJpbnRzXCIpLm9yZGVyQnlDaGlsZCgnb3JkZXInKS5saW1pdFRvTGFzdCgxNSkpO1xuXG4gICAgICAgICRzY29wZS5zcHJpbnRzLiR3YXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5teUJhciAmJiAkc2NvcGUubXlCYXIuY29uZmlnLnR5cGUgPT0gJ2JhcicpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlQ2hhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnNwcmludHMuJGxvYWRlZChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGsgPSAkc2NvcGUuc3ByaW50cy4ka2V5QXQoJHNjb3BlLnNwcmludHMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAkc2NvcGUubGFzdFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoXCJzcHJpbnRzL1wiICsgaykpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUudG9PdmVydmlldyA9ICgpID0+IHtcbiAgICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZFNwcmludCkge1xuICAgICAgICAgICAgJHNjb3BlLmluaXRDaGFydCgpO1xuICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZUNoYXJ0KCk7XG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTcHJpbnQuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZFNwcmludCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUuc2VsZWN0U3ByaW50ID0gKGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRTcHJpbnQpIHtcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZFNwcmludC4kZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgayA9ICRzY29wZS5zcHJpbnRzLiRrZXlBdChpbmRleCk7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZFNwcmludCA9ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoXCJzcHJpbnRzL1wiICsgaykpO1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RlZFNwcmludC4kd2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubXlCYXIgJiYgJHNjb3BlLm15QmFyLmNvbmZpZy50eXBlID09ICdsaW5lJykge1xuICAgICAgICAgICAgICAgICRzY29wZS51cGRhdGVCdXJuZG93bkNoYXJ0KCRzY29wZS5zZWxlY3RlZFNwcmludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyAgICAgICAgXG4gICAgICAgICRzY29wZS5zZWxlY3RlZFNwcmludC4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuaW5pdEJ1cm5kb3duQ2hhcnQoJHNjb3BlLnNlbGVjdGVkU3ByaW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmFwaFwiKS5vbmNsaWNrID0gZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkU3ByaW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBhY3RpdmVQb2ludHMgPSAkc2NvcGUubXlCYXIuZ2V0RWxlbWVudHNBdEV2ZW50KGV2dCk7XG4gICAgICAgIHZhciBpbmRleCA9ICgndGVzdDonLCBhY3RpdmVQb2ludHNbMV0uX2luZGV4KTtcbiAgICAgICAgJHNjb3BlLnNlbGVjdFNwcmludChpbmRleCk7XG4gICAgfTtcblxuXG4gICAgJHNjb3BlLmFkZEJ1cm5kb3duID0gKHBvaW50cywgc3ByaW50KSA9PiB7XG5cbiAgICAgICAgdmFyIHNwcmludEtleSA9ICRzY29wZS5zcHJpbnRzLiRrZXlBdChzcHJpbnQpO1xuICAgICAgICB2YXIgYnVybmRvd25zID0gJHNjb3BlLnNwcmludHMuJGdldFJlY29yZChzcHJpbnRLZXkpLmJ1cm5kb3duO1xuICAgICAgICBidXJuZG93bnMuJGFkZChwb2ludHMpO1xuICAgIH1cblxuICAgICRzY29wZS5pbml0Q2hhcnQgPSAoKSA9PiB7XG4gICAgICAgIHZhciBjaGFydEN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ3JhcGhcIikuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICAkc2NvcGUuYmFyQ2hhcnREYXRhID0ge1xuICAgICAgICAgICAgbGFiZWxzOiBbXSxcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJBY2hpZXZlZFwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogJyNFQjUxRDgnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0yJyxcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJFc3RpbWF0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICcjNUNFNUU3JyxcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJCb3JkZXJDb2xvcjogJyM1Q0U1RTcnLFxuICAgICAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTEnLFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCRzY29wZS5teUJhcikge1xuICAgICAgICAgICAgJHNjb3BlLm15QmFyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5teUJhciA9IG5ldyBDaGFydChjaGFydEN0eCwge1xuICAgICAgICAgICAgdHlwZTogJ2JhcicsXG4gICAgICAgICAgICBkYXRhOiAkc2NvcGUuYmFyQ2hhcnREYXRhLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2xhYmVsJyxcbiAgICAgICAgICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZWxlbWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUudXBkYXRlQ2hhcnQgPSAoKSA9PiB7XG5cbiAgICAgICAgdmFyIGxhYmVscyA9ICRzY29wZS5zcHJpbnRzLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiU3ByaW50IFwiICsgcGFkKGQub3JkZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGVzdGltYXRlZCA9ICRzY29wZS5zcHJpbnRzLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQudmVsb2NpdHk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYnVybmVkID0gJHNjb3BlLnNwcmludHMubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciB4IGluIGQuYnVybmRvd24pIHtcbiAgICAgICAgICAgICAgICBpID0gaSArIGQuYnVybmRvd25beF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLm15QmFyLmRhdGEubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICAkc2NvcGUubXlCYXIuZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gYnVybmVkO1xuICAgICAgICAkc2NvcGUubXlCYXIuZGF0YS5kYXRhc2V0c1sxXS5kYXRhID0gZXN0aW1hdGVkO1xuXG4gICAgICAgICRzY29wZS5teUJhci51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgLy8vIEJVUk5ET1dOIENIQVJUXG4gICAgLy8vIElOSVRcbiAgICAkc2NvcGUuaW5pdEJ1cm5kb3duQ2hhcnQgPSAoc3ByaW50KSA9PiB7XG4gICAgICAgIHZhciBidXJuZG93bkRhdGEgPSB7XG4gICAgICAgICAgICBsYWJlbHM6IFtcImRpXCIsIFwid29cIiwgXCJkb1wiLCBcInZyXCIsIFwibWFcIiwgXCJkaVwiLCBcIndvXCIsIFwiZG9cIiwgXCJ2clwiXSxcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJHZWhhYWxkXCIsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB5QXhpc0lEOiAneS1heGlzLTInLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyM1RkZBRkMnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNUZGQUZDJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogJyM1RkZBRkMnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogJyM1RkZBRkMnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiAnIzVGRkFGQycsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogJyM1RkZBRkMnLFxuICAgICAgICAgICAgICAgICAgICBoaXRSYWRpdXM6IDE1LFxuICAgICAgICAgICAgICAgICAgICBsaW5lVGVuc2lvbjogMFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJNZWFuIEJ1cm5kb3duXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgeUF4aXNJRDogJ3ktYXhpcy0xJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI0VCNTFEOCcsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogJyNFQjUxRDgnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6ICcjRUI1MUQ4JyxcbiAgICAgICAgICAgICAgICAgICAgaGl0UmFkaXVzOiAxNSxcbiAgICAgICAgICAgICAgICAgICAgbGluZVRlbnNpb246IDBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICB9O1xuICAgICAgICBcblxuICAgICAgICB2YXIgaWRlYWxCdXJuZG93biA9IGJ1cm5kb3duRGF0YS5sYWJlbHMubWFwKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICBpZiAoaSA9PSBidXJuZG93bkRhdGEubGFiZWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ByaW50LnZlbG9jaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChzcHJpbnQudmVsb2NpdHkgLyA4KSAqIGk7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcbiAgICAgICAgYnVybmRvd25EYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xuXG4gICAgICAgIHZhciB2ZWxvY2l0eVJlbWFpbmluZyA9IHNwcmludC52ZWxvY2l0eVxuICAgICAgICB2YXIgZ3JhcGhhYmxlQnVybmRvd24gPSBbXTtcblxuICAgICAgICBmb3IgKHZhciB4IGluIHNwcmludC5idXJuZG93bikge1xuICAgICAgICAgICAgdmVsb2NpdHlSZW1haW5pbmcgLT0gc3ByaW50LmJ1cm5kb3duW3hdO1xuICAgICAgICAgICAgZ3JhcGhhYmxlQnVybmRvd24ucHVzaCh2ZWxvY2l0eVJlbWFpbmluZyk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBidXJuZG93bkRhdGEuZGF0YXNldHNbMV0uZGF0YSA9IGlkZWFsQnVybmRvd247XG4gICAgICAgIGJ1cm5kb3duRGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG5cbiAgICAgICAgaWYgKCRzY29wZS5teUJhcikge1xuICAgICAgICAgICAgJHNjb3BlLm15QmFyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5teUJhciA9IG5ldyBDaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdyYXBoXCIpLmdldENvbnRleHQoXCIyZFwiKSwge1xuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgZGF0YTogYnVybmRvd25EYXRhLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG9vbHRpcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2xhYmVsJyxcbiAgICAgICAgICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZWxlbWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBcInktYXhpcy0xXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBTaXplOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhUaWNrc0xpbWl0OiAyMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwuMSlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFwieS1heGlzLTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwU2l6ZTogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4vLy8gVVBEQVRFXG4gICAgJHNjb3BlLnVwZGF0ZUJ1cm5kb3duQ2hhcnQgPSAoc3ByaW50KSA9PiB7XG4gICAgICAgIFxuICAgICAgICB2YXIgaWRlYWxCdXJuZG93biA9ICRzY29wZS5teUJhci5kYXRhLmxhYmVscy5tYXAoZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgICAgIGlmIChpID09ICRzY29wZS5teUJhci5kYXRhLmxhYmVscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwcmludC52ZWxvY2l0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoc3ByaW50LnZlbG9jaXR5IC8gOCkgKiBpO1xuICAgICAgICB9KS5yZXZlcnNlKCk7XG5cbiAgICAgICAgdmFyIHZlbG9jaXR5UmVtYWluaW5nID0gc3ByaW50LnZlbG9jaXR5XG4gICAgICAgIHZhciBncmFwaGFibGVCdXJuZG93biA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIHggaW4gc3ByaW50LmJ1cm5kb3duKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eVJlbWFpbmluZyAtPSBzcHJpbnQuYnVybmRvd25beF07XG4gICAgICAgICAgICBncmFwaGFibGVCdXJuZG93bi5wdXNoKHZlbG9jaXR5UmVtYWluaW5nKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUubXlCYXIuZGF0YS5kYXRhc2V0c1swXS5kYXRhID0gZ3JhcGhhYmxlQnVybmRvd247XG4gICAgICAgICRzY29wZS5teUJhci5kYXRhLmRhdGFzZXRzWzFdLmRhdGEgPSBpZGVhbEJ1cm5kb3duO1xuXG4gICAgICAgICRzY29wZS5teUJhci51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnN1bSA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGZvciAodmFyIHggaW4gaXRlbXMpIHtcbiAgICAgICAgICAgIGkgPSBpICsgaXRlbXNbeF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGk7XG4gICAgfVxufSk7XG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gICAgcmV0dXJuIChuIDwgMTApID8gKFwiMFwiICsgbikgOiBuO1xufVxuXG4vLyBib3gtc2hhZG93OiAwcHggMnB4IDZweCAwcHggcmdiYSg5NSwyNTAsMjUyLDAuMzcpLCBcbi8vICAgICAgICAgICAgIDBweCAycHggMjRweCAwcHggcmdiYSg5NSwyNTAsMjUyLDAuNDgpLCBcbi8vICAgICAgICAgICAgIC01cHggOXB4IDE0cHggMHB4IHJnYmEoMCwwLDAsMC41MCksIFxuLy8gICAgICAgICAgICAgMHB4IDJweCA0cHggMHB4IHJnYmEoMCwwLDAsMC41MCk7IiwiXG5wYXJ0aWNsZXNKUyhcInBhcnRpY2xlcy1qc1wiLCB7XG4gIFwicGFydGljbGVzXCI6IHtcbiAgICBcIm51bWJlclwiOiB7XG4gICAgICBcInZhbHVlXCI6IDEwLFxuICAgICAgXCJkZW5zaXR5XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJ2YWx1ZV9hcmVhXCI6IDgwMFxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb2xvclwiOiB7XG4gICAgICBcInZhbHVlXCI6IFwiI2ZmZmZmZlwiXG4gICAgfSxcbiAgICBcInNoYXBlXCI6IHtcbiAgICAgIFwidHlwZVwiOiBcImNpcmNsZVwiLFxuICAgICAgXCJzdHJva2VcIjoge1xuICAgICAgICBcIndpZHRoXCI6IDAsXG4gICAgICAgIFwiY29sb3JcIjogXCIjMDAwMDAwXCJcbiAgICAgIH0sXG4gICAgICBcInBvbHlnb25cIjoge1xuICAgICAgICBcIm5iX3NpZGVzXCI6IDVcbiAgICAgIH0sXG4gICAgICBcImltYWdlXCI6IHtcbiAgICAgICAgXCJzcmNcIjogXCJpbWcvZ2l0aHViLnN2Z1wiLFxuICAgICAgICBcIndpZHRoXCI6IDEwMCxcbiAgICAgICAgXCJoZWlnaHRcIjogMTAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcIm9wYWNpdHlcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAwLjEsXG4gICAgICBcInJhbmRvbVwiOiBmYWxzZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEsXG4gICAgICAgIFwib3BhY2l0eV9taW5cIjogMC4wMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcInNpemVcIjoge1xuICAgICAgXCJ2YWx1ZVwiOiAzLFxuICAgICAgXCJyYW5kb21cIjogdHJ1ZSxcbiAgICAgIFwiYW5pbVwiOiB7XG4gICAgICAgIFwiZW5hYmxlXCI6IGZhbHNlLFxuICAgICAgICBcInNwZWVkXCI6IDEwLFxuICAgICAgICBcInNpemVfbWluXCI6IDAuMSxcbiAgICAgICAgXCJzeW5jXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcImRpc3RhbmNlXCI6IDE1MCxcbiAgICAgIFwiY29sb3JcIjogXCIjZmZmZmZmXCIsXG4gICAgICBcIm9wYWNpdHlcIjogMC4wNSxcbiAgICAgIFwid2lkdGhcIjogMVxuICAgIH0sXG4gICAgXCJtb3ZlXCI6IHtcbiAgICAgIFwiZW5hYmxlXCI6IHRydWUsXG4gICAgICBcInNwZWVkXCI6IDIsXG4gICAgICBcImRpcmVjdGlvblwiOiBcIm5vbmVcIixcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJzdHJhaWdodFwiOiBmYWxzZSxcbiAgICAgIFwib3V0X21vZGVcIjogXCJvdXRcIixcbiAgICAgIFwiYm91bmNlXCI6IGZhbHNlLFxuICAgICAgXCJhdHRyYWN0XCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwicm90YXRlWFwiOiA2MDAsXG4gICAgICAgIFwicm90YXRlWVwiOiAxMjAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImludGVyYWN0aXZpdHlcIjoge1xuICAgIFwiZGV0ZWN0X29uXCI6IFwiY2FudmFzXCIsXG4gICAgXCJldmVudHNcIjoge1xuICAgICAgXCJvbmhvdmVyXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwiZ3JhYlwiXG4gICAgICB9LFxuICAgICAgXCJvbmNsaWNrXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgICAgXCJtb2RlXCI6IFwicHVzaFwiXG4gICAgICB9LFxuICAgICAgXCJyZXNpemVcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJtb2Rlc1wiOiB7XG4gICAgICBcImdyYWJcIjoge1xuICAgICAgICBcImRpc3RhbmNlXCI6IDE0MCxcbiAgICAgICAgXCJsaW5lX2xpbmtlZFwiOiB7XG4gICAgICAgICAgXCJvcGFjaXR5XCI6IC4xXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJ1YmJsZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogNDAwLFxuICAgICAgICBcInNpemVcIjogNDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogNSxcbiAgICAgICAgXCJvcGFjaXR5XCI6IC4xLFxuICAgICAgICBcInNwZWVkXCI6IDMwMFxuICAgICAgfSxcbiAgICAgIFwicmVwdWxzZVwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMjAwLFxuICAgICAgICBcImR1cmF0aW9uXCI6IDAuNFxuICAgICAgfSxcbiAgICAgIFwicHVzaFwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDNcbiAgICAgIH0sXG4gICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgIFwicGFydGljbGVzX25iXCI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwicmV0aW5hX2RldGVjdFwiOiB0cnVlXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
