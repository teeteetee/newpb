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




var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  , users = db.get('users'),insidemsg = db.get('insidemsg'),discussions = db.get('discussions'),messages = db.get('messages'),books = db.get('books'),authors = db.get('authors'),follow = db.get('follow');
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
                  {   //var avatar = "img id='userimg' class='img-circle pull-left' src='/userpics/id"+done._id+done.picext+"'";
                      delete done.phr;
                      req.session=done;
                      res.render('userpage',{'user':done._id,'avatar':1,'done':JSON.stringify(done)});
                     
                  }
                   else {
                    //var emptyavatar = "div id=emptyavatar class='img-circle pull-left'";
                    delete done.phr;
                    req.session = done;
                    res.render('userpage',{'user':done._id,'avatar':0,'done':JSON.stringify(done)});
                    
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

app.post('/getbooks/:uid',function (req,res){
  //TO DO auth?
  users.findOne({_id:req.params.uid},function(err,doc){
    if(err) {
    console.log('err while users query');
     res.send(0);
    }
    else {
      if(doc!=null) {
        res.send(doc.bookstore);
      }
      else {
        res.send(0);
      }
    }
  });
});

app.post('/getbook/:id',function (req,res){
  //TO DO auth
  books.findOne({_id:req.params.id},function(err,doc){
    if(err) {
    console.log('err while users query');
     res.send(0);
    }
    else {
      if(doc!=null) {
        res.send(doc);
      }
      else {
        console.log('doc===null');
        res.send(0);
      }
  }
});
});

app.post('/getuser/:id',function (req,res){
  //TO DO auth
  users.findOne({_id:req.params.id},function(err,doc){
    if(err) {
    console.log('err while users query');
     res.send(0);
    }
    else {
      if(doc!=null) {
        res.send(doc);
      }
      else {
        console.log('doc===null');
        res.send(0);
      }
  }
});
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
    var vnick = req.body.nick;
    if(req.body.p.length >30 || req.body.mail.length>30 || req.body.nick.length>30) {
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

    if (validateEmail(vmail) === true) {
    users.find({mail:vmail,nick:vnick},function(err,doc){
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
          users.insert({pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,userpic:0,regdateint:fulldate,regdate:{year:vyear,month:vmonth,day:vday},userstore:{}},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          follow.insert({user:done._id.toString()});
          req.session.mail=vmail;
          req.session._id=done._id;
          ms.trouble =0;
          ms.mtext='success';
          res.send(ms);
          }
          });
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
                  res.render('chat',{'user':done._id,'discussions':done.discussions,'done':JSON.stringify(done)});
                  }
                  else {
                   //res.render('emptychat',{'user':done.uid,'done':JSON.stringify(done)});
                   res.render('chat',{'user':done._id,'discussions':0,'done':JSON.stringify(done)});
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

app.get('/about',function (req,res){
  if(req.session.mail)
  {res.render('about');}
else {
  res.render('about_out');
}
});

app.get('/people',function (req,res){
   if(req.session._id)
  {
        users.findOne({_id:req.session._id},function (err,doc){
          if(err) {
          // TO DO tell user
          }
          else {
            if(doc){
                          delete doc.bookstore;
                          delete doc.phr;
                          res.render('people',{'user':doc._id,'doc':JSON.stringify(doc)});  
                  }
                  else {
                    res.redirect('/');
                  }
          }
        });
      }
  else {
    res.render('restricted');
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

app.post('/markread/:uid/:bid',function (req,res){
  
  users.findOne({uid:parseInt(req.params.uid)},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
       res.send(1);
    }
    else {
      if(doc!=null){
       var temp_arr;
       temp_arr = doc.bookstore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.bid)){
           temp_arr[i].newbook = 0;
           users.update({uid:parseInt(req.params.uid)},{$set:{bookstore:temp_arr},$inc:{readbooks:1,newbooks:-1}});
          res.send(0);
         }
       }
      }
      else {
        console.log('trouble finding the user');
       res.send(1);
      }
    }
  });
});

app.post('/markgood/:uid/:bid',function (req,res){
  users.findOne({uid:parseInt(req.params.uid)},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
       res.send(1);
    }
    else {
     if(doc!=null){
      console.log('found user');
       var temp_arr;
       temp_arr = doc.bookstore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.bid)){
          console.log('modifying');
           temp_arr[i].goodbook = 1;
           users.update({uid:parseInt(req.params.uid)},{$set:{bookstore:temp_arr}});
          res.send(0);
         }
       }
      }
      else {
        console.log('trouble finding the user');
       res.send(1);
      }
    }
  });
});

//app.post('/people/:item',function (req,res){
//
//});

//******************** HELPERS ********************//

app.get('/helpers',function(req,res){
  res.render('helpers');
});

app.get('/sus',function(req,res){
  users.update({_id:req.session._id},{$set:{userstore:[]});
  res.redirect('/seeuser');
});

app.get('/seebooks',function (req,res){
  books.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
});

app.get('/seefollow',function (req,res){
 follow.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
});

app.get('/clearbooks/:id',function (req,res){
  console.log('clear books: '+req.params.id);
  users.update({uid:parseInt(req.params.id)},{$unset:{bookstore:[]},$set:{totalbooks:0,readbooks:0,newbooks:0}});
  res.redirect('/');
});

app.get('/seeauthors',function (req,res){
  authors.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
});

app.get('/cs',function (req,res){
  res.send(req.session);
});

app.get('/ad:id',function (req,res){
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

app.get('/dropbooks',function (req,res){
  books.remove({});
  res.redirect('/');
});

app.get('/dropauthors',function (req,res){
  authors.remove({});
  res.redirect('/');
});

app.get('/dropfollow',function (req,res){
  follow.remove({});
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

//******************** HELPERS END ********************//

app.get('/chat/:recid',function (req,res){
   console.log(1);
   var vsender = parseInt(req.session.uid);
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
  var vuid = req.params.uid
  if(vuid)
  {
    if(req.session.mail&&req.session._id){
      var ms={};
      ms.trouble=1;
      users.findOne({_id:vuid},function(err,doc){
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

app.get('/testloopx', function (req,res){
  tmp_l=14;
    for (var i = tmp_l; i>-1; i--) {
              // console.log('i: '+i);
              // console.log('long poll in 7');
              //if(1) {
              //      console.log('long poll in 8');
              //      
              //      if(i=tmp_l) {
              //        console.log('long poll in 9');
              //       
              //     }
              //    }
              if(i===tmp_l) {
                      console.log('long poll in 9');
                     
                   }
              console.log(i);
            }
            console.log('done');
});

//-----------------LONGPOLLING------------------//
app.post('/ntfc',function(req,res){
  console.log('timestamp: '+req.body.tmstmp)
  var dynamic_tmstmp;
  var ms={};
  var db_cont_check = setInterval(function(){check_udb()},7000);
   var tick = setInterval(function(){sort_response()},1500);
   function check_udb() {
    console.log('longpol routine'+req.ip);
    users.findOne({uid:parseInt(req.session.uid)},function (err,doc){
       if(err) {
       console.log('err while disc query');
       }
       else {
         if(doc.g_tmstmp&&doc.g_tmstmp>parseInt(req.body.tmstmp)){
           dynamic_tmstmp=doc.g_tmstmp;
           console.log('timestamp set');
           clearInterval(db_cont_check);
         }
           else{
            console.log('LOOP ROUTINE');
           }
       }
     });}
    function sort_response() {
      console.info('running sort_response');
      if(dynamic_tmstmp){
          ms.tmstmp = dynamic_tmstmp;
          ms.trouble=0;
          console.log('MS: '+dynamic_tmstmp);
         res.send(ms);
          clearInterval(tick);}
    }
});

app.post('/gtm/:discid',function(req,res){
    var vtmstmp = parseInt(req.body.tmstmp);
    var g_vdiscid = parseInt(req.params.discid);
    var dynamic_msgstore;
    var vlsttmstmp;
    var ms={};
    ms.msgstore =[];

    var terminate=0;
    req.on('close', function() {
       terminate ++;
       console.log('TERMINATE: '+terminate);
     }); 
   
   var db_cont_check = setInterval(function(){check_db()},2500);

   var tick = setInterval(function(){sort_response()},1500);

   function check_db () {
    discussions.findOne({discid:g_vdiscid},function(err,done){
      if(err) {
        console.warn('db err disc query');
      }
      else {
        if(done&&done.msgstore) {
           dynamic_msgstore = done.msgstore;
        }
        else {
          console.warn('empty');
        }
      }
    });
  }
    function sort_response () {
      if(dynamic_msgstore && dynamic_msgstore[dynamic_msgstore.length-1].tmstmp>vtmstmp)
           {
            //console.log('TIMESTAMP: '+vtmstmp);
             var tmp_l = dynamic_msgstore.length-1;
            for (var i = tmp_l; i>-1; i--) {
               if(dynamic_msgstore[i].tmstmp < vtmstmp){
                       break;
                     }
              else if(dynamic_msgstore[i].rcvr === parseInt(req.session.uid) && dynamic_msgstore[i].tmstmp > vtmstmp) {
                    ms.msgstore.push(dynamic_msgstore[i]);
                    if(i===tmp_l) {
                     vlsttmstmp=dynamic_msgstore[i].tmstmp;
                   }
                  }
            }
         if(ms.msgstore.length)   
        {
          var sht_tmp ={};
           sht_tmp['$set'] = {};
           sht_tmp['$set']['tmstmpstore.'+g_vdiscid.toString()] =vlsttmstmp;
           users.update({uid:parseInt(req.session.uid)},sht_tmp);
                
          ms.trouble=0;
          //--------------------------//
          res.send(ms);
          terminate++;
          clearInterval(db_cont_check);
          clearInterval(tick);
        }
          else {
            
            return 0
          }
      }
      else {
        
         return 0
      }
    }
   });
//-----------------LONGPOLLING END------------------//


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
      if(doc){
        //---------------------------//
        if(doc.msgstore)
           { console.log('changing timestamp'); 
            var tmp_length = doc.msgstore.length-1;
             var vlsttmstmp = doc.msgstore[tmp_length].tmstmp;
             vdisid=vdiscid.toString();
             var sht_tmp ={};
              sht_tmp['$set'] = {};
              sht_tmp['$set']['tmstmpstore.'+vdiscid] =vlsttmstmp;
              users.update({uid:parseInt(req.session.uid)},sht_tmp);}
        //--------------------------//
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
  discussions.update({discid:vdiscid},{$push:{msgstore:{txt:vtxtbody,rcvr:vrcvr,sndr:vsndr,discid:vdiscid,tmstmp:vtmstmp}},$inc:{msgcnt:1}});
  users.update({uid:vrcvr},{$set:{g_tmstmp:vtmstmp}});// planned to be used to get message notification throughout the webpage
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
  var vlsttmstmp;
  discussions.findOne({discid:vdiscid},function (err,done){
    if (err) {
     res.send(ms);
    }
    else {
      if(done.msgstore) {
        for (var i = done.msgstore.length-1; i > -1; --i) {
          if(done.msgstore[i].rcvr === rcvr && done.msgstore[i].tmstmp > vtmstmp) {
            ms.msgstore.push(done.msgstore[i]);
            if(i=done.msgstore.length-1) {
             vlsttmstmp=done.msgstore[i].tmstmp;
           }
          }
          else if(done.msgstore[i].tmstmp <= vtmstmp){
            break;
          }
        }
        if(vlsttmstmp&&vlsttmstmp!=null){
            console.log('setting lsttmstmp: '+vlsttmstmp);
            console.log('discid: '+vdiscid);
            vdisid=vdiscid.toString();
            //eval("db.collection('users').update({uid:rcvr},{$set:{tmpstmpstore."+vdiscid+":vlsttmstmp}});");
            var sht_tmp ={};
             sht_tmp['$set'] = {};
             sht_tmp['$set']['tmstmpstore.'+vdiscid] =vlsttmstmp;
             
            console.log(sht_tmp);
             users.update({uid:rcvr},sht_tmp);
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

app.get('/supfollow',function (req,res){
  follow.insert({user:req.session._id});
  res.redirect('/');
});

app.get('/delfollow',function (req,res){
  follow.remove({user:req.session._id});
  res.redirect('/');
});

app.post('/follow/:id',function (req,res){
  if(req.session._id){
    var tmp_id = req.params.id;
    console.log(typeof tmp_id);
    var tmstmp = Date.now();
    //var new_user={};
    var update_tmstmp = {};
    update_tmstmp[req.params.id]={'tmstmp': tmstmp};
    follow.update({user:req.session._id},{$set:update_tmstmp});
    users.update({_id:req.session._id},{$push:{userstore:req.params.id}});
   //users.update({_id:req.session._id},{$set:new_user});
   //req.session.userstore[req.params.id]={'tmstmp':tmstmp};
    var ms={};
    ms.trouble=0;
    res.send(ms);
  }
  else {
    res.send(0);
  }
});

app.post('/getfollow',function (req,res){
  if(req.session._id){
    var ms={};
    ms.trouble=1;
    follow.findOne({user:req.session._id},function(err,done){
     if(err){
        res.send(ms);
     }
     else {
       res.send(done);
     }
    });
  }
    else{
      res.send(0);
    }
});

app.post('/unfollow/:id',function (req,res){
  if(req.session._id){
    var tmp_id = req.params.id;
    var tmp_unset={}
    tmp_unset[tmp_id]=0;
   follow.update({user:req.session._id},{$unset:tmp_unset});
   var rem_user={};
    var tmstmp = Date.now();
    rem_user.userstore[req.params.id]=0;
   users.update({_id:req.session._id},{$unset:rem_user});
   delete req.session.userstore[req.params.id];
   console.log('req.session.userstore');
   var ms={};
    ms.trouble=0;
    res.send(ms);
  }
    else {
    res.send(0);
  }
});

app.post('/gettimestamp/:id',function (req,res){
  if(req.session._id){
    follow.findOne({user:req.session._id},function (err,done){
      if(err)
      {
        console.log('err');
        res.send(0);
      }
      else {
        var update_tmstmp = {};
        update_tmstmp[req.params.id]={'tmstmp': Date.now()};
        follow.update({user:req.session._id},{$set:update_tmstmp});
        var ms={};
        ms.tmstmp = done[req.params.id.toString()];
        console.log(ms.tmstmp);
        res.send(ms);
      }
    });
  }
  else {
    res.send(0);
  }
});

app.get('/u/:nick', function (req,res){
  //TO DO if req.session
  if(req.session.mail)
  { if(req.session.nick===req.params.nick)
    {
     res.redirect('/');
    }
    else
    {var vnick = req.params.nick;
        users.findOne({nick:vnick},function (err,doc){
          if(err) {
          
          }
          else {
            if(doc){
              var unfollow=0;
              var avatar=0
                      if(doc.userpic)
                      { avatar=1; }
                        delete doc.bookstore;
                          delete doc.phr;
                          if(req.session.userstore && req.session.userstore[req.params.id]) {
                          //  req.session.userstore.some(function(el,index,ar){
                          //  console.log(el._id+'\n'+JSON.stringify(doc._id));
                          //  if(el._id===doc._id.toString()) {
                          //    unfollow=1;
                          //    console.log('good');
                          //    return true;
                          //  }
                          //});
                          unfollow=1;
                          }
                          var update_tmstmp = {};
                          var tmp_str = doc._id.toString();
                          update_tmstmp[tmp_str]={'tmstmp': Date.now()};
                          follow.update({user:req.session._id},{$set:update_tmstmp});
                          res.render('anotheruser',{'user':doc._id,'avatar':avatar,'doc':JSON.stringify(doc),unfollow:unfollow});
                      
                       
                  }
                  else {
                    res.redirect('/');
                  }
          }
        });
      }
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
  if(req.session.mail&&req.session._id)
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
        var newpath = __dirname +"/public/userpics/id"+req.session._id+vpicext;
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
                    var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
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
                        var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
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



app.post('/additem/:uid/:id',function (req,res){
  var cond = req.params.id; 
  switch(cond){
    case('book'):
    
      newbook(req.body.title, doauthors)
      function newbook(vtitle, callback){
         books.findOne({title:vtitle},function(err,book){
           if(err) {
               console.log('err while book query');
           }
           else {
              if(book){
                var book_insert={};
                book_insert._id = book._id;
                book_insert.goodbook = 0;
                if(parseInt(req.body.newbook))
              { book_insert.newbook = 1;
                users.update({_id:req.params.uid},{$push:{bookstore:book_insert},$inc:{totalbooks:1,newbooks:1}});
                             tell_user(0);}
                  else {
                    book_insert.newbook =0;
                    users.update({_id:req.params._id},{$push:{bookstore:book_insert},$inc:{totalbooks:1,oldbooks:1}});
                             tell_user(0);
                  }
               //respond to user with success
              }
              else{
                 books.insert({title:vtitle},function(err,newbook){

                  if(err){
                    console.log('err while adding a book');
                  }
                  else{
                     console.log('created a book:'+newbook._id);
                     console.log('newbook: '+req.body.newbook+' '+typeof req.body.newbook);
                      var book_insert={};
                      book_insert._id = newbook._id;
                      book_insert.goodbook = 0;
                     if(parseInt(req.body.newbook))
                     {book_insert.newbook = 1;
                      users.update({_id:req.params.uid},{$push:{bookstore:book_insert},$inc:{totalbooks:1,newbooks:1}});
                                          callback(parseInt(req.body.authornum),newbook._id,tell_user);}
                                          else
                      {book_insert.newbook = 0;
                        users.update({_id:req.params.uid},{$push:{bookstore:book_insert},$inc:{totalbooks:1,oldbooks:1}});
                                          callback(parseInt(req.body.authornum),newbook._id,tell_user);}
                  }
                 });
              }
           }
         });
         }

      function doauthors(authors_num, book_id, callback){
        console.log('in authors, parameters: '+authors_num+', '+book_id);
         if(!req.body.author0_name || !req.body.author0_surname)
          {callback(0);}
        else
         {authors_num++;
                  for(var i =0;i<authors_num;i++){
                    eval("console.log('authors surname:'+req.body.author"+i+"_surname);authors.findOne({name:req.body.author"+i+"_name,surname:req.body.author"+i+"_surname},function(err,author){if(err) {console.log('err while author query');callback(0);}else {console.log('1');if(author!=null){console.log('author exists');var insert_author={};insert_author.name = author.name;insert_author.surname = author.surname;insert_author._id = author._id;books.update({_id:book_id},{$push:{authors:insert_author}});console.log('inserted '+author_surname+' to book '+book_id);}else{console.log('there was no author, created one');authors.insert({name:req.body.author"+i+"_name,surname:req.body.author"+i+"_surname},function(err,newauthor){if(err) {console.log('err while adding author');callback(0);}else {  var insert_author={};insert_author.name = newauthor.name;insert_author.surname = newauthor.surname;insert_author._id = newauthor._id;console.log('going to push our author id in the book');books.update({_id:book_id},{$push:{authors:insert_author}});console.log('inserted '+newauthor.surname+' to book '+book_id);}});}}});");
                  }
                  console.log('all authors added');
                  callback(1);}
       }

       function tell_user (trouble){
        console.log('reporting to the user');
        var ms = {};
        if(trouble){
        console.log('TROUBLE, REPORTING');
        ms.trouble = trouble;
        res.send(ms);
        }
        else {
        ms.trouble = trouble;
        res.send(ms);
        }
       }
      
    break;
    case('movie'):
    break;
  }
});

app.post('/nickcheck',function (req,res){
  var query = req.body.txt;
  var msg = {};
  users.find({title: { $regex: query,}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs);
        if(docs.length!=0)
        { console.log('someone');
          msg.present =1;
          res.send(msg);}
        else {
          console.log('clear');
          msg.present=0;
          res.send(msg);
        }
      }
     });
});

app.post('/livesearch/:id',function (req,res){
  var cond = req.params.id;
  var query = req.body.txt;
  console.log('txt: '+query);
  switch(cond){
    case('btitle'):
     //query = '.*\\'+query+'.*';
     books.find({title: { $regex: query, $options: 'i'}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs);
        if(docs.length!=0)
        {res.send(docs);}
        else {
          res.send(0);
        }
      }
     });
    break;
    case('author'):
     authors.find({author: { $regex: query, $options: 'i'}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs); 
        res.send(docs);
      }
     });
    break;
    case('mtitle'):
     mtitles.find({title: { $regex: query, $options: 'i'}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs);
        res.send(docs);
      }
     });
    break;
    case('director'):
     directors.find({director: { $regex: query, $options: 'i'}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs);
        res.send(docs);
      }
     });
    break;
    case('isbn'):
     // lets not use that for now
     isbn.find({isbn: { $regex: query, $options: 'i'}},function(err,docs){
      if(err){
        console.log('err');
      }
      else {
        console.log(docs);
        res.send(docs);
      }
     });
    break;
  }
});

app.get('/sockets',function (req,res){
  res.render('sockets');
});

///sockets
var server = app.listen(80,'188.166.118.116');
var io = require('socket.io').listen(server);

var clients = [];
io.on('connection', function (socket) {
  clients.push(socket);
  var interval = setInterval(function () {
  socket.emit('news', { hello: 'world' });
},1000);
   socket.on("disconnect", function () {
        console.log('disconnect');
        clearInterval(interval);
    });
   socket.on("tweet", function (tweet) {
        // we received a tweet from the browser
        console.log(clients);
        console.log('session id:'+socket.sessionId);
        console.log('tweet: '+tweet.text);
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