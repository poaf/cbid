// ==UserScript==
// @name         Cigarbid record lowest prices
// @version      1.0
// @author       Poaf
// @match        https://www.cigarbid.com/shop/free-fall-auctions/*
// @grant        none
// ==/UserScript==

var prices = {};
window.prices = prices;

(function() {
    'use strict';
    checkPrices();
})();

function checkPrices() {
    $('.search-res-col > .search-res-auction').each(
        function(i, e) {
            let pack = $(e).find('.title > .title-pack').html();
            let size = $(e).find('.title > .title-shape').html();
            let dimensions = $(e).find('.title > .dimensions').html();
            let name = $(e).find('.title > .title-name').html() + size + dimensions + pack;
            let price = $(e).find(".search-res-info > .lot-ff > span[class*='lot-tick-'] > .price-amount").attr("data-value");
            let unit = 0;
            let qty = 0;

            if (price) price = parseFloat(price);

            if (pack) {
                qty = 1;
                if (pack.match(/[0-9]+/)) {
                    qty = parseInt(pack.match(/[0-9]+/));
                }
                unit = price / qty;
            }

            if (name && !prices[name]) {
                let url = $(e).find(".search-res-info > .btn-auction").attr("href");
                let shortName = $(e).find('.title > .title-name').html()

                prices[name] = {};
                prices[name].qty = qty;
                prices[name].url = url;
                prices[name].shortName = shortName;

                size ? prices[name].size = size : prices[name].size = '';
                dimensions ? prices[name].dimensions = dimensions : prices[name].dimensions = '';
            }

            if (price && (!prices[name].price || (prices[name].price && prices[name].price > price))) {
                prices[name].price = price;
                prices[name].unit = unit.toFixed(2);
                $(e).find(".search-res-info > .lot-ff > .lot-msg").html('lowest: $' + price.toFixed(2) + '($' + unit.toFixed(2) + ' ea) /');
            }
        }
    )

    setTimeout(checkPrices, 1000);
}

function dumpPrices() {
    let content = "name,size,dimensions,unit,qty,total,url";
    Object.keys(prices).forEach(e => content += `\n${prices[e].shortName},${prices[e].size},${prices[e].dimensions},${prices[e].unit},${prices[e].qty},${prices[e].price},https://www.cigarbid.com${prices[e].url}`);
    downloadContent(content, 'prices.csv');
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
