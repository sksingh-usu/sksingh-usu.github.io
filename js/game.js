/* Game.js
 * This file contains the Game object which acts as an backbone object for the game. Here we define the game as real world object
 * It provides the functionality to start, pause, resume and restart the game according to the commands from the user via controls in the UI page.It also renders and updates the canvas with necessary components according
 * to the current status of the game. These methods are called on each engine loop.
 */

/*Initializing the Game function object with the currentStatus of the game. For the complete user session we will have one object of the Game
 * We defined the gameStatus object as pseudo Enum which has different statuses a game can be at a particular time.
 * currentStatus holds the current status of the game. this is used in the game to control the position updates of various actors.
 * ** Actors are player, enemy(cars) and children
 */
var Game = function () {

    this.gameStatus = {
        "PAUSE": 'pause', "RUNNING": 'running', "STOP": 'stop'
    };
    this.currentStatus = this.gameStatus.STOP; // When the game is loaded it's in STOP state until user clicks on start button.
};

/*This function is called at each engine loop from the main() in Engine.js and responsible for rendering the components on canvas.*/
Game.prototype.render = function () {
    this.renderGame();
    this.renderEntities(this.currentStatus);
};

/*This function is called at each engine loop from the main() in Engine.js and responsible for updating the locations of the actors.*/
Game.prototype.update = function (dt) {
    this.updateEntities(dt, this.currentStatus);
};

/*This function is called from the game controls(START) defined as buttons in the index.html file.
 * It also sets the css of Pause and Restart button to visible giving the user an option to Pause and restart the game at any point of time.
 */
Game.prototype.activateGameStart = function () {
    $("#Start").css("display", 'none');
    $("#Pause").css("display", 'inline');
    $("#Restart").css("display", 'inline');
    $("#Resume").css("display", 'none');
    $("#instruction").css("display", 'none');
    this.gameStart();
};

/* This function is called from the game controls(PAUSE) defined as buttons in the index.html file and calls the gamePause();
 */
Game.prototype.activateGamePause = function () {
    $("#Pause").css("display", 'none');
    $("#Resume").css("display", 'inline');
    this.gamePause()
};

Game.prototype.activateGameResume = function () {
    $("#Pause").css("display", 'inline');
    $("#Resume").css("display", 'none');
    this.gameResume();
};

Game.prototype.activateGameRestart = function () {
    this.gameRestart();
};
/* It will create the enemies and the children from the app.js file  and render them to their default locations to get the game running.
 * It starts the game and set the current status of the game to RUNNING.
 * Setting the current status of the game to RUNNING will allow the update() to update the position of cars and player at each loop creating the animations for the game.
 */
Game.prototype.gameStart = function () {
    createEnemies();
    createChildren();
    this.currentStatus = this.gameStatus.RUNNING;
    sticker = null; // Since the game is running the sticker which has win and lost images are set to null so that it won't get rendered on canvas.
};

/* This function is called from the activateGamePause() function and it sets the current status of the game to PAUSE. Once the game is in PAUSE state the update positions of the actor will cease to update and they will be repainted at same location on each engine loop making them look pause.
 *  In PAUSE state the player also can not move.
 */
Game.prototype.gamePause = function () {
    this.currentStatus = this.gameStatus.PAUSE;
};

/*
 This function is called from activateGameRestart and it sets the player to a new object instance creating a new player with default values.
 it also empties the allEnemy and allChildren array and after that calls the gameStart method which in turn will create the new children and and new enemies objects to push in their respective arrays.
 */
Game.prototype.gameRestart = function () {
    player = new Player();
    allCars = [];
    allChildren = [];
    homes = [];
    this.gameStart();
};

/* This function is called from the Engine.js if player collides with any of the enemy(car) and internally calls the resetGame function.
 It sets the sticker to the Lost image as it will be called only when the player collides with the enemy(car).
 Finally it sets the css to hide all the user action controls
 */
Game.prototype.gameOver = function () {
    this.currentStatus = this.gameStatus.STOP;
    this.resetGame();
    sticker = new Sticker(200, 200, 'images/Lost.png');
    $("#Resume").css("display", 'none');
    $("#Restart").css("display", 'none');
    $("#Pause").css("display", 'none');
    $("#Start").hide();
};

// This function is resetting the game to its original content, It is setting the player to a new instance and also emptying the allEnemy and allChildren array
Game.prototype.resetGame = function () {
    $("#Start").show();
    $("#Resume").css("display", 'none');
    $("#Restart").css("display", 'none');
    $("#Pause").css("display", 'none');
    player = new Player();
    allCars = [];
    allChildren = [];
    homes = [];
    sticker = null;
};

/* This function will resume the game by setting the currentStatus of the game to RUNNING and as soon as game is running the sticker is set to null */
Game.prototype.gameResume = function () {
    this.currentStatus = this.gameStatus.RUNNING;
    sticker = null;
};

/****************************************************/

/* This function initially draws the "game level", it will then call
 * the renderEntities function. Remember, this function is called every
 * game tick (or loop of the game engine) because that's how games work -
 * they are flipbooks creating the illusion of animation but in reality
 * they are just drawing the entire screen over and over.
 */
Game.prototype.renderGame = function () {
    /* This array holds the relative URL to the image used
     * for that particular row of the game level.
     */
    var rowImages = ['images/home.png', 'images/stone-block.png',   // Row 1 of 3 of stone
            'images/stone-block.png',   // Row 2 of 3 of stone
            'images/stone-block.png',   // Row 3 of 3 of stone
            'images/grass-block.png'   // Row 1 of 2 of grass
        ], numRows = 5, numCols = 7, row, col;

    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */

    for (row = 0; row < numRows; row++) {
        for (col = 0; col < numCols; col++) {
            /* The drawImage function of the canvas' context element
             * requires 3 parameters: the image to draw, the x coordinate
             * to start drawing and the y coordinate to start drawing.
             * We're using our Resources helpers to refer to our images
             * so that we get the benefits of caching these images, since
             * we're using them over and over.
             */
            ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
        }
    }
};

Game.prototype.renderEntities = function (currentStatus) {

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    if (this.currentStatus == this.gameStatus.PAUSE || this.gameStatus.RUNNING) {
        allCars.forEach(function (enemy) {
            enemy.render();
        });
        allChildren.forEach(function (child) {
            child.render();
        });
        homes.forEach(function (home) {
            home.render();
        });
        player.render();
    }

    if (this.currentStatus == this.gameStatus.STOP) {
        if (sticker != null) {
            sticker.render();
        }
    }
};

/****************************************************/

/* This is called by the update function and loops through all of the
 * objects within your allCars array as defined in app.js and calls
 * their update() methods. It will then call the update function for your
 * player object. These update methods should focus purely on updating
 * the data/properties related to the object. Once the positions are updated they are rendered using the render methods in the engine.js
 * This function takes the argument dt and currentStatus. dt --> this is used to make the animation smooth as explained in the engine.js file
 * currentStatus --> this holds the current status defined in the constructor of game and used to decide if the object has to be updated or not. If the game is not in running state then it won't update the enemies and children and so for each engine loop they will be rendered at the same location making it look static.
 *
 */
Game.prototype.updateEntities = function (dt, currentStatus) {

    if (this.currentStatus == this.gameStatus.RUNNING) {
        allCars.forEach(function (car) {
            car.update(dt);
        });
        var i = 0;
        allChildren.forEach(function (child) {
            if (!child.isHeld) {
                child.update(posArray[i]);
            }
            i++;
        });
    }
};

/* This function is called when user clicks on instructions button. It sets the sticker to an image containing instructions of the game.*/
Game.prototype.showInstruction = function () {
    sticker = new Sticker(100, 150, 'images/Introduction.png');
};

var game = new Game();