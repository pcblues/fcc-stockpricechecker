/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog')
        .end(function(err, res){
        var stockData =res.body
           
        console.log(stockData)  
         assert.isDefined(stockData.stockData,'Object to have stockData element')
          done()
        })
      })
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog&like=true')
        .end(function(err, res){
         var stockData =res.body
         console.log(stockData.stockData.likes)
          assert.equal(stockData.stockData.likes,1,'1 like')
        done()
      });
      })
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog&like=true')
        .end(function(err, res){
          var stockData =res.body
       console.log(stockData)         
          assert.equal(stockData.stockData.likes,1,'stockData','1 like')
        done()
      });})
      
      test('2 stocks', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog&stock=msft')
        .end(function(err, res){
          var stockData =res.body
        console.log(stockData)
          assert.isArray(stockData.stockData,'')
        done()
      });})
      
      test('2 stocks with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog&stock=msft&like=true')
        
        .end(function(err, res){
         var stockData =res.body
         console.log(stockData)
          assert.isArray(stockData.stockData,'')
         assert.equal(stockData.stockData[0].rel_likes,0,'Rel_like 0')
 
        done()
      });})
    
})})
