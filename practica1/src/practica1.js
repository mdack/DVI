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
	var cards = ["8-ball, "potato", "dinosaur", "kronos", "rocket", "unicorn", "guy", "zeppelin"];
	var status = "";
	var board = [];

	this.initGame = function(){
		var pos_cards = [];

		for(var i = 0; i < 16; i++){
			pos_cards.push(i);
		}

		for(var i = 0; i < 16; i++){
			var pos = Math.floor(Math.random() * pos_cards.length);
        	board.push(cards[pos]);
        	pos_cards.splice(pos, 1);
		}

		this.loop;
	}

	this.draw = function(){
		gs.drawMessage(status);

		for(var i = 0; i < board.length; i++){
			gs.draw(board[i], i);
		}
	}

	this.loop = function(){
		setInterval(this.draw , 16);
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

};
