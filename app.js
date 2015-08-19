var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var Cookies = require('cookies');
var bcrypt = require('bcrypt');

var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  , users = db.get('users'),insidemsg = db.get('insidemsg'),friends = db.get('friends');
// POSTS and OBJECTS BELONGS TO MALESHIN PROJECT DELETE WHEN PUSHING TOPANDVIEWS TO PRODUCTION
var fs = require('fs-extra');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(require('connect').bodyParser());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2540000000 }));



app.get('/',function(req,res){
  res.render('TEMPINDEX');
  console.log(' REQ ');
});

if(req.files) {
  res.send(req.files);
  
}

app.post('/upl',function(req,res){
  console.log('upl!');
  upload(req.files.userpic.path,req.files.userpic.name,reply);

  function reply(picadr){
    console.log('reply!');
   req.send('<img src="'+picadr+'" style="height:200px;width:200px;"></img>');
  }

  function upload(filepath,imageid,reply){
               var oldPath = filepath;
               console.log('UPLOAD 1 step, oldPath:'+ oldPath);
               var newPath = __dirname +"/public/userpics/"+ imageid;
               console.log('UPLOAD 2 step, newPath:' + newPath );
                fs.readFile(oldPath , function(err, data) {
                  fs.writeFile(newPath, data, function(err) {
                      fs.unlink(oldPath, function(){
                          if(err) throw err;
                          res.send('UPLOAD '+imageid+"file uploaded to: " + newPath);
                          reply("/userpics/"+ imageid);
                            });

                  }); 
               }); 
               }
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