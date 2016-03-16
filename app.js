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
//var gm = require('gm').subClass({imageMagick: true}); - crashes , no binaries found
var gm = require('gm');



var mongo = require('mongodb').MongoClient;
var db = require('monk')('localhost/tav')
  , users = db.get('users'),items = db.get('items');
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
  domain:'peopleandbooks.com'
  }
}));


app.get('*', function(req,res,next) {   var d = new Date();
  if(req.headers.host === 'api.peopleandbooks.com' )  //if it's a sub-domain
   {console.log(d+' got an api request from '+req.ip);
    req.url = '/api' + req.url; 
    console.log(req.url); //append some text yourself
  next();}
  else{
   //console.log('-------------- REQUEST --------------')
   //console.log('User-Agent: ' + req.headers['user-agent']);
   //console.log('URL: '+req.url);
   //console.log(req.ip);
    next();}
   });

app.get('*', function(req,res,next) {  
  console.log('########### '+req.url+'############');
  var test =['signin',
  'logout',
  'messages',
  'settings',
  'helpers',
  'lstitm',
  'seebooks',
  'seeuser',
  'seefollow',
  'clearbooks',
  'clearlinks',
  'setbooks',
  'clearmovies',
  'seeauthors',
  'cs',
  'people',
  'dropum',
  'showum',
  'dropusers',
  'dropbooks',
  'dropmovies',
  'dropauthors',
  'showitems',
  'admax',
  'admin',
  'test',
  '/'
  ];

  var requrl='';
  if(req.url!='/')
  {var ln = req.url.length-1;
  requrl = req.url.substring(1,req.url.length);
  }
  if(req.url!='/'&&requrl.indexOf('/') > -1)
  { 
    requrl = requrl.substring(0,requrl.indexOf('/'));
  }

  if (req.url==='/'||test.indexOf(requrl) > -1) {
    next();
  } 
  else {
    if(req.session && req.session.nick===requrl)
    {
     //res.redirect('/');
     next();
    }
    else
    {  users.findOne({nick:requrl},{fields:{regdate:0,male:0,mail:0,phr:0,userstore:0,tmstmpstore:0}},function (err,doc){
          //pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,userpic:0,last_item:0,regdate:Date.now(),userstore:[],bookstore:[],moviestore:[]}
          if(err) {
          
          }
          else {
            
            if(doc){
              
              if(doc.pub)
              {var unfollow=0;
                
               if(req.session.userstore ) {
                
               for(var i=0;i<req.session.userstore.length;i++){
                 
                 if(req.session.userstore[i]===doc._id.toString()) {
                 unfollow=1;
                 break
                 }
               }
               }
               //var update_tmstmp = {};
                //var tmp_str = doc._id.toString();
                //update_tmstmp[tmp_str]={'tmstmp': Date.now()};
                //follow.update({user:req.session._id},{$set:update_tmstmp});
                console.log(7+' '+doc._id);
                items.findOne({user:doc._id.toString()},function (err,done){
                  //console.log('done '+JSON.stringify(done));
                  if(!done){
                    done=[];
                  }
                  doc.bookstore = done.bookstore;
                  doc.moviestore = done.moviestore;
                  doc.linkstore = done.linkstore;
                  
                  var mc = req.session.moviestore ? req.session.moviestore : 0;
                  var bc = req.session.bookstore ? req.session.bookstore : 0;
                  var ac = req.session.linkstore ? req.session.linkstore : 0;
                  if(req.session.nick)
               {
                res.render('anotheruser',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc),'bookstorecheck':bc,'moviestorecheck':mc,'linkstorecheck':ac,'unfollow':unfollow,'lang':req.session.lang});
                }
                else {
                
                 if(doc.pub)
                 {res.render('anotheruser_out',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc),'lang':req.session.lang});}
                 else {
                  
                   res.render('private');
                 }
               }
                }); 
             }//doc pub
             else {
              
               res.render('private');
             }
                  }//if doc exists
                  else {
                    
                    res.render('404');
                  }
          }
        });
      }
}
   });

app.get('/test',function (req,res){
  items.findOne({user:req.session._id},function (err,done){
                  res.send(done);});
});




app.get('/',function(req,res) {
  //console.log(req.session.mail+' : '+is_email(req.session.mail));
   if (req.session.mail)
        //{res.render('indexreg',{'prfname':"Привет, "+req.session.lgn+"!"});}
        { //console.log(req.session);
          users.findOne({mail:req.session.mail},{fields:{regdate:0,male:0,pub:0,phr:0}},function(err,done){
            //console.log('-----found-----');
            //console.log(done);
            if(err){
                res.render('index_new');
            }
            else {
              if(done){
                req.session=done;
                res.render('userpage');
              }
              else {
                //var color;
                //switch(Math.floor(Math.random() * 4) + 1){
                //  case(1):
                //  color='#ec3737';
                //  break
                //  case(2):
                //  color='#37b6ec';
                //  break
                //  case(3):
                //  color='#1FD081';
                //  break
                //  case(4):
                //  color='#ec8637';
                //  break
                //}
                //res.render('index_new',{'color':color});
                res.render('index_new');
              }
            }
          });
        }
   else {         
       res.render('index_new');
   }
});

//DATA VALIDATION
// half of this shit doesnt work and fucks the thing up, needs to be tested
function is_tmstmp(input){
  var re = /^\d{10}$/;
  console.log(re.test(input)+' tesing TIMESTAMP');
  return re.test(input);
}
function is_uid(input){
  var re = /^[a-zA-Z0-9]{24}$/;
  console.log(re.test(input)+' tesing UID');
  return re.test(input);
}
function is_single(input){
  var re = /^\d{1}$/;
  console.log(re.test(input)+' tesing SINGLE');
  return re.test(input);
}
function is_multiple(input){
  var re = /^\d+$/;
  console.log(input+' = '+re.test(input)+' tesing MULTIPLE');
  return re.test(input);
}
function is_author(input){
  var re = /^[a-zA-Z\u0400-\u04FF\-. ’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
  console.log(re.test(input)+' tesing AUTHOR');
  return re.test(input);
}
function is_title(input){
  var re = /^[a-zA-Z0-9\u0400-\u04FF\-_ ?!¡#&:¿’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
  console.log(re.test(input)+' tesing TITLE');
  return re.test(input);
}
function is_nick(input){
  //TODO length limit
  var re = /^[a-zA-Z0-9\u0400-\u04FF\-_ ’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
  console.log(re.test(input)+' tesing NICK');
  return re.test(input);
}
function rm_st_sc(input){
  return input.replace(/<script>|<\/script>|<style>|<\/style>|style=/g,' ');
}
function is_link(input){
  //var re = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  //return re.test(input);
  console.log('TODO fix is_link');
  return true;
}
function is_email(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
    } 

// will be used on writes mostly

//END OF DATA VALIDATION

app.post('/getitems',function (req,res){
  var ms ={};
  ms.trouble=1;
  items.findOne({user:req.session._id},function (err,doc){
    if(err) {
      console.log('ERR WHILE ITEMS QUERY');
      res.send(ms);
    }
    else if(doc.user){
      ms.doc = doc;
      ms.trouble=0;
      res.send(ms);
    }
    else {
      res.send(ms);
    }
  });
});

app.post('/getitems_a',function (req,res){
  if(req.session._id && req.body.qu)
  {var ms ={};
    ms.trouble=1;
    items.findOne({user:req.body.qu},function (err,doc){
      if(err) {
        console.log('ERR WHILE ITEMS QUERY');
        res.send(ms);
      }
      else if(doc.user){
        ms.doc = doc;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        res.send(ms);
      }
    });}
    else
      {res.send(0);}
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
  users.findOne({_id:req.params.id},{fields:{regdate:0,pub:0,phr:0,userstore:0,bookstore:0,moviestore:0,newbooks:0,newmovies:0,totalbooks:0,totalmovies:0}},function(err,doc){
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
  res.redirect('http://peopleandbooks.com/');
});

app.post('/newuser',function(req,res){
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect';
    var vmail = req.body.mail; 
    var vnick = req.body.nick;
    if(req.body.p.length >30 || req.body.mail.length>30 || req.body.nick.length>30 || !is_nick(req.body.nick) || !is_single(parseInt(req.body.gn)) ) {
      ms.mtext('fail');
      res.send(ms);
      return;
    }
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    //checkmail function was here before being moved out of scope

    if (is_email(vmail) === true) {
    users.find({mail:vmail},{fields:{mail:1}},function(err,doc){
      if (err)
      {
        //DO SMTH
      }
      else {
        if(doc.length === 0)
        { 
          users.insert({pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,lang:req.body.lang,totallinks:0,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,newlinks:0,readlinks:0,userpic:0,last_item:0,lst_msg:0,regdate:Date.now(),userstore:[],bookstore:[],moviestore:[],linkstore:[]},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          follow.insert({user:done._id.toString()});
          items.insert({user:done._id.toString(),bookstore:[],moviestore:[],links:[],pub:1});// used to populate the user, checks are done with user object passed in session
          user_messages.insert({user:done._id.toString(),msgstore:[],lst_tmstmp:Date.now(),msgcount:0});
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
          req.session._id = confirmed._id;
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





app.get('/about',function (req,res){
  if(req.session.mail)
  {res.render('about');}
else {
  res.render('about_out');
}
});


app.get('/settings',function (req,res){
  if(req.session.mail){
    users.findOne({mail:req.session.mail},{fields:{pub:1,lang:1}},function(err,done){
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
  if(req.session._id || is_uid(req.params.bid)){
    var ms={};
    ms.trouble=0;
    items.findOne({user:req.session._id},function(err,doc){
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
             items.update({user:req.session._id},{$set:{bookstore:temp_arr}});
             users.update({_id:req.session._id},{$inc:{readbooks:1,newbooks:-1}});
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
  if(req.session._id || is_uid(req.params.mid)){
    var ms={};
    ms.trouble=0;
    items.findOne({user:req.session._id},function(err,doc){
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
             items.update({user:req.session._id},{$set:{moviestore:temp_arr}});
             users.update({_id:req.session._id},{$inc:{seenmovies:1,newmovies:-1}})
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

app.post('/marklinkread/:aid',function (req,res){
  if(req.session._id || is_uid(req.params.aid)){
    var ms={};
    ms.trouble=0;
    items.findOne({users:req.session._id},function(err,doc){
      if(err)
      {
       console.log('trouble finding the user');
         ms.trouble=1;
         res.send(ms);
      }
      else {
        if(doc!=null){
         var temp_arr;
         temp_arr = doc.linkstore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
            temp_id = JSON.stringify(temp_arr[i]._id);
           if(temp_id === JSON.stringify(req.params.aid)){
             temp_arr[i].newlink = 0;
             items.update({user:req.session._id},{$set:{linkstore:temp_arr}});
             users.update({_id:req.session._id},{$inc:{readlinks:1,newlinks:-1}});
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
    items.findOne({user:req.session._id},function(err,doc){
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
         users.update({_id:req.session._id},{$pull:{bookstore:rem_item[0]._id.toString()}});
         items.update({user:req.session._id},{$set:{bookstore:temp_arr},$inc:{totalbooks:-1,newbooks:-1}});
         res.send(ms);
         }
         else {
          users.update({_id:req.session._id},{$pull:{bookstore:rem_item[0]._id.toString()}});
          items.update({user:req.session._id},{$set:{bookstore:temp_arr},$inc:{totalbooks:-1,readbooks:-1}});
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
    items.findOne({user:req.session._id},function(err,doc){
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
         users.update({_id:req.session._id},{$pull:{moviestore:rem_item[0]._id.toString()}});
         items.update({user:req.session._id},{$set:{moviestore:temp_arr},$inc:{totalmovies:-1,newmovies:-1}});
         res.send(ms);
         }
         else {
          users.update({_id:req.session._id},{$pull:{moviestore:rem_item[0]._id.toString()}});
          items.update({user:req.session._id},{$set:{moviestore:temp_arr},$inc:{totalmovies:-1,seenmovies:-1}});
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
  items.findOne({user:req.session._id},function(err,doc){
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
           items.update({user:req.session._id},{$set:{bookstore:temp_arr}});
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
  items.findOne({user:req.session._id},function(err,doc){
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
           items.update({user:req.session._id},{$set:{bookstore:temp_arr}});
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

app.post('/unmarklinkgood/:aid',function (req,res){
  var ms={};
  ms.trouble=0;
  items.findOne({user:req.session._id},function(err,doc){
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
       temp_arr = doc.linkstore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodlink = 0;
           items.update({user:req.session._id},{$set:{linkstore:temp_arr}});
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
  items.findOne({user:req.session._id},function(err,doc){
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
           items.update({user:req.session._id},{$set:{moviestore:temp_arr}});
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

app.post('/marklinkgood/:aid',function (req,res){
  var ms={};
  ms.trouble=0;
  items.findOne({user:req.session._id},function(err,doc){
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
       temp_arr = doc.linkstore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodlink = 1;
           items.update({user:req.session._id},{$set:{linkstore:temp_arr}});
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
  items.findOne({user:req.session._id},function(err,doc){
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
           items.update({user:req.session._id},{$set:{moviestore:temp_arr}});
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

app.get('/seemovies',function (req,res){
  movies.find({},function (err,done){
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

app.get('/clearlinks',function(req,res){
  users.update({_id:req.session._id},{$set:{linkstore:[],totallinks:0,newlinks:0,readlinks:0}});
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
  user_messages.remove({});
  res.redirect('/');
});

app.get('/showum',function (req,res){
  user_messages.find({},function(err,done){
    res.send(done);
  });
});

app.get('/dropusers',function (req,res){
  users.remove({});
  items.remove({});
  follow.remove({});
  user_messages.remove({});
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
    res.redirect('http://peopleandbooks.com/admax');
  }
  else {
    res.render('adminauth');
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
     res.redirect('http://peopleandbooks.com/admax');}
    else {
      res.redirect('http://peopleandbooks.com');
    }
  }
  else {
    res.redirect('http://peopleandbooks.com');
  }
});


app.post('/additem/:id',function (req,res){
  if(req.session && req.session._id ){
  var cond = req.params.id; 
  switch(cond){
    case('book_out'):
    console.log('book_out');
    var book_id = req.body.book_id;
    var already = 0;
    if(req.session.bookstore.indexOf(book_id)>-1) {already=1;}
    if(!already)
    { books.findOne({_id:book_id},function (err,book){
       if(err)
       {
        var ms ={};
        ms.trouble=1;
        res.send(ms);
       }
       else if(book){
        var crrtm = Date.now();
        users.update({_id:req.session._id},{$push:{bookstore:book_id.toString()},$set:{last_item:crrtm},$inc:{totalbooks:1,newbooks:1}});
        items.update({user:req.session._id},{$push:{bookstore:{tmstmp:crrtm,_id:book_id,title:book.title,authors:book.authors,newbook:1,goodbook:0}}});
        req.session.bookstore.push(book_id.toString());
       }
       else {
        var ms ={};
        ms.trouble=1;
        res.send(ms);
       }
      });
    }
        var ms ={};
        ms.trouble=0;
        res.send(ms);
    break;
    case('link_out'):
    console.log('link_out');
    var link_id = req.body.link_id;
    var already = 0;
    if(req.session.linkstore.indexOf(link_id)>-1) {already=1;}
    if(!already)
    {users.update({_id:req.session._id},{$push:{linkstore:link_id},$set:{last_item:Date.now()},$inc:{totallinks:1,newlinks:1}});
     items.update({user:req.session._id},{$push:{linkstore:{tmstmp:Date.now(),_id:link_id,title:req.body.title,link:req.body.link,newlink:1,goodlink:0}}});
      }
        var ms ={};
        ms.trouble=0;
        res.send(ms);
    break;
    case('movie_out'):
    console.log('movie_out');
    var movie_id = req.body.movie_id;
    var already = 0;
    if(req.session.moviestore.indexOf(movie_id)>-1) {already=1;}
    if(!already)
    {
      movies.findOne({_id:movie_id},function (err,movie){
       if(err)
       {

       }
       else if(movie){
    var crrtm = Date.now();
    users.update({_id:req.session._id},{$push:{moviestore:movie_id.toString()},$set:{last_item:crrtm},$inc:{totalmovies:1,newmovies:1}});
    items.update({user:req.session._id},{$push:{moviestore:{tmstmp:crrtm,_id:movie_id,title:movie.title,year:movie.year,newmovie:1,goodmovie:0}}});
    req.session.moviestore.push(movie_id.toString());
    }
       else {
        var ms ={};
        ms.trouble=1;
        res.send(ms);
       }
      });
    }
    var ms ={};
    ms.trouble=0;
    res.send(ms);
    break;
    case('link'):
    console.log(req.body.title);
    if(req.body.title&& is_title(req.body.title)&& req.body.link&& is_link(req.body.link) && is_single(parseInt(req.body.newlink))){
    var newlink = parseInt(req.body.newlink);
    var newid = new ObjectID();
    var newdate = Date.now();
    if(newlink)
    {
      users.update({_id:req.session._id},{$push:{linkstore:newid},$set:{last_item:newdate},$inc:{totallinks:1,newlinks:1}});
      items.update({user:req.session._id},{$push:{linkstore:{tmstmp:newdate,_id:newid,title:req.body.title,link:req.body.link,newlink:1,goodlink:0}}})
    }
    else {
      users.update({_id:req.session._id},{$push:{linkstore:newid},$set:{last_item:newdate},$inc:{totallinks:1,readlinks:1}});
      items.update({user:req.session._id},{$push:{linkstore:{tmstmp:newdate,_id:newid,title:req.body.title,link:req.body.link,newlink:0,goodlink:0}}});
    }
    var ms ={};
    ms.trouble=0;
    res.send(ms);
    }
    else {
      var ms ={};
    console.log('data check fail while adding an link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('book'):
      if(req.body.authornum&&is_single(parseInt(req.body.authornum))&&req.body.title&& is_title(req.body.title) && req.body.newbook&& is_single(parseInt(req.body.newbook))) {
      //if(req.body.authornum&&req.body.title&&req.body.newbook){
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
                   if(book._id.toString() === req.session.bookstore[xx]){
                     console.log('trying to add a book, which is already on the list');
                    already =1;
                   }
                 }
                 if(!already)
                 {
                   book_insert.tmstmp = Date.now();
                book_insert._id = book._id;
                book_insert.goodbook = 0;
                book_insert.title = book.title;
                book_insert.authors = book.authors;
                if(parseInt(req.body.newbook))
              { book_insert.newbook = 1;
                users.update({_id:req.session._id},{$push:{bookstore:book._id.toString()},$inc:{totalbooks:1,newbooks:1},$set:{last_item:Date.now()}});
                items.update({user:req.session._id},{$push:{bookstore:book_insert}});
                             tell_user(0);}
                  else {
                    book_insert.newbook =0;
                    users.update({_id:req.session._id},{$push:{bookstore:book._id.toString()},$inc:{totalbooks:1,oldbooks:1},$set:{last_item:Date.now()}});
                    items.update({user:req.session._id},{$push:{bookstore:book_insert}});
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
                      book_insert.title = vtitle;
                      book_insert.authors = authors_arr;
                     if(parseInt(req.body.newbook))
                     {book_insert.newbook = 1;
                      users.update({_id:req.session._id},{$push:{bookstore:newbook._id.toString()},$inc:{totalbooks:1,newbooks:1},$set:{last_item:Date.now()}});
                      items.update({user:req.session._id},{$push:{bookstore:book_insert}});
                                          //callback(authors_arr,newbook._id,tell_user);
                                          authors_arr.forEach(function(element){
                                            doauthors(element,newbook._id,tell_user);
                                          });
                                        }
                                          else
                      {book_insert.newbook = 0;
                        users.update({_id:req.session._id},{$push:{bookstore:newbook._id.toString()},$inc:{totalbooks:1,oldbooks:1},$set:{last_item:Date.now()}});
                        items.update({user:req.session._id},{$push:{bookstore:book_insert}});
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
      }
      else {
        var ms ={};
        ms.trouble=1;
        res.send(ms);
      }
    break;
    case('movie'):
    if(req.body.title&&is_title(req.body.title)&&req.body.year&&is_multiple(req.body.year)&&req.body.newmovie&&is_single(req.body.newmovie)){
    var movie_insert={};
    var ms={};
    movies.findOne({title:req.body.title},function(err,movie){
           if(err) {
               console.log('err while movie query');
           }
           else {
              if(movie){
                var already = 0;
                if(req.session.moviestore.length)
                 {for(var xx =req.session.moviestore.length-1;xx>=0;xx--){
                                    if(movie._id.toString() === req.session.moviestore[xx]){
                                      console.log('trying to add a book, which is already on the list');
                                     already =1;
                                    }
                                  }}
                 if(!already)
                 {
                movie_insert.tmstmp = Date.now();
                movie_insert._id = movie._id;
                movie_insert.goodmovie = 0;
                movie_insert.title = movie.title;
                movie_insert.year = movie.year;
                if(parseInt(req.body.newmovie))
              { movie_insert.newmovie = 1;
                users.update({_id:req.session._id},{$push:{moviestore:movie._id.toString()},$inc:{totalmovies:1,newmovies:1},$set:{last_item:Date.now()}});
                items.update({user:req.session._id},{$push:{moviestore:movie_insert}});
                             var ms={};
                             ms.trouble = 0;
                             res.send(ms);
                           }
                  else {
                    movie_insert.newmovie =0;
                    users.update({_id:req.session._id},{$push:{moviestore:movie._id.toString()},$inc:{totalmovies:1,oldmovies:1},$set:{last_item:Date.now()}});
                    items.update({user:req.session._id},{$push:{moviestore:movie_insert}});
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
                      movie_insert.title = req.body.title;
                      movie_insert.year = req.body.year;
                     if(parseInt(req.body.newmovie))
                     {movie_insert.newmovie = 1;
                      users.update({_id:req.session._id},{$push:{moviestore:newmovie._id.toString()},$inc:{totalmovies:1,newmovies:1},$set:{last_item:Date.now()}});
                      items.update({user:req.session._id},{$push:{moviestore:movie_insert}});
                                         var ms={};
                                         ms.trouble = 0;
                                         res.send(ms);}
                                          else
                      {movie_insert.newmovie = 0;
                        users.update({_id:req.session._id},{$push:{moviestore:newmovie._id.toString()},$inc:{totalmovies:1,oldmovies:1},$set:{last_item:Date.now()}});
                        items.update({user:req.session._id},{$push:{moviestore:movie_insert}});
                                          var ms = {};
                                          ms.trouble =0;
                                           res.send(ms);}
                  }
                 });
              }
           }
         })
   }
   else {
    var ms={};
    ms.trouble=1;
    res.send(ms);
   }
    break;
  }
}
else {
  res.render('404');
}
});



app.post('/livesearch/:id',function (req,res){
  var cond = req.params.id;
  var query = req.body.txt;
  console.log('txt: '+query);
  switch(cond){
    case('btitle'):
     //query = '.*\\'+query+'.*';
     //if(is_title(query))
     if(0<1)
     {books.find({title: { $regex: query, $options: 'i'}},function(err,docs){
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
    }
    else {
      res.send(0);
    }
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
     if(is_title(query)){
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
    }
    else {
      res.send(0);
    }
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
    default:
    res.send(0);
    break;
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