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
        const buyValueInInteger = parseInt(buyValue, 10);

        console.log(FgWhite, "buy: ", $("#buyvalue").html());
        console.log(FgGreen, "sell:", $("#sellvalue").html());
        console.log(Reset, "********************");

        if(buyValueInInteger < 493000) {
            say.speak("alert: buy value is less than 493,000");
        }
    })
    .catch(function (err) {
       console.log("error occured");
    });
});
