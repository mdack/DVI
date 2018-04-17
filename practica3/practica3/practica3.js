var game = function(){

	var Q = window.Q =  Quintus()
            .include("Scenes, Sprites, Input, UI, Touch, TMX, Anim, 2D")
            .setup({
                width: 320,
                height: 480,
    		}).controls().touch();

    Q.scene("level1", function(stage){
    	Q.stageTMX("level.tmx", stage);
    });

    Q.loadTMX("level.TMX", function(){
    	Q.stageScene("level1");
    })

};