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
app.use(express.bodyParser());
app.use(cookieParser());
app.use(express.compress());
// TO DO get this up when ttesting done app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2540000000 }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessions({
  cookieName: 'session',
  secret:'2342kjhkj2h3i2uh32j3hk2jDKLKSl23kh42u3ih4',
  duration:4320 * 60 *1000,
  activeduration:1440 * 60 * 1000,
  cookie: {
    path:'/',
  httpOnly: true,
  domain:'vntrlst.com'
  }
}));


app.get('/',function(req,res) {
   if (req.session.mail)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        { console.log(req.session);
          users.findOne({mail:req.session.mail},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.render('index_new');
            }
            else {
              if(done){
                  res.send('WELCOME USER '+done.uid);
              }
              else {
                res.render('index_new');
              }
            }
          });
        }
   else {
  res.render('index_new');}
});

app.get('/signin', function (req,res){
  res.render('signin');
});

app.get('/logout',function (req,res){
  req.session.reset();
  res.redirect('http://vntrlst.com/');
});

app.post('/newuser',function(req,res){
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect';
    var vmail = req.body.mail; 
    if(req.body.p.length >30 || req.body.mail.length>30) {
      ms.mtext('fail');
      res.send(ms);
      return;
    }
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
    } 

    function generateId(callback) {
     users.find({},{limit:1,sort:{uid:-1}},function(err,doc){
     if(err){
         console.log('DB ERR WHILE GENERATING ID');
         callback(0);
        }
      else {
        if(doc.length>0){
            var newid = doc[0].uid;
                newid++;
                console.log('returning uid='+newid);
                callback(newid);
          }
        else {
              console.log('returning uid=');
                callback(1);
          }
            }
          });
     } // generateId declaration end

     function blanktest () {
      return 1;
     }

    if (validateEmail(vmail) === true) {
    users.find({mail:vmail},function(err,doc){
      if (err)
      {
        //DO SMTH
      }
      else {
        if(doc.length === 0)
        { //generate date
          var dd= new Date();
          var vday = dd.getDate().toString();
          if (vday.length===1){
            vday='0'+vday;
          }
          var vmonth = dd.getMonth()+1;
          vmonth = vmonth.toString();
          if (vmonth.length===1){
            vmonth='0'+vmonth;
          }
          var vyear = dd.getUTCFullYear().toString();
          var fulldate = vyear+vmonth+vday;
          fulldate = parseInt(fulldate);
          // end of generate date
          generateId(insert);
          function insert(vuid) {
            //lgn:vu
          users.insert({pub:0,styleint:1,mail:vmail,uid:vuid,phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,regdateint:fulldate,regdate:{year:vyear,month:vmonth,day:vday}});
          friends.insert({uid:vuid,mail:vmail});
          req.session.mail=vmail;
          ms.trouble =0;
          ms.mtext='success';
          res.send(ms);
          
           }
        }
        else {
           ms.mtext='email exists'
           res.send(ms);
        }
      }// end of err's else
    });
    }   
    else {
      // INCORRECT EMAIL, SO WE SEND A NOTIFICATION
      res.send(ms);
    }

    });

app.post('/check',function(req,res){
  vphr=req.body.phr;
  vlgn=req.body.lgn; // email
  console.log(vphr+" , "+vlgn);
   var  ms = {};
  ms.trouble=1;
  ms.mtext='db';
  users.findOne({mail:vlgn},function(err,confirmed){
    if (err)
      {res.send(ms);}
    else 
    {
      if (confirmed)
      {console.log('we have found :'+JSON.stringify(confirmed));
         
      
          if(bcrypt.compareSync(vphr,confirmed.phr))
          {
          
          req.session.mail = confirmed.mail;
          console.log("THAT'S WHAT I WROTE TO HIS COOKIES: "+JSON.stringify(req.session));
          ms.trouble = 0;
          ms.mtext= 'success';
          res.send(ms);
           }
           else {
            ms.mtext='wrong pas';
              res.send(ms);
              //WRONG PASSWORD
           }
         
      }
      else {
        ms.mtext='wronguser'
        res.send(ms);
      }
    }
  });
});





//app.post('/usrp',function (req,res) {
//  console.log('upl!');
//  if (req.files) 
//  { 
//    function upload(filepath,imageid){
//                 console.log('into upload');
//                 var oldPath = filepath;
//                 console.log('UPLOAD 1 step, oldPath:'+ oldPath);
//                 var newPath = __dirname +"/public/userpics/"+ imageid;
//                 console.log('UPLOAD 2 step, newPath:' + newPath );
//                  fs.readFile(oldPath , function(err, data) {
//                    fs.writeFile(newPath, data, function(err) {
//                        fs.unlink(oldPath, function(){
//                            if(err) throw err;
//                            //res.send('<img src="/userpics/'+imageid+'" style="height:200px;width:200px;"></img>');
//                            var dest = '/userpics/'+imageid;
//                            res.render('crop',{'imgsrc':dest});
//                              });
//  
//                  }); 
//               }); 
//               }
//    upload(req.files.userpic.path,req.files.userpic.name);
// }
// else {
//  res.send('Trouble with files');
// }
//});



//app.post('/userp/crop',function (req,res){
//  console.log(req.body);
//  var imgname = req.body.img.substring(10);
//  var fullimgname = __dirname +"/public/userpics/"+ imgname;
//  // TO DO check if info is present
//  lwip.open(fullimgname, function(err, image) {
//  if (err) throw err;
//  var _cropOpt = {
//   // left: req.body.x2,
//   // top: req.body.x1,
//   // right: req.body.y2,
//   // bottom: req.body.y1
//   left:parseInt(req.body.x2),
//   top:parseInt(req.body.y2),
//   right:parseInt(req.body.x1),
//   bottom:parseInt(req.body.y1)
//  }; // extract the face from the pic
// 
//  image.crop(_cropOpt.left, _cropOpt.top, _cropOpt.right, _cropOpt.bottom, function(err, crpdImg) {
//    if (err) throw err;
//    crpdImg.writeFile(__dirname +"/public/userpics/crop_"+ imgname, function(err) {
//      if (err) throw err;
//      var ms={};
//      ms.rdurl = 'crop_'+imgname;
//      res.send(ms);
//    });
//  });
// 
//});
//
//  });



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