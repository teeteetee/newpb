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
//var gm = require('gm').subClass({imageMagick: true});
var gm = require('gm');



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
  'cleararticles',
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
     res.redirect('/');
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
                  doc.articlestore = done.articlestore;
                  
                  var mc = req.session.moviestore ? req.session.moviestore : 0;
                  var bc = req.session.bookstore ? req.session.bookstore : 0;
                  var ac = req.session.articlestore ? req.session.articlestore : 0;
                  if(req.session.nick)
               {
                res.render('anotheruser',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc),'bookstorecheck':bc,'moviestorecheck':mc,'articlestorecheck':ac,'unfollow':unfollow});
                }
                else {
                
                 if(doc.pub)
                 {res.render('anotheruser_out',{'user':doc._id,'avatar':doc.userpic,'doc':JSON.stringify(doc)});}
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


app.get('/api/udata/:nick',function (req,res){
  users.findOne({nick:req.params.nick},{fields:{bookstore:1,moviestore:1,articlestore:1}},function (err,doc){
    var ms={};
    if(err){
      ms.trouble=1;
      res.send(ms);
    }
    else if(doc){
      ms.trouble=0;
      console.log('sending books to '+req.params.nick);
      ms.bookstore = doc.bookstore;
      ms.moviestore = doc.moviestore;
      ms.articlestore = doc.articlestore;
      res.send(ms);
    }
    else {
      ms.trouble=1;
      res.send(ms);
    }
  });
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

app.post('/backup',function (req,res){
  if(req.session._id){    
  users.findOne({_id:req.session._id},function (err,doc){ 
    if(err){
      console.log('ERR WHILE BACKUP REQUEST');
      console.log(err);
    }
    else if(doc._id)
  { var json = [];
    var statstore = {
    'totalbooks':doc.totalbooks,
    'totalmovies':doc.totalmovies,
    'totalarticles':doc.totalarticles,
    'newbooks':doc.newbooks,
    'readbooks':doc.readbooks,
    'newmovies':doc.newmovies,
    'seenmovies':doc.seenmovies,
    'newarticles':doc.newarticles,
    'readarticles':doc.readarticles,
    'last_item':doc.last_item};
    var ids={};
    ids.bookstore = doc.bookstore;
    ids.moviestore = doc.moviestore;
    ids.articlestore = doc.articlestore;
     items.findOne({_id:req.session._id},function (err2,doc2){
        if(err){
           console.log('ERR WHILE BACKUP REQUEST');
           console.log(err2);
         }
         else if(doc2.user)
       {
         json.push(doc2.bookstore);
         json.push(doc2.moviestore)
         json.push(doc2.articlestore);
         json.push(statstore);
         json.push(ids);
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
         var date= vday+'/'+vmonth+'/'+vyear;
         var filename = 'P&B_backup_'+date+'.json'; // or whatever
         var mimetype = 'application/json';
         res.setHeader('Content-disposition', 'attachment; filename=' + filename);
         res.setHeader('Content-type', mimetype);
         res.write(JSON.stringify(json));
         res.end();
       }
        else {
      res.redirect('/');
    }
     });
    //res.redirect('/');
    }
    else {
      res.redirect('/');
    }
  });
  }
  else {
    res.redirect('/');
  }
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



app.post('/restore',function (req,res){
  if(req.session._id){      
    var oldPath = req.files.usersjson.path;
    fs.readFile(oldPath , 'utf8', function(err, data) {
      var valid = validateJSON(data);
       if (data) {
         data = JSON.parse(data);
         users.update({_id:req.session._id},{$set:{bookstore:data[0],moviestore:data[1],articlestore:data[2],totalbooks:data[3].totalbooks,totalmovies:data[3].totalmovies,totalarticles:data[3].totalarticles,newbooks:data[3].newbooks,readbooks:data[3].readbooks,newmovies:data[3].newmovies,seenmovies:data[3].seenmovies,newarticles:data[3].newarticles,readarticles:data[3].readarticles,last_item:data[3].last_item}});
         items.update({user:req.session._id},{$set:{bookstore:data[4].bookstore,moviestore:data[4].moviestore,articlestore:data[4].articlestore}});
         //console.log(JSON.stringify(data[0]));
       }
      fs.unlink(oldPath, function(){
        //if(err) throw err;
        if(err) console.log(err);
        res.redirect('/');
       });
    });
   }
  else {
    res.redirect('/');
  }
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
          users.insert({pub:1,mail:vmail,nick:vnick,male:parseInt(req.body.gn),phr:vp,totalarticles:0,totalbooks:0,totalmovies:0,newbooks:0,readbooks:0,newmovies:0,seenmovies:0,newarticles:0,readarticles:0,userpic:0,last_item:0,lst_msg:0,regdate:Date.now(),userstore:[],bookstore:[],moviestore:[],articlestore:[]},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          follow.insert({user:done._id.toString()});
          items.insert({user:done._id.toString(),bookstore:[],moviestore:[],articles:[],pub:1});// used to populate the user, checks are done with user object passed in session
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



app.get('/messages',function (req,res){
  if(req.session.mail){
    user_messages.findOne({user:req.session._id},{fields:{msgstore:1}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              //err page ?
              res.redirect('/');
              console.log('QUERY ERR');
            }
            else {
              if(done){
                  if(done.msgstore)
                  {
                  console.log('yes');
                  done.msgstore = done.msgstore.length > 50 ? done.msgstore.slice(done.msgstore.length-51,done.msgstore.length) : done.msgstore;
                  var more = done.msgstore.length > 50 ? 1:0;
                  res.render('chat',{'user':req.session._id,'lst_tmstmp':req.session.lst_msg,'messages':done.msgstore,'more':more});
                  }
                  else {
                   //res.render('emptychat',{'user':done.uid,'done':JSON.stringify(done)});
                   res.render('chat',{'user':req.session._id,'lst_tmstmp':0,'messages':0});
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
    res.render('404');
  }
});

app.post('/ntfc_p',function (req,res){
  var ms ={};
  ms.newp = 0;
   follow.findOne({user:req.session._id},function(err,done){
     if(err){
        res.send(ms);
     }
     else {
      if(req.session.userstore.length)
       {var count=req.session.userstore.length-1;
              function chkp (count,callback) {
                if(count<0) {
                  res.send(ms);
                  return 0;
                }
                console.log('count: '+count);
                console.log('user: '+req.session.userstore[count]);
               users.findOne({_id:req.session.userstore[count]},{fields:{last_ite:1}},function (err,doc){
                   if(err) {
                    res.send(ms);
                   }
                   else {
                     if(doc!=null) {
                      console.log(1);
                      console.log(req.session.userstore[count]].tmstmp);
                      if(done[req.session.userstore[count]].tmstmp<doc.last_item) {
                        ms.newp=1;
                        res.send(ms);
                      }
                      else {
                        console.log(2);
                       count--;
                       callback(count,callback);
                      }
                     }
                     else if(!count){
                      console.log(3);
                       res.send(ms);
                     }
                     else {
                      console.log(4);
                       count--;
                       callback(count,callback);
                     }
                 }
               });
              }
              chkp(count,chkp);}
        else {
          console.log(5);
          res.send(ms);

        }
     }
    });
});

app.post('/ntfc_m',function (req,res){
  var ms ={};
  ms.newmsg = 0;
  user_messages.findOne({user:req.session._id},{fields:{msgstore:1}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              console.log('QUERY ERR');
              res.send(ms);
            }
            else {
              if(done){
                  if(done.msgstore.length)
                  {
                   if(!done.msgstore[done.msgstore.length-1].read)
                   {ms.newmsg=1;
                    res.send(ms);}
                 else
                 {res.send(ms);}
                  }
                  else {
                   res.send(ms); 
                  }
              }
              else {
                res.send(ms);
              }
            }
          });
});

app.post('/moremsg',function (req,res){
  var iter = req.body.iter;
  var ms ={};
  ms.trouble=1;
  user_messages.findOne({user:req.session._id},{fields:{msgstore:1}},function(err,done){
            console.log('-----found-----');
            console.log(done);
            if(err){
              console.log('QUERY ERR');
              res.send(ms);
            }
            else {
              if(done){
                  if(done.msgstore)
                  {
                  var end = 51-25*iter>=done.msgstore.length?0:done.msgstore.length-51-25*iter;
                  var more =51-25*iter>=done.msgstore.length?0:1;
                  done.msgstore = done.msgstore.slice(end,done.msgstore.length-26-25*iter);
                  ms.trouble = 0;
                  ma.more = more;
                  ms.msgstore = done.msgstore;
                  res.send(ms);
                  }
                  else {
                   res.send(ms);
                  }
              }
              else {
                console.log('DOCUMENT ERR');
                res.send(ms);
              }
            }
          });
});

app.post('/stlstmsg',function (req,res){
  //users.update({_id:req.session._id},{$set:{lst_msg:req.body.tmstmp}});
  //req.session.lst_msg = req.body.tmstmp;
  //res.send('ok');
  user_messages.update({"user":req.session._id,"msgstore.tmstmp" : parseInt(req.body.tmstmp)}, {$set : {"msgstore.$.read" : 1}});
  res.send('ok');
});

app.post('/msg',function (req,res){
 if(req.session._id) {
  console.log(req.body.txtbody);
  var msg ={};
  msg.sndr = req.session._id;
  //msg.textbody = req.body.txtbody.replace("\n","<br />");
  msg.textbody = req.body.txtbody.length>2700?req.body.txtbody.replace(/\n/g, '<br />').slice(0,2700):req.body.txtbody.replace(/\n/g, '<br />');
  console.log(msg.textbody);
  msg.tmstmp = Date.now();
  msg.read = 0;
  msg.userpic = req.session.userpic;
  msg.nick = req.session.nick;
   user_messages.update({user:req.body.rcvr},{$push:{msgstore:msg},$inc:{msgcount:1},$set:{lst_tmstmp:msg.tmstmp}});
  res.send('ok');
 }
 else {
  res.send(0);
 }
});

app.post('/settings',function (req,res){
  var ms={};
  ms.trouble=1;
  var vpub = parseInt(req.body.pub);// public
  //var vmrq = parseInt(req.body.mrq);// messaging request
  if(req.session.mail || !is_single(parseInt(req.body.pub))){
    //users.update({mail:req.session.mail},{pub:vpub,mrq:vmrq});
    users.update({mail:req.session.mail},{$set:{pub:vpub}});
    items.update({user:req.session._id},{$set:{pub:vpub}});
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

app.post('/markarticleread/:aid',function (req,res){
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
         temp_arr = doc.articlestore;
         var temp_id;
         for(var i=0;i<temp_arr.length;i++){
            temp_id = JSON.stringify(temp_arr[i]._id);
           if(temp_id === JSON.stringify(req.params.aid)){
             temp_arr[i].newarticle = 0;
             items.update({user:req.session._id},{$set:{articlestore:temp_arr}});
             users.update({_id:req.session._id},{$inc:{readarticles:1,newarticles:-1}});
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

app.post('/unmarkarticlegood/:aid',function (req,res){
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
       temp_arr = doc.articlestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodarticle = 0;
           items.update({user:req.session._id},{$set:{articlestore:temp_arr}});
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

app.post('/markarticlegood/:aid',function (req,res){
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
       temp_arr = doc.articlestore;
       var temp_id;
       for(var i=0;i<temp_arr.length;i++){
          temp_id = JSON.stringify(temp_arr[i]._id);
         if(temp_id === JSON.stringify(req.params.aid)){
          console.log('modifying');
           temp_arr[i].goodarticle = 1;
           items.update({user:req.session._id},{$set:{articlestore:temp_arr}});
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



app.get('/people/:kind/:item',function (req,res){
  if(req.session._id){
    switch(req.params.kind){
       case('b'):
       users.find({bookstore:req.params.item},{fields:{_id:1}}, function(err,done){
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
        users.find({moviestore:req.params.item},{fields:{_id:1}}, function(err,done){
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


app.post('/follow/:id',function (req,res){
  if(req.session._id || is_uid(req.params.id)){
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
  //TODO query mechanics used in making messages read might fly here 
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
                              gm(newPath).size(function (err, size) {
                                if(err){
                                  console.log(err);
                                }
                                else if(size.width>1024||size.height>1024){
                                  console.log('image is too large, going to resize ( '+size.width+'x'+size.height+' )');
                                  if(size.width>size.height){
                                    gm(newPath).resize(1024).write(newPath,function (err){
                                      if(err) {console.log(err);}
                                      else{
                                        var dest = '/userpics/'+imageid;
                                         res.render('crop_new',{'imgsrc':dest});
                                      }
                                    });
                                  }
                                  else {
                                    gm(newPath).resize(null,1024).write(newPath,function (err){
                                      if(err) {console.log(err);}
                                      else{
                                        var dest = '/userpics/'+imageid;
                                         res.render('crop_new',{'imgsrc':dest});
                                      }
                                    });
                                  }
                                }
                                else {
                                  var dest = '/userpics/'+imageid;
                                  res.render('crop_new',{'imgsrc':dest});
                                }
                              });  //resize
                          });//unlink temp
                    }); //write new
                 }); //read from temp
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
  console.log(req.body);
  if(req.session && req.session.mail && is_email(req.session.mail) && req.session._id && is_uid(req.session._id) && req.body.x1 && is_multiple(parseInt(req.body.x1)) && req.body.x2 && is_multiple(parseInt(req.body.x2)) && req.body.y1 && is_multiple(parseInt(req.body.y1)) && req.body.y2 && is_multiple(parseInt(req.body.y2)) && req.body.img)
    { var imgname = req.body.img.substring(10);
      var fullimgname = __dirname +"/public/userpics/"+ imgname;
      var output_path = __dirname +"/public/userpics/"+req.session._id+".png"; 
      var output_path_small = __dirname +"/public/userpics/"+req.session._id+"_small.png";
      console.log('############# 1 #############');
       path.exists(output_path, function(exists) { 
        console.log('############# 2 #############');
          if (exists) {
            console.log('############# 3 EXISTS #############');
            rm_images(res,req.session.mail,parseInt(req.body.x1),parseInt(req.body.y1),parseInt(req.body.x2),parseInt(req.body.y2),output_path,fullimgname,output_path_small,make_userpic);
            }
            else{
              console.log('############# 3 #############');
               make_userpic(res,req.session.mail,parseInt(req.body.x1),parseInt(req.body.y1),parseInt(req.body.x2),parseInt(req.body.y2),fullimgname,output_path,output_path_small);
            }
       });//PATH EXISTS USERPIC
    }
  else {
    //TODO REMOVE UPLOADED PIC
    console.log('CROP FAIL, REDIRECT');
    res.redirect('/');
  }
  });

function rm_images(res,_mail,x1,y1,x2,y2,output_path,fullimgname,output_path_small,callback) {
  console.log('############# 4 #############');
  fs.unlink(output_path, function(err){
    if(err) throw err;
    console.log('############# 5 #############');
        //fs.unlink(fullimgname, function(err){
        //  if(err) throw err;
        //  console.log('############# 6 #############');
                fs.unlink(output_path_small, function(err){
                  if(err) throw err;
                  console.log('############# 6 #############');
                  callback(res,_mail,x1,y1,x2,y2,fullimgname,output_path,output_path_small);
                });
              });
           //});
}

function make_userpic(res,_mail,x1,y1,x2,y2,fullimgname,output_path,output_path_small) {
  gm(fullimgname).size(function (err, size) {
    console.log('############# 4 #############');
                 if (err)
                   {//console.log(size.width > size.height ? 'wider' : 'taller than you');
                    console.log(err);
                   }
                 else if(size.width<300 || size.height<300) {
                  console.log('USERPIC ERR: TO SMALL');
                  var ms={};
                  ms.trouble = 1;
                  res.send(ms);
                 }
                 else {
                  console.log('############# 5 #############');
                   gm(fullimgname).autoOrient().crop(x2, y2, x1, y1).resizeExact(300, 300).density(300, 300).write(output_path, function (err) {
                     if (err)
                      { console.log(err);
                        var ms={};
                        ms.trouble = 1;
                        res.send(ms);
                      }
                    else {
                      console.log('############# 6 #############');
                       gm(output_path).resizeExact(69, 69).write(output_path_small, function (err) {
                         if (err)
                          { console.log(err);
                            var ms={};
                            ms.trouble = 1;
                             res.send(ms);
                          }
                        else {
                          fs.unlink(fullimgname, function(err){
                            if(err) throw err;
                            console.log('############# 6 #############');
                            console.log('MK_USERPIC DONE;');
                            users.update({mail:_mail},{$set:{userpic:1}});
                            var ms={};
                            ms.trouble=0;
                            res.send(ms);
                          });
                        }
                       });//CREATE _small 
                    }
                   });//CROP&RESIZE UPLOADED IMAGE
                 }
               });
}
    


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
    res.redirect('http://peopleandbooks.com/admax');
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
     res.redirect('http://peopleandbooks.com/admax');}
    else {
      res.redirect('http://peopleandbooks.com');
    }
  }
  else {
    res.redirect('http://peopleandbooks.com');
  }
});

app.post('/admin/1/:uid',function(req,res){
  var pas = req.body.uu;
  if (pas != 'withoutthesecurity') {
    res.redirect('http://peopleandbooks.com');
  }
  else 
  {var vuid = parseInt(req.params.uid);
    var ms={};
    ms.trouble=1;
    ms.mtext = 'db';
    users.remove({_id:vuid},function(err,done){
      if(err){
        res.send(ms);
      }
      else {
        friends.remove({_id:vuid},function(err,done){
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
    res.redirect('http://peopleandbooks.com');
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
  if(req.session && req.session._id ){
  var cond = req.params.id; 
  switch(cond){
    case('book_out'):
    console.log('book_out');
    var book_id = req.body.book_id;
    var already = 0;
    for(var xx =req.session.bookstore.length-1;xx>=0;xx--){
      if(book_id === req.session.bookstore[xx]){
        console.log('trying to add a book, which is already on the list');
       already =1;
      }
    }
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
        items.update({user:req.session._id},{$push:{bookstore:{tmstmp:crrtm,_id:book_id,title:book.title,authors:books.authors,newbook:1,goodbook:0}}});
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
    case('article_out'):
    console.log('article_out');
    var article_id = req.body.article_id;
    var already = 0;
    for(var xx =req.session.articlestore.length-1;xx>=0;xx--){
      if(article_id === req.session.articlestore[xx]){
        console.log('trying to add an article, which is already on the list');
       already =1;
      }
    }
    if(!already)
    {users.update({_id:req.session._id},{$push:{articlestore:article_id},$set:{last_item:Date.now()},$inc:{totalarticles:1,newarticles:1}});
     items.update({user:req.session_id},{$push:{articlestore:{tmstmp:Date.now(),_id:article_id,title:req.body.title,link:req.body.link,newarticle:1,goodarticle:0}}});
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
      if(movie_id === req.session.moviestore[xx]){
        console.log('trying to add a movie, which is already on the list');
       already =1;
      }
    }
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
    case('article'):
    console.log(req.body.title);
    if(req.body.title&& is_title(req.body.title)&& req.body.link&& is_link(req.body.link) && is_single(parseInt(req.body.newarticle))){
    var newarticle = parseInt(req.body.newarticle);
    var newid = new ObjectID();
    var newdate = Date.now();
    if(newarticle)
    {
      users.update({_id:req.session._id},{$push:{articlestore:newid},$set:{last_item:newdate},$inc:{totalarticles:1,newarticles:1}});
      items.update({user:req.session._id},{$push:{articlestore:{tmstmp:newdate,_id:newid,title:req.body.title,link:req.body.link,newarticle:1,goodarticle:0}}})
    }
    else {
      users.update({_id:req.session._id},{$push:{articlestore:newid},$set:{last_item:newdate},$inc:{totalarticles:1,readarticles:1}});
      items.update({user:req.session._id},{$push:{articlestore:{tmstmp:newdate,_id:newid,title:req.body.title,link:req.body.link,newarticle:0,goodarticle:0}}});
    }
    var ms ={};
    ms.trouble=0;
    res.send(ms);
    }
    else {
      var ms ={};
    console.log('data check fail while adding an article');
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
                                         ms.trouble = 0;
                                         res.send(ms);}
                                          else
                      {movie_insert.newmovie = 0;
                        users.update({_id:req.session._id},{$push:{moviestore:newmovie._id.toString()},$inc:{totalmovies:1,oldmovies:1},$set:{last_item:Date.now()}});
                        items.update({user:req.session._id},{$push:{moviestore:movie_insert}});
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

app.post('/nickcheck',function (req,res){
  var query = req.body.txt;
  var msg = {};
  if(is_nick(req.body.txt)){
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
   }
   else {
    msg.present =1;
    res.send(msg);
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