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

var numStocks=0
var stock1=''
var stock2=''
var ip
var like
var stockDB1
var stockDB2

exports.get = function(req,res){
  console.log('using get')
  console.log(req.query)
  //console.log(req.body)
  var qparams = req.query
  var qbody = req.body
  
  
  // get number/names of stocks
  if (Array.isArray(qparams.stock)) {
    numStocks=2
    stock1=qparams.stock[0]
    stock2=qparams.stock[1]
  } else {
    numStocks=1
    stock1=qparams.stock
  }
  console.log('numStocks: '+numStocks)
  like=qparams.like
  ip= req.ip

  // get stocks
  getStock(stock1,res,gotStock1)
  
}

function gotStock1(res,sdb1) {
  console.log('gotStock1')
  stockDB1=sdb1
  if (numStocks==2) {
    getStock(stock2,res,gotStock2)  
  } else {
    gotStock2(res,{})
  }
}
  


function gotStock2(res,sdb2) {
 // likes
  stockDB2=sdb2
  console.log('gotStock2')
  if (like=='true') {
    if (stockDB1.likeIPs.indexOf(ip)==-1) {
      console.log(like +' '+stockDB1.likeIPs.indexOf(ip)+' '+ip)
      stockDB1.likeIPs.push(ip)
      stockDB1.likes+=1
      
    }
    if (numStocks==2) {
      if (stockDB2.likeIPs.indexOf(ip)==-1) {
        stockDB2.likeIPs.push(ip)
        stockDB2.likes+=1
    }
    }
  }
  console.log('After likes:'+JSON.stringify(stockDB1))
  // prices
  price.getPrice(stockDB1.stock,function(result) {
    //console.log(result)
    stockDB1.price = result
    putStock(stockDB1,res)
    
    if (numStocks==2) {
      price.getPrice(stockDB2.stock,function(result) {
        //console.log(result)
        stockDB2.price = result
        putStock(stockDB2,res)
        doRest(res,numStocks,stockDB1,stockDB2)
      })
    } else {
      doRest(res,numStocks,stockDB1,stockDB2)
    }
  })
   
}

function doRest(res,numStocks,stockDB1,stockDB2) {
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
  console.log(stockdata)
  res.send(stockdata)   
}

function getStock(stock,res,callback) {
  console.log('getStock:'+stock)
  var docObj=populateNewRec(stock)
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.find({stock:stock}).toArray(function(err,docs){
      if (err) {
        res.send(JSON.stringify(err))
      }  else {
        //console.log(docs)
        if (docs.length==0) {
          console.log('inserting record')
          coll.insert(docObj,function(err,data){
            if (err) { res.send(JSON.stringify(err))
            } else {
              console.log('inserted')
              callback(res,docObj)
            }
          })
        } else {
        docObj=docs[0] 
        console.log('got this: '+JSON.stringify(docObj))
        db.close()
        callback(res,docObj)
        }
      }
    })
  }
  
  })
}      

function putStock(stock,res) {
  console.log('using putStock:'+JSON.stringify(stock))
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.update({_id:ObjectId(stock._id)},stock,function(err,count) {
      if (err ) {
        console.log('Error:'+err)
        console.log('could not update '+stock._id)
      } else if (count.n==0) {
        console.log('id not found '+stock._id)
      } else {
        console.log('successfully updated')
      }      
    db.close()
    }
              )
  }
  
  })
}      

  
  