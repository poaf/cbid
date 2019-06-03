# cbid scripts
Userscripts to help save money on cbid. Visit [https://www.tampermonkey.net](https://www.tampermonkey.net) to learn more about userscripts. The script can also save pricing info to AWS and a front end is included in this project.
#### cbid-prices
Adds functionality to the free fall auctions page. Adds lowest price and unit cost display to each item. Auctions can be dumped to a .csv by running the following in the console:
```
dumpPrices()
```
Auctions can be saved to an AWS dynamoDB by running:
```
saveToDB()
```
To enable saving to AWS create a config.js file in the root folder with the following:
```
var config = {
	tableName: "your tableName",
	AWSconfig: {
		region: "your region",
		accessKeyId: "your accessKeyId",
		secretAccessKey: "your secretAccessKey"
	}
};

if (typeof module === "object" && module && typeof module.exports === "object") {
	module.exports = config;
}
```
This config file is used by both the scripts and the front end.
#### cbid-autobuy
Buys an item when it falls to or below your target price. Visit a free fall auction page and run the following in the console:
```
autoBuy(targetPrice)
```
