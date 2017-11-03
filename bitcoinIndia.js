var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');
var say = require('say');

var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgWhite = "\x1b[37m";
var Reset = "\x1b[0m";

console.log("Starting bitCoinIndia");
var options = {
  uri: "https://bitcoin-india.org/",
    transform: function (body) {
        return cheerio.load(body);
    }
};

cron.schedule('*/10 * * * * *', function(){
  rp(options)
    .then(function ($) {
        const buyValue = $("#buyvalue").html();
        const sellValue = $("#sellvalue").html();
        const buyValueInInteger = parseInt(buyValue, 10);
        const sellValueInInteger = parseInt(sellValue, 10);

        console.log(FgWhite, "buy: ", buyValue);
        console.log(FgGreen, "sell:", sellValue);
        console.log(Reset, "********************");

        if (buyValueInInteger < 485000) {
            say.speak("alert: buy value is less than 485,000");
        }
        if(sellValueInInteger > 500000) {
            say.speak("alert: sell value is greater than 500,000");
        }
    })
    .catch(function (err) {
       console.log("error occured");
    });
});
