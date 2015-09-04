var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('client-sessions');
var Cookies = require('cookies');
var bcrypt = require('bcrypt');
var http = require('http');

var server = app.listen(80,'188.166.118.116');
var io = require('socket.io').listen(server);



var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  , users = db.get('users'),insidemsg = db.get('insidemsg'),discussions = db.get('discussions'),messages = db.get('messages');
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
                  if(done.userpic)
                  { var avatar = "img id='userimg' class='img-circle center-block' src='/userpics/id"+done.uid+done.picext+"'";
                    res.render('userpage',{'user':done.uid,'avatar':avatar});}
                   else {
                    var emptyavatar = "div id=emptyavatar class='img-circle' style='width:130px;height:130px;margin:auto;border:7px dotted #eee;bakcground-color:white;border-radius:50%;'";
                    res.render('userpage',{'user':done.uid,'avatar':emptyavatar});
                   }
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
          users.insert({pub:1,mail:vmail,uid:vuid,phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,userpic:0,regdateint:fulldate,regdate:{year:vyear,month:vmonth,day:vday}});
          req.session.mail=vmail;
          req.session.uid=vuid;
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
          req.session.uid = confirmed.uid;
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



app.get('/chat',function (req,res){
  if(req.session.mail){
    users.findOne({mail:req.session.mail},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.render('index_new');
              console.log('QUERY ERR');
            }
            else {
              if(done){
                  if(done.discussions)
                  {
                  res.render('chat',{'user':done.uid,'discussions':done.discussions,'done':JSON.stringify(done)});
                  }
                  else {
                   res.render('emptychat',{'user':done.uid,'done':JSON.stringify(done)});
                  }
              }
              else {
                res.render('index_new');
                console.log('DOCUMENT ERR');
              }
            }
          });
  }
  else {
    res.send('restricted. authorised only');
  }
});

app.get('/temp_disc',function (req,res){
  res.render('discussion',{'rcvrid':2,'user':1});
});

app.get('/discussion/:id',function (req,res){
  //TO DO if req.session
  discussions.findOne({discid:vdiscid},function (err,doc){
    if(err) {
    ms.trouble=1;
    ms.mtext='db';
    res.send(ms);
    }
    else {
      if(doc){
         var vlast = doc.msgstore.length - 10;
         ms.trouble = 0;
         ms.mtext = array_slice( doc.msgstore,vlast,doc.msgstore.length);
         res.send(ms);
      }
      else {
        ms.trouble=1;
        ms.mtext='no discussion';
        res.send(ms);
      }
    }
  });
});

app.post('/settings',function (req,res){
  var ms={};
  ms.trouble=1;
  var vpub = parseInt(req.body.pub);// public
  var vmrq = parseInt(req.body.mrq);// messaging request
  if(req.session.mail){
    users.update({mail:req.session.mail},{pub:vpub,mrq:vmrq});
    ms.trouble=0;
    res.send(ms);
  }
  else {
    res.send(ms);
  }
});

app.get('/settings',function (req,res){
  if(req.session.mail){
    users.findOne({mail:req.session.mail},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.redirect('/');
              console.log('QUERY ERR');
            }
            else {
              if(done){
                  res.render('settings',{'done':JSON.stringify(done),'user':done.uid});
              }
              else {
                res.redirect('/');
                console.log('DOCUMENT ERR');
              }
            }
          });
  }
  else {
    res.redirect('/');
  }
});

app.get('/dropdisc',function (req,res){
  users.update({},{$unset:{discussions:1}},{upsert:false,
                          multi:true});
  discussions.remove({});
  res.redirect('/');
});

app.get('/dropusers',function (req,res){
  users.remove({});
  res.redirect('/');
});

app.get('/seedisc',function (req,res){
  discussions.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
});

app.get('/seeuser',function (req,res){
  users.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
});

app.get('/chat/:sndid/:recid',function (req,res){
   console.log(1);
   var vsender = parseInt(req.params.sndid);
   var vdest =  parseInt(req.params.recid);
   if(vsender!=req.session.uid){
    res.redirect('/');
   }
   else{
   discussions.findOne({snd:vsender,rcv:vdest},function (err,done){
     if(err){
              //err page ?
              res.render('index_new');
              console.log('QUERY ERR');
            }
            else {
              console.log(2);
              if(done){
                console.log(3);
                console.log('discussion '+done.discid);
                res.render('discussion',{'user':vsender,'rcvrid':vdest,'discid':done.discid});
              }
              else{
               discussions.findOne({rcv:vsender,snd:vdest},function (err,done2){
                 if(err){
                          //err page ?
                          res.render('index_new');
                          console.log('QUERY ERR');
                        }
                        else {
                          console.log(2);
                          if(done2){
                            console.log(3);
                            console.log('discussion '+done2.discid);
                            res.render('discussion',{'user':vsender,'rcvrid':vdest,'discid':done2.discid});
                          }
                else {
                  console.log(4);
                  discussions.find({},{limit:1,sort:{discid:-1}},function (err,doc){
                    console.log(5);
                    if(err){
                        res.render('index_new');
                         console.log('QUERY ERR');
                       }
                     else {
                      console.log(6);
                       if(doc.length>0){
                        console.log(7);
                           var newid = doc[0].discid;
                           newid++;
                           discussions.insert({discid:newid,snd:vsender,rcv:vdest,msgcnt:0});
                           users.update({uid:vsender},{$push:{discussions:newid}});
                           users.update({uid:vdest},{$push:{discussions:newid}});
                           res.render('discussion',{'user':vsender,'rcvrid':vdest,'discid':newid});
                         }
                         else{
                          discussions.insert({discid:1,snd:vsender,rcv:vdest,msgcnt:0});
                          users.update({uid:vsender},{$push:{discussions:1}});
                          users.update({uid:vdest},{$push:{discussions:1}});
                           res.render('discussion',{'user':vsender,'rcvrid':vdest,'discid':1});
                         }
                       }
                     });
                }//else
              }
             });
              }
            }
   });
}
});

app.post('/getavatar/:uid',function (req,res){
  var vuid = parseInt(req.params.uid);
  if(vuid)
  {
    if(req.session.mail&&req.session.uid){
      var ms={};
      ms.trouble=1;
      users.findOne({uid:vuid},function(err,doc){
           if(err) {
       ms.mtext='db';
       res.send(ms);
       }
       else {
         if(doc){
            console.log('userpic: '+parseInt(doc.userpic));
            if(parseInt(doc.userpic)!=0)
            {ms.trouble = 0;
             ms.mtext = doc.userpic;
             ms.ext= doc.picext;
             res.send(ms);}
             else {
                ms.trouble = 0;
             ms.mtext = 'emptypic';
             res.send(ms);
             }
         }
         else {
           ms.mtext='no user';
           res.send(ms);
         }
       }
      });
    }
    else
    {
    res.send(Date.now());
    }
  }
  else {
    res.send(Date.now());
  }
});

app.get('/newindex',function (req,res){
  res.render('userpage_empty');
});

app.post('/getdisc/:id', function (req,res){
  // API to populate discussion page
  //TO DO if req.session present, otherwise go away
  var vdiscid = parseInt(req.params.id);
  var ms ={};
  ms.trouble = 0;
  discussions.findOne({discid:vdiscid},function (err,doc){
    if(err) {
    res.send(ms);
    }
    else {
      if(doc){
        if(doc.msgstore)
        {
         var vlast = doc.msgstore.length - 10;
         ms.msgstore=doc.msgstore.slice(vlast,doc.msgstore.length);
         res.send(ms);}
        else {
          ms.mtext = 'empty'
          res.send(ms);
        }
      }
      else {
        ms.trouble=1;
        ms.mtext='no discussion';
        res.send(ms);
      }
    }
  });

});

app.post('/getdiscinfo/:id', function (req,res){
  //API used when populating page with the list of conversations
  console.log('getting disc info');
  //TO DO if req.session present, otherwise go away
  var vdiscid = parseInt(req.params.id);
  var ms ={};
  ms.trouble = 0;
  discussions.findOne({discid:vdiscid},function (err,doc){
    if(err) {
    ms.trouble=1;
    res.send(ms);
    }
    else {
      console.log('found discussion №'+doc.discid+': \n'+JSON.stringify(doc));
      if(doc){
        ms.mtext = doc;
        res.send(ms);
      }
      else {
        ms.trouble=1;
        ms.mtext='no discussion';
        res.send(ms);
      }
    }
  });

});

app.post('/disc/:id',function (req,res){
  // Incoming message 
  //TO DO if req.session present, otherwise go away
  var vdiscid = parseInt(req.params.id);
  var vsndr = parseInt(req.body.sndr);
  var vrcvr = parseInt(req.body.rcvr);
  var vtxtbody = req.body.txtbody;
  var ms = {};
  ms.trouble =0;
  var vtmstmp = Date.now();
  console.log('MSG: snd '+vsndr+',rcv'+vrcvr+',txt '+vtxtbody+', timestamp: '+vtmstmp);
  discussions.update({discid:vdiscid},{$push:{msgstore:{txt:vtxtbody,rcvr:vrcvr,sndr:vsndr,discid:vdiscid,tmstmp:vtmstmp}}},{$inc:{msgcnt:1}});
  res.send(ms);
  });

app.post('/disccheck/:id/:uid',function (req,res){
  // Client checking for messages 
  //TO DO if req.session present, otherwise go away
  var rcvr = parseInt(req.params.uid);
  var vdiscid = parseInt(req.params.id);
  var vtmstmp = parseInt(req.body.tmstmp);
  var ms ={};
  ms.trouble=1;
  ms.msgstore=[];
  discussions.findOne({discid:vdiscid},function (err,done){
    if (err) {
     res.send(ms);
    }
    else {
      if(done.msgstore) {
        console.log('IIIIIIII'+done.msgstore+'IIIIIIII');
        for (var i = done.msgstore.length-1; i > -1; --i) {
          if(done.msgstore[i].rcvr === rcvr && done.msgstore[i].tmstmp > vtmstmp) {
            ms.msgstore.push(done.msgstore[i]);
          }
          else if(done.msgstore[i].tmstmp <= vtmstmp){
            break;
          }
        }
        ms.trouble=0;
        console.log(ms);
        res.send(ms);
      }
      else {
       res.send(ms);
      }
    }
  });
});
  
  //discussions.findOne({discid:vdiscid},function (err,doc){
  //  if(err) {
  //  ms.trouble=1;
  //  ms.mtext='db';
  //  res.send(ms);
  //  }
  //  else {
  //    if(doc){
  //     
  //    }
  //    else {
  //      ms.trouble=1;
  //      ms.mtext='no discussion';
  //      res.send(ms);
  //    }
  //  }
  //});
  //messages.find({},{limit:1,sort:{uid:-1}},function(err,doc){
  //                  if(err){
  //                      res.render('index_new');
  //                       console.log('QUERY ERR');
  //                     }
  //                   else {
  //                     if(doc.length>0){
  //                         var newid = doc[0].uid;
  //                         newid++;
  //                         var vtmstmp = Date.now();
  //                        messages.insert({txt:vtxtbody,rcvr:vrcvr,sndr:vsndr,discid:vdiscid,tmstmp:vtmstmp});
  //                        //TO DO check for new messages 
  //                        var ms={};
  //                        var ms.trouble = 0;
  //                        res.send(ms); 
  //                       }
  //                       }
  //                     });


app.post('/checkdisc/:id/:last', function (req,res){
  var vdiscid = req.params.id;
  var vlast = req.params.last;
  ms.trouble=1;
  ms.mtext='db';
  res.send(ms);

  //array_slice( $directors, 1, 2 )

  discussions.findOne({discid:vdiscid},function (err,doc){
    if(err) {
    res.send(ms);
    }
    else {
      if(doc){
        ms.trouble=0;
        ms.mtext=array_slice( doc.msgstore,vlast,doc.msgstore.length);
        console.log(ms.mtext);
       res.send(ms);
      }
      else {
        ms.trouble=1;
        ms.mtext='no discussion';
        res.send(ms);
      }
    }
  });

});

app.get('/cs',function (req,res){
  res.send(req.session);
});

app.get('/usr:id',function (req,res){
  var vuid = parseInt(req.params.id);
  users.findOne({uid:vuid},function (err,done){
    if (err) {
      console.log('err');
      res.send('db err');
    }
    else {
      res.send(done);
    }
  });
});

app.get('/user/:id', function (req,res){
  //TO DO if req.session
  if(req.session.uid)
  {var vuid = parseInt(req.params.id);
    users.findOne({uid:vuid},function (err,doc){
      if(err) {
      
      }
      else {
        if(doc){
          if(doc.pub)
          {res.render('anotheruser',{'sndr':req.session.uid,'rcvr':vuid,'books':doc.books,'movies':doc.movies});}
          else {
            res.render('restricted');
          }
        }
        else {
          res.redirect('vntrlst.com');
        }
      }
    });
  }
  else {
    res.render('restricted');
  }
});





app.post('/usrp',function (req,res) {
  console.log('upl!');
  if(req.session.mail){
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
                              res.render('crop_new',{'imgsrc':dest});  
                                });
                    }); 
                 }); 
                 }
      upload(req.files.userpic.path,req.files.userpic.name);
   }
   else {
    console.log('problem with files');
    res.redirect('/');
   }}
   else {
    console.log('somebody messing with us?');
    res.redirect('/');
   }
});



app.post('/userp/crop',function (req,res){
  // Although duplicate check was implemented, if the new image has another extension it will fail, nothing major as soon as we will accept only two formats
  // resize is done with this ttps://github.com/EyalAr/lwip#resize, shit quality, needs to be tweaked or replaced
  console.log(req.body);
  if(req.session.mail)
  {var imgname = req.body.img.substring(10);
    var fullimgname = __dirname +"/public/userpics/"+ imgname;
    // TO DO check if info is present
    lwip.open(fullimgname, function(err, image) {
    if (err) throw err;
    var _cropOpt = {
     // left: req.body.x2,
     // top: req.body.x1,
     // right: req.body.y2,
     // bottom: req.body.y1
     left:parseInt(req.body.x2),
     top:parseInt(req.body.y2),
     right:parseInt(req.body.x1),
     bottom:parseInt(req.body.y1)
    }; // extract the face from the pic
   
    image.crop(_cropOpt.left, _cropOpt.top, _cropOpt.right, _cropOpt.bottom, function(err, crpdImg) {
      if (err) throw err;
      //crpdImg.writeFile(__dirname +"/public/userpics/crop_"+ imgname, function(err) {
        //path.extname('index.html')
        var vpicext = path.extname(imgname);
        var newpath = __dirname +"/public/userpics/id"+req.session.uid+vpicext;
      path.exists(newpath, function(exists) { 
  if (exists) { 
    // remove existing userpic, write cropped imge, remove original image
       fs.unlink(newpath, function(){
            if(err) throw err;
            crpdImg.writeFile(newpath, function(err) {
        if (err) throw err;
        fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
          if(err) throw err;
           //00000000000000000000000000000
                    var newpath_small = __dirname +"/public/userpics/id"+req.session.uid+"_small"+vpicext;
                     path.exists(newpath_small, function(exists) { 
                    if (exists) 
                      { //remove existing userpic_small, write resized
                        fs.unlink(newpath_small, function(){
                              if(err) throw err;
                              //-----------------------
                              lwip.open(newpath, function(err, image_trsz) {
                                 if (err) throw err;
                                  
                                  image_trsz.resize(69,function(err,image_small){
                                      image_small.writeFile(newpath_small, function(err) {
                                         if (err) throw err;
                                          users.update({mail:req.session.mail},{$set:{userpic:1,picext:vpicext}});
                                          res.send('ok');
                                       });
                                  });
                                });
                              //-----------------
                            });
                      }
                      else{
                         //write resized
                        lwip.open(newpath, function(err, image_trsz) {
                                 if (err) throw err;
                                  
                                  image_trsz.resize(69,function(err,image_small){
                                      image_small.writeFile(newpath_small, function(err) {
                                         if (err) throw err;
                                            users.update({mail:req.session.mail},{$set:{userpic:1,picext:vpicext}});
                                            res.send('ok');
                                       });
                                  });
                                });
                      }
                    });
           //00000000000000000000000000000
        });
      });  
             });
       } 
      else {
        //write cropped image, remove original
        crpdImg.writeFile(newpath, function(err) {
        if (err) throw err;
        fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
          if(err) throw err;
           //0000000000000000000000000000000
                        var newpath_small = __dirname +"/public/userpics/id"+req.session.uid+"_small"+vpicext;
                         path.exists(newpath_small, function(exists) { 
                        if (exists) 
                          { //remove existing userpic_small, write resized
                            fs.unlink(newpath_small, function(){
                                  if(err) throw err;
                                  //-----------------------
                                  lwip.open(newpath, function(err, image_trsz) {
                                     if (err) throw err;
                                      
                                      image_trsz.resize(69,function(err,image_small){
                                          image_small.writeFile(newpath_small, function(err) {
                                             if (err) throw err;
                                              users.update({mail:req.session.mail},{$set:{userpic:1,picext:vpicext}});
                                              res.send('ok');
                                           });
                                      });
                                    });
                                  //-----------------
                                });
                          }
                          else{
                             //write resized
                            lwip.open(newpath, function(err, image_trsz) {
                                     if (err) throw err;
                                      
                                      image_trsz.resize(69,function(err,image_small){
                                          image_small.writeFile(newpath_small, function(err) {
                                             if (err) throw err;
                                                users.update({mail:req.session.mail},{$set:{userpic:1,picext:vpicext}});
                                                res.send('ok');
                                           });
                                      });
                                    });
                          }
                        });
           //0000000000000000000000000000000
        });
      });
      }
     }); 
      
    });
   
  });}
  else {
    res.redirect('/');
  }

  });

    


function messagescount () {
  insidemsg.count({},function(err,c){
    if(err) {
      return 0;
    }
    else {
      return c;
    }
  });
}

function getmessages () {
  insidemsg.find({},function(err,doc){
    if (err)
    {
      return 0;
    }
    else {
      return doc;
    }
  });
}

app.get('/admax',function(req,res){
  console.log("CHECKING COOKIES: "+JSON.stringify(req.session));
  
   if(req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
   {
   users.count({},function(err,c){
    if (err)
    {
      res.send('DB ERR')
    }
  else {
    
        if(messagescount)
    {
       var messages = getmessages;
      res.render('admin',{'users':c,'doc':messages});
     }
     else {
      res.render('adminzeromsg',{'users':c});
     }
     

  }
  });
  
}
   else {
   res.render('adminauth');
 }

});

app.post('/admax',function(req,res){
  var pas = 'christ';
  var log = 'jesus';
  var vpas = req.body.vpas;
  var vlog = req.body.vlog;
  if(pas === vpas && log === vlog) {
    req.session.sKK76d = 'porC6S78x0XZP1b2p08zGlq';
    res.redirect('http://vntrlst.com/admax');
  }
  else {
    res.render('adminauth');
  }
});

app.get('/admin/userlist',function(req,res){
  if(req.ip === '188.226.189.180'  || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
  {
    users.find({},function(err,doc){
    if(err)
    {
      res.send('DB ERR')
    }
    else {
      if(doc.length>0)
      {
         res.render('userlist',{'doc':doc});
      }
      else{
         res.send('NO PLACES - EMPTY DB');
      }
    }
  });
  }
  else{
    res.redirect('http://ya.ru');
  }
});

app.post('/drop/users',function(req,res){
  if(req.ip === '188.226.189.180' || req.session.sKK76d === 'porC6S78x0XZP1b2p08zGlq')
  {
    var pp = 'secureshit';
     if(req.body.p ===  pp)
     {users.remove({});
     console.log('USERS DB DROPPED FROM '+ req.ip);
     req.session.reset();
     res.redirect('http://vntrlst.com/admax');}
    else {
      res.redirect('http://vntrlst.com');
    }
  }
  else {
    res.redirect('http://vntrlst.com');
  }
});

app.post('/admin/1/:uid',function(req,res){
  var pas = req.body.uu;
  if (pas != 'withoutthesecurity') {
    res.redirect('http://vntrlst.com');
  }
  else 
  {var vuid = parseInt(req.params.uid);
    var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    users.remove({uid:vuid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        friends.remove({uid:vuid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        ms.trouble=0;
        res.send(ms);
      }
    });
      }
    });}
});

app.post('/admin/insidemsg/remove',function(req,res){
  console.log('removing a message');
  var vmid = parseInt(req.body.mid);
  var pas = req.body.pas;
  if (pas != 'withoutthesecurity' || !vmid) {
    res.redirect('http://vntrlst.com');
  }
  else 
  { var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    insidemsg.remove({mid:vmid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        ms.trouble=0;
        res.send(ms);
      }
    });
  }

});


app.post('/admin/insidemsg',function(req,res){
  console.log('creating message;');
  var vheading = req.body.heading;
  var vtextbody = req.body.textbody;
  var d = new Date();
  var vday = d.getDate().toString();
  var vmonth = d.getMonth()+1;
  vmonth = vmonth.toString();
  var vyear = d.getUTCFullYear().toString();
  console.log('beginning');
  if (vday.length===1){
         vday='0'+vday;
       }
  if (vmonth.length===1){
         vmonth='0'+vmonth;
       }
  var vregdateint= vyear+vmonth+vday;
  vregdateint = parseInt(vregdateint);
  var ms = {};
  ms.trouble=1;
  ms.mtext = 'db';
  console.log('middle');
  insidemsg.find({},{limit:1,sort:{mid:-1}},function(err,doc){
    if(err)
    {
      //clap your hands
      res.send(ms);
    }
   else {
    if(doc.length>0){
      console.log('end');
         var newid = doc[0].mid;
         newid++;
         console.log(newid);
         insidemsg.insert({mid: newid,heading: vheading,textbody: vtextbody,regdateint: vregdateint,regdate:{day:vday,month:vmonth,year:vyear}});
      ms.trouble=0;
      res.send(ms);
       }
       else {
         insidemsg.insert({mid: 1,heading: vheading,textbody: vtextbody,regdateint: vregdateint,regdate:{day:vday,month:vmonth,year:vyear}});
         ms.trouble=0;
      res.send(ms);
       }
   }
  });
});

app.get('sockets',function (req,res){
  res.render('sockets');
});

///sockets

io.on('connection', function (socket) {
  console.log('ANOTHER CUTOMER ON SOCKETS')
  var interval = setInterval(function () {
  socket.emit('news', { hello: 'world' });
},1000);
   socket.on("disconnect", function () {
        clearInterval(interval);
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

//app.listen(80,'188.166.118.116');
// zero downtime with naught
if (process.send) process.send('online');
process.on('message', function(message) {
  if (message === 'shutdown') {
    //Do whatever you need to do before shutdown (cleanup, saving stuff, etc.)
    process.exit(0);
  }
});