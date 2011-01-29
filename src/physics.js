physics_props = {
    max_acceleration : 100,
    bounce_dampening : -0.5,
    max_velocity     : 1,
    collision_mult   : 1.5
};


function calculate_acceleration(p1, planets) {
    var accel = Vector.Zero(2);

    for (var i = 0; i < planets.length; i++) {
        if (planets[i] == p1)
            continue;

        var p2   = planets[i];
        var pos1 = p1.position;
        var pos2 = p2.position;

        var dir  = pos2.subtract(pos1).toUnitVector();
        var dist = pos1.distanceFrom(pos2);

        if (dist * dist == 0)
            continue;

        var f = (p1.mass * p2.mass) / (dist * dist);
        accel = accel.add(dir.multiply(f));
    }

    var max_accel = physics_props.max_acceleration;
    if (accel.modulus() > max_accel)
        accel = accel.toUnitVector().multiply(max_accel * 0.9);

    return accel;
}


function do_collision(p1, p2, dt) {
    // Adapted from http://archive.ncsa.illinois.edu/Classes/MATH198/townsend/math.html
    var n = p1.position.subtract(p2.position).toUnitVector();

    var vn1 = n.x(-1 * p1.velocity.dot(n.x(-1)));
    var vn2 = n.x(p2.velocity.dot(n));

    var vt1 = vn1.subtract(p1.velocity);
    var vt2 = vn2.subtract(p2.velocity);

    // ignoring mass
    p1.velocity = vt1.add(vn2).x(physics_props.collision_mult);
    p2.velocity = vt2.add(vn1).x(physics_props.collision_mult);

    p1.position = p1.position.add(p1.velocity.multiply(dt));
    p2.position = p2.position.add(p2.velocity.multiply(dt));
}


function physics_step(planets, dt) {
    for (var i = 0; i < planets.length; i++) {
        var p = planets[i].position;
        var v = planets[i].velocity;
        var a = calculate_acceleration(planets[i], planets);

        v = v.add(a.multiply(dt));
        p = p.add(v.multiply(dt));

        var px = p.e(1);
        var py = p.e(2);
        var vx = v.e(1);
        var vy = v.e(2);
        var bounce_dampening = physics_props.bounce_dampening;

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

        p = $V([px, py]);
        v = $V([vx, vy]);

        var max_vel = physics_props.max_velocity;
        if (v.modulus() > max_vel)
            v = v.toUnitVector().multiply(max_vel * 0.9);

        planets[i].position = p;
        planets[i].velocity = v;
    }

    // Check for collisions
    for (i = 0; i < planets.length; i++) {
        var p1 = planets[i];
        for (var j = 0; j < planets.length; j++) {
            if (i == j)
                continue;

            var p2 = planets[j];
            if (p1.position.distanceFrom(p2.position) - p1.radius - p2.radius <= 0)
                do_collision(p1, p2, dt);
        }
    }
}
