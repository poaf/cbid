// ==UserScript==
// @name         Free Fall Auction Autobuy
// @version      1.0
// @description  Buys a free fall auction when under a specified price
// @author       Poaf
// @match        https://www.cigarbid.com/a/*
// @grant        none
// ==/UserScript==

var freeFall = false;
var targetPrice;

(function() {
    'use strict';
    checkFreeFall();
})();

//the url for regular and free fall auctions is the same, make sure this script can only run on freefall auctions
function checkFreeFall() {
    var disclaimer = $('#page-container > div > main > div > section > div.col-xs-12.col-sm-7.col-md-6.lot-col-right > div.rs.lot-bid > form.lot-form > small > p').text();

    if (disclaimer.startsWith('Disclaimer: By clicking “Buy Now!” your purchase is instant. Free Fall')) {
        freeFall = true;
    }
}

function autoBuy(price) {
    if (!freeFall) {
        console.log('This is not a free fall auction!!!');
        return;
    }

    if (price <= 0) {
        console.log('Price must be greater than 0.');
        return;
    }

    targetPrice = price;
    console.log(`Buying at ${targetPrice} or less.`);
    $("#BidConfirmation").click();
    buyLoop();
}

function buyLoop() {
    let currentPrice = $(".price-amount").attr("data-value");
    console.log(currentPrice);

    if (currentPrice > 0 && currentPrice <= targetPrice) {
        $('#page-container > div > main > div > section > div.col-xs-12.col-sm-7.col-md-6.lot-col-right > div.rs.lot-bid > form.lot-form > div:nth-child(6) > button').click();
        console.log(`Bought item at ${currentPrice}.`);
        return;
    }

    setTimeout(buyLoop, 1000);
}

window.autoBuy = autoBuy;
