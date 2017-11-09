var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var cron = require('node-cron');
var say = require('say');
const fs = require('fs');

var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgWhite = "\x1b[37m";
var Reset = "\x1b[0m";
var objDump = null;
var USDTOINR = 65.02;

var TRIM_SIZE = 100;

function getInt(x, time) {
    var val = parseInt(x, 10);
    return {
        timestamp: time,
        price: val
    }
}

function trim(item) {
    if(item.length < TRIM_SIZE) {
        return item;
    }
    return item.slice(item.length - TRIM_SIZE, item.length);
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
                coindesk: {
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

var optionsCoinDesk = {
  uri: "https://api.coindesk.com/v1/bpi/currentprice.json",
  json: true
};

var optionsCoinbase = {
  uri: "https://api.coinbase.com/v2/prices/spot?currency=INR",
  json: true
};

function checkForAlert(arr, exchange) {
    var min = 100000000000; var max = 0;
    var THRESOLD = 1800;

    arr.map(el => {
        var price = el.price;
        if(price > max)
            max = price;

        if(price < min) 
            min = price;
    });
    if(exchange == "coinbase") {
        THRESOLD = 1000;
    }

    if(max - min > THRESOLD) {
        console.log("exchange: " + exchange);
        say.speak(exchange);
        console.log("min " + min);
        console.log("max " + max);
    }
}

function check(objDump) {
    // get last 5 results and check for max min
    var zebpay = objDump.zebpay;
    var bci = objDump.bci;
    var coinbase = objDump.coinbase;
    var coindesk = objDump.coindesk;
    var minSize = 3;
    if(size <= minSize) {
        return; // no alert
    }
    var size = zebpay.buy.length;
    var zbuy = zebpay.buy.slice(size - minSize , size);
    var zsell = zebpay.sell.slice(size - minSize , size);
    var bbuy = bci.buy.slice(size - minSize , size);
    var bsell = bci.sell.slice(size - minSize , size);
    var cbase = coinbase.buy.slice(size - minSize , size);
    var cdesk = coindesk.buy.slice(size - minSize , size);

    checkForAlert(zbuy, "zebpay buy");
    checkForAlert(zsell, "zebpay sell");
    checkForAlert(bbuy, "bitcoin india buy");
    checkForAlert(bsell, "bitcoin india sell");
    checkForAlert(cbase, "coinbase");
    checkForAlert(cdesk, "coinbase");
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

  var coindesk =  rp(optionsCoinDesk)
    .then(function (obj) {
        coindeskBuy = obj.bpi.USD.rate_float * USDTOINR;
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

    Promise.all([bci, zeb, coinbase, coindesk])
    .then(values => { 
        console.log(FgWhite, "bcibuy: ", bciBuy, "  bciSell: ", bciSell);
        console.log(FgGreen, "zebBuy:  ", zebBuy, "  zebsell:  ", zebsell);
        console.log(FgWhite, "coinbaseBuy: ", coinbaseBuy);    
        console.log(FgWhite, "coindeskBuy: ", coindeskBuy);    
        console.log(Reset, "*********************************************");
        var time = Date.now();
        objDump.coinbase.buy.push(getInt(coinbaseBuy, time));
        objDump.coindesk.buy.push(getInt(coindeskBuy, time));
        objDump.zebpay.buy.push(getInt(zebBuy, time));
        objDump.zebpay.sell.push(getInt(zebsell, time));
        objDump.bci.buy.push(getInt(bciBuy, time));
        objDump.bci.sell.push(getInt(bciSell, time));

        objDump.coinbase.buy = trim(objDump.coinbase.buy);
        objDump.coindesk.buy = trim(objDump.coindesk.buy);
        objDump.zebpay.buy = trim(objDump.zebpay.buy);
        objDump.zebpay.sell = trim(objDump.zebpay.sell);
        objDump.bci.buy = trim(objDump.bci.buy);
        objDump.bci.sell = trim(objDump.bci.sell);


        check(objDump);
        fs.writeFileSync('./datadump.json', JSON.stringify(objDump, null, 2) , 'utf-8');
    });
});
