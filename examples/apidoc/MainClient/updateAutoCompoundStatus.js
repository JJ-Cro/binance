import { MainClient } from 'binance';
// or, if require is preferred:
// const { MainClient } = require('binance');

// This example shows how to call this Binance API endpoint with either node.js, javascript (js) or typescript (ts) with the npm module "binance" for Binance exchange
// This Binance API SDK is available on npm via "npm install binance"
//
// DEPRECATED: Binance removed this endpoint (POST /sapi/v1/dci/product/auto_compound/edit-status).
// updateAutoCompoundStatus() is deprecated and calls will fail. Configure auto-compound for Dual
// Investment positions in the Binance web UI instead.
// ENDPOINT: sapi/v1/dci/product/auto_compound/edit-status (removed)
// METHOD: POST
// PUBLIC: NO

const client = new MainClient({
  api_key: 'insert_api_key_here',
  api_secret: 'insert_api_secret_here',
});

client.updateAutoCompoundStatus(params)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
