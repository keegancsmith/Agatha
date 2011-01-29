var canvas;
var ctx;
var game_state;
var counter;


function can_battle(from_planet, to_planet) {
    if (from_planet == to_planet)
        return false;

    var d = from_planet.position.distanceFrom(to_planet.position)
        - from_planet.radius - to_planet.radius;
    return d < from_planet.travel_radius;
}


function battle(fromplan, toplan){
    if (!can_battle(fromplan, toplan)) {
        console.log('That planet is too far to click');
        return;
    }

    var troops_staying = Math.floor(fromplan.ntroops / 2);
    var troops_sending = Math.floor(fromplan.ntroops - troops_staying);

    fromplan.ntroops = troops_staying;

    if (troops_sending == 0) {
        console.log('no troops to send');
        return;
    }

    if (toplan.player != null && toplan.player != fromplan.player){ // planet is occupied
        toplan.ntroops -= troops_sending;

        if (toplan.ntroops == 0) {
            toplan.player = null;
        } else if (toplan.ntroops < 0) {
            toplan.player = fromplan.player;
            toplan.ntroops *= -1;
        }
    }
    else { // planet is not occupied win by default
        toplan.ntroops += troops_sending;
        toplan.player = fromplan.player;
    }

    //console.log(fromplan.ntroops, toplan.ntroops);
}

//
// Ai strategies to implement:
//      currently does never give troops to own base;
//      a good strategy is to do this sometimes to make a planet which is strong enough to kill another really strong planet
function random_ai(player){
    var bases = new Array();
    var targets = new Array();
    var planets = game_state.planets;
    for (var i =0;i < planets.length;i++){
        if (planets[i].player == player){
            bases.push(planets[i]);
        }
    }
    //console.log('BASES:' + bases);

    for (var j=0;j < bases.length;j++){
        for (var k =0;k < planets.length;k++){
            if (bases[j] == planets[k]){
                continue;
            }

            if (can_battle(bases[j],planets[k])){
                targets.push([j,k]);
            }
        }
    }
    if (targets.length == 0)
        return;

    // Choose who to attack randomnly
    var attack_choice = targets[Math.floor(Math.random()*targets.length)];
    battle(bases[attack_choice[0]],planets[attack_choice[1]]);
}


function generate_planet() {
    var r = Math.random() * 7.5 + 7.5;
    return {
        position      : $V([Math.random() * canvas.width, Math.random() * canvas.height]),
        velocity      : Vector.Zero(2),
        mass          : r / 13,

        type          : 'normal',
        health        : 100*r,
        radius        : r,
        travel_radius : r * 5,
        activated     : false,

        player        : null,
        ntroops       : 0
    };
}

function update_stats(){
    var planets = game_state.planets;
    for (i = 0;i < planets.length;i++){
        var p = planets[i];
        if (p.player != null){
            p.health-=0.001*p.numtroops;
            p.ntroops =p.ntroops + 0.01;
        }
    }
}

function game_loop() {
    counter+=1;
    physics_step(game_state.planets, 1000/40.0 * 0.1);
    update_stats();
    if (counter > 75){

        random_ai(1);
        random_ai(2);
        counter=0;
    }

    // fading
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var col = ['rgba(128,128,255,0.5)','rgba(128,255,128,0.5)','rgba(255,128,128,0.5)'];

    // dot drawing style
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(128,128,128,0.5)';

    for (i = 0; i < game_state.planets.length; i++) {
        var p = game_state.planets[i];

        if (p.player != null){
            ctx.fillStyle = col[p.player];
            ctx.beginPath();
            var k = 0;
            if (p == game_state.active_planet){
                k=5;
            }
            var tx= p.position.e(1);
            var ty= p.position.e(2);

           /* var radial = ctx.createRadialGradient(tx,ty,p.radius,tx,ty,p.radius+p.ntroops);
            radial.addColorStop(0, col[p.player]);
            radial.addColorStop(1, 'rgba(128,128,128,0.5)');
            ctx.fillStyle = radial;*/
            ctx.arc(p.position.e(1), p.position.e(2), p.radius +5 + k*Math.sin(game_state.aura_pulse), 0, Math.PI*2, false);
            game_state.aura_pulse+=0.1;
            ctx.fill();
        }

        if (p == game_state.active_planet){
            ctx.fillStyle = 'rgba(255,128,128,0.5)';
        } else if (game_state.active_planet && can_battle(game_state.active_planet, p)) {
            ctx.fillStyle = 'rgba(0,128,128,0.5)';
            ctx.moveTo(p.position.e(1),p.position.e(2));
            ctx.lineTo(game_state.active_planet.position.e(1),game_state.active_planet.position.e(2));
            ctx.strokeStyle = "#eee";
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(128,128,128,0.5)';
        }
        ctx.beginPath();
        ctx.arc(p.position.e(1), p.position.e(2), p.radius, 0, Math.PI*2, false);
        ctx.fill();

//        ctx.font = "bold 12px sans-serif";
        if (p.player != null){
            ctx.fillText(Math.floor(p.ntroops), p.position.e(1) - 5, p.position.e(2)+3);
        }
    }
}


function init(nplanets) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    counter = 0;

    var supportsTouch = 'createTouch' in document;
    canvas[supportsTouch ? 'ontouchstart' : 'onmousedown'] = click;

    var planets = new Array();
    for (var i = 0; i < nplanets; i++)
        planets.push(generate_planet());

    planets[0].player = 0;
    planets[1].player = 1;

    planets[0].ntroops = 10;
    planets[1].ntroops = 4;

    planets[2].player = 2;
    planets[2].ntroops = 8;

    game_state = {
        planets : planets,
        players : [{}],
        active_planet : null,
        human_player : 0 ,
        aura_pulse : 0
    };


    setInterval(game_loop, 40);
}
