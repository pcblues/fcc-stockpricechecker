var url = process.env.DB
var dbName = 'fcc'
var collName = 'stocks'
var mongo=require('mongodb').MongoClient
var {ObjectId} = require('mongodb')
var price = require('./price')

var populateNewRec=function(stock) {
    var newRec ={}
    newRec.stock = stock
    newRec.price="0.00"
    newRec.likes=0
    newRec.likeIPs=[]
    return newRec
}


exports.get = function(req,res){
  console.log('using get')
  console.log(req.query)
  console.log(req.body)
  var qparams = req.query
  var qbody = req.body
  
  var numStocks=0
  var stock1=''
  var stock2=''
  
  // get number/names of stocks
  if (Array.isArray(qparams.stock)) {
    numStocks=2
    stock1=qparams.stock[0]
    stock2=qparams.stock[1]
  } else {
    numStocks=1
    stock1=qparams.stock
  }
    
  var like=req.body.like
  var ip= req.ip

  // get stocks
  var stockDB1 = getStock(stock1,res)
  var stockDB2 = {}
  if (numStocks==2) {
    stockDB2 = getStock(stock2,res)  
  }
  
  // likes
  if (like==true) {
    if (stockDB1.likeIPs.indexOf(ip)==1) {
      stockDB1.likeIPs.push(ip)
      stockDB1.likes+=1
    }
    if (numStocks==2) {
      if (stockDB2.likeIPs.indexOf(ip)==1) {
        stockDB2.likeIPs.push(ip)
        stockDB2.likes+=1
    }
    }
  }
  
  // prices
  price.getPrice(stockDB1.stock,function(result) {
    console.log(result)
    stockDB1.price = result
    putStock(stockDB1,res)
  })
  if (numStocks==2) {
    price.getPrice(stockDB2.stock,function(result) {
      console.log(result)
      stockDB2.price = result
      putStock(stockDB2,res)
    })
  }
  
  // output
  var stockdata = {stockdata:null}
  if (numStocks==1) {
     var stockBack1={stock:stockDB1.stock,price:stockDB1.price,likes:stockDB1.likes}
     stockdata.stockdata=stockBack1
  } else {
     var stockBack1={stock:stockDB1.stock,price:stockDB1.price,rel_likes:stockDB1.likes-stockDB2.likes}
     var stockBack2={stock:stockDB2.stock,price:stockDB2.price,rel_likes:stockDB2.likes-stockDB1.likes}
    stockdata.stockdata=[stockBack1,stockBack2]      
  }
  res.send(stockdata)
  
}


                   


function getStock(stock,res) {
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.find({stock:stock}).toArray(function(err,docs){
      if (err) {
        res.send(JSON.stringify(err))
      }  else {
        console.log(docs)
        if (docs==[]) {
          var newDocObj=populateNewRec(stock)
          coll.insert(newDocObj,function(err,data){
            if (err) { res.send(JSON.stringify(err))
            }  else {
              return newDocObj
            }
          })
        } else {
          return docs
        }
          
      }
    })
  }
  db.close()
  })
}      

function putStock(stock,res) {
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.update({_id:ObjectId(stock._id)},stock,function(err,count) {
      if (err ) {
        console.log('Error:'+err)
        res.send('could not update '+stock._id)
      } else if (count.n==0) {
        res.send('id not found '+stock._id)
      } else {
        console.log('successfully updated')
      }
      db.close()  
              
    }
    )
  }
  db.close()
  })
}      

  
  