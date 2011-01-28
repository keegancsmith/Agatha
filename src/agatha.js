var canvas;
var ctx;
var game_state;

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

function battle(fromplan,toplan){
    // XXX alternate discuss
    //
    //
    // XXX integer division PROBLEM??????
    var d =  fromplan.position.distanceFrom(toplan.position);
    if (d < 50){
        if (toplan.player != null){ // planet is occupied
            if (fromplan.ntroops/2 >= toplan.ntroops){ // win
                fromplan.ntroops/=2;
                toplan.ntroops+= fromplan.ntroops;
                toplan.player = fromplan.player;
            }
            else{                                       // loose
                fromplan.ntroops/=2;
                
            }

        }
        else{ // planet is not occupied                 win by default
            fromplan.ntroops/=2;
            toplan.ntroops+= fromplan.ntroops;
            toplan.player = fromplan.player;

        }

    }
    else{    // cant attack
        console.log('That planet is too far to click');
    }
}


function generate_planet() {
    var r = Math.random() * 7.5 + 7.5;
    return {
        position  : $V([Math.random() * canvas.width, Math.random() * canvas.height]),
        velocity  : Vector.Zero(2),
        mass      : r / 13,

        type      : 'normal',
        health    : 100,
        radius    : r,
        activated : false,

        player    : null,
        nunits    : 0
    };
}


function game_loop() {
    physics_step(game_state.planets, 1000/40.0 * 0.1);

    // fading
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'rgba(128,128,128,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dot drawing style
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(128,128,128,0.5)';

    for (i = 0; i < game_state.planets.length; i++) {
        var p = game_state.planets[i];

        if (p == game_state.active_planet){
            ctx.fillStyle = 'rgba(255,128,128,0.5)';
        }
         else{
            ctx.fillStyle = 'rgba(128,128,128,0.5)';
        }
        ctx.beginPath();
        ctx.arc(p.position.e(1), p.position.e(2), p.radius, 0, Math.PI*2, false);
        ctx.fill();
    }
}


function init(nplanets) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    var supportsTouch = 'createTouch' in document;
    canvas[supportsTouch ? 'ontouchstart' : 'onmousedown'] = click;

    var planets = new Array();
    for (var i = 0; i < nplanets; i++)
        planets.push(generate_planet());

    game_state = {
        planets : planets,
        players : [{}],
        active_planet : null
    };

    setInterval(game_loop, 40);
}
