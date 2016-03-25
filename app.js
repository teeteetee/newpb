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
  , users = db.get('users'),items = db.get('items'), concepts = db.get('concepts'), misc=db.get('misc'), business=db.get('business');
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
  if(req.session.tmstmp)
    {console.log('setting last_visit');
      req.session.last_visit=req.sessiontmstmp;
     req.session.tmstmp = Date.now();
    }
  else {
    console.log('NEW CLIENT');
    req.session.tmstmp = Date.now();
  }
  next();
  });



app.get('/test',function (req,res){
  items.findOne({user:req.session._id},function (err,done){
                  res.send(done);});
});




app.get('/',function(req,res) {
    var tmstmp=0;
   if (req.session._id)
        { 
          users.findOne({_id:req.session._id},function (err,done){
            if(err){
              if(req.session.last_visit)
                {tmstmp=req.session.last_visit}
               res.render('index_new',{'tmstmp':tmstmp});
                }
            else {
              if(done){
                //req.session=done;
                res.render('userpage_new');
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
                if(req.session.last_visit)
                {tmstmp=req.session.last_visit}
                res.render('index_new',{'tmstmp':tmstmp});
              }
            }
          });
        }
   else { 
       if(req.session.last_visit)
      {tmstmp=req.session.last_visit}
      res.render('index_new',{'tmstmp':tmstmp});
   }
});

app.get('/userpage',function (req,res){
  res.render('userpage_new');
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
  var re = /^[a-zA-Z0-9\u0400-\u04FF\-_ ?!¡()%#&:¿’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
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
  items.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE ITEMS QUERY');
      res.send(ms);
    }
    else if(doc!=null){
      ms.doc = doc;
      ms.trouble=0;
      res.send(ms);
    }
    else {
      res.send(ms);
    }
  });
});

app.post('/getitems_b',function (req,res){
  var ms ={};
  ms.trouble=1;
  business.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE ITEMS_b QUERY');
      res.send(ms);
    }
    else if(doc!=null){
      ms.doc = doc;
      ms.trouble=0;
      res.send(ms);
    }
    else {
      res.send(ms);
    }
  });
});

app.post('/getitems_m',function (req,res){
  var ms ={};
  ms.trouble=1;
  misc.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE ITEMS_b QUERY');
      res.send(ms);
    }
    else if(doc!=null){
      ms.doc = doc;
      ms.trouble=0;
      res.send(ms);
    }
    else {
      res.send(ms);
    }
  });
});

app.post('/getitems_ic',function (req,res){
  var ms ={};
  ms.trouble=1;
  concepts.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE CONCEPTS QUERY');
      res.send(ms);
    }
    else if(doc!=null){
      ms.doc = doc;
      ms.trouble=0;
      res.send(ms);
    }
    else {
      res.send(ms);
    }
  });
});


app.get('/ic',function (req,res){
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
               res.render('ic_out');
                }
            else {
              if(done){
                res.render('ic');
              }
              else {
                res.render('ic_out');
              }
            }
          });
});

app.get('/b',function (req,res){
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
               res.render('b_out');
                }
            else {
              if(done){
                res.render('b');
              }
              else {
                res.render('b_out');
              }
            }
          });
});

app.get('/m',function (req,res){
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
               res.render('m_out');
                }
            else {
              if(done){
                res.render('m');
              }
              else {
                res.render('m_out');
              }
            }
          });
});

app.get('/a',function (req,res){
  res.render('a');
});

app.post('/ic',function (err,done){
  var ms ={};
  concepts.find({},function(err,done){
    if(err)
    {
      ms.trouble=0;
      res.send(ms);
    }
    else {
      ms.articles=done;
      ms.trouble=0;
      res.send(ms);
    }
  });
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

app.get('/gets',function(req,res){
  req.session._id='56e9b1defa89b86136000001';
  res.redirect('/');
});

app.post('/newuser',function(req,res){
    var reload = req.body.reload;
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect'; 
    var vnick = req.body.nick;
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    //checkmail function was here before being moved out of scope
      users.insert({nick:vnick,phr:vp,totallinks:0,last_item:0,regdate:Date.now()},function (err,done){
        if(err)
        {
          ms.mtext='db';
         res.send(ms); 
        }
      else {
      req.session._id=done._id;
      if(!reload)
      {ms.trouble =0;
      ms.mtext='success';
      res.send(ms);}
      else {
        res.redirect('/')
      }
      }
      });
        
    
    });

app.post('/check',function(req,res){
  vphr=req.body.phr;
  vlgn=req.body.lgn; // email
  console.log(vphr+" , "+vlgn);
   var  ms = {};
  ms.trouble=1;
  ms.mtext='db';
  users.findOne({nick:vlgn},function(err,confirmed){
    if (err)
      {res.send(ms);}
    else 
    {
      if (confirmed)
      {console.log('we have found :'+JSON.stringify(confirmed));
          if(bcrypt.compareSync(vphr,confirmed.phr))
          {
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


//******************** HELPERS ********************//


app.get('/see:items',function (req,res){
  switch(req.params.items){
    case('items'):
  items.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
  break;
  case('m'):
  misc.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
  break;
  case('b'):
  business.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
  break;
  case('ic'):
  concepts.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
  break;
  case('user'):
  users.find({},function (err,done){
    if(err){

    }
    else {
      res.send(done);
    }
  });
  break;
}
});


app.get('/clearitems',function (req,res){
  concepts.remove({});
  business.remove({});
  misc.remove({});
  items.remove({});
  res.redirect('/');
});


app.get('/cs',function (req,res){
  res.send(req.session);
});

//******************** HELPERS END ********************//

//-----------------LONGPOLLING END------------------//


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

app.post('/number/:jesus', function (req,res){
  var vcase = req.params.jesus;
  var ms={};
  switch(vcase){
    case('items'):
      items.count({},function (err,done){
     if(err) {
      ms.number=0;
      res.send(ms);
     }
     else {
      ms.number=done;
      res.send(ms);
      }
    });
    break;
    case('b'):
      business.count({},function (err,done){
     if(err) {
      ms.number=0;
      res.send(ms);
     }
     else {
      ms.number=done;
      res.send(ms);
      }
    });
    break;
    case('m'):
    misc.count({},function (err,done){
     if(err) {
      ms.number=0;
      res.send(ms);
     }
     else {
      ms.number=done;
      res.send(ms);
      }
    });
    break;
    case('ic'):
    concepts.count({},function (err,done){
     if(err) {
      ms.number=0;
      res.send(ms);
     }
     else {
      ms.number=done;
      res.send(ms);
      }
    });
    break;
  }
});

app.post('/remitem/:id',function (req,res){
  if(req.session && req.session._id && req.body._id){
    var cond = req.params.id; 
    var ms ={};
    ms.trouble=0;
    switch(cond){
      case('link'):
      console.log('removing a link');
      items.remove({_id:req.body._id});
      users.update({_id:req.session._id},{$inc:{totallinks:-1,nlinks:-1}});
      res.send(ms);
      break;
      case('ic'):
      console.log('removing a consept');
      concepts.remove({_id:req.body._id});
      users.update({_id:req.session._id},{$inc:{blinks:-1}});
      res.send(ms);
      break;
      case('b'):
      console.log('removing a b_item');
      business.remove({_id:req.body._id});
      users.update({_id:req.session._id},{$inc:{totallinks:-1,blinks:-1}});
      res.send(ms);
      break;
      case('m'):
      console.log('removing a m_item');
      misc.remove({_id:req.body._id});
      users.update({_id:req.session._id},{$inc:{totallinks:-1,mlinks:-1}});
      res.send(ms);
      break;
  }
}
});

app.post('/additem/:id',function (req,res){
  if(req.session && req.session._id ){
    //conditioning is left due to plans of bringing in a section of "terms", to be added the same way
  var cond = req.params.id; 
  var ms ={};
  switch(cond){
    case('link'):
    console.log(req.body.title);
    //if(req.body.title&& is_title(req.body.title)&& req.body.link&& is_link(req.body.link) ){
    if(req.body.title&& is_title(req.body.title)){
    var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      {users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,nlinks:1}});
      items.insert({tmstmp:newdate,title:req.body.title,link:req.body.link,comment:vcomment});
      ms.trouble=0;
      res.send(ms);}
      else {
      users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,nlinks:1}});
      items.insert({tmstmp:newdate,title:req.body.title,link:0,comment:vcomment});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while adding an link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('ic'):
     if(req.session._id && req.body.title && is_title(req.body.title)&& req.body.link&& is_link(req.body.link) ){
      users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{concepts:1}});
     concepts.insert({title:req.body.title,link:req.body.link, tmstmp:Date.now()},function(err,done){
       if(err){
        ms.trouble=1;
         res.send(ms);
       }
       else {
        ms.trouble=0;
       res.send(ms);
       }
     });
    }
    else {
     ms.trouble=1;
     res.send(ms);
    }
    break;
    case('b'):
    if(req.body.title&& is_title(req.body.title)){
    var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      {users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,blinks:1}});
      business.insert({tmstmp:newdate,title:req.body.title,link:req.body.link,comment:vcomment});
      ms.trouble=0;
      res.send(ms);}
      else {
      users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,blinks:1}});
      business.insert({tmstmp:newdate,title:req.body.title,link:0,comment:vcomment});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while adding an link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('m'):
    if(req.body.title&& is_title(req.body.title)){
    var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      {users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,mlinks:1}});
      misc.insert({tmstmp:newdate,title:req.body.title,link:req.body.link,comment:vcomment});
      ms.trouble=0;
      res.send(ms);}
      else {
      users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,mlinks:1}});
      misc.insert({tmstmp:newdate,title:req.body.title,link:0,comment:vcomment});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while adding an link');
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