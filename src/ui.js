
function click(e){
    var pos = getCursorPosition(e);
    var x = pos.x;
    var y = pos.y;
    var p = get_planet(game_state.planets,x,y);

    if (game_state.active_planet != null){ // attack a planet
        if (p){
            // XXX battle() must check the distance
            battle(game_state.active_planet , p);
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

// XXX only returns first planet which is close
function get_planet(planets,x,y){
    for (i=0;i < planets.length;i++){
        var plan = planets[i];
        var radius = plan.radius;
        var dist = $V([x,y]);
        if (dist.subtract( plan.position ).modulus() < radius){
            console.log('Planet clicked', plan.ntroops);
            return plan;
        }
    }
    console.log('Space clicked');
    return null;
}
