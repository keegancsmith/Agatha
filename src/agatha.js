var canvas;
var ctx;
var game_state;
var plan_image;


function battle_animation(from_planet, to_planet, colour) {
    var p1      = from_planet;
    var p2      = to_planet;
    var steps   = 10;
    var counter = 0;

    return function() {
        if (counter++ > steps)
            return false;

        var r1 = p1.radius + 10 * (counter / steps);
        var r2 = p2.radius + 10 * (1 - counter / steps);

        ctx.fillStyle = colour;//'rgba(0, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(p1.position.e(1), p1.position.e(2), r1, 0, Math.PI*2, false);
        ctx.arc(p2.position.e(1), p2.position.e(2), r2, 0, Math.PI*2, false);
        ctx.fill();

        return true;
    };
}


function can_battle(from_planet, to_planet) {
    if (from_planet == to_planet)
        return false;

    var d = from_planet.position.distanceFrom(to_planet.position)
        - from_planet.radius - to_planet.radius;
    return d < from_planet.travel_radius;
}


function battle(fromplan, toplan){
    if (!can_battle(fromplan, toplan)) {
        return;
    }

    var p1 = fromplan.player;
    var p2 = toplan.player;

    var troops_staying = Math.floor(fromplan.ntroops / 2);
    var troops_sending = Math.floor(fromplan.ntroops - troops_staying);

    fromplan.ntroops = troops_staying;

    if (troops_sending == 0) {
        return;
    }

    if (toplan.player != null && toplan.player != fromplan.player){ // planet is occupied
        toplan.ntroops -= troops_sending;

        if (toplan.ntroops < 0) {
            toplan.player = fromplan.player;
            toplan.ntroops *= -1;
        } else if (Math.floor(toplan.ntroops) == 0) {
            toplan.ntroops = 0;
            toplan.player = null;
        }
    }
    else { // planet is not occupied win by default
        toplan.ntroops += troops_sending;
        toplan.player = fromplan.player;
    }

    // Do sounds
    var p = game_state.human_player;
    if (p == p1 && p != p2 && p == toplan.player) { // Just took over a planet
        play_sound('getplanet');
    } else if (p == p2 && p != p1 && p != toplan.player) { // Lost a planet
        play_sound('loseplanet');
    } else {
        play_sound('sendtroops');
    }

    game_state.animations.push(battle_animation(fromplan, toplan, fromplan.player.colour));
}


function ai_find_targets(player) {
    var targets = [];
    var planets = game_state.planets;

    for (var i = 0; i < planets.length; i++) {
        var p1 = planets[i];

        if (p1.player != player)
            continue;

        for (var j = 0; j < planets.length; j++) {
            var p2 = planets[j];
            if (p2.player != player && can_battle(p1, p2))
                targets.push([p1, p2]);
        }
    }

    return targets;
}


// Attack a random target
function ai_random(player){
    var targets = ai_find_targets(player);

    if (targets.length == 0)
        return false;

    // Choose who to attack randomnly
    var attack_choice = targets[Math.floor(Math.random()*targets.length)];
    battle(attack_choice[0], attack_choice[1]);

    return true;
}


// Attack the target such that we maximise the troops left over after the attack
function ai_target_weak(player) {
    var targets = ai_find_targets(player);

    if (targets.length == 0)
        return false;

    var target_wrap = [];
    for (var i = 0; i < targets.length; i++) {
        var from = targets[i][0];
        var to   = targets[i][1];

        var troops_staying = Math.floor(from.ntroops / 2);
        var troops_sending = Math.floor(from.ntroops - troops_staying);

        target_wrap.push([to.ntroops - troops_sending, -troops_staying, from, to]);
    }

    var smallest = target_wrap[0];
    for (i = 1; i < target_wrap.length; i++)
        if (target_wrap[i] < smallest)
            smallest = target_wrap[i];

    battle(smallest[2], smallest[3]);

    return true;
}


function play_sound(s) {
    var snd = new Audio('snd/' + s + '.mp3');
    snd.play();
}


function generate_planet() {
    var r = Math.random() * 7.5 + 15;
    return {
        position      : $V([Math.random() * canvas.width, Math.random() * canvas.height]),
        velocity      : Vector.Random(2).x(0.75),
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


function generate_players() {
    return [{
                name     : 'Agatha',
                colour   : 'rgba(128,128,255,0.5)'
            },
            {
                name     : 'Bertha',
                colour   : 'rgba(128,255,128,0.5)',
                ai       : {
                    count        : 0,
                    count_thresh : 40,
                    func         : ai_target_weak
                }
            },
            {
                name     : 'Mabel',
                colour   : 'rgba(255,128,128,0.5)',
                ai       : {
                    count        : 0,
                    count_thresh : 40,
                    func         : ai_target_weak
                }
            }];
}


function do_ai() {
    for (var i = 0; i < game_state.players.length; i++) {
        var p = game_state.players[i];
        if (p == game_state.human_player)
            continue;

        p.ai.count++;
        if (p.ai.count > p.ai.count_thresh) {
            if (p.ai.func(p))
                p.ai.count = 0;
        }
    }
}


function draw_animations() {
    var new_animations = [];
    for (var i = 0; i < game_state.animations.length; i++) {
        var a = game_state.animations[i];
        if (a())
            new_animations.push(a);
    }
    game_state.animations = new_animations;
}


function draw_planet(p) {

    // Draw Aura
    if (p.player != null) {
        ctx.fillStyle = p.player.colour;
        ctx.beginPath();
        var k = 0;
        if (p == game_state.active_planet){
            k=0;
        }
        var tx= p.position.e(1);
        var ty= p.position.e(2);

        ctx.arc(p.position.e(1), p.position.e(2),
                p.radius + p.ntroops +1+ k*Math.sin(game_state.aura_pulse),
                0, Math.PI*2, false);
        game_state.aura_pulse+=0.1;
        ctx.fill();
    }

    if (p == game_state.active_planet){
        ctx.beginPath();
        ctx.arc(p.position.e(1),p.position.e(2), p.travel_radius + p.radius, 0, 2*Math.PI, false);
        ctx.stroke();

        // colour the path
    } else if (game_state.active_planet && can_battle(game_state.active_planet, p)) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,128,128,0.5)';
        ctx.moveTo(p.position.e(1),p.position.e(2));
        ctx.lineTo(game_state.active_planet.position.e(1),game_state.active_planet.position.e(2));
        ctx.stroke();
    } else {
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
    }

    var offset = Math.floor ( Math.sqrt ( 2 * p.radius * p.radius) );
    ctx.drawImage(plan_image, p.position.e(1)-p.radius , p.position.e(2) - p.radius ,2*p.radius,2*p.radius);
}


function update_stats(){
    var planets = game_state.planets;
    for (var i = 0;i < planets.length;i++){
        var p = planets[i];
        if (p.player != null){
            p.health-=0.001*p.numtroops;
            p.ntroops =p.ntroops + 0.01;
        }
    }
}


function is_game_over() {
    var has_human = false;
    var has_ai    = false;

    for (var i = 0; i < game_state.planets.length; i++) {
        var p = game_state.planets[i].player;
        if (p) {
            if (p == game_state.human_player)
                has_human = true;
            else
                has_ai = true;
        }
    }

    if (has_human && has_ai) {
        return { 'is_game_over' : false };
    } else if (!has_human) {
        return { 'is_game_over' : true, 'won' : false };
    } else {
        return { 'is_game_over' : true, 'won' : true };
    }
}


function game_loop() {
    physics_step(game_state.planets, 1000/40.0 * 0.1);
    update_stats();
    do_ai();

    // AI can take over your active planet
    if (game_state.active_planet && game_state.active_planet.player != game_state.human_player)
        game_state.active_planet = null;

    // text properties
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // redraw
    var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height / 2);
    grad.addColorStop(0, "black");
    grad.addColorStop(0.5, "rgb(15, 15, 15)");
    grad.addColorStop(1, "black");
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dot drawing style
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    ctx.strokeStyle = "#eee";

    // Draw scene
    draw_animations();
    for (var i = 0; i < game_state.planets.length; i++)
        draw_planet(game_state.planets[i]);

    var game_over = is_game_over();
    if (game_over.is_game_over) {
        var text;
        if (game_over.won)
            text = 'YOU HAVE WON!';
        else
            text = 'GAME OVER';

        // Draw text
        ctx.save();
        ctx.font      = 'bold 36px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}


function init(nplanets) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var supportsTouch = 'createTouch' in document;
    canvas[supportsTouch ? 'ontouchstart' : 'onmousedown'] = click;

    var players = generate_players();
    var planets = new Array();
    for (var i = 0; i < nplanets; i++)
        planets.push(generate_planet());

    planets[0].player  = players[0];
    planets[0].ntroops = 10;

    planets[1].player  = players[1];
    planets[1].ntroops = 8;

    planets[2].player  = players[2];
    planets[2].ntroops = 8;

    plan_image = new Image();
    plan_image.src = "images/planet3.png";

    game_state = {
        planets : planets,
        players : players,
        active_planet : planets[0],
        human_player : players[0],
        animations : [],
        aura_pulse : 0
    };

    setInterval(game_loop, 40);
}
