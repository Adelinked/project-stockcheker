const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  //this.timeout(1500);
  suite("Integration tests with chai-http", function () {
    test("Test Viewing one stock", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=GOOG")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { stockData } = res.body
          assert.equal(stockData.stock, "GOOG");
          assert.equal(typeof (stockData.price), "number");
          assert.equal(typeof (stockData.likes), "number");
          done();
        });
    });
    test("Test Viewing one stock and liking it", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=MSFT&like=true")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { stockData } = res.body
          assert.equal(stockData.stock, "MSFT");
          assert.equal(typeof (stockData.price), "number");
          assert.equal(typeof (stockData.likes), "number");
          done();
        });
    });
    test("Test Viewing the same stock and liking it again", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=MSFT&like=true")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { stockData } = res.body
          assert.equal(stockData.stock, "MSFT");
          assert.equal(typeof (stockData.price), "number");
          assert.equal(typeof (stockData.likes), "number");
          done();
        });
    });
    test("Test Viewing two stocks", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=GOOG&stock=MSFT")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { stockData } = res.body
          assert.equal(stockData[0].stock, "GOOG");
          assert.equal(typeof (stockData[0].price), "number");
          assert.equal(typeof (stockData[0].rel_likes), "number");
          assert.equal(stockData[1].stock, "MSFT");
          assert.equal(typeof (stockData[1].price), "number");
          assert.equal(typeof (stockData[1].rel_likes), "number");
          done();
        });
    });
    test("Test Viewing two stocks and liking them", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=GOOG&stock=MSFT&like=true")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const { stockData } = res.body
          assert.equal(stockData[0].stock, "GOOG");
          assert.equal(typeof (stockData[0].price), "number");
          assert.equal(typeof (stockData[0].rel_likes), "number");
          assert.equal(stockData[1].stock, "MSFT");
          assert.equal(typeof (stockData[1].price), "number");
          assert.equal(typeof (stockData[1].rel_likes), "number");
          done();
        });
    });
  });
});
