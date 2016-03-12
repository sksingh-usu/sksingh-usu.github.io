/* This file contains all the Components used in the game viz: Car, Player, Home blocks, and Stickers and their helper functions
  * All these components are inherited from the Actor interface which holds the coordinate(x,y) location, sprite url and also defines the rendering function of these components on the canvas.
  * This file also defines the eventListening handles from the USER for the game keys elucidated in the README file.
*/


/* Global Variable initialization
 * This variables are used in game.js to control the components from the Game object*/
const TILE_WIDTH = 101,
    TILE_HEIGHT = 83;
var allChildren = [];
var homes = [];
var sticker;
var allCars = [];
var childArr = ['images/char-horn-girl.png', 'images/char-cat-girl.png', 'images/char-pink-girl.png',
    'images/char-princess-girl.png', 'images/char-horn-girl.png'];

/* Actor is an Interface Object since all the components shares the common property of x,y location, sprite url and also shares the render() function.
All other components will implement/extend this actor calls within their constructor
 */
var Actor = function(x, y, sprite){
    this.x=x;
    this.y=y;
    this.sprite=sprite;
};
/** This function renders the given sprite at location x,y defined in the object */
Actor.prototype.render =function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/** Cars our player must avoid */
var Car = function (x, y) {

    /*  the url of the image which is used by the helper function render() to paint the image on canvas.*/
    var sprite =  'images/car.png';
    /*  Instantiating Interface Object*/
    Actor.call(this,x,y,sprite);

    /*  this defines the translation offset on each engine loop for the car. It help repaint the car image to a translated location on the canvas.*/
    this.speed = getSpeed();
};

/* Setting the prototype of car to use the Actors prototype*/
Car.prototype = Object.create(Actor.prototype);

/*Setting the Constructor*/
Car.prototype.constructor = Car;

/* This function updates the location of the car object to a new X-translated value which helps to create an impression of moving car*/
Car.prototype.update = function (dt) {
    this.x = this.x + this.speed * dt;
    if (this.x >= ctx.canvas.width) {
        this.x = 0;
        this.y = getLocation();
        this.speed = getSpeed();
    }
};

/* Resetting the car to outside the canvas so that it is invisible to user.*/
Car.prototype.reset = function () {
    this.x = -100;
};
/*Sticker is use to provide the information messages to the user like Instructions, Win/Lost message*/
var Sticker = function (x, y, url) {
    this.x=x;
    this.y=y;
    this.sprite = url;
};

Sticker.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*Player class constructor */
var Player = function () {

    var sprite='images/char-boy.png';
    Actor.call(this,606,320,sprite);
    this.hasChild = false;
    this.noOfChild = 0;
};
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;


/*Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};*/

/*Updating the location of the player based on the key input from the user.*/
Player.prototype.update = function (key) {
    switch (key) {
        case 'left' :
            this.x = this.x - TILE_WIDTH;
            break;
        case 'right' :
            this.x = this.x + TILE_WIDTH;
            break;
        case 'up' :
            this.y = this.y - TILE_HEIGHT;
            break;
        case 'down' :
            this.y = this.y + TILE_HEIGHT;
            break;
    }
};

/* This function iterates over every child object in allChildren array and see if player share the same space as child and if yes player holds the child using holdChild();*/
Player.prototype.canHoldChild = function () {
    var self = this;

    allChildren.forEach(function (child) {
        if (self.x == child.x && self.y == child.y && !self.hasChild) {
            child.update(-100);
            child.isHeld = true;
            self.holdChild();
        }
    });
};

/* Once player can hold the child, we set the hasChild to true and replaces the image of the player with the one holding child.*/
Player.prototype.holdChild = function () {
    this.hasChild = true;
    this.sprite = 'images/char-boy-with-child.png';
};

/* once the player reaches the home block, this function is called and it drops the children which is updating the home image to home image with child, resetting the player location to default
    This also increases the number of cars on canvas and also their speed which adds to the complexity of the game
 */
Player.prototype.dropChild = function () {
    this.noOfChild = this.noOfChild + 1;
    this.addHome();
    this.resetLocation();
    addCar();
};

/* This function checks if player can drop child on the home block or not. Once the player is at home block and it has child it can drop else not.*/
Player.prototype.canDropChild = function () {
    if (this.y < 0 && this.hasChild) {
        this.dropChild();
    }
};

/*This function handles the user input keys for every player movement*/
Player.prototype.handleInput = function (key) {
    if (game.currentStatus == game.gameStatus.RUNNING) {
        this.update(key);
        this.restrictMovement(this.x, this.y);
        this.canHoldChild();
        this.canDropChild();
        if (this.checkWin()) {
            game.currentStatus = game.gameStatus.STOP;
            game.resetGame();
            sticker = new Sticker(200, 200, 'images/win.png');
        }
    }
};

/*This function restricts the player movement outside the canvas.*/
Player.prototype.restrictMovement = function (x, y) {
    if (x >= ctx.canvas.width) {
        this.x -= TILE_WIDTH;
    }
    if (x < 0) {
        this.x = 0;
    }
    if (y >= 403) {
        this.y -= TILE_HEIGHT;
    }
    if (y <= -12) {
        this.y = -12;
    }
};

Player.prototype.resetLocation = function () {
    this.x = 606;
    this.y = 320;
    this.sprite = 'images/char-boy.png';
    this.hasChild = false;
};

/* This function checks on every player movement if the player has won or not. The win condition is if all the children has been dropped.
For every dropped child we increase the counter by 1 and as soon it reaches the number of children we have created on the canvas player wins
 */
Player.prototype.checkWin = function () {
    return this.noOfChild == childArr.length;
};

/* Once the player we replace the home image with the with child image
	and sets the coordinate of the image according to the number of children dropped to home row. */
Player.prototype.addHome = function() {
    var home = new Home(posArray[this.noOfChild], 0);
    homes.push(home);
};

var player = new Player();

/* Creating the child*/
var Child = function (x, y, url) {
    Actor.call(this,x,y,url);
    this.isHeld = false;
};

Child.prototype = Object.create(Actor.prototype);
Child.prototype.constructor=Child;

/*
Child.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
*/

Child.prototype.update = function (x) {
    this.x = x;
};

/* This function generates a random row location for the cars to start with after completing their every run.
 posArray has location of the three stone blocks rows and we generate a random number which acts as index for the posArray
* */
function getLocation() {
    var posArray = [71, 154, 237];
    return posArray[Math.floor(Math.random() * (3 - 0) + 0)];
}
var posArray = [0, 101, 202, 303, 404, 505];

function getXLocation() {
    return posArray[Math.floor(Math.random() * (5 - 0) + 0)];
}

/* Function to generate the random speed*/
function getSpeed() {
    return Math.random() * (200 - 50) + 50;
}

/*Creating the Home objects which will be rendered on top row once player will drop the child*/
var Home = function (x, y) {
	this.x = x;
	this.y = y;
    this.sprite = 'images/home-with-child.png';
};

Home.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'Space'
    };
    handleInput(allowedKeys[e.keyCode]);
});




/* Creating initial set of the enemies*/
function createEnemies() {
    for (var i = 0; i < 3; i++) {
        var car = new Car(-100, getLocation());
        allCars.push(car);
    }
}

function createChildren() {
    for (var i = 0; i < childArr.length; i++) {

        /* The y location will be same for player and children since they share same row.*/
        var child = new Child(-100, 320, childArr[i]);
        allChildren.push(child);
    }
}

/* This function creates one more*/
function addCar() {
    var car = new Car(0, getLocation());
    allCars.push(car);
}

/* this function handles the input. Inputs are divided in two classes
 1. when game is running. In this case we handles player movement
 2. when game is stopped. In this case we ask the user if the want to continue the game
  */
function handleInput(key) {
    if (game.currentStatus == game.gameStatus.STOP && key == "Space") {
        game.resetGame();
    } else {
        player.handleInput(key);
    }
}
