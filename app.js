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
  
var lwip = require('lwip');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(require('connect').bodyParser());
app.use(express.bodyParser());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: true
//}));
app.use(cookieParser());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2540000000 }));



app.get('/',function (req,res){
  res.render('TEMPINDEX');
  console.log(' REQ ');
});



app.post('/upltest',function (req,res) {
  console.log('upl!');
  if(req.body.usertext) {
  res.send(req.body.usertext);
   
  }
  else {
    res.send(req.body);
  }
});

app.post('/usrp',function (req,res) {
  console.log('upl!');
  if (req.files) 
  { 
    function upload(filepath,imageid){
                 console.log('into upload');
                 var oldPath = filepath;
                 console.log('UPLOAD 1 step, oldPath:'+ oldPath);
                 var newPath = __dirname +"/public/userpics/"+ imageid;
                 console.log('UPLOAD 2 step, newPath:' + newPath );
                  fs.readFile(oldPath , function(err, data) {
                    fs.writeFile(newPath, data, function(err) {
                        fs.unlink(oldPath, function(){
                            if(err) throw err;
                            //res.send('<img src="/userpics/'+imageid+'" style="height:200px;width:200px;"></img>');
                            var dest = '/userpics/'+imageid;
                            res.render('crop',{'imgsrc':dest});
                              });
  
                  }); 
               }); 
               }
    upload(req.files.userpic.path,req.files.userpic.name);
 }
 else {
  res.send('Trouble with files');
 }
});


app.post('/userp/crop',function (req,res){
  console.log(req.body);
  var imgname = req.body.img.substring(10);
  var fullimgname = __dirname +"/public/userpics/"+ imgname;
  // TO DO check if info is present
  lwip.open(fullimgname, function(err, image) {
  if (err) throw err;
  var _cropOpt = {
    left: req.body.x1,
    top: req.body.x2,
    right: req.body.y1,
    bottom: req.body.y2
  }; // extract the face from the pic
 
  image.crop(_cropOpt.left, _cropOpt.top, _cropOpt.right, _cropOpt.bottom, function(err, crpdImg) {
    if (err) throw err;
    crpdImg.writeFile(__dirname +"/public/userpics/crop_"+ imgname, function(err) {
      if (err) throw err;
      res.send('succecss');
    });
  });
 
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