//GRUPO 15
/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
	this.cards = ["8-ball", "potato", "dinosaur", "kronos", "rocket", "unicorn", "guy", "zeppelin"];
	this.statusGame = "";
	this.board = [];


	this.initGame = function(){
		var pos_cards = [];
		this.board = new Array(16);

		for(var i = 0; i < 16; i++){
			pos_cards.push(i);
		}

		for(var i = 0; i < 8; i++){
			var pos = Math.floor(Math.random() * pos_cards.length);
        	this.board[pos_cards[pos]] = new MemoryGameCard(this.cards[i]);
        	pos_cards.splice(pos, 1);

        	pos = Math.floor(Math.random() * pos_cards.length);
        	this.board[pos_cards[pos]] = new MemoryGameCard(this.cards[i]);
        	pos_cards.splice(pos, 1);
		}

		this.loop();
	}

	this.draw = function(){
		gs.drawMessage(status);

		for(var i = 0; i < this.board.length; i++){
			if(this.board[i].status === 0){
				gs.draw("back", i);
			}else{
				gs.draw(this.board[i].sprite, i);
			}
		}
	}

	this.loop = function(){
		setInterval(this.draw() , 16);
	}

	this.onClick = function(cardId){

	}

};


/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
	this.sprite = id;
	this.status = 0;

	this.flip = function(){
		this.status = 1;
	}

	this.found = function(){
		this.status = 2;
	}

	this.compareTo = function(otherCard){

		if(this.id === this.otherCard.sprite)
			return true;

		return false;
	}
};
