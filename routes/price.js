'use strict';

let https=require('https')


exports.getPrice= function(stock,callback) {
   var results=[]
    var result
    let host = 'www.alphavantage.co'
    let path = '/query';
    
    let response_handler = function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            var rawResults = body
            
            results=JSON.parse(rawResults)
            
            var resultTS=results['Time Series (1min)']
            if (resultTS==null) {
               result='0.00' 
            } else {
              var resultRec = resultTS[Object.keys(resultTS)[0]]
              var resultStr=resultRec['4. close']
              var resultFloat=parseFloat(resultStr)
              result = resultFloat.toFixed(2)
            }
              
          callback(result)
        
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });
    };

    let get_price = function (stock) {
      var fullPath = path + '?function=TIME_SERIES_INTRADAY&symbol='+stock+'&interval=1min&apikey='+process.env.ALPHAKEY 
      
      let request_params = {
            method : 'GET',
            hostname : host,
            path : fullPath 
        };
        
        let req = https.request(request_params, response_handler);
        req.end();
      
    }

    get_price(stock)
    //result='1.00'
    //callback(result)
}


