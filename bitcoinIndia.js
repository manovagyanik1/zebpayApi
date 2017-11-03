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

        if(buyValueInInteger > 493000) {
            say.speak("alert negative: buy value is more than 493,000");
        } else if (buyValueInInteger < 487000) {
            say.speak("alert positive: buy value is less than 486,000");
        }
        if(sellValueInInteger > 490000) {
            say.speak("alert negative: sell value is greater than 490,000");
        } else if(sellValueInInteger > 490000) {
            say.speak("alert: sell value is greater than 490,000");
        }
    })
    .catch(function (err) {
       console.log("error occured");
    });
});
