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


function click(e){
    var pos = getCursorPosition(e);
    var x = pos.x;
    var y = pos.y;
    var p = find_closest_planet(game_state.planets, x, y);

    if (game_state.active_planet != null){ // attack a planet
        if (p){
            // XXX battle() must check the distance
            if (can_battle(game_state.active_planet, p)) {
                battle(game_state.active_planet, p);
            } else if (game_state.active_planet.player == p.player) {
                game_state.active_planet = p;
            }
        }
        else{
            game_state.active_planet = null;
        }
    }
    else{ // select a planet
        if (p == null){
            console.log('Cant select empty space');
            return;
        }
        if (p.player == null){ // No player,  invalid move
            console.log('You cant select an empty planet');
        }
        else if (p.player != game_state.human_player){ // enemy player, invalid move
            console.log('You cant select an enemy');
        }
        else if (p.player == game_state.human_player){ // good move
            game_state.active_planet = p;
        }
    }

}


function find_closest_planet(planets, x, y){
    var v = $V([x, y]);
    var closest_planet = [2 * canvas.width, null];

    for (var i = 0; i < planets.length; i++){
        var p = planets[i];
        var d = v.distanceFrom(p.position) - p.radius;
        if ([d, p] < closest_planet)
            closest_planet = [d, p];
    }

    if (closest_planet[0] < 100)
        return closest_planet[1];
    else
        return null;
}
