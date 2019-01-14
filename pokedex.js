'use strict';
/**
 *  Name: Fan Yu
 *  TA: Anupam Gupta
 *  Homework 5
 *  This is the pokedex.js file of homework4. In this file, it defines the behavior of 
 *  a web page of a pokemondex. In this page, user could check information about pokemon
 *  they once discovred. Initially, there are three pokemons are set to be found by default.
 */

(function() {
	let pokedexApi = 'https://webster.cs.washington.edu/pokedex/pokedex.php';// url for pokedaxapi
	let gameID;
	let playerID;
	let oriHP;

	// This function calls the initialzie function which initialize image and card setings
	window.onload = function (){
		initialize();
		$("start-btn").onclick = beginGame;
		$("endgame").onclick = changeBack;
		$("flee-btn").onclick = flee;
	};

    /**
  	  *  Helper function to get the element by
  	  *  @param The string ID of the DOM element to retrieve
  	  *  @return the DOM element denoted by the ID given
  	  */
	function $(id) {
		return document.getElementById(id);
	}


    /**
  	  *  Helper function to get the element by
  	  *  @param {string} selector - containing the relative selector
  	  *  @return the DOM element targeted by the selector
  	  */
	function $$(selector) {
		return document.querySelector(selector);
	}

	/**
	  * This function fetches data from podexAPI and pass it to initialpokemon function, 
	  * after checking status.
	  */
	function initialize() {
		let url = pokedexApi + "?pokedex=all"; // the url for image of all pokemons
		fetch(url)
		  .then(checkStatus)
		  .then(initialpokemon)
		  .then(errorCatching);
	}

	/**
	  * This function check the Status of a GET request, 
	  * if the status is valid, it will return the text,
	  * if the status is invalid, it will return an error.
	  */
	function checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response.text();
		} else {
			return Promise.reject(new Error(response.status + ": " + response.statusText));
		}
	}

	/**
	  * This function initiate initial setings of pokedex
	  * @param data, which is the string of name and url query of image of all pokemons
	  * This function :
	  * 1. get image of all pokemons and display them in the div with id = "pokedex-view";
	  * 2. make all pokemon icons have a class of "sprite";
	  * 3. make three pokemon icons be found by calling function findPokemon.
	  */
	function initialpokemon(data) {
		data = data.split("\n");
		for(let i = 0; i < data.length; i++) {
			let pair = data[i].split(":");
			let pokeImg = document.createElement("img");
			pokeImg.src = "https://webster.cs.washington.edu/pokedex/sprites/" + pair[1];
			pokeImg.id = pair[0];
			pokeImg.classList.add("sprite");
			$('pokedex-view').appendChild(pokeImg);
		}
		findPokemon("Bulbasaur");
		findPokemon("Charmander");
		findPokemon("Squirtle");
	}

	/**
	  * This function catches possible errors during fetching, and print it in console.
	  */
	function errorCatching(error) {
		if (error){
			console.log(error);
		}
	}

	/**
	  *  This function takes in  
	  *  @param {string} poke - a name of a pokemon
	  *  then:
	  *  1. add a class found to the pokemon
	  *  2. set that pokemon icon's click behavior to change the card on the left.
	  */
	function findPokemon(poke) {
		$(poke).classList.add("found");
		$(poke).onclick = changeCard;
	}

	/**
	  *  This function fetches data from pokedexAPI of a particular pokemon when its icon is
	  *  clicked. It parses data from API into JSON object if the status is valid. Then it pass
	  *  the JSON object to initialCard to initialize card display.
	  */
	function changeCard() {
		let url = pokedexApi + "?pokemon=" + this.id;
		fetch(url)
		  .then(checkStatus)
		  .then(JSON.parse)
		  .then(changeMyCard)
		  .then(errorCatching);
		$("start-btn").classList.remove("hidden");
	}

	/**
	  *  This function takes in  
	  *  @param JSON object pokedata - card info of a pokemon
	  *  then:
	  *  Initial My-card by calling initialCard
	  */
	function changeMyCard(pokedata) {
		initialCard(pokedata, "my-card");
	}

	/**
	  *  This function takes in  
	  *  @param JSON object pokedata - card info of a pokemon
	  *  then:
	  *  Initial Their-card by calling initialCard
	  */
	function changeTheirCard(pokedata) {
		initialCard(pokedata, "their-card-card");
	}

	/**
	  *  This function change the card display.
	  *  @param {JSON object} pokedata -contains one pokemon information,
	  *  @param {String} id - contains the coresponding id of card.
	  *  This function use information in the JSON object changes the display 
	  *  of the left card of chosen pokemon.
	  */
	function initialCard(pokedata, id) {
		let imgurl = "https://webster.cs.washington.edu/pokedex/";
		$$("#" + id + " .name").innerHTML = pokedata.name;
		$$("#" + id + " .pokepic").src = imgurl + pokedata.images.photo;
		$$("#" + id + " .type").src = imgurl + pokedata.images.typeIcon;
		$$("#" + id + " .weakness").src = imgurl + pokedata.images.weaknessIcon;
		$$("#" + id + " .hp").innerHTML = pokedata.hp + "HP";
		$$("#" + id + " .info").innerHTML = pokedata.info.description;
		let allmoves = $$("#" + id + " .moves");
		for (let i = 0; i < 4; i++){
			if(i < pokedata.moves.length){
				allmoves.children[i].classList.remove("hidden");
				allmoves.children[i].querySelector(".move").innerHTML = pokedata.moves[i].name;
				allmoves.children[i].querySelector("img").src = 
				imgurl + "icons\/" + pokedata.moves[i].type + ".jpg";
				if (pokedata.moves[i].dp) {
					allmoves.children[i].querySelector(".dp").innerHTML = 
					pokedata.moves[i].dp + "DP";
				}else {
					allmoves.children[i].querySelector(".dp").innerHTML = "";
				}
			} else {
				allmoves.children[i].classList.add("hidden");
			}
		}
	}

	/**
	 *  This function is trigger when Start button is clicked.
	 *  This function first activate all game setings and the
	 *  fetch this game information from api 
	 */
	function beginGame() {
		switchCardSetting ();
		for (let i = 0; i < 4; i++) {
			if(!$$("#my-card .moves").children[i].classList.contains("hidden")) {
				$$("#my-card .moves").children[i].disabled = false;
				$$("#my-card .moves").children[i].onclick = move;
			}
		}

		$("flee-btn").disabled = false;
		$("title").innerHTML = "Pokemon Battle Mode!";
		oriHP = $("my-card").querySelector(".hp").innerHTML;
		let data = new FormData();
		data.append("startgame", 'true');
		data.append("mypokemon", $$("#my-card .name").innerHTML);
		fetch("https://webster.cs.washington.edu/pokedex/game.php", {method: "POST", body: data})
		  .then(checkStatus)
		  .then(JSON.parse)
		  .then(beginGameHelper)
		  .then(errorCatching);
	}

	/**
	 *  This function take a JSON object  
	 *  @param {JSON object} gamedata - contains game infomation
	 *  Then update game settings by calling initialCard and makeChange functions
	 */
	function beginGameHelper(gamedata) {
		gameID = gamedata.guid; // set unique game id
		playerID = gamedata.pid; //  set unique player id
		initialCard(gamedata.p2, "their-card");
		makeChange(gamedata);
	}

	// This function is triggered when any moves is clicked.
	// It will call getMoveResponse function to update game information after move.
	function move() {
		getMoveResponse(this.querySelector(".move").innerHTML);
	}

	// This funciton is triggered when flee button is clicked.
	// It will call getMoveResponse function to update game information after flee.
	function flee() {
		getMoveResponse("flee");
	}

	// This is a helper function which takes into a string.
	// @param {String} move -move's name
	// Then fetch the data from api to get game information after that move.
	function getMoveResponse (move) {
		$("loading").classList.remove("hidden");
		let data = new FormData();
		data.append("move", move);
		data.append("guid", gameID);
		data.append("pid", playerID);
		fetch("https://webster.cs.washington.edu/pokedex/game.php",{method: "POST", body: data})
		  .then(checkStatus)
		  .then(JSON.parse)
		  .then(makeChange)
		  .then(errorCatching);
	}

	// This is a helper function 
	// @param {JSON object} result -contains game information.
	// Then it update card information from result by calling ChangeTurn 
	// ChangeHP ChangeBuff respectively.
	// It calls checkEnd function check if the game is end.
	function makeChange(result) {
		$("loading").classList.add("hidden");
		changeTurn(1, result);
		changeTurn(2, result);
		changeHP("my-card", result.p1);
		changeHP("their-card", result.p2);
		changeBuff("my-card", result.p1);
		changeBuff("their-card", result.p2);
		checkEnd(result.p1["current-hp"], result.p2["current-hp"]);
	}

	// This function takes into number as id and a JSON obeject as result,
	// @param {int} id -contains target id.
	// @param {JSON object} result -contains game information.
	// Then changes the text in the block displaying move information.
	function changeTurn(id, result) {
		if (result.results && result.results["p" + id + "-move"]) {
			$("p" + id + "-turn-results").innerHTML = "Player " + id + " played " + 
			result.results["p" + id + "-move"] + " and " + result.results["p" + 
			id + "-result"] + "!";
		} else	{
			$("p" + id + "-turn-results").innerHTML = "";
		}
	}

	// This function takes into a string as id and a JSON obeject reslut,
	// @param {String} id -contains target id.
	// @param {JSON object} result -contains game information.
	// then update the HP number and HP bar.
	function changeHP(id, result) {
		$(id).querySelector(".hp").innerHTML = result["current-hp"] + "HP";
		let percent = result["current-hp"] / result.hp;
		$(id).querySelector(".health-bar").style.width = percent * 100 + "%";
		if (percent*100 < 20) {
			$(id).querySelector(".health-bar").classList.add("low-health");
		}
	}

	// This function takes into a string as id and a JSON obeject result,
	// @param {String} id -contains target id.
	// @param {JSON object} result -contains game information.
	// then update the buff information of both my card and their card
	function changeBuff(id, result) {
		let allbuf = $(id).querySelector(".buffs");
		while (allbuf.firstChild) {
    		allbuf.removeChild(allbuf.firstChild);
		}
		for (let i = 0; i < result.buffs.length; i++) {
			let buf = document.createElement("div");
			buf.classList.add("buff");
			buf.classList.add(result.buffs[i]);
			allbuf.appendChild(buf);
		}
		for (let i = 0; i < result.debuffs.length; i++) {
			let buf = document.createElement("div");
			buf.classList.add("debuff");
			buf.classList.add(result.debuffs[i]);
			allbuf.appendChild(buf);
		}

	}

	// This function takes into two number p1 and p2,
	// @param {int} p1 -current HP of player1.
	// @param {int} p2 -current HP of player2.
	// The game will end when either of them is 0. 
	// If the game is end, buttons will be disabled and the endgame button will appear.
	function checkEnd(p1, p2) {
		if (p1 * p2 == 0){
			if (p1 == 0) {
				$("title").innerHTML = "You lost!";
			} else if (p2 == 0) {
				$("title").innerHTML = "You won!";
				findPokemon($$("#their-card .name").innerHTML);
			}
			$("endgame").classList.remove("hidden");
			$("flee-btn").disabled = true;
			for (let i = 0; i < 4; i++) {
				if(!$$("#my-card .moves").children[i].classList.contains("hidden")) {
					$$("#my-card .moves").children[i].disabled = true;
				}
			}
		}
	}

	// This function is triggered when the end game button is clicked.
	// This function will change the web display back to pokemondex mode.
	function changeBack() {
		switchCardSetting();  // helper function
		$("endgame").classList.add("hidden");
		$("title").innerHTML = "Your Pokedex";
		$("my-card").querySelector(".hp").innerHTML = oriHP;
		$("my-card").querySelector(".health-bar").style.width = "100%";
		$("their-card").querySelector(".health-bar").style.width = "100%";
		$("my-card").querySelector(".health-bar").classList.remove("low-health");
		$("their-card").querySelector(".health-bar").classList.remove("low-health");
	}

	// This is a helper function which is called both at begining and the end of a game,
	// it will switch display of web between game mode and pokedex mode.
	function switchCardSetting () {
		$("pokedex-view").classList.toggle("hidden");
		$("their-card").classList.toggle("hidden");
		$$("#my-card .hp-info").classList.toggle("hidden");
		$("results-container").classList.toggle("hidden");
		$("flee-btn").classList.toggle("hidden");
		$$("#my-card .buffs").classList.toggle("hidden");
		$("p1-turn-results").classList.toggle("hidden");
		$("p2-turn-results").classList.toggle("hidden");
		$("start-btn").classList.toggle("hidden");
		$("p1-turn-results").classList.innerHTML = "";
		$("p2-turn-results").classList.innerHTML = "";
	}

})();