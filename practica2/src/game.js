var sprites = {
    leftWall: { sx: 0, sy: 0, w: 512, h: 480, frames: 1 },
    beer: { sx: 512, sy: 99, w: 23, h: 32, frames: 1 },
    glass: { sx: 512, sy: 131, w: 23, h: 32, frames: 1 },
    NPC: { sx: 512, sy: 66, w: 33, h: 33, frames: 1 },
    player: { sx: 512, sy: 0, w: 56, h: 66, frames: 1 },
    background: { sx: 0, sy: 480, w: 512, h: 480, frames: 1 }
};

var level1 = [
    [0, 4000, 1500, { x: 125, y: 80 }],
    [6000, 13000, 1700, { x: 95, y: 176 }],
    [12000, 20000, 2000, { x: 65, y: 272 }],
    [18200, 40000, 2000, { x: 35, y: 368 }]
];

var OBJECT_PLAYER = 1,
    OBJECT_BEER = 2,
    OBJECT_NPC = 4,
    OBJECT_GLASS = 8,
    OBJECT_DEADZONE = 16;

var deadZones = [
    { x: 335, y: 104 }, //primero derecha
    { x: 367, y: 195 }, //segundo derecha
    { x: 399, y: 291 },
    { x: 431, y: 387 },
    { x: 114, y: 100 },
    { x: 82, y: 197 },
    { x: 49, y: 293 },
    { x: 16, y: 390 }
];

var spawner;

var startGame = function() {
    var ua = navigator.userAgent.toLowerCase();

    // Only 1 row of stars
    if (ua.match(/android/)) {
        Game.setBoard(0, new Starfield(50, 0.6, 100, true));
    } else {
        Game.setBoard(0, new Starfield(20, 0.4, 100, true));
        Game.setBoard(1, new Starfield(50, 0.6, 100));
        Game.setBoard(2, new Starfield(100, 1.0, 50));
    }
    Game.setBoard(3, new TitleScreen("Tapper", "Press space to start playing", playGame));
};


var playGame = function() {
    var board = new GameBoard();
    board.add(new Scene());

    var game = new GameBoard();
    var p = new Player();
    game.add(p);

    for (var i = 0; i < deadZones.length; i++) {
        board.add(Object.create(new DeadZone(deadZones[i].x, deadZones[i].y)));
    }

    spawner = new Spawner(level1, winGame);

    board.add(spawner);

    spawner.board.add(p);

    Game.setBoard(0, board);
    Game.setBoard(1, game);


};

var winGame = function() {
    Game.setBoard(3, new TitleScreen("You win!", "Press fire to play again", playGame));
};

var loseGame = function() {
    Game.setBoard(3, new TitleScreen("You lose!", "Press space to play again", playGame));
};

var Starfield = function(speed, opacity, numStars, clear) {

    // Set up the offscreen canvas
    var stars = document.createElement("canvas");
    stars.width = Game.width;
    stars.height = Game.height;
    var starCtx = stars.getContext("2d");

    var offset = 0;

    // If the clear option is set, 
    // make the background black instead of transparent
    if (clear) {
        starCtx.fillStyle = "#000";
        starCtx.fillRect(0, 0, stars.width, stars.height);
    }

    // Now draw a bunch of random 2 pixel
    // rectangles onto the offscreen canvas
    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity;
    for (var i = 0; i < numStars; i++) {
        starCtx.fillRect(Math.floor(Math.random() * stars.width),
            Math.floor(Math.random() * stars.height),
            2,
            2);
    }

    // This method is called every frame
    // to draw the starfield onto the canvas
    this.draw = function(ctx) {
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;

        // Draw the top half of the starfield
        if (intOffset > 0) {
            ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
        }

        // Draw the bottom half of the starfield
        if (remaining > 0) {
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
var Scene = function() {
    this.setup('background', { x: 0, y: 0 });
};

Scene.prototype = new Sprite();

Scene.prototype.step = function(dt) {}

/* Player Class */
var Player = function() {
    this.setup('player', { x: 421, y: 377, reloadTime: 0.2 });
    this.positions = [{ x: 325, y: 90 },
        { x: 357, y: 185 },
        { x: 389, y: 281 },
        { x: 421, y: 377 }
    ];
    this.move = this.reloadTime;
    this.beerTime = this.reloadTime;
    this.x = this.positions[0].x;
    this.y = this.positions[0].y;
    this.p = 0;
};


Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

Player.prototype.step = function(dt) {
    this.move -= dt;
    this.beerTime -= dt;

    if (this.move < 0) {
        if (Game.keys['up']) {
            this.p--;
            if (this.p < 0) {
                this.p = 3;
            }
        }

        if (Game.keys['down']) {
            this.p++;
            if (this.p > 3) {
                this.p = 0;
            }
        }

        this.x = this.positions[this.p].x;
        this.y = this.positions[this.p].y;

        this.move = this.reloadTime;
    }


    if (Game.keys['space'] && this.beerTime < 0) {
        Game.keys['space'] = false;
        this.beerTime = this.reloadTime;
        spawner.board.add(new Beer(this.x, this.y - 10, 50));
    }
};

/* Beer Class */
var Beer = function(x, y, vx) {
    this.setup('beer');
    this.x = x - this.w;
    this.y = y;
    this.vx = -vx;
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_BEER;

Beer.prototype.step = function(dt) {
    this.x += this.vx * dt;

    if (this.board.collide(this, OBJECT_NPC)) {
        spawner.board.add(new Glass(this.x, this.y, 50));
        this.board.remove(this);
        var c = spawner.client.shift();
        this.board.remove(c);
        GameManager.clientServed();
    }

    if (this.board.collide(this, OBJECT_DEADZONE)) {
        this.board.remove(this);
        GameManager.lose();
    }
};

/* Class Client*/
var Client = function(x, y, vx) {
    this.setup('NPC');
    this.x = x;
    this.y = y;
    this.vx = vx;
    /*
    this.clients = [
      {sx: 0, sy: 0, w: 134, h: 134, frames: 1},
      {sx: 0, sy: 137, w: 134, h: 134, frames: 1},
      {sx: 0, sy: 267, w: 134, h: 134, frames: 1},
      {sx: 0, sy: 403, w: 134, h: 134, frames: 1}
    ];

    this.s = this.clients[Math.floor(Math.random()*4)];

    this.draw = function(ctx){
      this.image = new Image();
      this.image.src = 'img/customers_sheet.png';
      ctx.drawImage(this.image,
                       this.s.sx,
                       this.s.sy, 
                       this.s.w, this.s.h, 
                       Math.floor(this.x), Math.floor(this.y),
                       33, 33);
    }*/

};

Client.prototype = new Sprite();
Client.prototype.type = OBJECT_NPC;

Client.prototype.step = function(dt) {
    this.x += this.vx * dt;

    if (this.board.collide(this, OBJECT_DEADZONE)) {
        this.board.remove(this);
        spawner.client.shift();
        GameManager.lose();
    }
}

/* Glass Class */
var Glass = function(x, y, vx) {
    this.setup('glass');
    this.x = x;
    this.y = y;
    this.vx = vx;
}

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_GLASS;

Glass.prototype.step = function(dt) {
    this.x += this.vx * dt;

    if (this.board.collide(this, OBJECT_PLAYER)) {
        this.board.remove(this);
        GameManager.beerServed();
    }

    if (this.board.collide(this, OBJECT_DEADZONE)) {
        this.board.remove(this);
        GameManager.lose();
    }

}

/* DeadZone Class */
var DeadZone = function(x, y) {
    this.x = x;
    this.y = y;
    this.w = 10;
    this.h = 60;

    this.draw = function(ctx) {
        ctx.fillStyle = "rgba(244, 246, 246, 0.1)";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    };

    this.step = function(dt) {};
}

DeadZone.prototype = new Sprite();
DeadZone.prototype.type = OBJECT_DEADZONE;

/* GameManager Class */
var GameManager = new function() {
    this.nClients = 0;
    this.nGlasses = 0;

    this.lose = function() {
        console.log("You lose!");
    }

    this.win = function() {
        console.log("You win!");
    }

    this.beerServed = function() {
        this.nGlasses++;
    }

    this.clientServed = function() {
        this.nClients--;
    }

    this.setClients = function(n) {
        this.nClients = n;
    }
}


window.addEventListener("load", function() {
    Game.initialize("game", sprites, playGame);
});