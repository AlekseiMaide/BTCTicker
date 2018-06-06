var BTCTicker = (function(){

var USDTickerCount = 0;
var EURTickerCount = 0;
var BTCEUR = "N/A";
var EURUSD = "N/A";

//WEB SOCKET TICKER
var connection = new WebSocket("wss://api.bitfinex.com/ws");

connection.onopen = function () {
	USDTickerCount += 1;
	connection.send( JSON.stringify({ "event":"subscribe",
   									"channel":"ticker",
  									"pair":"BTCUSD" }) );
};

// Log errors
connection.onerror = function (error) {
	console.log('BitFinex socket error ' + error);
	if (!USDTickerCount) {
		USDTickerCount -= 1;
	}
	connection.close();
	
	//Restart the connection if needed...
	if(connection.readyState === connection.CLOSED){
   		// Do your stuff...
	}
};

// Log messages from the server
connection.onmessage = function (e) {
  	var response = JSON.parse(e.data);
	//check if response contains data (not a ping or an event)
	if (response[1] != "hb" && !response.hasOwnProperty('event')) {
		document.getElementById('BTCTicker').innerHTML = "BTC/USD: " + response[1] + " EUR/USD: " + EURUSD.toFixed(2) + 
			" BTC/EUR: " + BTCEUR +" Active sources: BTC/USD (" + USDTickerCount + " of 2) BTC/EUR (1 of 1)";
	}
};

//AJAX TICKER
function reqListener () {
	var coindeskUSD = parseFloat((JSON.parse(this.responseText).bpi.USD.rate).replace(/,/,'.')) * 1000;
	var coindeskEUR = parseFloat((JSON.parse(this.responseText).bpi.EUR.rate).replace(/,/,'.')) * 1000;
	EURUSD = coindeskEUR / coindeskUSD;
	document.getElementById('BTCTicker').innerHTML = "BTC/USD: " + coindeskUSD + " EUR/USD: " + EURUSD.toFixed(2) + 
		" BTC/EUR: " + coindeskEUR + " Active sources: BTC/USD (" + USDTickerCount + " of 2) BTC/EUR (" + EURTickerCount + " of 1)";
	BTCEUR = coindeskEUR;
	setTimeout(function(){ 
		oReq.open("GET", "http://api.coindesk.com/v1/bpi/currentprice.json");
		oReq.send();
	}, 10000);
}

function reqFailed(error) {
	console.log("CoinDesk ajax error " + error);
	if (!USDTickerCount) {
		USDTickerCount -= 1;
	}
	if (!EURTickerCount) {
		EURTickerCount -= 1;
	}
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.addEventListener("error", reqFailed);
oReq.open("GET", "http://api.coindesk.com/v1/bpi/currentprice.json");
if (oReq.readyState === 1) {
	EURTickerCount += 1;
	USDTickerCount += 1;
}
oReq.send();

})();