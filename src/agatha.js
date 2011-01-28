var canvas;
var ctx;
var points = [];

function getCursorPosition(e) {
    var x;
    var y;

    if (e.touches != undefined && e.touches.length == 1)
        e = e.touches[0];

    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return {
        'x' : x,
        'y' : y
    };
}


function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var planets = new Array();
    for (var i = 0; i < 30; i++) {
        var planet = {
            mass     : 1,
            position : $V([Math.random() * canvas.width, Math.random() * canvas.height]),
            velocity : Vector.Zero(2)
        };
        planets.push(planet);
    }

    setInterval(function() {
                    physics_step(planets, 1000/40.0 * 0.1);

                    // fading
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.fillStyle = 'rgba(128,128,128,0.85)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // dot drawing style
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = 'rgba(128,128,128,0.5)';

                    for (i = 0; i < planets.length; i++) {
                        var planet = planets[i];
                        ctx.beginPath();
                        ctx.arc(planet.position.e(1), planet.position.e(2), 7.5, 0, Math.PI*2, false);
                        ctx.fill();
                    }
                }, 40);
}
