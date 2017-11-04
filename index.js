var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');
// var say = require('say');
const fs = require('fs');

var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgWhite = "\x1b[37m";
var Reset = "\x1b[0m";
var objDump = null;

function getInt(x, time) {
    var val = parseInt(x, 10);
    return {
        timestamp: time,
        price: val
    }
}

function checkForFile(fileName,callback)
{
    fs.exists(fileName, function (exists) {
        if(exists){
            callback();
        }else {
            var obj = {
                coinbase: {
                    buy: []
                },
                zebpay: {
                    buy: [],
                    sell: []
                },
                bci: {
                    buy: [],
                    sell: []
                }
            };
            fs.writeFileSync('./datadump.json', JSON.stringify(obj, null, 2) , 'utf-8');
            callback();
        }
    });
}

console.log("Starting trade");

checkForFile("./datadump.json",function(){
    fs.readFile("./datadump.json", function (err,data) {
        if (err) throw err;
        objDump = JSON.parse(data);
    });
});

var optionsBitCoinIndia = {
  uri: "https://bitcoin-india.org/",
    transform: function (body) {
        return cheerio.load(body);
    }
};

var optionsZebPay = {
  uri: "https://api.zebpay.com/api/v1/ticker?currencyCode=INR",
  json: true
};

var optionsCoinbase = {
  uri: "https://api.coinbase.com/v2/prices/spot?currency=INR",
  json: true
};

function alert() {
    // if (buyValueInInteger < 485000) {
    //     say.speak("alert: buy value is less than 485,000");
    // }
    // if(sellValueInInteger > 500000) {
    //     say.speak("alert: sell value is greater than 500,000");
    // }
        //     const buyValueInInteger = parseInt(buyValue, 10);
        // const sellValueInInteger = parseInt(sellValue, 10);
}

cron.schedule('*/10 * * * * *', function(){
    var bciBuy, bciSell, zebBuy, zebsell, coinbaseBuy;
  var bci = rp(optionsBitCoinIndia)
    .then(function ($) {
        bciBuy = $("#buyvalue").html();
        bciSell = $("#sellvalue").html();
    })
    .catch(function (err) {
       console.log("error occured");
    });

  var zeb =  rp(optionsZebPay)
    .then(function (obj) {
        zebBuy = obj.buy;
        zebsell = obj.sell;
    })
    .catch(function (err) {
       console.log("error occured");
    });

  var coinbase =  rp(optionsCoinbase)
    .then(function (obj) {
        coinbaseBuy = obj.data.amount;
    })
    .catch(function (err) {
       console.log("error occured");
    });

    Promise.all([bci, zeb, coinbase])
    .then(values => { 
        console.log(FgWhite, "bcibuy: ", bciBuy, "  bciSell: ", bciSell);
        console.log(FgGreen, "zebBuy:  ", zebBuy, "  zebsell:  ", zebsell);
        console.log(FgWhite, "coinbaseBuy: ", coinbaseBuy);    
        console.log(Reset, "*********************************************");
        var time = Date.now();
        objDump.coinbase.buy.push(getInt(coinbaseBuy, time));
        objDump.zebpay.buy.push(getInt(zebBuy, time));
        objDump.zebpay.sell.push(getInt(zebsell, time));
        objDump.bci.buy.push(getInt(bciBuy, time));
        objDump.bci.sell.push(getInt(bciSell, time));
        fs.writeFileSync('./datadump.json', JSON.stringify(objDump, null, 2) , 'utf-8');
    });
});
