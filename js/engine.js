/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function (global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = document.getElementById('gameWindow');
        win = global.window,
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext('2d'),
        lastTime = 0;

    canvas.width = 707;
    canvas.height = 505;
    doc.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        main();
    }

    /* This function is called on each iteration of the engine loop
     * and it checks for the collision(overlapping) of the cars and player using their respective location */
    function checkCollisions() {
        allCars.forEach(function (car) {
            if (car.y == player.y) {
                if ((car.x <= player.x && car.x + 90 >= player.x) || (car.x >= player.x && player.x > car.x - 90)) {
                    game.gameOver();
                }
            }
        });
    }


    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        game.update(dt);
        checkCollisions();
    }

    /* This function is called by main (our game loop)
     * which in turn call the render function defined in the game.js file
     */
    function render() {
        game.render();
    }


    /* We load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/grass-block.png',
        'images/car.png',
        'images/char-boy.png',
        'images/home.png',
        'images/char-boy-with-child.png',
        'images/char-horn-girl.png',
        'images/char-cat-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/home-with-child.png',
        'images/Introduction.png',
        'images/win.png',
        'images/Lost.png'
    ]);

    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js and game.js files.
     */
    global.ctx = ctx;
})(this);