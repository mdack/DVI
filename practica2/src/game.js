var sprites = {
 leftWall: { sx: 0, sy: 0, w: 512, h: 480, frames: 1 },
 beer: { sx: 512, sy: 99, w: 23, h: 32, frames: 1 },
 glass: { sx: 512, sy: 131, w: 23, h: 32, frames: 1 },
 NPC: { sx: 512, sy: 66, w: 33, h: 33, frames: 1 },
 player: { sx: 512, sy: 0, w: 56, h: 66, frames: 1 },
 background: { sx: 0, sy: 480, w: 512, h: 480, frames: 1 }
};

var OBJECT_PLAYER = 1,
    OBJECT_BEER = 2,
    OBJECT_NPC = 4,
    OBJECT_GLASS = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  Game.setBoard(3,new TitleScreen("Alien Invasion", 
                                  "Press fire to start playing",
                                  playGame));
};

var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
  var board = new GameBoard();
  board.add(new Scene());

  var game = new GameBoard();
  game.add(new Player());

  Game.setBoard(0, board);
  Game.setBoard(1, game);
  /*
  board.add(new PlayerShip());
  board.add(new Level(level1,winGame));
  Game.setBoard(3,board);
  Game.setBoard(5,new GamePoints(0));
  */
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press fire to play again",
                                  playGame));
};

var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width; 
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.fillRect(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     2,
                     2);
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };

  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

/* Scene Class */
var Scene = function(){
  this.setup('background', {x: 0, y:0});
};

Scene.prototype = new Sprite();

Scene.prototype.step = function(dt){}

/* Player Class */
var Player = function() { 
  this.setup('player', { x:421, y:377, reloadTime: 0.2});
  this.positions = [{x:325, y:90},
                    {x:357, y:185},
                    {x:389, y:281},
                    {x:421, y:377}];
  this.move = this.reloadTime;
  this.beer = this.reloadTime;
  this.x = this.positions[0].x;
  this.y = this.positions[0].y;
  this.p = 0;
};
                    

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

Player.prototype.step = function(dt){
  this.move -= dt;

  if(this.move < 0){
    if(Game.keys['up']){
      this.p--;
      if(this.p < 0){
        this.p = 3;
      }
    }

   if(Game.keys['down']){
      this.p++;
      if(this.p > 3){
        this.p = 0;
      }
    }

    this.x = this.positions[this.p].x;
    this.y = this.positions[this.p].y;

    this.move = this.reloadTime;    
  }


  if(Game.keys['space'] && this.beer < 0){
    Game.keys['space'] = false;
    this.beer = this.reloadTime;
    this.board.add(Object.create(Beer.prototype, {
                      x: {
                        value: this.x - this.w
                      },

                      y: {
                        value: this.y
                      }
                    })
                  );
  }
};

/* Beer Class */
var Beer = function(x,y) {
  this.setup('beer',{ vx: -150, damage: 10 });
  this.x = x - this.w;
  this.y = y; 
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_BEER;

Beer.prototype.step = function(dt)  {
  this.x += this.vx * dt;
  var collision = this.board.collide(this,OBJECT_NPC);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }
};

/* Class Client*/
var Client = function(x, y) {
  this.merge('NPC');
  this.x = x;
  this.y = y;
};

Client.prototype = new Sprite();
Client.prototype.type = OBJECT_NPC;

Client.prototype.step = function(dt){
  this.x -= this.vx * dt;

  var collision = this.board.collide(this,OBJECT_BEER);
  if(collision) {
    this.board.remove(this);
    this.board.add(new Glass(this.x, this.y));
  }
}

Client.prototype.hit = function(dt){

}

/* Glass Class */
var Glass = function(x, y){
  this.setup('Glass', {vx: -120, damage:10});
  this.x = x;
  this.y = y;
}

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_GLASS;

Glass.prototype.step = function(dt){
  this.x -= this.vx * dt;
 var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    this.board.remove(this);
  }
}

window.addEventListener("load", function() {
  Game.initialize("game",sprites,playGame);
});


