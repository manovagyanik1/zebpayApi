var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');

var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgWhite = "\x1b[37m";
var Reset = "\x1b[0m";

console.log("starting zebpay");

var options = {
  uri: "https://api.zebpay.com/api/v1/ticker?currencyCode=INR",
  json: true
};

cron.schedule('*/10 * * * * *', function(){
  rp(options)
    .then(function (obj) {
        console.log(FgWhite, "buy: ", obj.buy);
        
        console.log(FgGreen, "sell:", obj.sell);
        console.log(Reset, "********************");
    })
    .catch(function (err) {
       console.log("error occured");
    });
});

