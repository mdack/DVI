var game = function(){

	var Q = window.Q =  Quintus()
            .include("Scenes, Sprites, Input, UI, Touch, TMX, Anim, 2D")
            .setup({
                width: 320,
                height: 480,
    		}).controls().touch();

    Q.Sprite.extend("Mario", {
        init: function(p) {
            this._super(p, {
                sprite: "mario_anim",
                sheet: "mario",
                x: 150,
                y: 380
            });

            this.add("2d, platformerControls");
        },
        step: function(dt){
            if(this.p.vx > 0){
                this.play("marioR");
            }else if(this.p.vx < 0){
                this.play("marioL");
            }else{
                this.play("stand_" + this.p.direction);
            }
        }
    });

    Q.animations("mario_anim", {
        "marioR":{frames: [1,2,3], rate: 1/10},
        "marioL":{frames: [15,16,17], rate: 1/10},
        "stand_right":{frames: [0], rate: 1/10, loop: false},
        "stand_left":{frames: [14], rate: 1/10, loop: false},
        "jumping_right":{frames: [4], rate: 1/10, loop: false},
        "jumping_left":{frames: [18], rate: 1/10, loop: false},
        "mario_die":{frames: [12], rate: 1/10, loop: false}
    });

    Q.scene("level1", function(stage){
        Q.stageTMX("level.tmx", stage);

        var player = stage.insert(new Q.Mario());
        stage.add("viewport").follow(player);
    })

    Q.load("level.json, mario_small.png, mario_small.json", function(){
        //this will create the sprite sheets
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.stageScene("level1");
    })

};