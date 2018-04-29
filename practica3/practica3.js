var game = function() {

    var Q = window.Q = Quintus({ audioSupported: ['mp3', 'ogg'] })
        .include("Scenes, Sprites, Input, UI, Touch, TMX, Anim, 2D")
        .setup({
            width: 320,
            height: 480,
        }).controls().touch();

    Q.include("Audio").enableSound();

    Q.load(["coin.mp3", "music_die.mp3", "music_level_complete.mp3", "music_main.mp3"]);

    Q.Sprite.extend("Mario", {
        init: function(p) {
            this._super(p, {
                sprite: "mario_anim",
                sheet: "mario",
                frame: 0,
                x: 150,
                y: 380,
                jumpSpeed: -400,
                playing: true
            });

            this.add("2d, platformerControls, animation");

            this.on("win", this, "win");
        },
        step: function(dt) {
            if (this.p.playing) {
                if (this.p.y > 800) {
                    this.play("mario_die");
                    this.playing = false;
                    Q.stageScene("endGame", 1, { label: "You Died" });
                }

                if (this.p.vx > 0) {
                    this.play("marioR");
                } else if (this.p.vx < 0) {
                    this.play("marioL");
                } else {
                    this.play('stand_' + this.p.direction);
                }

                if (this.p.vy > 0) {
                    this.play("jumping_" + this.p.direction);
                }
            }

        },
        win: function() {
            this.playing = false;
            Q.stageScene("winGame", 1);
        }
    });

    Q.animations("mario_anim", {
        "marioR": { frames: [1, 2, 3], rate: 1 / 10 },
        "marioL": { frames: [15, 16, 17], rate: 1 / 10 },
        "stand_right": { frames: [0], rate: 1 / 10, loop: false },
        "stand_left": { frames: [14], rate: 1 / 10, loop: false },
        "jumping_right": { frames: [4], rate: 1 / 10, loop: false },
        "jumping_left": { frames: [18], rate: 1 / 10, loop: false },
        "mario_die": { frames: [12], rate: 1 / 10, loop: false }
    });

    Q.component("defaultEnemy", {
        extend: {
            onCollission: function(anim) {
                this.on("bump.left,bump.right", function(collision) {
                    if (collision.obj.isA("Mario")) {
                        Q.stageScene("endGame", 1, { label: "You Died" });
                        collision.obj.destroy();
                    }
                });

                this.on("bump.top", function(collision) {
                    if (collision.obj.isA("Mario")) {
                        this.play(anim);
                        collision.obj.p.vy = -300;
                        this.destroy();
                    }
                });
            }
        }
    })

    Q.Sprite.extend("Goomba", {
        init: function(p) {
            this._super(p, {
                sprite: "goomba_anim",
                sheet: "goomba",
                x: 1200,
                y: 380,
                vx: 100
            });

            this.add("2d, aiBounce, animation, defaultEnemy");

            this.onCollission("goomba_die");
        },
        step: function(dt) {

        }
    });

    Q.animations("goomba_anim", {
        "goomba_walk": { frames: [0], rate: 1 / 5 },
        "goomba_die": { frames: [1, 2], rate: 1 / 3, loop: false }
    });

    Q.Sprite.extend("Bloopa", {
        init: function(p) {
            this._super(p, {
                sprite: "bloopa_anim",
                sheet: "bloopa",
                frame: 0,
                gravity: 0,
                x: 500,
                y: 380,
                vy: 100,
                collisioned: false
            });

            this.add("2d, aiBounce, animation, defaultEnemy");

            this.onCollission("bloopa_die");
        },
        step: function(dt) {
            this.timeJump += dt;

            if (this.p.vy == 0) {
                this.p.vy = -50;
                this.timeJump = 0;
            }

            if (this.timeJump >= 2)
                this.p.vy = 120;
        }
    });

    Q.animations("bloopa_anim", {
        "bloopa_walk": { frames: [0], rate: 1 / 3 },
        "bloopa_die": { frames: [1, 2], rate: 1 / 3, loop: false }
    });

    Q.Sprite.extend("Princess", {

        init: function(p) {
            this._super(p, {
                asset: "princess.png",
                frame: 0,
                x: 3140,
                y: 520
            });
            this.add("2d, aiBounce");

            this.on("bump.right, bump.left, bump.top", "sensor");
        },

        sensor: function(collision) {
            if (collision.obj.isA("Mario")) {
                Q.stageScene("winGame", 1, { label: "You win!" });
            }
        }
    });

    Q.Sprite.extend("Coin", {
        init: function(p) {
            this._super(p, {
                sheet: "coin",
                frame: 2,
                sprite: "coin_anim",
                gravity: 0,
                collisioned: false
            });

            this.add("2d, tween, animation, aiBounce");
            this.on("bump.right, bump.left, bump.top, bump.bottom", "coll");
        },
        coll: function(collision) {
            if (collision.obj.isA("Mario") && !this.collisioned) {
                this.collisioned = true;
                Q.audio.play("coin.mp3");
                this.animate({ x: this.p.x, y: this.p.y - 50 }, 0.3, Q.Easing.Quadratic.Out, {
                    callback: function() {
                        this.destroy();
                    }
                });
                Q.state.inc("score", 50);
            }
        },
        step: function(dt) {
            this.play("coin_move");
        }
    });

    Q.animations("coin_anim", {
        "coin_move": { frames: [0, 1, 2], rate: 1 / 3 }
    });

    Q.UI.Text.extend("Score", {
        init: function(p) {
            this._super({
                label: "Score: 0",
                x: 10,
                y: 10
            });

            Q.state.on("change.score", this, "score");
        },

        score: function(score) {
            this.p.label = "Score: " + score;
        }
    });

    Q.scene("HUD", function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: 70,
            y: 0
        }));
        stage.insert(new Q.Score(), container);
        container.fit(20);
    }, { stage: 1 });

    Q.scene("endGame", function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again" }));
        var label = container.insert(new Q.UI.Text({ x: 10, y: -10 - button.p.h, label: stage.options.label }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function() {
            Q.clearStages();
            Q.stageScene("HUD");
            Q.stageScene('level1');
        });
        Q.audio.stop();
        Q.audio.play("music_die.mp3");
        container.fit(20);
    });

    Q.scene("winGame", function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again" }));
        var label = container.insert(new Q.UI.Text({ x: 10, y: -10 - button.p.h, label: stage.options.label }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function() {
            Q.clearStages();
            Q.stageScene("HUD");
            Q.stageScene('level1');
        });

        Q.audio.stop();
        Q.audio.play("music_level_complete.mp3");
        container.fit(20);
    });

    Q.scene("mainTitle", function(stage) {
        var container = stage.insert(new Q.UI.Container({ x: Q.width, y: Q.height }));
        var button = container.insert(new Q.UI.Button({ x: -Q.width / 2, y: -Q.height / 2, fill: "#CCCCCC", asset: "mainTitle.png" }));
        //var label = container.insert(new Q.UI.Text({ x: 0, y: 10, label: "Press Enter or click to start", size: 18, color: "black" }));
        button.on("click", function() {
            Q.clearStages();
            Q.stageScene("HUD");
            Q.stageScene("level1");
        });


        container.fit(20);
    });

    Q.scene("level1", function(stage) {
        Q.stageTMX("level.tmx", stage);

        var player = stage.insert(new Q.Mario());
        stage.insert(new Q.Goomba());
        stage.insert(new Q.Bloopa());
        stage.insert(new Q.Bloopa({ x: 1820, y: 230 }));
        stage.insert(new Q.Bloopa({ x: 1870, y: 350 }));
        stage.insert(new Q.Goomba({ x: 1120, y: 350 }));
        stage.insert(new Q.Goomba({ x: 1750, y: 420 }));
        stage.insert(new Q.Princess());
        stage.insert(new Q.Coin({ x: 315, y: 400 }));
        stage.insert(new Q.Coin({ x: 447, y: 318 }));
        stage.insert(new Q.Coin({ x: 470, y: 370 }));
        stage.insert(new Q.Coin({ x: 490, y: 318 }));
        stage.insert(new Q.Coin({ x: 1530, y: 420 }));
        stage.insert(new Q.Coin({ x: 1600, y: 420 }));
        stage.insert(new Q.Coin({ x: 1950, y: 270 }));
        stage.insert(new Q.Coin({ x: 2000, y: 270 }));
        stage.insert(new Q.Coin({ x: 2725, y: 380 }));
        stage.insert(new Q.Coin({ x: 2750, y: 400 }));
        stage.insert(new Q.Coin({ x: 2775, y: 420 }));
        stage.insert(new Q.Coin({ x: 2800, y: 440 }));
        stage.insert(new Q.Score());

        Q.state.set("score", 0);

        stage.add("viewport").follow(player);
        stage.viewport.offsetX = -90;
        stage.viewport.offsetY = 160;

        Q.audio.play("music_main.mp3", { loop: true });
    })

    Q.load("mario_small.png, mario_small.json, mainTitle.png, goomba.png, goomba.json, bloopa.json, bloopa.png, princess.png, coin.png, coin.json", function() {
        //this will create the sprite sheets
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png", "goomba.json");
        Q.compileSheets("bloopa.png", "bloopa.json");
        Q.compileSheets("coin.png", "coin.json");
        Q.loadTMX("level.tmx", function() {
            Q.stageScene("mainTitle");
        });

    })

};