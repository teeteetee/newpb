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
  , users = db.get('users'),insidemsg = db.get('insidemsg'),user_messages = db.get('user_messages'),messages = db.get('messages'),items = db.get('items'),books = db.get('books'),movies = db.get('movies'),authors = db.get('authors'),follow = db.get('follow');
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
          users.findOne({mail:req.session.mail},{fields:{regdate:0,male:0,pub:0,phr:0}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
                var color;
                switch(Math.floor(Math.random() * 4) + 1){
                  case(1):
                  color='#ec3737';
                  break
                  case(2):
                  color='#37b6ec';
                  break
                  case(3):
                  color='#1FD081';
                  break
                  case(4):
                  color='#ec8637';
                  break
                }
                res.render('index_new',{'color':color});
            }
            else {
              if(done){
                  if(done.userpic)
                  {  
                      req.session=done;
                      //var background="background: url('/userpics/id"+done._id+"_small"+done.picext+"') no-repeat 15px 15px;";
                      res.render('userpage',{'user':done._id,'avatar':1,'done':JSON.stringify(done)});
                     
                  }
                   else {
                    req.session = done;
                    //var background="background: url('/images/pb_inf_logo.png') no-repeat 15px 15px;";
                    res.render('userpage',{'user':done._id,'avatar':0,'done':JSON.stringify(done)});
                    
                   }
              }
              else {
                var color;
                switch(Math.floor(Math.random() * 4) + 1){
                  case(1):
                  color='#ec3737';
                  break
                  case(2):
                  color='#37b6ec';
                  break
                  case(3):
                  color='#1FD081';
                  break
                  case(4):
                  color='#ec8637';
                  break
                }
                res.render('index_new',{'color':color});
              }
            }
          });
        }
   else {
                var color;
                switch(Math.floor(Math.random() * 4) + 1){
                  case(1):
                  color='#ec3737';
                  break
                  case(2):
                  color='#37b6ec';
                  break
                  case(3):
                  color='#1FD081';
                  break
                  case(4):
                  color='#ec8637';
                  break
                }
                res.render('index_new',{'color':color});
   }
});

//DISCONTINUED BECAUSE WE STORE BOOKS IN THE USER OBJECT WICH IS PASSED AROUND
//if it will be the case, that we decide to optimize loading time, than bookstore and moviestore will be
//separated into separate dbs, and this scenario will be back on track
//app.post('/getbooks',function (req,res){
//  //TO DO auth?
//  users.findOne({_id:req.session._id},function(err,doc){
//    if(err) {
//    console.log('err while users query');
//     res.send(0);
//    }
//    else {
//      if(doc!=null) {
//        res.send(doc.bookstore);
//      }
//      else {
//        res.send(0);
//      }
//    }
//  });
//});

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

app.get('/indextry',function (req,res){
  res.render('indextry');
});

app.post('/getmovie/:id',function (req,res){
  //TO DO auth
  movies.findOne({_id:req.params.id},function(err,doc){
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
  //used in 'people'
  users.findOne({_id:req.params.id},{fields:{regdate:0,male:0,pub:0,phr:0,userstore:0,bookstore:0,moviestore:0,newbooks:0,newmovies:0,totalbooks:0,totalmovies:0}},function(err,doc){
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
  var color;
   switch(Math.floor(Math.random() * 4) + 1){
     case(1):
     color='#ec3737';
     break
     case(2):
     color='#37b6ec';
     break
     case(3):
     color='#1FD081';
     break
     case(4):
     color='#ec8637';
     break
   }
   res.render('signin',{'color':color});
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
    users.find({mail:vmail,nick:vnick},{fields:{mail:1}},function(err,doc){
      if (err)
      {
        //DO SMTH
      }
      else {
        if(doc.length === 0)
        { 
          users.insert({pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,totalarticles:0,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,newarticles:0,readarticles:0,userpic:0,last_item:0,regdate:Date.now(),userstore:[],bookstore:[],moviestore:[],articlestore:[]},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          follow.insert({user:done._id.toString()});
          items.insert({user:done._id.toString(),bookstore:[],moviestore:[]});// used when searching by item id, not in user to keep things light and fast
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
    users.findOne({mail:req.session.mail},{fields:{discussions:1,tmstmpstore:1}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.redirect('/');
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
                res.redirect('/');
                console.log('DOCUMENT ERR');
              }
            }
          });
  }
  else {
    res.send('restricted. authorised only');
  }
});

app.post('/settings',function (req,res){
  var ms={};
  ms.trouble=1;
  var vpub = parseInt(req.body.pub);// public
  //var vmrq = parseInt(req.body.mrq);// messaging request
  if(req.session.mail){
    //users.update({mail:req.session.mail},{pub:vpub,mrq:vmrq});
    users.update({mail:req.session.mail},{$set:{pub:vpub}});
    ms.trouble=0;
    res.send(ms);
  }
  else {
    ms.trouble=1;
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
        users.findOne({_id:req.session._id},{fields:{userstore:1,readbooks:1,seenmovies:1}},function (err,doc){
          if(err) {
          // TO DO tell user
          }
          else {
            if(doc){
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
    users.findOne({mail:req.session.mail},{fields:{pub:1}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.redirect('/');
              console.log('QUERY ERR');
            }
            else {
              if(done){
                  res.render('settings',{'done':JSON.stringify(done),'user':done._id});
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

app.post('/markread/:bid',function (req,res){
  if(req.session._id){
    var ms={};
    ms.trouble=0;
    users.findOne({_id:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
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
             users.update({_id:req.session._id},{$set:{bookstore:temp_arr},$inc:{readbooks:1,newbooks:-1}});
             res.send(ms);
           }
         }
        }
        else {
          console.log('trouble finding the user');
          ms.trouble=1;
         res.send(ms);
        }
      }
    });
  }
  else {
    res.send('go away');
  }
});

app.post('/markseen/:mid',function (req,res){
  if(req.session._id){
    var ms={};
    ms.trouble=0;
    users.findOne({_id:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
      }
      else {
        if(doc!=null){
         var temp_arr;
         temp_arr = doc.moviestore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
            temp_id = JSON.stringify(temp_arr[i]._id);
           if(temp_id === JSON.stringify(req.params.mid)){
             temp_arr[i].newmovie = 0;
             users.update({_id:req.session._id},{$set:{moviestore:temp_arr},$inc:{seenmovies:1,newmovies:-1}});
             res.send(ms);
           }
         }
        }
        else {
          console.log('trouble finding the user');
          ms.trouble=1;
         res.send(ms);
        }
      }
    });
  }
  else {
    res.send('go away');
  }
});

app.post('/markarticleread/:aid',function (req,res){
  if(req.session._id){
    var ms={};
    ms.trouble=0;
    users.findOne({_id:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
      }
      else {
        if(doc!=null){
         var temp_arr;
         temp_arr = doc.articlestore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
            temp_id = JSON.stringify(temp_arr[i]._id);
           if(temp_id === JSON.stringify(req.params.aid)){
             temp_arr[i].newarticle = 0;
             users.update({_id:req.session._id},{$set:{articlestore:temp_arr},$inc:{readarticles:1,newarticles:-1}});
             res.send(ms);
           }
         }
        }
        else {
          console.log('trouble finding the user');
          ms.trouble=1;
         res.send(ms);
        }
      }
    });
  }
  else {
    res.send('go away');
  }
});

app.post('/removebook/:bid',function (req,res) {
  console.log(req.params.bid+' '+typeof req.params.bid);
  if(req.session._id){
    var ms={};
    ms.trouble=0;
    users.findOne({_id:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
      }
      else {
        if(doc!=null){
        var rem_item={};
         var temp_arr;
         temp_arr = doc.bookstore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
          console.log(JSON.stringify(temp_arr[i]._id)+'\n'+req.params.bid+' '+typeof temp_arr[i]._id);
           if(JSON.stringify(temp_arr[i]._id) === JSON.stringify(req.params.bid) ){
             rem_item = temp_arr.splice(i, 1);
             console.log('rem_item: '+JSON.stringify(rem_item));
             break
           }
         }//forloop
         console.log('newbook: '+rem_item.newbook);
         if(rem_item[0].newbook){
         users.update({_id:req.session._id},{$set:{bookstore:temp_arr},$inc:{totalbooks:-1,newbooks:-1}});
         items.update({user:req.session._id},{$pull:{bookstore:rem_item[0]._id.toString()}});
         res.send(ms);
         }
         else {
          users.update({_id:req.session._id},{$set:{bookstore:temp_arr},$inc:{totalbooks:-1,readbooks:-1}});
          items.update({user:req.session._id},{$pull:{bookstore:rem_item[0]._id.toString()}});
         res.send(ms);
         }
       }
     }

         });
  }
    else {
      res.send('go away');
    }
});

app.post('/removemovie/:mid',function (req,res) {
  console.log(req.params.mid+' '+typeof req.params.mid);
  if(req.session._id){
    var ms={};
    ms.trouble=0;
    users.findOne({_id:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
      }
      else {
        if(doc!=null){
        var rem_item={};
         var temp_arr;
         temp_arr = doc.moviestore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
          console.log(JSON.stringify(temp_arr[i]._id)+'\n'+req.params.mid+' '+typeof temp_arr[i]._id);
           if(JSON.stringify(temp_arr[i]._id) === JSON.stringify(req.params.mid) ){
             rem_item = temp_arr.splice(i, 1);
             console.log('rem_item: '+JSON.stringify(rem_item));
             break
           }
         }//forloop
         console.log('newmovie: '+rem_item.newmovie);
         if(rem_item[0].newmovie){
         users.update({_id:req.session._id},{$set:{moviestore:temp_arr},$inc:{totalmovies:-1,newmovies:-1}});
         items.update({user:req.session._id},{$pull:{moviestore:rem_item[0]._id.toString()}});
         res.send(ms);
         }
         else {
          users.update({_id:req.session._id},{$set:{moviestore:temp_arr},$inc:{totalmovies:-1,seenmovies:-1}});
          items.update({user:req.session._id},{$pull:{moviestore:rem_item[0]._id.toString()}});
         res.send(ms);
         }
       }
     }

         });
  }
    else {
      res.send('go away');
    }
});

app.post('/markbookgood/:bid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
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
           users.update({_id:req.session._id},{$set:{bookstore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});

app.post('/unmarkbookgood/:bid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
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
           temp_arr[i].goodbook = 0;
           users.update({_id:req.session._id},{$set:{bookstore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});

app.post('/unmarkarticlegood/:aid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
    }
    else {
     if(doc!=null){
      console.log('found user');
       var temp_arr;
       temp_arr = doc.articlestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodarticle = 0;
           users.update({_id:req.session._id},{$set:{articlestore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});

app.post('/markmoviegood/:mid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
    }
    else {
     if(doc!=null){
      console.log('found user');
       var temp_arr;
       temp_arr = doc.moviestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.mid)){
          console.log('modifying');
           temp_arr[i].goodmovie = 1;
           users.update({_id:req.session._id},{$set:{moviestore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});

app.post('/markarticlegood/:aid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
    }
    else {
     if(doc!=null){
      console.log('found user');
       var temp_arr;
       temp_arr = doc.articlestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodarticle = 1;
           users.update({_id:req.session._id},{$set:{articlestore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});

app.post('/unmarkmoviegood/:bid',function (req,res){
  var ms={};
  ms.trouble=0;
  users.findOne({_id:req.session._id},function(err,doc){
    if(err)
    {
     console.log('trouble finding the user');
      ms.trouble=1;
       res.send(ms);
    }
    else {
     if(doc!=null){
      console.log('found user');
       var temp_arr;
       temp_arr = doc.moviestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.bid)){
          console.log('modifying');
           temp_arr[i].goodmovie = 0;
           users.update({_id:req.session._id},{$set:{moviestore:temp_arr}});
           res.send(ms);
       }
      }
    }
      else {
        console.log('trouble finding the user');
        ms.trouble=1;
       res.send(ms);
      }
    }
  });
});


//******************** HELPERS ********************//

app.get('/helpers',function(req,res){
  res.render('helpers');
});

app.get('/lstitm',function (req,res){
  users.update({},{$set:{last_item:0}});
  res.redirect('/seeuser');
})

app.get('/sus',function(req,res){
  users.update({_id:req.session._id},{$set:{userstore:[]}});
  res.redirect('/seeuser');
});

app.get('/sdi',function(req,res) {
  users.update({},{$unset:{discussions:[],tmstmpstore:{}}});
  discussions.remove({});
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

app.get('/seemovies',function (req,res){
  movies.find({},function (err,done){
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

app.get('/clearbooks',function (req,res){
  if(req.session._id)
  {users.update({_id:req.session._id.toString()},{$set:{bookstore:[]},$set:{totalbooks:0,readbooks:0,newbooks:0}});
    console.log('empty items');
    items.update({user:req.session._id.toString()},{$set:{bookstore:[]}});
    res.redirect('/');}
    else {
      res.redirect('/');
    }
});

app.get('/cleararticles',function(req,res){
  users.update({_id:req.session._id},{$set:{articlestore:[],totalarticles:0,newarticles:0,readarticles:0}});
  res.redirect('/');
});

app.get('/setbooks',function (req,res){
  users.update({_id:req.session._id},{$set:{bookstore:[]}});
  res.redirect('/');
});

app.get('/clearmovies',function (req,res){
  users.update({_id:req.session._id},{$unset:{moviestore:[]},$set:{totalmovies:0,seenmovies:0,newmovies:0}});
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
  var vuid = req.params.id;
  users.findOne({nick:vuid},function (err,done){
    if (err) {
      console.log('err');
      res.send('db err');
    }
    else {
      res.send(done);
    }
  });
});

app.get('/dropum',function (req,res){
  user_messages.remove();
  res.redirect('/');
});

app.get('/dropusers',function (req,res){
  users.remove({});
  items.remove({});
  follow.remove({});
  res.redirect('/');
});

app.get('/dropbooks',function (req,res){
  books.remove({});
  res.redirect('/');
});

app.get('/dropmovies',function (req,res){
  movies.remove({});
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



app.post('/getavatar/:id',function (req,res){
  var vuid = req.params.id
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
             ms.nick= doc.nick;
             ms.mtext = doc.userpic;
             ms.picext= doc.picext;
             res.send(ms);}
             else {
                ms.trouble = 0;
                ms.nick= doc.nick;
                ms.mtext = doc.userpic;
                ms.picext= doc.picext;
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
  var vdiscid = req.params.id;
  var ms ={};
  ms.trouble = 0;
  discussions.findOne({_id:vdiscid},function (err,doc){
    if(err) {
    res.send(ms);
    }
    else {
      if(doc){
        if(doc.msgstore)
        {//----------- SETTING TIMESTAMP ----------//
         var tmp_length = doc.msgstore.length-1;
         var vlsttmstmp = doc.msgstore[tmp_length].tmstmp;
         var tmp_val={};
         vtmstmp = vlsttmstmp;
         tmp_val[vdiscid] = vlsttmstmp;
         var sht_tmp ={};
         var sht_tmp={'$set':{'tmstmpstore':tmp_val,'g_tmstmp':vlsttmstmp}};
         users.update({_id:req.session._id},sht_tmp);
         //-----------END SETTING TIMESTAMP ----------//
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


//-----------------LONGPOLLING END------------------//


app.get('/showitems',function (req,res){
  items.find({},function (err,done){
    res.send(done);
  });
});

app.get('/testtest',function (req,res){
  items.insert({option_one:'people',option_two:'books',bookstore:['a','b','c','d','e']});
  res.send('ok');
});

app.get('/checktest',function (req,res) {
  users.find({bookstore:'a'},function(err,done){
    if(err){} 
      else{
        res.send(done);
      }
  });
});



app.get('/people/:kind/:item',function (req,res){
  if(req.session._id){
    switch(req.params.kind){
       case('b'):
       items.find({bookstore:req.params.item},{fields:{bookstore:0,moviestore:0,_id:0}}, function(err,done){
        if(err){
          console.log('err while items query');
        }
          else {
            console.log(done);
            books.findOne({_id:req.params.item}, function (err2,book){
              if(err2){
                console.log('err while book query');}
              else if(book){
                 res.render('findpeople',{'doc':JSON.stringify(done),'title':book.title,'author':book.authors,'me':req.session._id});
              }
              else {
                res.render('findpeople',{'doc':JSON.stringify(done),'title':'--','author':'--','me':req.session._id});
              }
              });
            }
            //res.render('findpeople',{'doc':JSON.stringify(done)});
          });
       break;
       case('m'):
        items.find({moviestore:req.params.item},{fields:{bookstore:0,moviestore:0,_id:0}}, function(err,done){
        if(err){
          console.log('err while items query');
        }
          else {
            console.log(done);
            movies.findOne({_id:req.params.item}, function (err2,movie){
              console.log('movie: '+movie);
              if(err2){
                console.log('err while book query');}
              else if(movie){
                 res.render('findpeople',{'doc':JSON.stringify(done),'title':movie.title,'author':movie.year,'me':req.session._id});
              }
              else {
                res.render('findpeople',{'doc':JSON.stringify(done),'title':'--','author':'--','me':req.session._id});
              }
              });
            }
            //res.render('findpeople',{'doc':JSON.stringify(done)});
          });
       break;}
  }
  else {
    res.redirect('/');
  }
});

app.post('/getmsg',function (req,res){

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
    req.session.userstore.push(req.params.id);
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
   for(var i =0; i< req.session.userstore.length;i++){
    console.log(req.session.userstore[i]+','+typeof req.session.userstore[i]);
    console.log('\n'+tmp_id);
  if ( req.session.userstore[i] === tmp_id) { req.session.userstore.splice(i, 1);break}
} 
   users.update({_id:req.session._id},{$set:{userstore:req.session.userstore}});
   var ms={};
    ms.trouble=0;
    res.send(ms);
  }
    else {
    res.send(0);
  }
});

app.post('/gettimestamp/:id',function (req,res){
  //WHY DO WE NEED THAT ? THE OTHER PART OF THIS IS INSIDE "ANOTHERUSER"
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
        ms = done[req.params.id.toString()];
        res.send(ms);
      }
    });
  }
  else {
    res.send(0);
  }
});

app.get('/u/:nick', function (req,res){
  
   if(req.session && req.session.nick===req.params.nick)
    {
     res.redirect('/');
    }
    else
    {var vnick = req.params.nick;
        users.findOne({nick:vnick},{fields:{regdate:0,male:0,mail:0,phr:0,userstore:0,tmstmpstore:0}},function (err,doc){
          //pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,userpic:0,last_item:0,regdate:Date.now(),userstore:[],bookstore:[],moviestore:[]}
          if(err) {
          
          }
          else {
            if(doc){
              if(doc.pub)
              {var unfollow=0;
               if(req.session.userstore ) {
               for(var i=0;i<req.session.userstore.length;i++){
                 console.log(req.session.userstore[i]);
                 if(req.session.userstore[i]===doc._id.toString()) {
                 unfollow=1;
                 break
                 }
               }
               }
               if(req.session.nick)
               {//var update_tmstmp = {};
                //var tmp_str = doc._id.toString();
                //update_tmstmp[tmp_str]={'tmstmp': Date.now()};
                //follow.update({user:req.session._id},{$set:update_tmstmp});
                items.findOne({user:req.session._id},function(err,done){
                  if(!done){
                    done=[];
                  }
                  console.log('item done: '+done);
                  var mc = done.moviestore ? done.moviestore : 0;
                  var bc = done.bookstore ? done.bookstore : 0;
                  var ac = done.articlestore ? done.articlestore : 0;
                res.render('anotheruser',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc),'bookstorecheck':bc,'moviestorecheck':mc,'articlestorecheck':ac,'unfollow':unfollow});
                });

               }
               else {
                 if(doc.pub)
                 {res.render('anotheruser_out',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc)});}
                 else {
                   res.render('private');
                 }
               }
             }//doc pub
             else {
               res.render('private');
             }
                  }//if doc exists
                  else {
                    res.redirect('/');
                  }
          }
        });
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
                              res.render('crop_new2',{'imgsrc':dest});  
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
  console.log('INTO CROP');
  // Although duplicate check was implemented, if the new image has another extension it will fail, nothing major as soon as we will accept only two formats
  // resize is done with this ttps://github.com/EyalAr/lwip#resize, shit quality, needs to be tweaked or replaced
  console.log(req.body);
  if(req.session.mail&&req.session._id&&req.body.x1&&req.body.x2&&req.body.y1&&req.body.y2&&req.body.img)
    {var imgname = req.body.img.substring(10);
     var fullimgname = __dirname +"/public/userpics/"+ imgname;
     // TO DO check if info is present
     console.log(fullimgname);
     lwip.open(fullimgname, function(err, image) {
       if (err) throw err;
       var _cropOpt = {
       left:parseInt(req.body.x1),
       top:parseInt(req.body.y1),
       right:parseInt(req.body.x2),
       bottom:parseInt(req.body.y2)
       }; 

       console.log('CROPPING');
       image.crop(_cropOpt.left, _cropOpt.top, _cropOpt.right, _cropOpt.bottom, function(err, image) {
         if (err) throw err;
           if(parseInt(req.body.x2)-parseInt(req.body.x1)>300)
             {console.log('we are going to resize');
              image.resize(300,300,function(err,image){ 
                if(err) throw err;
                var vpicext = path.extname(imgname);
                var newpath = __dirname +"/public/userpics/id"+req.session._id+vpicext;
                path.exists(__dirname +"/public/userpics/id"+req.session._id+req.session.picext, function(exists) { 
                if (exists) {
                  console.log('userpic exists') 
                  // remove existing userpic, write cropped imge, remove original image
                  fs.unlink(newpath, function(){
                    if(err) throw err;
                    image.writeFile(newpath, function(err) {
                      if (err) throw err;
                        fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
                          if(err) throw err;
                          var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
                          path.exists(__dirname +"/public/userpics/id"+req.session._id+"_small"+req.session.picext, function(exists) { 
                            if (exists) 
                              { console.log('small exists');//remove existing userpic_small, write resized
                                fs.unlink(__dirname +"/public/userpics/id"+req.session._id+"_small"+req.session.picext, function(){
                                  if(err) throw err;
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
                        });
                    });  
                  });
                } 
                else {
                  console.log('no userpic');
                  //write cropped image, remove original
                  image.writeFile(newpath, function(err) {
                    if (err) throw err;
                    fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
                      if(err) throw err;
                      var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
                      path.exists(newpath_small, function(exists) { 
                        if (exists) 
                          { console.log('small exists2');//remove existing userpic_small, write resized
                            fs.unlink(newpath_small, function(){
                              if(err) throw err;
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
                    });
                  });
                }
              }); //PATH IF EXISTS  
            });//IMAGE RESIZE
          }//if cropped image was wider than 300
        else {
          var vpicext = path.extname(imgname);
          var newpath = __dirname +"/public/userpics/id"+req.session._id+vpicext;
          path.exists(__dirname +"/public/userpics/id"+req.session._id+req.session.picext, function(exists) { 
            if (exists) {
            console.log('userpic exists') 
            // remove existing userpic, write cropped imge, remove original image
            fs.unlink(newpath, function(){
              if(err) throw err;
              image.writeFile(newpath, function(err) {
                if (err) throw err;
                fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
                  if(err) throw err;
                    var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
                    path.exists(__dirname +"/public/userpics/id"+req.session._id+"_small"+req.session.picext, function(exists) { 
                      if (exists) 
                      { console.log('small exists');//remove existing userpic_small, write resized
                        fs.unlink(__dirname +"/public/userpics/id"+req.session._id+"_small"+req.session.picext, function(){
                          if(err) throw err;
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
                });
              });  
            });
          } 
          else {
            console.log('no userpic');
            //write cropped image, remove original
            image.writeFile(newpath, function(err) {
              if (err) throw err;
              fs.unlink(__dirname +"/public/userpics/"+imgname, function(){
                if(err) throw err;
                var newpath_small = __dirname +"/public/userpics/id"+req.session._id+"_small"+vpicext;
                path.exists(newpath_small, function(exists) { 
                  if (exists) 
                  { console.log('small exists2');//remove existing userpic_small, write resized
                    fs.unlink(newpath_small, function(){
                      if(err) throw err;
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
              });
            });
          }
        });// PATH IF EXISTS 
      }//ELSE FROM IF IMAGE>300
    });//IMAGE CROP
  });//IMAGE OPEN
}
  else {
    console.log('CROP FAIL REDIRECT');
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


app.post('/additem/:id',function (req,res){
  //TODO req session check with every post
  var cond = req.params.id; 
  switch(cond){
    case('book_out'):
    console.log('book_out');
    var book_id = req.body.book_id;
    var already = 0;
    for(var xx =req.session.bookstore.length-1;xx>=0;xx--){
      if(book_id === req.session.bookstore[xx]._id.toString()){
        console.log('trying to add a book, which is already on the list');
       already =1;
      }
    }
    if(!already)
    { var crrtm = Date.now();
      users.update({_id:req.session._id},{$push:{bookstore:{tmstmp:crrtm,_id:book_id,newbook:1,goodbook:0}},$set:{last_item:crrtm},$inc:{totalbooks:1,newbooks:1}});
        items.update({user:req.session._id},{$push:{bookstore:book_id.toString()}});
       req.session.bookstore.push({tmstmp:crrtm,_id:book_id,newbook:1,goodbook:0});
      }
        var ms ={};
        ms.trouble=0;
        res.send(ms);
    break;
    case('article_out'):
    console.log('article_out');
    var article_id = req.body.article_id;
    var already = 0;
    for(var xx =req.session.articlestore.length-1;xx>=0;xx--){
      if(article_id === req.session.articlestore[xx]._id.toString()){
        console.log('trying to add an article, which is already on the list');
       already =1;
      }
    }
    if(!already)
    {users.update({_id:req.session._id},{$push:{articlestore:{tmstmp:Date.now(),_id:article_id,title:req.body.title,link:req.body.link,newarticle:1,goodarticle:0}},$set:{last_item:Date.now()},$inc:{totalarticles:1,newarticles:1}});
      }
        var ms ={};
        ms.trouble=0;
        res.send(ms);
    break;
    case('movie_out'):
    console.log('movie_out');
    var movie_id = req.body.movie_id;
    var already = 0;
    for(var xx =req.session.moviestore.length-1;xx>=0;xx--){
      if(movie_id === req.session.moviestore[xx]._id.toString()){
        console.log('trying to add a movie, which is already on the list');
       already =1;
      }
    }
    if(!already)
    {
    var crrtm = Date.now();
    users.update({_id:req.session._id},{$push:{moviestore:{tmstmp:crrtm,_id:movie_id,newmovie:1,goodmovie:0}},$set:{last_item:crrtm},$inc:{totalmovies:1,newmovies:1}});
    items.update({user:req.session._id},{$push:{moviestore:movie_id.toString()}});
    req.session.moviestore.push({tmstmp:crrtm,_id:movie_id,newmovie:1,goodmovie:0});
    }
    var ms ={};
    ms.trouble=0;
    res.send(ms);
    break;
    case('article'):
    var newarticle = parseInt(req.body.newarticle);
    if(newarticle)
    {
      users.update({_id:req.session._id},{$push:{articlestore:{tmstmp:Date.now(),_id:new ObjectID(),title:req.body.title,link:req.body.link,newarticle:1,goodarticle:0}},$set:{last_item:Date.now()},$inc:{totalarticles:1,newarticles:1}});
    }
    else {
      users.update({_id:req.session._id},{$push:{articlestore:{tmstmp:Date.now(),_id:new ObjectID(),title:req.body.title,link:req.body.link,newarticle:0,goodarticle:0}},$set:{last_item:Date.now()},$inc:{totalarticles:1,readarticles:1}});
    }
    var ms ={};
    ms.trouble=0;
    res.send(ms);
    break;
    case('book'):
      var authors_arr = [];
      for(var i=0;i<=parseInt(req.body.authornum);i++){
        eval("authors_arr.push(req.body.author"+i+"_name);");
      }
      console.log(authors_arr);
    
      newbook(req.body.title, doauthors)
      function newbook(vtitle, callback){
         books.findOne({title:vtitle},function(err,book){
          var book_insert={};
           if(err) {
               console.log('err while book query');
           }
           else {
              if(book){
                //checking if we have the book already
                 var already = 0;
                 for(var xx =req.session.bookstore.length-1;xx>=0;xx--){
                   if(book._id.toString() === req.session.bookstore[xx]._id.toString()){
                     console.log('trying to add a book, which is already on the list');
                    already =1;
                   }
                 }
                 if(!already)
                 {
                   book_insert.tmstmp = Date.now();
                book_insert._id = book._id;
                book_insert.goodbook = 0;
                if(parseInt(req.body.newbook))
              { book_insert.newbook = 1;
                users.update({_id:req.session._id},{$push:{bookstore:book_insert},$inc:{totalbooks:1,newbooks:1},$set:{last_item:Date.now()}});
                items.update({user:req.session._id},{$push:{bookstore:book._id.toString()}});
                             tell_user(0);}
                  else {
                    book_insert.newbook =0;
                    users.update({_id:req.session._id},{$push:{bookstore:book_insert},$inc:{totalbooks:1,oldbooks:1},$set:{last_item:Date.now()}});
                    items.update({user:req.session._id},{$push:{bookstore:book._id.toString()}});
                             tell_user(0);
                  }

                 }
                 else {
                   var ms ={};
                     ms.trouble=0;
                     res.send(ms);
                 }

               //respond to user with success
              }
              else{
                 books.insert({title:vtitle,authors:[]},function(err,newbook){
                  var book_insert={};
                  if(err){
                    console.log('err while adding a book');
                  }
                  else{
                     console.log('created a book:'+newbook._id);
                     console.log('newbook: '+req.body.newbook+' '+typeof req.body.newbook);
                     book_insert.tmstmp = Date.now();
                      var book_insert={};
                      book_insert._id = newbook._id;
                      book_insert.goodbook = 0;
                     if(parseInt(req.body.newbook))
                     {book_insert.newbook = 1;
                      users.update({_id:req.session._id},{$push:{bookstore:book_insert},$inc:{totalbooks:1,newbooks:1},$set:{last_item:Date.now()}});
                      items.update({user:req.session._id},{$push:{bookstore:newbook._id.toString()}});
                                          //callback(authors_arr,newbook._id,tell_user);
                                          authors_arr.forEach(function(element){
                                            doauthors(element,newbook._id,tell_user);
                                          });
                                        }
                                          else
                      {book_insert.newbook = 0;
                        users.update({_id:req.session._id},{$push:{bookstore:book_insert},$inc:{totalbooks:1,oldbooks:1},$set:{last_item:Date.now()}});
                        items.update({user:req.session._id},{$push:{bookstore:newbook._id.toString()}});
                                          //callback(authors_arr,newbook._id,tell_user);
                                          authors_arr.forEach(function(element){
                                            doauthors(element,newbook._id,tell_user);
                                          });
                                        }
                  }
                 });
              }
           }
         });
         }

      function doauthors(element,book_id, callback){
        console.log('in authors, parameters: '+authors_arr.length+', '+book_id);
         if(!req.body.author0_name)
          {callback(0);}
        else
         {
              
                    
                     
                     //////////////////////////////////////////////////////
                    
                    authors.findOne({name:element},function(err,author){
                      
                      if(err) {console.log('err while author query');
                          callback(0);
                      }else {
                        if(author!=null)
                          {
                           books.update({_id:book_id},{$push:{authors:author.name}});
                           
                        }else{
                          console.log('2: '+element);
                          authors.insert({name:element},function(err,newauthor){
                            
                            if(err) {
                              console.log('err while author insert');
                              callback(0);
                            }else {  
                              books.update({_id:book_id},{$push:{authors:newauthor.name}});
                              //////////////////////////////////////////////////////
                              
                            }
                          });
                        }
                      }
                    });

                  
                  console.log('all authors added');
                  callback(0);}
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
    var movie_insert={};
    var ms={};
    movies.findOne({title:req.body.title},function(err,movie){
           if(err) {
               console.log('err while movie query');
           }
           else {
              if(movie){
                var already = 0;
                 for(var xx =req.session.moviestore.length-1;xx>=0;xx--){
                   if(movie._id.toString() === req.session.moviestore[xx]._id.toString()){
                     console.log('trying to add a book, which is already on the list');
                    already =1;
                   }
                 }
                 if(!already)
                 {
                movie_insert.tmstmp = Date.now();
                movie_insert._id = movie._id;
                movie_insert.goodmovie = 0;
                if(parseInt(req.body.newmovie))
              { movie_insert.newmovie = 1;
                users.update({_id:req.session._id},{$push:{moviestore:movie_insert},$inc:{totalmovies:1,newmovies:1},$set:{last_item:Date.now()}});
                items.update({user:req.session._id},{$push:{moviestore:movie._id.toString()}});
                             var ms={};
                             ms.trouble = 0;
                             res.send(ms);
                           }
                  else {
                    movie_insert.newmovie =0;
                    users.update({_id:req.session._id},{$push:{moviestore:movie_insert},$inc:{totalmovies:1,oldmovies:1},$set:{last_item:Date.now()}});
                    items.update({user:req.session._id},{$push:{moviestore:movie._id.toString()}});
                             var ms={};
                             ms.trouble = 0;
                             res.send(ms);
                  }
                }//if(!already)
               //respond to user with success
               else {
                   var ms ={};
                     ms.trouble=0;
                     res.send(ms);
                 }
              }
              else{
                 movies.insert({title:req.body.title,year:req.body.year},function(err,newmovie){
                  if(err){
                    console.log('err while adding a movie');
                  }
                  else{
                     console.log('created a movie:'+newmovie._id);
                     console.log('newmovie: '+req.body.newmovie+' '+typeof req.body.newmovie);
                     movie_insert.tmstmp = Date.now();
                      movie_insert._id = newmovie._id;
                      movie_insert.goodmovie = 0;
                     if(parseInt(req.body.newmovie))
                     {movie_insert.newmovie = 1;
                      users.update({_id:req.session._id},{$push:{moviestore:movie_insert},$inc:{totalmovies:1,newmovies:1},$set:{last_item:Date.now()}});
                      items.update({user:req.session._id},{$push:{moviestore:newmovie._id.toString()}});
                                         ms.trouble = 0;
                                         res.send(ms);}
                                          else
                      {movie_insert.newmovie = 0;
                        users.update({_id:req.session._id},{$push:{moviestore:movie_insert},$inc:{totalmovies:1,oldmovies:1},$set:{last_item:Date.now()}});
                        items.update({user:req.session._id},{$push:{moviestore:newmovie._id.toString()}});
                                          ms.trouble =0;
                                           res.send(ms);}
                  }
                 });
              }
           }
         })
    break;
  }
});

app.post('/nickcheck',function (req,res){
  var query = req.body.txt;
  var msg = {};
  users.find({nick: query},function(err,docs){
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
     movies.find({title: { $regex: query, $options: 'i'}},function(err,docs){
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
//var server = app.listen(80,'188.166.118.116');
//var io = require('socket.io').listen(server);
//
//var clients = [];
//io.on('connection', function (socket) {
//  clients.push(socket);
//  var interval = setInterval(function () {
//  socket.emit('news', { hello: 'world' });
//},1000);
//   socket.on("disconnect", function () {
//        console.log('disconnect');
//        clearInterval(interval);
//    });
//   socket.on("tweet", function (tweet) {
//        // we received a tweet from the browser
//        console.log(clients);
//        console.log('session id:'+socket.sessionId);
//        console.log('tweet: '+tweet.text);
//    });
//});



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