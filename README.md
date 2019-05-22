# cbid scripts
Userscripts to help save money on cbid. Visit [https://www.tampermonkey.net](https://www.tampermonkey.net) to learn more about userscripts.
#### cbid-prices
Adds functionality to the free fall auctions page. Adds lowest price and unit cost display to each item. Auctions can be dumped to a .csv by running the following in the console:
```
dumpPrices()
```
It is recommended to let this script run for a while to record price information, then dumping it to a .csv for browsing.
#### cbid-autobuy
Buys an item when it falls to or below your target price. Visit a free fall auction page and run the following in the console:
```
autoBuy(targetPrice)
```
