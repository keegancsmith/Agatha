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

function keydown(e){
    console.log("Keydown");
    game_state.active_planet = null;

}
function click(e){
    if (game_state.game_over){
       clearInterval(game_state.main_game_int); 
       init(15);
       //var hs = setInterval(blah,40);
       //home_state.home_int = hs;
    }
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


//--------------------- Home screen Functions ---------------------------

function homeClick(e){
    var pos = getCursorPosition(e);
    if (home_state.current == 'home'){
        if (home_state.selected == 'play'){
            home_state.current = 'play';
            home_state.selected = null;
        }
        else if (home_state.selected == 'guide' ) {
            home_state.current = 'guide';
        }
        else if (home_state.selected == 'about'){
            home_state.current = 'about';
        }

    }
    else if (home_state.current == 'play'){
    }
    else{
        home_state.current = 'home';
    }
}
function homeMove(e){
    var pos = getCursorPosition(e);
    if (home_state.current == 'home'){
        if (pos.x > 230 && pos.x < (230 + 140)){
            if (pos.y > 80 && pos.y < (80+53)){
                home_state.selected = 'play';
            }
            else if (pos.y > 120 && pos.y < (120+36)){
                home_state.selected = 'guide';
            }
            else if (pos.y > 150 && pos.y < 186){
                home_state.selected = 'about';
            }
            else{
                home_state.selected = null;
            }
        }
        else{
                home_state.selected = null;
        }
    }
    else if (home_state.current == 'play'){
        if (pos.x > 150 && pos.x < 350){
            if (pos.y > 319 && pos.y < 360){
                home_state.selected = 'easy';
            }
            else if (pos.y > 370 && pos.y < 410){
                home_state.selected = 'medium';
            }
            else if (pos.y > 420 && pos.y < 460){
                home_state.selected = 'hard';
            }
            else{
                home_state.selected = null;
            }
        }
        else{
            home_state.selected = null;
        }
    }
}
