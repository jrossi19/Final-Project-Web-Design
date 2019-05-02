//lovingly stolen from http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
//...and modified heavily

//################ SETUP CANVAS ##################
//create the canvas element
var canvas = document.createElement("canvas");
//takes canvas gets its context and puts that value in the ctx variable
var ctx = canvas.getContext("2d");
// set canvas width height
canvas.width = 600;
canvas.height = 450;
//appends the canvas to the document object
document.body.appendChild(canvas);

//################ Global variables ##################
var playing = true;
var monstersCaught = 0;
var allMonsters = [];
var allPlatforms = [];
var allPillars = [];
var allProjectiles = [];
var allExplosions = [];
var gravity = 2;
var wave =25;
var timerThen = Math.floor(Date.now() / 1000);
var bgX = 0;
var gameOverTimer;
var xProgress = 0;

//################ Setting up images ##################

// sprite sheet
var imgReady = false;
var img = new Image();
img.onload = function () {
	imgReady = true;
};
img.src = "_images/dog hero.png";

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
	console.log("background loaded successfully");
};
bgImage.src = "_images/scrollingbackground3.png";

// Scratching Post image
var postReady = false;
var postImage = new Image();
postImage.onload = function () {
	postReady = true;
	console.log("post loaded successfully");
};
postImage.src = "_images/post.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "_images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "_images/monster2.gif";

// Boss image
var bossReady = false;
var bossImage = new Image();
bossImage.onload = function () {
	bossReady = true;
	console.log("boss image loaded successfully");

};
//bossImage.src = "_images/boss.png";

// frozen Monster image
var frozenReady = false;
var frozenImage = new Image();
frozenImage.onload = function () {
	frozenReady = true;
	console.log("frozen bullet loaded successfully");
};
frozenImage.src = "_images/monster_frozen.png";

// projectile image
var projectileReady = false;
var projectileImage = new Image();
projectileImage.onload = function () {
	projectileReady = true;
	console.log("fireball image loaded successfully");
};

projectileImage.src = "_images/fireball.png";

// explode image
var explodeReady = false;
var explodeImage = new Image();
explodeImage.onload = function () {
	explodeReady = true;
};
explodeImage.src = "_images/explode.png";

// sword image
var swordReady = false;
var swordImage = new Image();
swordImage.onload = function () {
	swordReady = true;
};
swordImage.src = "_images/sword.png";

//sounds

function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
	  this.sound.play();
	};
	this.stop = function(){
	  this.sound.pause();
	};
}

//global vars
var pew;
var boom;
pew = new sound("_sounds/somesound.mp3");
boom = new sound("_sounds/boom.mp3");

//############ Proto testing ground ##################

function Entity() {
	this.x = '';
	this.y = '';
	this.width = '';
	this.height = '';
}

function magicMissile() {
	Entity.call(this);
	this.reports = [];

}
magicMissile.prototype = Object.create(Entity.prototype);
magicMissile.prototype.constructor = magicMissile;



//################ Game Objects ##################
var hero = {
	magic: "fire",
	width: 32,
	height: 32,
	velX: 0,
	velY: 0,
	gravity: gravity,
	speed: 5, // movement in pixels per second
	coFriction: 0.8,
	friction: function () {
		if (this.velX > 0.5) {
			this.velX -= this.coFriction;
		}
		else if (this.velX < -0.5) {
			this.velX += this.coFriction;
		}
		else {
			this.velX = 0;
		}
	},
	grounded: true,
	jump: function () {
		this.velY -= 25;
	}
};

function shoot() {
	pew.play();
	var bullet = new Projectile();
	bullet.fired = true;
	var length = Math.sqrt(Math.pow(bullet.directionX, 2) + Math.pow(bullet.directionY, 2));
	bullet.directionX/=length;
	bullet.directionY/=length;
}

function Monster() {
	this.width = 32;
	this.height = 32;
	this.types = ["normal", "boss", "jumpy"];
	this.type = this.types[range(0, 1)];
	this.state = "normal";
	this.alive = true;
	this.deathCoords = [];
	this.x = Math.random() * canvas.width;
	this.y = 0;
	this.velX = 1;
	this.velY = 1;
	this.direction = 1;
	this.reset = function () {
		this.y = 0;
	};
	allMonsters.push(this);
}

function Platform(x,y,w,h,type) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.velX = 1;
	this.direction = 1;
	this.type = type;
	allPlatforms.push(this);
}

function Pillar(x,y,w,h,type) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.velX = 1;
	this.velY = 0;
	this.direction = 1;
	this.type = type;
	allPillars.push(this);
}

//floor
var ground = new Platform(0,canvas.height-0,canvas.width, 0,"ground");

var myFirstPillar = new Pillar(620, 370, 50, 50, "normal");
console.log("here are the pillars... " + allPillars);

//################ Functions ##################
var reset = function () {
	hero.x = canvas.width/2;
	hero.y = canvas.height/2;
	monsterWave(wave);
};

// generate random number
var randNum = function (x) {
	return Math.floor(Math.random() * x);
};

//this function populates an array using a range of values
function range(start, end) {
	var arr = [];
	for (let i = start; i <= end; i++) {
		arr.push(i);
	}
	return arr;
}
function signum() {
	var  selections = [-1,1];
	return selections[randNum(selections.length)];
}
//this function creates new monsters based on a range using the range function
function monsterWave(max) {
	for (var monster in range(1, max)) {
		monster = new Monster();
		// monster.type = "jumpy";
		monster.type = monster.types[randNum(monster.types.length)];
		monster.direction = signum();
		// monster.velX = randNum(6) + 1;
		// monster.velY = randNum(10) + 1;
	}
}

//this function creates new plats based on x tranlation
function platWave(max) {
	for (var plat in range(1, max)) {
		plat = new Platform(450,400,100,20,"normal");
	}
}

//countdown timer counts down from x to y
function counter() {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer = timerNow - timerThen;
	return currentTimer;
}
function timerUp(x,y) {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer = timerNow - timerThen;
	if (currentTimer <= y && typeof (currentTimer + x) != "undefined") {
		return currentTimer;
	}
	else {
		timerThen = timerNow;
		return x;
	}
}
function fastTimerUp(x,y) {
	timerNow = Date.now();
	currentTimer = timerNow - timerThen;
	if (currentTimer <= y && typeof (currentTimer + x) != "undefined") {
		return currentTimer;
	}
	else {
		timerThen = timerNow;
		return x;
	}
}
function timerDown(x,y) {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer =  timerNow - timerThen;
	if (currentTimer <= y && typeof (currentTimer + x) != "undefined") {
		return y-currentTimer;
	}
	else {
		timerThen = timerNow;
		return x;
	}
}

// ########## this is where animation magic happens ########
function drawFrame(frameX, frameY, canvasX, canvasY) {
	ctx.drawImage(img, frameX * hero.width, frameY * hero.height, hero.width, hero.height, canvasX, canvasY, hero.width, hero.height);
}

const cycleLoop = [0, 1];
let currentLoopIndex = 0;
let frameCount = 0;

function step(delay) {
	frameCount += 1;
	drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
	if (frameCount > delay) {
		frameCount = 0;
		drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
		currentLoopIndex++;
		if (currentLoopIndex >= cycleLoop.length) {
			currentLoopIndex = 0;
		}
	}
}

function drawRotated(image, degrees, x, y, w, h){
    ctx.clearRect(x,y,w,h);

    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    ctx.save();

    // move to the center of the canvas
    ctx.translate(x,y);

    // rotate the canvas to the specified degrees
    ctx.rotate(degrees*Math.PI/180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    // ctx.drawImage(image,-image.width/2,-image.width/2);
    ctx.drawImage(image,-image.width/2,-image.height/2);

    // we’re done with the rotating so restore the unrotated context
    ctx.restore();
}

//################ Setup Keyboard controls ##################

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

// #################### get user input #########################

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown && hero.grounded == true) { // Player holding up
		// hero.y -= hero.speed * modifier;\
		hero.jump();
		hero.grounded = false;
	}
	if ("s" in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if ("q" in keysDown) { // Player holding down
		hero.health = 100;
		playing = true;
		
	}
	if ("a" in keysDown) { // Player holding left
		hero.velX = -hero.speed;
	}
	if ("d" in keysDown) { // Player holding right
		hero.velX = hero.speed;
	}
	if ("e" in keysDown) { // Player holding right
		projectileImage.src = "_images/frostball.png";
		hero.magic = "frost";
		for (projectile in allProjectiles) {
			allProjectiles[projectile].type = "frost";
		}
	}
	if (" " in keysDown) {
		projectileImage.src = "_images/fireball.png";
		hero.magic = "fire";
		for (projectile in allProjectiles) {
			allProjectiles[projectile].type = "fire";
		}
	}
};

// gets mouse position and runs the shoot function
addEventListener('mousedown', mouseClick);
// addEventListener('touchstart', mouseClick);
// addEventListener("touchend", mouseClick);

function mouseClick(e) {
//   console.log( `
//     Screen X/Y: ${e.screenX}, ${e.screenY}
// 	Client X/Y: ${e.clientX}, ${e.clientY}`);
	mouseCoords =  [e.clientX, e.clientY];
	// console.log(mouseCoords);
	if (allProjectiles.length < 3) {
		shoot();
	}
	console.log(mousedownID);
}

// ##################### Update #####################
var update = function (modifier) {
	xProgress += hero.velX;


	hero.y += hero.velY;
	if (hero.x < canvas.width/4) {
		hero.x += hero.velX;
	}
	//health timer for progressively losing
	gameOverTimer = timerDown(0,60);

	if (gameOverTimer < 0) {
		playing = false;
	}

	// makes background move relative to hero...
	bgX -= hero.velX;

	// create new plats
	if (xProgress > 400 && allPlatforms.length < 1) {
		platWave(1);
	}
	// console.log (hero.y);
	hero.friction();
	//here's all the timer stuff
	if (hero.health < 0) {
		// console.log("he's dead!!!");
		playing = false;
	}
	// if (timerDown(0,5)<= 0) {
	// 	playing = false;
	// }
	if (allMonsters.length == 0) {
		wave += wave;
		monsterWave(wave);
	}
	if (hero.y < canvas.height) {
		hero.velY += hero.gravity;
	}
	// this keeps the hero on the screen...
	if (hero.x >= canvas.width - 32) {
		hero.x = canvas.width - 32;
	}
	if (hero.x <= 0) {
		hero.x = 0;
	}
	if (hero.y <= 0) {
		hero.y = 0;
	}

	for (var pillar in allPillars) {
		if (
			hero.x <= (allPillars[pillar].x + allPillars[pillar].w) &&
			allPillars[pillar].x <= (hero.x + hero.width) &&
			hero.y <= (allPillars[pillar].y + allPillars[pillar].h) &&
			allPillars[pillar].y <= (hero.y + hero.height)
		) {
			console.log("hero collided with pillar...");
			console.log("hero x " + hero.x);
			console.log("pillar x " + allPillars[pillar].x);
			if (hero.x < allPillars[pillar].x) {
				console.log("hero x was lesser...")
				hero.x = allPillars[pillar].x - hero.width;
			}
			if (hero.x + hero.width > allPillars[pillar].x) {
				console.log("hero x was greater...");
				hero.x = allPillars[pillar].x + allPillars[pillar].w;
			}
		}
		allPillars[pillar].x -= hero.velX;
		allPillars[pillar].x -= allPillars[pillar].velX;
		//remove pillar if off screen
		if (allPillars[pillar].x < 0){
			allPillars.splice(pillar, 1);
			console.log(allPillars);
		}
		// if we're all out of pillars add another
		if (allPillars.length < 1){
			var myFirstPillar = new Pillar(620, 370, 50, 50, "normal");
			console.log(allPillars);
			var mySecondPillar = new Pillar(810, 370, 50, 50, "normal");
			console.log(allPillars);
			var mySecondPillar = new Pillar(1020, 370, 50, 50, "normal");
			console.log(allPillars);

		}
	}

	//hero.alive(true)
	//consol.log pillar(false)


	// this is where the monsters get updated
	for (var monster in allMonsters) {
		if (allMonsters[monster].y <= canvas.height && allMonsters[monster].type != "jumpy") {
			if (allMonsters[monster].type == "boss") {
				allMonsters[monster].velX = 3;
					allMonsters[monster].velY = 3;
			}
	
			allMonsters[monster].y += allMonsters[monster].velY;
			allMonsters[monster].x += Math.floor(allMonsters[monster].velX*allMonsters[monster].direction);
			if  (allMonsters[monster].x > canvas.width-allMonsters[monster].width || allMonsters[monster].x < 0){
				allMonsters[monster].direction = allMonsters[monster].direction*-1;
			}
			// if  (allMonsters[monster].x >= hero.x){
			// 	allMonsters[monster].x -= allMonsters[monster].velX;				
			// }
			// if  (allMonsters[monster].x <= hero.x){
			// 	allMonsters[monster].x += allMonsters[monster].velX;				
			// }
			// if  (allMonsters[monster].y <= hero.y){
			// 	allMonsters[monster].y += allMonsters[monster].velY;				
			// }
			// if  (allMonsters[monster].y >= hero.y){
			// 	allMonsters[monster].y -= allMonsters[monster].velY;	
			// }
		}
		if (allMonsters[monster].y > canvas.height) {
			allMonsters[monster].reset();
            allMonsters[monster].x = randNum(canvas.width);
            hero.health-=5;
		}
	}

	// this tracks any projectiles that appear in the array after you click the mouse
	for (var projectile in allProjectiles) {
		allProjectiles[projectile].x += Math.floor(allProjectiles[projectile].directionX*allProjectiles[projectile].speed);
		allProjectiles[projectile].y += Math.floor(allProjectiles[projectile].directionY*allProjectiles[projectile].speed);
	}
	// ################### Collision Detection ########################
	for (var plat in allPlatforms) {
		if (allPlatforms[plat].type == "moving") {
			allPlatforms[plat].x += allPlatforms[plat].velX*allPlatforms[plat].direction;
			if  (allPlatforms[plat].x > canvas.width-allPlatforms[plat].w || allPlatforms[plat].x < 0){
				allPlatforms[plat].direction = allPlatforms[plat].direction*-1;
			}
			
		}
		// uncomment to create scrolling platforms
		if (allPlatforms[plat].type != "ground") {
			allPlatforms[plat].x -= hero.velX;
		}
		if (
			hero.x <= (allPlatforms[plat].x + allPlatforms[plat].w) &&
			allPlatforms[plat].x <= (hero.x + hero.width) &&
			hero.y <= (allPlatforms[plat].y + allPlatforms[plat].h-10) &&
			allPlatforms[plat].y <= (hero.y + hero.width)
		) {	
			// this accounts for fall damage
			if (hero.velY > 30) {
				hero.health -= 10;
			}
			if (allPlatforms[plat].type == "moving") {
				hero.x += allPlatforms[plat].velX*allPlatforms[plat].direction;
			}
			if (allPlatforms[plat].type == "ice") {
				console.log("im ice skating!!!!")
				hero.coFriction = 0.0;
			}
			if (allPlatforms[plat].type == "lava") {
				hero.health -= 1;
			}
			else {
				hero.coFriction = 0.7;
			}

			hero.grounded = true;
			hero.velY = 0;
			hero.y = allPlatforms[plat].y - hero.height;
		}

	}
	
	for (monster in allMonsters) {
		if (
			hero.x <= (allMonsters[monster].x + allMonsters[monster].width) &&
			allMonsters[monster].x <= (hero.x + hero.width) &&
			hero.y <= (allMonsters[monster].y + allMonsters[monster].width) &&
			allMonsters[monster].y <= (hero.y + hero.width)
		) {
			++monstersCaught;
            //uncomment below if you want hero's health to go down when colliding with monster
            hero.health -= 10;
			allMonsters.splice(monster, 1);
		}
	}

	//check to see if any projectile hits and monster in either array
	for (projectile in allProjectiles) {
		for (monster in allMonsters) {
		if (
			allProjectiles[projectile].x <= (allMonsters[monster].x + allMonsters[monster].width) &&
			allMonsters[monster].x <= (allProjectiles[projectile].x + allProjectiles[projectile].width) &&
			allProjectiles[projectile].y <= (allMonsters[monster].y + allMonsters[monster].height) &&
			allMonsters[monster].y <= (allProjectiles[projectile].y + allProjectiles[projectile].height)
		) {	
			if (allProjectiles[projectile].type == "fire") {
				if (allMonsters[monster].state == "normal") {
					allMonsters[monster].state = "dead";
					var splode = new Explosion(allMonsters[monster].x,allMonsters[monster].y);
					shot = true;
					++monstersCaught;
					// gameTimer.countDown += 5;
					allMonsters.splice(monster, 1);
				}
				else if (allMonsters[monster].state == "frozen") {
					allMonsters[monster].state = "normal";
					allMonsters[monster].velX = 3;
					allMonsters[monster].velY = 3;
					allProjectiles.splice(projectile, 1);
				}
			}
			if (allProjectiles[projectile].type == "frost" && allMonsters[monster].type == "normal") {
				allMonsters[monster].state = "frozen";
				var freezeTimer = timerUp(0,3);
				allMonsters[monster].velX=0.5;
				allMonsters[monster].velY=0.5;
				// monsterImage.src = "_images/monster_frozen.png";
				allProjectiles.splice(projectile, 1);
			}
		}
	}
}

// check to see if projectile is off screen
for (projectile in allProjectiles) {
	if (
		allProjectiles[projectile].x > canvas.width ||
		allProjectiles[projectile].x < 0 ||
		allProjectiles[projectile].y > canvas.height ||
		allProjectiles[projectile].y < 0
	) {
		allProjectiles.splice(projectile, 1);
	}
}
};//end of update function

// ################# Render/Draw section ######################
var render = function (modifier) {
	//render background first
	// ctx.drawImage(bgImage, bgX, 0);
	// console.log(bgX);

//start screen
	var startScreen = (function(input) {

		// the red component of rgb
		var hue = 0; 
		// are we moving toward red or black?
		var direction = 1; 
		var transitioning = false;
	
		// record the input state from last frame
		// because we need to compare it in the
		// current frame
		var wasButtonDown = false;
	
		// a helper function
		// used internally to draw the text in
		// in the center of the canvas (with respect
		// to the x coordinate)
		function centerText(ctx, text, y) {
			var measurement = ctx.measureText(text);
			var x = (ctx.canvas.width - measurement.width) / 2;
			ctx.fillText(text, x, y);
		}
		
		// draw the main menu to the canvas
		function draw(ctx, elapsed) {
			
			// let's draw the text in the middle of the canvas
			// note that it's ineffecient to calculate this 
			// in every frame since it never changes 
			// however, I leave it here for simplicity
			var y = ctx.canvas.height / 2;
			
			// create a css color from the `hue`
			var color = 'rgb(' + hue + ',0,0)';
			
			// clear the entire canvas
			// (this is not strictly necessary since we are always
			// updating the same pixels for this screen, however it
			// is generally what you need to do.)
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
			// draw the title of the game
			// this is static and doesn't change
			ctx.fillStyle = 'white';
			ctx.font = '48px monospace';
			centerText(ctx, 'My Awesome Game', y);
	
			// draw instructions to the player
			// this animates the color based on the value of `hue`
			ctx.fillStyle = color;
			ctx.font = '24px monospace';
			centerText(ctx, 'click to begin', y + 30);
		}
	
		// update the color we're drawing and
		// check for input from the user
		function update() {
			// we want `hue` to oscillate between 0 and 255
			hue += 1 * direction;
			if (hue > 255) direction = -1;
			if (hue < 0) direction = 1;
			
			// note that this logic is dependent on the frame rate,
			// that means if the frame rate is slow then the animation
			// is slow. 
			// we could make it indepedent on the frame rate, but we'll 
			// come to that later.
	
			// here we magically capture the state of the mouse
			// notice that we are not dealing with events inside the game
			// loop.
			// we'll come back to this too.
			var isButtonDown = input.isButtonDown();
	
			// we want to know if the input (mouse click) _just_ happened
			// that means we only want to transition away from the menu to the
			// game if there _was_ input on the last frame _but none_ on the 
			// current one.
			var mouseJustClicked = !isButtonDown && wasButtonDown;
	
			// we also check the value of `transitioning` so that we don't 
			// initiate the transition logic more the once (like if the player
			// clicked the mouse repeatedly before we finished transitioning)
			if (mouseJustClicked && !transitioning) {
				transitioning = true;
				// do something here to transition to the actual game
			}
	
			// record the state of input for use in the next frame
			wasButtonDown = isButtonDown;
		}
	
		// this is the object that will be `startScreen`
		return {
			draw: draw,
			update: update
		};
	
	}());


	if (bgReady) {
		ctx.drawImage(bgImage, bgX, 0);
		if (bgX < 0) {
			ctx.drawImage(bgImage, bgX+bgImage.width, 0);
			if (bgX < -bgImage.width) {
				bgX = 0;
			}
		}
		if (bgX > 0 ) {
			ctx.drawImage(bgImage, bgX-bgImage.width, 0);
			if (bgX > bgImage.width) {
				bgX = 0;
			}
		}
		// uncomment below to create locked backwards movement
		// if (bgX > 0 ) {
		// 	console.log("register image past edges backward");
		// 	ctx.drawImage(bgImage, bgX-bgImage.width, 0);
		// 	if (bgX < bgImage.width) {
		// 		bgX = 0;
		// 	}
		// }
		// console.log("background drawn successfully")
	}


	if (swordReady){ 
		drawRotated(swordImage, fastTimerUp(0,360), hero.x-5, hero.y+5, 0, 0);
	}
	for (var plat in allPlatforms) {
		if (allPlatforms[plat].type == "normal") {
			ctx.fillStyle = "orange";
		}
		if (allPlatforms[plat].type == "ground") {
			ctx.fillStyle = "#00ff00";
		}
		if (allPlatforms[plat].type == "ice") {
			ctx.fillStyle = "#fff";
		}
		if (allPlatforms[plat].type == "lava") {
			ctx.fillStyle = "red";
		}
		ctx.fillRect(allPlatforms[plat].x,allPlatforms[plat].y,allPlatforms[plat].w,allPlatforms[plat].h);
	}
    // then hero on top of background`
	// if (heroReady) {
	// 	ctx.drawImage(heroImage, hero.x, hero.y);
	// }
	// if (swordReady) {
	// 	ctx.drawImage(swordImage, hero.x-5, hero.y-hero.height+10);
	// 	console.log("drawing sword");
	// }

	// if (swordReady) {
	// 	ctx.drawImage(swordImage, hero.x-16, hero.y-16);
	// }

	if (imgReady) {
		step(25);
	}

	
	
	// if (swordReady){
	// 	console.log("sword trying to rotate")
	// 	if (timerDown(0,1)<=0){
	// 	ctx.save(); // save current state
	// 	ctx.rotate(Math.PI); // rotate
	// 	ctx.drawImage(swordImage,hero.x,hero.y,200,200); // draws a chain link or dagger
	// 	ctx.restore(); // restore original states (no rotation etc)
	// 	}
	// }
	
	// then projectile
	if (projectileReady){
		for (var projectile in allProjectiles) 	{
				if (allProjectiles[projectile].fired == true){
				ctx.drawImage(projectileImage, allProjectiles[projectile].x, allProjectiles[projectile].y);
				drawRotated(swordImage, fastTimerUp(0,360), allProjectiles[projectile].x, allProjectiles[projectile].y, 0, 0);
			}
		}
	}

	if (explodeReady) {
		for (var splode in allExplosions) {
				ctx.drawImage(explodeImage, allExplosions[splode].x, allExplosions[splode].y);
				allExplosions.splice(splode, 1);
		}
	}
	    
	//then render all monsters in the allMonsters array on top of hero and background
	// if (monsterReady) {
	// 	for (monster in allMonsters) {
	// 			ctx.drawImage(monsterImage, allMonsters[monster].x, allMonsters[monster].y);
	// 	}
	// }
	if (monsterReady) {
		for (var monster in allMonsters) {
			if (frozenReady && allMonsters[monster].state == "frozen") {
				ctx.drawImage(frozenImage, allMonsters[monster].x, allMonsters[monster].y);
			}
			else if (bossReady && allMonsters[monster].type == "boss") {
				ctx.drawImage(bossImage, allMonsters[monster].x, allMonsters[monster].y);
			}
			else if (explodeReady && allMonsters[monster].state == "dead") {
				ctx.drawImage(explodeReady, allMonsters[monster].x, allMonsters[monster].y);
			}
			else if (allMonsters[monster].type == "normal") {
				ctx.drawImage(monsterImage, allMonsters[monster].x, allMonsters[monster].y);
			}

		}
	}

	for (var pillar in allPillars) {
		if (postReady) {
			ctx.drawImage(postImage, allPillars[pillar].x,allPillars[pillar].y);
		}
	}


	// then Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught, 32, 32);
    
    // then Timer
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Monsters: " + allMonsters.length, 150, 32);
	
	// then progress
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Progress: " + xProgress, 350, 32);
    
    // then game over
    if (playing == false) {
	    ctx.fillStyle = "rgb(250, 250, 250)";
	    ctx.font = "48px Helvetica";
	    ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Game over...", 150, 256);
    }

	// then Create gradient rectangle
	var grd = ctx.createLinearGradient(0, 0, 200, 0);
	grd.addColorStop(0, "red");
	grd.addColorStop(1, "white");
	
	// then fill with gradient tied to hero health
	ctx.fillStyle = grd;
	ctx.fillRect(10, 10, hero.health, 20);

	
};

// ##################### Main loop function ################
var main = function () {
	now = Date.now();
    delta = now - then;
	input(delta / 1000);
	if (playing == true) {
		update(delta / 1000);
	}
	render(delta / 1000);
	then = now;
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();