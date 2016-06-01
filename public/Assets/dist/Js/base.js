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

/* ---- stats.js config ---- */

var count_particles, stats, update;
stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
count_particles = document.querySelector('.js-count-particles');
update = function () {
  stats.begin();
  stats.end();
  if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
    count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
  }
  requestAnimationFrame(update);
};
requestAnimationFrame(update);
//# sourceMappingURL=data:application/json;base64,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LElBQUksZUFBZSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7QUFDbkMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFBLENBQUM7QUFDbEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBQzdDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDcEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNoRSxNQUFNLEdBQUcsWUFBVztBQUNsQixPQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZCxPQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDWixNQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO0FBQzFFLG1CQUFlLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0dBQ3pFO0FBQ0QsdUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDL0IsQ0FBQztBQUNGLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbnBhcnRpY2xlc0pTKFwicGFydGljbGVzLWpzXCIsIHtcbiAgXCJwYXJ0aWNsZXNcIjoge1xuICAgIFwibnVtYmVyXCI6IHtcbiAgICAgIFwidmFsdWVcIjogMTAsXG4gICAgICBcImRlbnNpdHlcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcInZhbHVlX2FyZWFcIjogODAwXG4gICAgICB9XG4gICAgfSxcbiAgICBcImNvbG9yXCI6IHtcbiAgICAgIFwidmFsdWVcIjogXCIjZmZmZmZmXCJcbiAgICB9LFxuICAgIFwic2hhcGVcIjoge1xuICAgICAgXCJ0eXBlXCI6IFwiY2lyY2xlXCIsXG4gICAgICBcInN0cm9rZVwiOiB7XG4gICAgICAgIFwid2lkdGhcIjogMCxcbiAgICAgICAgXCJjb2xvclwiOiBcIiMwMDAwMDBcIlxuICAgICAgfSxcbiAgICAgIFwicG9seWdvblwiOiB7XG4gICAgICAgIFwibmJfc2lkZXNcIjogNVxuICAgICAgfSxcbiAgICAgIFwiaW1hZ2VcIjoge1xuICAgICAgICBcInNyY1wiOiBcImltZy9naXRodWIuc3ZnXCIsXG4gICAgICAgIFwid2lkdGhcIjogMTAwLFxuICAgICAgICBcImhlaWdodFwiOiAxMDBcbiAgICAgIH1cbiAgICB9LFxuICAgIFwib3BhY2l0eVwiOiB7XG4gICAgICBcInZhbHVlXCI6IDAuMSxcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLFxuICAgICAgXCJhbmltXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwic3BlZWRcIjogMSxcbiAgICAgICAgXCJvcGFjaXR5X21pblwiOiAwLjAxLFxuICAgICAgICBcInN5bmNcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIFwic2l6ZVwiOiB7XG4gICAgICBcInZhbHVlXCI6IDMsXG4gICAgICBcInJhbmRvbVwiOiB0cnVlLFxuICAgICAgXCJhbmltXCI6IHtcbiAgICAgICAgXCJlbmFibGVcIjogZmFsc2UsXG4gICAgICAgIFwic3BlZWRcIjogMTAsXG4gICAgICAgIFwic2l6ZV9taW5cIjogMC4xLFxuICAgICAgICBcInN5bmNcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIFwibGluZV9saW5rZWRcIjoge1xuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgIFwiZGlzdGFuY2VcIjogMTUwLFxuICAgICAgXCJjb2xvclwiOiBcIiNmZmZmZmZcIixcbiAgICAgIFwib3BhY2l0eVwiOiAwLjA1LFxuICAgICAgXCJ3aWR0aFwiOiAxXG4gICAgfSxcbiAgICBcIm1vdmVcIjoge1xuICAgICAgXCJlbmFibGVcIjogdHJ1ZSxcbiAgICAgIFwic3BlZWRcIjogMixcbiAgICAgIFwiZGlyZWN0aW9uXCI6IFwibm9uZVwiLFxuICAgICAgXCJyYW5kb21cIjogZmFsc2UsXG4gICAgICBcInN0cmFpZ2h0XCI6IGZhbHNlLFxuICAgICAgXCJvdXRfbW9kZVwiOiBcIm91dFwiLFxuICAgICAgXCJib3VuY2VcIjogZmFsc2UsXG4gICAgICBcImF0dHJhY3RcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiBmYWxzZSxcbiAgICAgICAgXCJyb3RhdGVYXCI6IDYwMCxcbiAgICAgICAgXCJyb3RhdGVZXCI6IDEyMDBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiaW50ZXJhY3Rpdml0eVwiOiB7XG4gICAgXCJkZXRlY3Rfb25cIjogXCJjYW52YXNcIixcbiAgICBcImV2ZW50c1wiOiB7XG4gICAgICBcIm9uaG92ZXJcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcIm1vZGVcIjogXCJncmFiXCJcbiAgICAgIH0sXG4gICAgICBcIm9uY2xpY2tcIjoge1xuICAgICAgICBcImVuYWJsZVwiOiB0cnVlLFxuICAgICAgICBcIm1vZGVcIjogXCJwdXNoXCJcbiAgICAgIH0sXG4gICAgICBcInJlc2l6ZVwiOiB0cnVlXG4gICAgfSxcbiAgICBcIm1vZGVzXCI6IHtcbiAgICAgIFwiZ3JhYlwiOiB7XG4gICAgICAgIFwiZGlzdGFuY2VcIjogMTQwLFxuICAgICAgICBcImxpbmVfbGlua2VkXCI6IHtcbiAgICAgICAgICBcIm9wYWNpdHlcIjogLjFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiYnViYmxlXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0MDAsXG4gICAgICAgIFwic2l6ZVwiOiA0MCxcbiAgICAgICAgXCJkdXJhdGlvblwiOiA1LFxuICAgICAgICBcIm9wYWNpdHlcIjogLjEsXG4gICAgICAgIFwic3BlZWRcIjogMzAwXG4gICAgICB9LFxuICAgICAgXCJyZXB1bHNlXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiAyMDAsXG4gICAgICAgIFwiZHVyYXRpb25cIjogMC40XG4gICAgICB9LFxuICAgICAgXCJwdXNoXCI6IHtcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogM1xuICAgICAgfSxcbiAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgXCJwYXJ0aWNsZXNfbmJcIjogMlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJyZXRpbmFfZGV0ZWN0XCI6IHRydWVcbn0pO1xuXG5cbi8qIC0tLS0gc3RhdHMuanMgY29uZmlnIC0tLS0gKi9cblxudmFyIGNvdW50X3BhcnRpY2xlcywgc3RhdHMsIHVwZGF0ZTtcbnN0YXRzID0gbmV3IFN0YXRzO1xuc3RhdHMuc2V0TW9kZSgwKTtcbnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGF0cy5kb21FbGVtZW50KTtcbmNvdW50X3BhcnRpY2xlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb3VudC1wYXJ0aWNsZXMnKTtcbnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICBzdGF0cy5iZWdpbigpO1xuICBzdGF0cy5lbmQoKTtcbiAgaWYgKHdpbmRvdy5wSlNEb21bMF0ucEpTLnBhcnRpY2xlcyAmJiB3aW5kb3cucEpTRG9tWzBdLnBKUy5wYXJ0aWNsZXMuYXJyYXkpIHtcbiAgICBjb3VudF9wYXJ0aWNsZXMuaW5uZXJUZXh0ID0gd2luZG93LnBKU0RvbVswXS5wSlMucGFydGljbGVzLmFycmF5Lmxlbmd0aDtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbn07XG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
