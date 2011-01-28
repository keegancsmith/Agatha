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


function recalculate_accelerations(balls) {
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        var acceleration = Vector.Zero(2);

        for (var j = 0; j < balls.length; j++) {
            if (i == j)
                continue;

            var other_ball = balls[j];

            var dir = other_ball.position.subtract(ball.position).toUnitVector();
            var d = ball.position.distanceFrom(other_ball.position);
            if (d * d == 0)
                continue;

            var f = (ball.mass * other_ball.mass) / (d * d);
            acceleration = acceleration.add(dir.multiply(f));
        }

        var max_accel = 100;
        if (acceleration.modulus() > max_accel) {
            acceleration = acceleration.toUnitVector().multiply(max_accel * 0.9);
        }

        ball.acceleration = acceleration;
    }
}


function physics_step(balls, dt) {
    recalculate_accelerations(balls);

    // for (i = 0; i < balls.length; i++) {
    //     var ball = balls[i];
    //     console.log(ball.acceleration.e(1), ball.acceleration.e(2));
    //     console.log(ball.velocity.e(1), ball.velocity.e(2));
    //     console.log(ball.position.e(1), ball.position.e(2));
    //     console.log("");
    // }

    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        ball.velocity = ball.velocity.add(ball.acceleration.multiply(dt));
        ball.position = ball.position.add(ball.velocity.multiply(dt));

        var px = ball.position.e(1);
        var py = ball.position.e(2);
        var vx = ball.velocity.e(1);
        var vy = ball.velocity.e(2);
        var bounce_dampening = -0.5;

        // bounce
        if (px < 0) {
            px = 0;
            vx *= bounce_dampening;
        }
        if (px > canvas.width) {
            px = canvas.width;
            vx *= bounce_dampening;
        }
        if (py < 0) {
            py = 0;
            vy *= bounce_dampening;
        }
        if (py > canvas.height) {
            py = canvas.height;
            vy *= bounce_dampening;
        }

        ball.position = $V([px, py]);
        ball.velocity = $V([vx, vy]);

        var max_vel = 1;
        if (ball.velocity.modulus() > max_vel) {
            ball.velocity = ball.velocity.toUnitVector().multiply(max_vel * 0.9);
        }
    }
}


function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var balls = new Array();
    for (var i = 0; i < 30; i++) {
        var ball = {
            mass     : 1,
            position : $V([Math.random() * canvas.width, Math.random() * canvas.height]),
            velocity : Vector.Zero(2)
        };
        balls.push(ball);
    }

    setInterval(function() {
                    physics_step(balls, 1000/40.0 * 0.1);

                    // fading
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.fillStyle = 'rgba(128,128,128,0.85)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // dot drawing style
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = 'rgba(128,128,128,0.5)';

                    for (i = 0; i < balls.length; i++) {
                        var ball = balls[i];
                        ctx.beginPath();
                        ctx.arc(ball.position.e(1), ball.position.e(2), 7.5, 0, Math.PI*2, false);
                        ctx.fill();
                    }
                }, 40);
}
