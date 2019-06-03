// ==UserScript==
// @name         Cigarbid record lowest prices
// @version      1.0
// @author       Poaf
// @match        https://www.cigarbid.com/shop/free-fall-auctions/*
// @grant        none
// @require      https://sdk.amazonaws.com/js/aws-sdk-2.7.16.min.js
// @require      file:///D:/projects/cigarbid/config.js
// ==/UserScript==

var prices = {};
window.prices = prices;

(function() {
    'use strict';
    AWS.config.update(config.AWSconfig);
    $("img").hide();
    checkPrices();
})();

function checkPrices() {
    //let start = new Date().getTime()
    $('.search-res-col > .search-res-auction').each(
        function(i, e) {
            let pack = $(e).find('.title > .title-pack').html();
            let size = $(e).find('.title > .title-shape').html();
            let dimensions = $(e).find('.title > .dimensions').html();
            let name = $(e).find('.title > .title-name').html() + size + dimensions + pack;
            let price = $(e).find(".search-res-info > .lot-ff > span[class*='lot-tick-'] > .price-amount").attr("data-value");
            let unitPrice = 0;
            let qty = 0;

            if (price) price = parseFloat(price);

            if (pack) {
                qty = 1;
                if (pack.match(/[0-9]+/)) {
                    qty = parseInt(pack.match(/[0-9]+/));
                }
                unitPrice = price / qty;
            }

            if (name && !prices[name]) {
                let auctionUrl = $(e).find(".search-res-info > .btn-auction").attr("href");
                let shortName = $(e).find('.title > .title-name').html()

                prices[name] = {};
                prices[name].qty = qty;
                prices[name].auctionUrl = auctionUrl;
                prices[name].fullname = name;
                prices[name].shortName = shortName;

                if (size) prices[name].size = size
                if (dimensions) prices[name].dimensions = dimensions;
            }

            if (price && (!prices[name].price || (prices[name].price && prices[name].price > price))) {
                prices[name].price = price;
                prices[name].updateDate = new Date().getTime();
                prices[name].unitPrice = unitPrice;
                $(e).find(".search-res-info > .lot-ff > .lot-msg").html('lowest: $' + price.toFixed(2) + '($' + unitPrice.toFixed(2) + ' ea) /');
            }
        }
    )

    //let end = new Date().getTime();
    //console.log((end - start) + ' ms');
    window.setTimeout(checkPrices, 1000);
}

function dumpPrices() {
    let content = "name,size,dimensions,unitPrice,qty,total,auctionUrl";
    Object.keys(prices).forEach(e => content += `\n${prices[e].shortName},${prices[e].size},${prices[e].dimensions},${prices[e].unitPrice},${prices[e].qty},${prices[e].price},https://www.cigarbid.com${prices[e].auctionUrl}`);
    downloadContent(content, 'prices.csv');
}

var dbQueue = [];
function saveToDB() {
    if (dbQueue.length>0) {
        console.log('Error: saving in progress');
        return;
    }
    Object.keys(prices).forEach(function(key) {
        var params = {
            TableName: config.tableName,
            Key:{
                "fullname": prices[key].fullname
            },
            UpdateExpression: "set shortName = :shortName, unitPrice = :unitPrice, price = :price, dimensions = :dimensions, size = :size, qty = :qty, auctionUrl = :auctionUrl, updateDate = :updateDate",
            ConditionExpression: "attribute_not_exists(fullname) or unitPrice > :unitPrice",
            ExpressionAttributeValues:{
                ":shortName": prices[key].shortName,
                ":price": prices[key].price,
                ":dimensions": prices[key].dimensions ? prices[key].dimensions : 'N/A',
                ":size": prices[key].size ? prices[key].size : 'N/A',
                ":qty": prices[key].qty ? prices[key].qty : 'N/A',
                ":auctionUrl": prices[key].auctionUrl,
                ":unitPrice": prices[key].unitPrice,
                ":updateDate": prices[key].updateDate
            },
            ReturnValues:"UPDATED_NEW"
        };
        dbQueue.push(params);
    });

    processDbQueue();
}

function processDbQueue() {
    console.log(`${dbQueue.length} records remaining`);
    if (dbQueue.length == 0) {
        console.log('Done saving');
        return;
    }

    let request = dbQueue.pop();
    let docClient = new AWS.DynamoDB.DocumentClient();
    console.log(request);
    docClient.update(request, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });

    sleep(400).then(() => processDbQueue());
}


function sleep(time) {
    return new Promise((resolve) => window.setTimeout(resolve, time));
}

function downloadContent(content, fileName) {
    var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function(){};
    var blob = null;
    var mimeString = "application/octet-stream";
    window.BlobBuilder = window.BlobBuilder ||
                         window.WebKitBlobBuilder ||
                         window.MozBlobBuilder ||
                         window.MSBlobBuilder;

    if (window.BlobBuilder) {
        var bb = new BlobBuilder();
        bb.append(content);
        blob = bb.getBlob(mimeString);
    } else {
        blob = new Blob([content], {type : mimeString});
    }

    var url = createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url
    a.download = fileName;
    a.innerHTML = "download file";
    document.body.appendChild(a);
    a.click();
}

window.dumpPrices = dumpPrices;
window.downloadContent = downloadContent;
window.saveToDB = saveToDB;
