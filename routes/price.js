'use strict';

let https=require('https')


exports.getPrice= function(stock,callback) {
   var results=[]
    // Verify the endpoint URI.  At this writing, only one endpoint is used for Bing
    // search APIs.  In the future, regional endpoints may be available.  If you
    // encounter unexpected authorization errors, double-check this host against
    // the endpoint for your Bing Search instance in your Azure dashboard.
    let host = 'finance.google.com'
    let path = '/finance/info';
    
    let response_handler = function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            console.log('');
          
            var rawResults = JSON.parse(body).value
            console.log(rawResults);
            var result='9.34'
              
            
          callback(result)
        
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });
    };

    let get_price = function (stock) {
        
      let request_params = {
            method : 'GET',
            hostname : host,
            path : path + '?q=NASDAQ%3a' + encodeURIComponent(stock)
        };

        let req = https.request(request_params, response_handler);
        req.end();
      
    }

    get_price(stock)
}


