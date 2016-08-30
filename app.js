var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var Cookies = require('cookies');
var bcrypt = require('bcrypt');
var ObjectID = require('mongodb').ObjectID;
var http = require('http');



var mongo = require('mongodb').MongoClient;
var db = require('monk')('localhost/tav')
  , concepts = db.get('concepts'),questions = db.get('questions'), stats = db.get('stats');
// POSTS and OBJECTS BELONGS TO MALESHIN PROJECT DELETE WHEN PUSHING TOPANDVIEWS TO PRODUCTION
var fs = require('fs-extra');
  

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.bodyParser());
app.use(cookieParser());
app.use(express.compress());
// TO DO get this up when ttesting done app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2540000000 }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(sessions({
//  cookieName: 'session',
//  secret:'2342kjhkj2h3i2uh32j3hk2jDKLKSl23kh42u3ih4',
//  duration:4320 * 60 *1000,
//  activeduration:1440 * 60 * 1000,
//  cookie: {
//    path:'/',
//  httpOnly: true,
//  domain:'peopleandbooks.com'
//  }
//}));


app.get('*', function(req,res,next) {   
 //var d = new Date();
 // if(req.headers.host === 'api.peopleandbooks.com' )  //if it's a sub-domain
 //  {console.log(d+' got an api request from '+req.ip);
 //   req.url = '/api' + req.url; 
 //   console.log(req.url); //append some text yourself
 // next();}
 // else{
 //  //console.log('-------------- REQUEST --------------')
 //  //console.log('User-Agent: ' + req.headers['user-agent']);
 //  //console.log('URL: '+req.url);
 //  //console.log(req.ip);
 //   next();}
 //
  //req.session.tmstmp = Date.now();
  //console.log(req.session);
  next();
  });




function validateJSON(body) {
  try {
    var data = JSON.parse(body);
    // if came to here, then valid
    return data;
  } catch(e) {
    // failed to parse
    return null;
  }
}

app.get('/',function(req,res){
  res.render('index');
});

app.get('/tryindex',function(req,res){
  res.render('tryindex');
});

app.get('/8871',function(req,res){
  comments.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE ITEMS QUERY');
      res.send(ms);
    }
    else {
      res.send(doc);
    }
  });
});

app.post('/getdata',function (req,res){
  var msg={};
  msg.trouble=0;
  concepts.find({},function (err,done){
    questions.find({},function (err2,done2){
      msg.questions = done2;
      msg.concepts = done;
      //console.log('sending:\n'+JSON.stringify(done)+'\n'+JSON.stringify(done2));
      res.send(msg);
    });
  });
});


app.post('/addquestion',function(req,res){
    console.log('NEW COMMENT');
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect'; 
    var vauth = req.body.au;
    var vcm = req.body.cm;
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    //checkmail function was here before being moved out of scope
      questions.insert({q_body:vcm,tmstmp:Date.now()},function (err,done){
        if(err)
        {
          ms.mtext='db';
         res.send(ms); 
        }
      else {
      ms.trouble =0;
      ms.mtext='success';
      res.send(ms);
      
      }
      });
        
    
    });

app.post('/addconcept',function(req,res){
    console.log('NEW COMMENT');
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect'; 
    var vauth = req.body.au;
    var vcm = req.body.cm;
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    //checkmail function was here before being moved out of scope
      concepts.insert({title:vcm,link:vauth,topic:v_topic,tmstmp:Date.now()},function (err,done){
        if(err)
        {
          ms.mtext='db';
         res.send(ms); 
        }
      else {
      ms.trouble =0;
      ms.mtext='success';
      res.send(ms);
      
      }
      });
        
    
    });




// production error handler
// no stacktraces leaked to user
app.use(function(req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('404');
});


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;

app.listen(80,'188.166.118.116');
// zero downtime with naught
if (process.send) process.send('online');
process.on('message', function(message) {
  if (message === 'shutdown') {
    //Do whatever you need to do before shutdown (cleanup, saving stuff, etc.)
    process.exit(0);
  }
});