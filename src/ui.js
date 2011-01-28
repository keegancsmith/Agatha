
function click(state){
    var pos = getCursorPosition(e);
    var x = pos.x;
    var y = pos.y;
    var p = get_planet(planets,x,y);
    if (state.active_planet != null){
        if (p){
            // XXX battle() must check the distance
            battle(state.active_planet , p);
        }
        else{
            state.active_planet = null;
        }
    }
    else{
        state.active_planet = p;
    }

}

// XXX only returns first planet which is close
function get_planet(planets,x,y){
    for (i=0;i < planets.length;i++){
        var plan = planets[i];
        var radius = plan.radius;
        var dist = $V([x,y])
        if (dist.minus(plan.pos).modulus() < radius){
            return plan;
        }
    }
    return null;
}
