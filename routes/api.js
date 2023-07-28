'use strict';
const axios = require('axios');
const crypto = require('crypto');
// db configuration
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const stockSchema = new mongoose.Schema({
  stock: {
    type: String,
    required: true
  },
  likers: {
    type: [String],
    required: true
  }

});

let DbStock = mongoose.model('StockModel', stockSchema);

function hashIP(ip) {
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex');
}
async function saveStock(dbData, stock, like, liker) {
  let likes = 0;
  if (dbData) {
    likes = dbData.likers.length;
    if (like == 'true' && !dbData.likers.includes(liker)) {
      likes++;
      dbData.likers.push(liker);
      const updatedStock = await dbData.save();
    }
  }
  else {
    if (like == 'true') {
      const newStock = new DbStock({ stock: stock, likers: [liker] });
      likes = 1;
      const savedStock = await newStock.save();
    }
  }
  return likes ?? 0;
}


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let stockData;
      const { stock, like } = req.query;
      let liker = req.ip;
      if (like == 'true') {
        liker = hashIP(liker)
      }
      if (Array.isArray(stock)) {
        const stockResponse1 = axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[0]}/quote`);
        const stockResponse2 = axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[1]}/quote`);
        const dbResponse1 = DbStock.find({ stock: stock[0].toUpperCase() });
        const dbResponse2 = DbStock.find({ stock: stock[1].toUpperCase() });

        const [stockData1, stockData2, dbData1, dbData2] = await Promise.all([stockResponse1, stockResponse2, dbResponse1, dbResponse2]);
        const receivedData1 = stockData1.data;
        const receivedData2 = stockData2.data;

        const likesResp1 = saveStock(dbData1[0], stock[0].toUpperCase(), like, liker);
        const likesResp2 = saveStock(dbData2[0], stock[1].toUpperCase(), like, liker);

        const [likes1, likes2] = await Promise.all([likesResp1, likesResp2])

        stockData = [{ stock: receivedData1.symbol, price: receivedData1.latestPrice, rel_likes: likes1 - likes2 },
        { stock: receivedData2.symbol, price: receivedData2.latestPrice, rel_likes: likes2 - likes1 }]
      }
      else {
        let likes = 0;
        const stockResponse = axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
        const dbResponse = DbStock.find({ stock: stock.toUpperCase() });
        const [receivedData, dbData] = await Promise.all([stockResponse, dbResponse]);
        likes = await saveStock(dbData[0], stock.toUpperCase(), like, liker)
        stockData = { stock: receivedData.data.symbol, price: receivedData.data.latestPrice, likes: likes }
      }
      res.json({ stockData });
    });

};
