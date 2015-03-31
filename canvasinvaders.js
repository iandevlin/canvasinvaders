/*global document:false, window:false, requestAnimationFrame:false */
(function () {
    'use strict';

    var reset = document.querySelector('#reset'),
        canvas = document.querySelector('#space'),
        context = canvas.getContext('2d'),
        width = window.innerWidth / 1.5,
        height = window.innerHeight / 1.5,
        speed = 4,
        projectileSize = 4,
        barrierHeight = projectileSize,
        cannonMoveOffset = 5,
        cannonSize = {
            width: 30,
            height: 10
        },
        invaderSize = {
            width: 30,
            height: 20
        },
        cannon,
        missiles = [],
        barriers = [],
        invaders = [],
        bombs = [],
        // Very simple (and SLOW!) collision detection
        hasCollided = function hasCollided(o1, o2) {
            if (o1.pos.x < o2.pos.x + o2.dim.width &&
                o1.pos.x + o1.dim.width > o2.pos.x &&
                o1.pos.y < o2.pos.y + o2.dim.height &&
                o1.pos.y + o1.dim.height > o2.pos.y) {
                return true;
            }
            return false;
        },
        createBomb = function createBomb(x, y) {
            return {
                dim: {
                    width: projectileSize,
                    height: projectileSize
                },
                pos: {
                    x: x,
                    y: y
                },
                movement: {
                    x: x,
                    y: speed
                }
            };
        },
        draw = function draw() {
            context.clearRect(0, 0, width, height);

            // Cannon
            context.fillRect(cannon.pos.x, cannon.pos.y, cannon.dim.width, cannon.dim.height);
            context.fillRect(cannon.pos.x + (cannon.dim.width / 3), cannon.pos.y - cannon.dim.height, cannon.dim.width / 3, cannon.dim.height);

            // Missiles
            missiles.forEach(function (missile, index) {
                context.fillRect(missile.pos.x, missile.pos.y, missile.dim.width, missile.dim.height);

                missile.pos.y += missile.movement.y;

                if (missile.pos.y < 0) {
                    missiles.splice(index, 1);
                }

                // Check for barrier collision
                barriers.forEach(function (barrier, bindex) {
                    if (hasCollided(barrier, missile) && barrier.damage.indexOf(missile.pos.x) === -1) {
                        // Save the damage to the barrier and remove the missile
                        barriers[bindex].damage.push(missile.pos.x);
                        missiles.splice(index, 1);
                    }
                });

                // Check for invader collision
                invaders.forEach(function (invader, iindex) {
                    if (hasCollided(invader, missile)) {
                        missiles.splice(index, 1);
                        invaders.splice(iindex, 1);
                    }
                });
            });

            // Bombs
            bombs.forEach(function (bomb, index) {
                context.fillRect(bomb.pos.x, bomb.pos.y, bomb.dim.width, bomb.dim.height);

                bomb.pos.y += bomb.movement.y;

                if (bomb.pos.y > height) {
                    bombs.splice(index, 1);
                }

                // Check for barrier collision
                barriers.forEach(function (barrier, bindex) {
                    if (hasCollided(barrier, bomb)) {
                        // Remove the bomb
                        bombs.splice(index, 1);
                    }
                });

                // Check for cannon collision
                if (hasCollided(bomb, cannon)) {
                    init();
                }
            });

            // Invaders
            invaders.forEach(function (invader) {
                context.fillRect(invader.pos.x, invader.pos.y, invader.dim.width, invader.dim.height);

                if (invader.dir === 'right') {
                    invader.pos.x += invader.movement.x;
                } else {
                    invader.pos.x -= invader.movement.x;
                }

                if (Math.random() > 0.995) {
                    bombs.push(createBomb(invader.pos.x, invader.pos.y));
                }
            });
            // First invader
            if (invaders[0].pos.x < 0) {
                invaders.map(function (inv) {
                    inv.dir = 'right';
                });
            } else if (invaders[invaders.length - 1].pos.x + invaders[invaders.length - 1].dim.width > width) {
                invaders.map(function (inv) {
                    inv.dir = 'left';
                });
            }

            // Barriers
            barriers.forEach(function (barrier) {
                var i;
                context.fillRect(barrier.pos.x, barrier.pos.y, barrier.dim.width, barrier.dim.height);

                // Check if the barrier has any damage
                if (barrier.damage.length > 0) {
                    for (i = 0; i < barrier.damage.length; i++) {
                        context.clearRect(barrier.damage[i], barrier.pos.y, projectileSize, projectileSize);
                    }
                }
            });

            requestAnimationFrame(draw);
        },
        createMissile = function createMissile(x, y) {
            return {
                dim: {
                    width: projectileSize,
                    height: projectileSize
                },
                pos: {
                    x: x,
                    y: y
                },
                movement: {
                    x: x,
                    y: -speed
                }
            };
        },
        createBarrier = function createBarrier(w) {
            return {
                dim: {
                    width: w,
                    height: barrierHeight
                },
                pos: {
                    x: (width / 2) - (w / 2),
                    y: (height / 100) * 65
                },
                damage: []
            };
        },
        createInvader = function createInvader(x, y) {
            return {
                dim: {
                    width: invaderSize.width,
                    height: invaderSize.height
                },
                pos: {
                    x: x,
                    y: y
                },
                movement: {
                    dir: 'left',
                    x: 0.5,
                    y: y
                }
            };
        },
        createInvaders = function createInvaders(num) {
            var i,
                x,
                y,
                total = width - (num * invaderSize.width),
                offset = total / num / 2;

            for (i = 0; i < num; i++) {
                if (i === 0) {
                    x = offset;
                } else {
                    x = invaders[i - 1].pos.x + (offset * 2) + invaderSize.width;
                }
                y = 10;

                invaders.push(createInvader(x, y));
            }
        },
        createCannon = function createCannon() {
            return {
                dim: {
                    width: cannonSize.width,
                    height: cannonSize.height
                },
                pos: {
                    x: (width / 2) - (cannonSize.width / 2),
                    y: height - cannonSize.height
                }
            };
        },
        moveCannon = function moveCannon(dir) {
            if (dir === 'left') {
                cannon.pos.x -= cannonMoveOffset;
            } else {
                cannon.pos.x += cannonMoveOffset;
            }
            if (cannon.pos.x < 0) {
                cannon.pos.x = 0;
            } else if (cannon.pos.x > (width - cannon.dim.width)) {
                cannon.pos.x = width - cannon.dim.width;
            }
        },
        fireCannon = function fireCannon() {
            var missile = createMissile(
                cannon.pos.x + (cannon.dim.width / 2) - (projectileSize / 2),
                parseFloat(parseFloat(cannon.pos.y) + parseInt(cannon.dim.height, 10))
            );
            missiles.push(missile);
        },
        keypress = function keypress(e) {
            console.log(e);
            if (e.keyCode === 39) {
                moveCannon('right');
            } else if (e.keyCode === 37) {
                moveCannon('left');
            } else if (e.keyCode === 32) {
                fireCannon();
            }
        },
        init = function init() {
            context.clearRect(0, 0, width, height);
            canvas.width = width;
            canvas.height = height;
            context.fillStyle = 'white';
            missiles = [];
            bombs = [];
            barriers = [];
            invaders = [];
            cannon = createCannon();
            barriers.push(createBarrier(projectileSize * 60));
            createInvaders(6);
            window.onkeydown = keypress;
        };

    init();

    draw();

    reset.addEventListener('click', function () {
        init();
    });

}());