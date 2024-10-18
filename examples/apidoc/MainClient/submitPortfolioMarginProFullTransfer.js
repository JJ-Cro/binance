const { MainClient } = require('binance');

  // This example shows how to call this Binance API endpoint with either node.js, javascript (js) or typescript (ts) with the npm module "binance" for Binance exchange
  // This Binance API SDK is available on npm via "npm install binance"
  // ENDPOINT: sapi/v1/portfolio/auto-collection
  // METHOD: POST
  // PUBLIC: NO
  // Link to function: https://github.com/tiagosiebler/binance/blob/master/src/main-client.ts#L3274

const client = new MainClient({
  apiKey: 'insert_api_key_here',
  apiSecret: 'insert_api_secret_here',
});

client.submitPortfolioMarginProFullTransfer(params)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });