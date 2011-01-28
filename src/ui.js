
function click(e){
    var pos = getCursorPosition(e);
    var x = pos.x;
    var y = pos.y;
    var p = get_planet(game_state.planets,x,y);
    if (game_state.active_planet != null){
        if (p){
            // XXX battle() must check the distance
            battle(game_state.active_planet , p);
        }
        else{
            game_state.active_planet = null;
        }
    }
    else{
        game_state.active_planet = p;
    }

}

// XXX only returns first planet which is close
function get_planet(planets,x,y){
    for (i=0;i < planets.length;i++){
        var plan = planets[i];
        var radius = plan.radius;
        var dist = $V([x,y])
        if (dist.subtract( plan.position ).modulus() < radius){
            console.log('Found a planet');
            return plan;
        }
    }
            console.log('Not a planet');
    return null;
}
