var game = function(){

	var Q = window.Q =  Quintus()
            .include("Scenes, Sprites, Input, UI, Touch")
            .setup({
                width: 320,
                height: 480,
    		}).controls().touch();
};