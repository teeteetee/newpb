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
//var db = require('monk')('localhost/tav'),users = db.get('users'),items = db.get('items'), concepts = db.get('concepts'), misc=db.get('misc'), business=db.get('business'), questions = db.get('questions'),movies = db.get('movies'),stats = db.get('stats');

var db = require('monk')('localhost/tav'),counter_users = db.get('counter_users'),counter_teamlists = db.get('counter_teamlist'),counter_items = db.get('counter_items'),counter_stats = db.get('counter_stats'),counter_books = db.get('counter_books'),counter_movies = db.get('counter_movies'),counter_friends = db.get('counter_friends'),counter_current = db.get('counter_current'),counter_web = db.get('counter_web'),ltps_posts = db.get('ltps_posts'),ltps_users = db.get('ltps_users');

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
  domain:'188.166.118.116'
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
  next();
  });

function is_author(input){
  var re = /^[a-zA-Z\u0400-\u04FF\-. ’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
  console.log(re.test(input)+' tesing AUTHOR');
  return re.test(input);
}
function is_title(input){
  var re = /^[a-zA-Z0-9\u0400-\u04FF\-<>_ ?!¡()%#&:¿’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
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




/*app.get('/test',function (req,res){
  items.findOne({user:req.session._id},function (err,done){
                  res.send(done);});
});

//-----------------------//

app.get('/promstat',function (req,res){
  res.render('promstat');
});

app.get('/scroll',function (req,res){
  res.render('scroll_test');
});

//-----------------------//

app.get('/ltps',function (req,res){
  res.render('ltps');
});

app.get('/ltps/red',function (req,res){
  if(req.session&&req.session.red_allow==1){
    res.render('ltps_admin');
  }
    else{
      res.render('ltps_login');
    }
});



app.post('/ltps/getposts',function (req,res){
  var msg={};
  msg.trouble=1;
  ltps_posts.find({},function(err,done){
    if(err){

    }
    else{
      if(done)
      {
       msg.trouble=0;
       msg.doc=done;
       res.send(msg);
      }
      else{
      res.send(msg);
      }
    }
  });
});*/


app.get('/counter/settings',function (req,res) {
  res.render('counter_settings');
});

/*
app.get('/counter/current',function (req,res) {
  if(req.session&&req.session._id){
  res.render('counter_current');
  }
  else{
    res.send('no');
  }
});

app.post('/counter/current/get',function (req,res){
  var ms={};
  if(req.session&&req.session._id){
  counter_current.find({},function (err,done){
    if(err){
     ms.trouble=1;
     res.send(ms);
    }
    else {
      //console.log(done);
      ms.trouble=0;
      ms.msg=done;
      res.send(ms);
    }
  });
  }
  else{
    res.send('no');
  }
});

app.post('/counter/current/add',function (req,res){
  if(req.session&&req.session._id){
    var vtmstmp=Date.now();
    var ms={};
  counter_current.insert({c_text:req.body.c_text,tmstmp:vtmstmp,done:0},function(err,done){
    if(err){
      ms.trouble=1;
      res.send(ms);
    }
    else{
      ms.trouble=0;
      res.send(ms);
    }
  });
   }
   else{
    res.send('no');
   }
});

app.post('/counter/current/remove',function (req,res){
  var ms={};
   ms.trouble=1;
  if(req.session&&req.session._id){
  counter_current.remove({_id:req.body._id},function(err,done){
   if(err){
      res.send(ms);
    }
    else{
      ms.trouble=0;
      res.send(ms);
    }
  });
   }
   else{
    res.send(ms);
   }
});



app.post('/counter/current/done',function (req,res){
  var ms={};
   ms.trouble=1;
  if(req.session&&req.session._id){
    var vstatus = parseInt(req.body.vstatus)?0:1;
    console.log('BODY: '+req.body._id+' '+vstatus);
  counter_current.update({_id:req.body._id},{$set:{done:vstatus}},function(err,done){
   if(err){
      res.send(ms);
    }
    else{
      console.log(done);
      ms.trouble=0;
      res.send(ms);
    }
  });
   }
   else{
    res.send(ms);
   }
});

*/
//-----------------test-----------------//

app.get('/update_users',function (req,res){
  counter_users.update({_id:req.session._id},{$set:{'teamlists':[]}},function(err,done){
    if(err){
      console.log('err updating users: '+err);}
      else{
        console.log('update users success');
        console.log('done: '+done)
        res.redirect('/counter');
      }
    
  });
});

app.get('/counter',function (req,res){
  if(req.session&&req.session._id)
 {console.log(req.session);
  if(req.session.nick){
    //res.render('index_counter_comb',{'_id':req.session._id,'nick':req.session.nick});
    if(!req.session.friendstore||req.session.friendstore.length<1)
      {req.session.friendstore=0;}
    res.render('index_counter_comb_09:17',{'_id':req.session._id,'nick':req.session.nick,'friendstore':req.session.friendstore});
  }
  else{
  //res.render('index_counter_comb',{'_id':req.session._id,'nick':0});
  res.render('index_counter_comb_09:17',{'_id':req.session._id,'nick':0});
}}
 else {
  res.render('counter_index_login');
 }
 //res.render('index_counter_out');
});


app.get('/counter/session/:session',function (req,res){
  if(req.params.session==='give'||req.params.session==='clean')
  {if(req.params.session==='give') {
      req.session._id = 1;
      console.log(req.session._id);
      res.send('done');
    }
    if(req.params.session==='clean') {
      delete req.session._id;
      res.redirect('/counter');
    }}
    else {
res.redirect('/counter');
    }
});

//app.get('/counter/comb',function (req,res){
//  if(req.session&&req.session._id)
// {console.log(req.session);
//  res.render('index_counter_comb',{'_id':req.session._id});}
// else {
//  res.render('counter_index_login');
// }
//});

app.get('/counter/setfirsttime',function (req,res){
  counter_users.update({},{$set:{first_time:1}},function (err,done){
    res.send(done);
});
});

app.post('/counter/greeting/:_id',function (req,res){
  //cancel that from server so it wont appear more that once 
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id){
    counter_users.findOne({_id:req.params._id},function (err,done){
          if(err){
            res.send(ms);
          }
          else{
            if(done)
            {//console.log('sending greeting');
            ms.trouble=0;
            ms.mtext=done.first_time;
            if(parseInt(done.first_time)){
              counter_users.update({_id:req.params._id},{$set:{first_time:0}},function (err,done){
               res.send(ms);
              });
            }
            else{ 
            res.send(ms);
            }
            }
            else {
              res.send(ms);
            }
          }
        });
  }
});

app.post('/counter/getshowmail/:_id',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id){
     counter_users.findOne({_id:req.params._id},function (err,done){
          if(err){
            res.send(ms);
          }
          else{
            if(done&&done.showmail)
            {console.log('sending showmail');
            ms.trouble=0;
            ms.mtext=done.showmail;
            res.send(ms);}
            else {
              res.send(ms);
            }
          }
        });
  }
    else{
      res.send(ms);
    }
  });

app.post('/counter/setshowmail',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id){
     console.log('SET SHOWMAIL '+parseInt(req.body.state));
     counter_users.update({_id:req.session._id},{$set:{showmail:parseInt(req.body.state)}},function (err,done){
          if(err){
            res.send(ms);
          }
          else{
            if(done&&done.showmail)
            {console.log('sending nick');
            ms.trouble=0;
            ms.mtext=done.showmail;
            ms.first_time=done.first_time;
            res.send(ms);}
            else {
              res.send(ms);
            }
          }
        });
  }
    else{
      res.send(ms);
    }
  });

app.post('/counter/get_teamlist',function (req,res){
   var ms ={};
   ms.trouble=1;
   if(req.session&&req.session._id&&req.body._id){
      var list_id = new ObjectID(req.body._id);
      counter_teamlists.findOne({_id:list_id},function (err,done){
           if(err){
             res.send(ms);
           }
           else{
             if(done)
             {ms.trouble=0;
             ms.doc=done;
             res.send(ms);}
             else {
               res.send(ms);
             }
           }
         });
   }
     else{
       res.send(ms);
     }
});

app.post('/counter/gn/:_id',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id){
     //var v_id = req.params._id[1]==='"'?req.params._id:'"'+req.params._id+'"';
        counter_users.findOne({_id:req.params._id},function (err,done){
          if(err){
            console.log('GN/ db err');
            res.send(ms);
          }
          else{
            //console.log('-------- GN --------\n'+JSON.stringify(done)+'\n'+'-------- GN --------');
            if(done&&done.nick)
            {console.log('sending nick');
            ms.trouble=0;
            ms.mtext=done.nick;
            ms.lastitem=done.lastitem;
            res.send(ms);}
            else {
              console.log('GN/ found nobody');
              res.send(ms);
            }
          }
        });
      }
      else{
        res.send(ms);
      }
});

/*
app.get('/counter/p3345',function (req,res){
  res.render('index_in');
});

app.get('/counter/p3345/b',function (req,res){
  res.render('index_in_b');
});
*/
app.get('/counter/friends_in',function (req,res){
  res.render('index_in_friend');
});

app.get('/counter/friends_out',function (req,res){
  res.render('index_out_friend');
});

/*
app.get('/counter/initdb',function (req,res){
  stats.remove({},function(err,done){
  stats.insert({queryhook:'stats',newmovies:0,totalmovies:0,seenmovies:0});
  stats.find({},function(err,done){
    res.redirect('/counter');
  });
 });
});

app.get('/counter/showmovies',function (req,res){
  movies.find({},function(err,done){
    res.send(done);
  });
});

app.get('/counter/showstats',function (req,res){
  stats.find({},function(err,done){
    res.send(done);
  });
});

app.get('/counter/clearfriends',function (req,res){
  counter_friends.update({uid:req.session._id},{$set:{total:0,friendstore:[]},$unset:{firendstore:1}},function (err,done){
    res.redirect('/counter');
  });
});
*/

//app.get('/counter/clear',function (req,res){
//  counter_users.remove({});
//  counter_friends.remove({});
//  counter_movies.remove({});
//  counter_books.remove({});
//  delete req.session._id;
//  delete req.session;
//  res.redirect('/counter');
//});

//app.get('/counter/deletemovies',function (req,res){
//  movies.remove({},function(err,done){
//  stats.update({queryhook:'stats'},{$set:{newmovies:0,totalmovies:0,seenmovies:0}});
//    res.redirect('/counter/initdb');
//  });
//});/

app.get('/counter/web_init',function (req,res){
  if(req.session&&req.session._id)
  {counter_web.insert({uid:req.session._id,total:0,weblinkstore:[]});
    res.redirect('/counter/current');}
    else {
      res.redirect('/counter');
    }
});

app.post('/counter/setnick',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id&&req.body.nick&&is_nick(req.body.nick)){
    console.log(req.body.nick);
        counter_users.update({_id:req.session._id},{$set:{nick:req.body.nick}},function (err,done){
        if(err){
          console.log('err while setting nick');
        }
          else{
            ms.trouble=0;
            req.session.nick=req.body.nick;
            console.log('req.session.nick: '+req.session.nick);
            res.send(ms);
          }
        });
      }
    else{
      res.send(ms);
    }
});

app.get('/counter/profile/:_id',function (req,res){
  if(req.session&&req.session._id){
    counter_users.findOne({_id:req.params._id},function (err,done){
      if(err){
        console.log('err /counter/profile/'+req.params._id);
      }
      if(done){
        var mail = done.showmail?done.mail:0;
        counter_friends.findOne({uid:req.session._id},function (err,done1){
          if(done1){
            if(done1.friendstore.indexOf(req.params._id)!=-1){
              res.render('index_in_profile',{'_id':req.params._id,'isfriend':1,'mail':mail});
            }
            else {
              res.render('index_in_profile',{'_id':req.params._id,'isfriend':0,'mail':mail});
            }
          }
        });
      }
      else {
        res.send('no such user');
      }
    });
  }
    else{
    counter_users.findOne({_id:req.params._id},function (err,done){
      if(done){
        res.render('index_profile_movies',{'_id':req.params._id});
      }
      else {
        res.send('no such user');
      }
    });
    }
});


app.post('/counter/getteamlists',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id)
  {counter_users.findOne({_id:req.session._id},function(err,doc){
    if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        //console.log(doc);
        ms.doc = doc.teamlists;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        res.send(ms);
      }
  });}
  else{
    res.send(ms);
  }
  });

app.get('/counter/checkdb',function (req,res){
  var ms ={};
  ms.trouble=1;
  var fixed_id= new ObjectID('592c0f45e3e371e70f000001');
counter_items.findOne({'uid':fixed_id},function(err,doc){
  if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        //console.log(doc);
        ms.doc = doc;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        console.log('hey 2: '+doc);
        res.send(ms);
      }
});
});

app.post('/counter/getitems',function (req,res){
  var ms ={};
  ms.trouble=1;
  //var vuid = req.body._id.replace(/"/g,'').trim();
  //console.log('vuid: '+vuid);
  if(req.session&&req.session._id)
  {
    var temp_id=req.body&&req.body._id&&req.body._id.length>1?new ObjectID(req.body._id):req.session._id;
    counter_items.findOne({'uid':temp_id},function(err,doc){
      if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        //console.log(doc);
        ms.doc = doc;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        console.log('hey 2: '+doc);
        res.send(ms);
      }
    });}
else{
   console.log('hey 1');
   res.send(ms);
}
});

//app.post('/counter/getweb',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id)
//  {counter_web.find({},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE MOVIES QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        //console.log(doc);
//        ms.doc = doc[0];
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else{
//   res.send(ms);
//}
//});

//app.post('/counter/friend/getmovies/:_id',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id&&req.params._id)
//  {
//    counter_movies.findOne({uid:req.params._id},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE MOVIES QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        ms.doc = doc;
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else{
//   res.send(ms);
//}
//});
//
//app.post('/counter/friend/getbooks/:_id',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id&&req.params._id)
//  {
//    counter_books.findOne({uid:req.params._id},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE MOVIES QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        ms.doc = doc;
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else{
//   res.send(ms);
//}
//});

//app.post('/counter/getbooks',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id)
//  {counter_books.findOne({uid:req.session._id},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE MOVIES QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        ms.doc = doc;
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else{
//  res.send(ms);
//}
//});

//app.get('/counter/sset',function (req,res){
//  counter_friends.update({uid:req.session._id},{$set:{total:0}},function(err,doc){
//  res.send('done');
//  });
//});

app.post('/counter/getfriends',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id)
  {counter_friends.findOne({uid:req.session._id},function(err,doc){
      if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        console.log(doc);
        ms.doc = doc;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        res.send(ms);
      }
    });}
else{
   res.send(ms);
}
});

app.post('/counter/getfl',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id)
  {console.log('get_fl: '+req.session._id);
    counter_friends.findOne({uid:req.session._id},function(err,doc){
      if(err) {
        console.log('ERR WHILE FRIENDS QUERY');
        res.send(ms);
      }
      else if(doc!=null&&doc.total_fl){
        console.log(doc);
        ms.doc={};
        ms.doc.followers=doc.followers;
        ms.doc.friends=doc.friendstore;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        console.log('doc null');
        res.send(ms);
      }
    });}
else{
   console.log('session absent');
   res.send(ms);
}
});

//app.post('/counter/getstat_m',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id)
//  {counter_movies.find({uid:req.session._id},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE STATS QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        ms.doc = doc;
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else {
//  res.send(ms);
//}
//});
//
//app.post('/counter/getstat_b',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  if(req.session&&req.session._id)
//  {counter_books.find({uid:req.session._id},function(err,doc){
//      if(err) {
//        console.log('ERR WHILE STATS QUERY');
//        res.send(ms);
//      }
//      else if(doc!=null){
//        ms.doc = doc;
//        ms.trouble=0;
//        res.send(ms);
//      }
//      else {
//        res.send(ms);
//      }
//    });}
//else {
//  res.send(ms);
//}
//});

app.post('/counter/rm_item/',function(req,res){
  //add user verification
  var ms = {};
  ms.trouble =1;
  var vtitle = req.body.item_title;
  var vtmstmp= parseInt(req.body.item_tmstmp);
  //ADD FUNCTIONALITY FOR TEAMLISTS
  console.log('removing: '+vtitle+','+vtmstmp);
  if(req.session&&req.session._id)
  {
  counter_items.update({uid:req.session._id},{$pull:{itemstore:{item_title:vtitle,tmstmp:vtmstmp}},$inc:{total:-1}},function (err,done){
  if(err)
  {
    console.log('trouble removing a item\n'+err);
    res.send(ms);
  }
    else{
      ms.trouble=0;
      res.send(ms);
    }
   });
  
}
  else {
    res.send(ms);
  }
});

//app.get('/counter/tmp_corr',function (req,res){
//  counter_items.findOne({uid:req.session._id},function (err,done){
//  if(err)
//  {
//    console.log('trouble removing a item\n'+err);
//    res.redirect('/counter');
//  }
//    else{
//      for(var i =0;i<done.itemstore.length;i++){
//        if(done.itemstore[i].tmstmp===1496353377409){
//          var tags=['фильм','посмотрел'];
//          done.itemstore[i].item_tags=tags;
//          counter_items.update({uid:req.session._id},{$set:{itemstore:done.itemstore}},function (err2,done2){
//                 if(err2){
//                   console.log(err2);
//                 res.redirect('/counter');
//                 }
//                   else{
//                  res.redirect('/counter');
//                   }
//        });
//        }
//      }
//    }
//  });
//});

app.post('/counter/rd_item/',function(req,res){
  // add user verification
  var ms = {};
  ms.trouble =1;
  var vtitle = req.body.item_title;
  var vcomment = req.body.item_comment;
  var vlink = req.body.item_link;
  var vtags = req.body.item_tags.split(',');
  var v_index = req.body.v_index;
  var vtmstmp= parseInt(req.body.item_tmstmp);
  var teamlist = parseInt(req.body.teamlist);
  console.log('redacting: '+vtitle+','+vcomment+','+vlink+','+vtags+','+vtmstmp+', teamlist:'+teamlist);
  if(req.session&&req.session._id&&vtmstmp)
  {
  var _id=new ObjectID(req.session._id);
  if(teamlist){
    _id=new ObjectID(req.body.teamlist_id);
  }
  counter_items.findOne({uid:_id},function (err,done){
  if(err)
  {
    console.log('trouble removing a item\n'+err);
    res.send(ms);
  }
    else{
      console.log('found a profile: '+JSON.stringify(done));
      //--------------//
      if(done&&done.itemstore){
        var itemstore_length = done.itemstore.length;
        console.log('has an itemstore, length: '+itemstore_length);
        for(var i =0;i<itemstore_length;i++){
          //console.log(done.itemstore[i].tmstmp+'  :  '+vtmstmp);
         if (parseInt(done.itemstore[i].tmstmp) == vtmstmp){
              console.log('found to redact: '+done.itemstore[i].item_title);
              done.itemstore[i].item_title = vtitle;
              done.itemstore[i].item_comment = vcomment;
              done.itemstore[i].item_link = vlink;
              vtags.forEach(function (element, index){
              vtags[index]=trim1(element).toLowerCase();
              });
              done.itemstore[i].item_tags = vtags;
              counter_items.update({uid:req.session._id},{$set:{itemstore:done.itemstore}},function (err2,done2){
                 if(err2){
                   console.log(err2);
                 res.send(ms);
                 }
                   else{
                  ms.trouble=0;
                 res.send(ms);
                   }
        });
            }
      
           //done.itemstore.find(function (elem, index){
           // //console.log('searching: '+elem.item_title+', for: '+query);
           // if (parseInt(elem.tmstmp) === parseInt(vtmstmp)){
           //  // console.log('found: '+elem.item_title)
           //   done.itemstore[index].item_title = vtitle;
           //   done.itemstore[index].item_comment = vlink;
           //   done.itemstore[index].item_link = vlink;
           //   done.itemstore[index].item_tags = vtags;
           // }
           // });
      }
      //--------------//
      res.send(ms);
    }
  }
   });
  
}
  else {
    res.send(ms);
  }
});

app.post('/f_search',function (req,res){
  if(req.session&&req.session._id)
 {
  var query = req.body.f_nick;
  console.log('txt: '+query);
  counter_users.find({nick: { $regex: query, $options: 'i'}},{fields:{nick:1,_id:1}},function(err,docs){
           if(err){
             console.log('err');
           }
           else {
             //console.log(docs);
             if(docs.length!=0)
             {res.send(docs);}
             else {
               res.send(0);
             }
           }
          });
}
else{
  res.send('boo');
}
    
});




app.post('/counter/addfriend',function (req,res){
  if(req.session&&req.session._id&&req.body._id)
 {var ms={};
  ms.trouble=1;
  //console.log('adding a friend');
  //console.log(JSON.stringify(req.session._id).replace(/"/g,'').trim());
  //console.log(req.body._id.toString());
  var u_id= new ObjectID(req.session._id);
  counter_users.update({_id:u_id},{$push:{friendstore:req.body._id}},function (err,done){
    if(err){
      console.log('err adding a friend');
      res.send(ms);}
      else {
        console.log('adding a follower');
        ms.trouble=0;
        res.send(ms);
      }
  });
 }       
      else {
        res.send('err');
      }   
});

app.post('/counter/removefriend',function (req,res){
  if(req.session&&req.session._id)
 {var ms={};
  ms.trouble=1;
  console.log('removing a friend');
  console.log(JSON.stringify(req.session._id).replace(/"/g,'').trim());
  console.log(req.body._id.toString());
  counter_friends.update({uid:req.session._id.replace(/"/g,'').trim()},{$pull:{friendstore:req.body._id},$inc:{total_fd:-1}},function (err,done){
    if(err){
      console.log('err removing a friend');
      res.send(ms);}
      else {
        counter_friends.update({uid:req.body._id},{$pull:{followers:JSON.stringify(req.session._id).replace(/"/g,'').trim()},$inc:{total_fl:-1}},function (err,done){
          if(err){
            console.log('err removing a friend');
            res.send(ms);}
            else {
              ms.trouble=0;
              res.send(ms);
                }
         });
        }  
        });  
        }   
      else {
        res.send('err');
      }   
});
  
function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

app.post('/counter/additem',function (req,res){
  if(req.session&&req.session._id)
 {console.log('adding an item');
          var ms = {};
          ms.trouble =1;
            var list_id;
            // =req.body.list_id===0?req.session._id:new ObjectID(req.body.list_id);
             if(req.body.list_id.length===1&&!parseInt(req.body.list_id)){
              list_id=req.session._id;
             }
             else{
              list_id=new ObjectID(req.body.list_id);
             }
            var vtitle = req.body.item_title.replace(/\s{2,}/g,' ').trim();;
            var vlink = req.body.item_link;
            console.log('breakpoint one');
            var vcomment = req.body.item_comment;
            var vtags = req.body.item_tags.split(',');
            vtags.forEach(function (element, index){
              vtags[index]=trim1(element);
            });
            console.log('ADDING AN ITEM: title:'+vtitle+' ,link: '+vlink+' ,comment: '+vcomment+' , tags: '+vtags);
            var dd= new Date();
            var vday = dd.getDate().toString();
            if (vday.length===1){
              vday='0'+vday;
            }
            var vmonth = dd.getMonth()+1;
            console.log('breakpoint two');
            vmonth = vmonth.toString();
            if (vmonth.length===1){
              vmonth='0'+vmonth;
            }
            console.log('breakpoint three');
            var vyear = dd.getUTCFullYear().toString();
            var fulldate = vyear+vmonth+vday;
            fulldate = parseInt(fulldate);
        
            if(!vtitle){
              vtitle = '--';
              //SEND ERROR
            }
            if(!vcomment){
              vcomment = '--';
            }
            if(!vlink){
              vlink = '--';
            }
            else{
              vlink=addhttp(vlink);
            }
            if(!vtags){
              vtags = [];
            }
            console.log('breakpoint four: '+req.session._id);
          var vtmstmp = Date.now();
          counter_items.update({uid:list_id},{$push:{itemstore:{item_comment:vcomment,item_title:vtitle,item_link:vlink,item_tags:vtags,regdateint:fulldate,tmstmp:vtmstmp}},$inc:{total:1}},function(err,done){
            console.log(done);
            console.log(err);
          });
          //console.log('breakpoint five');
          
          
          console.log('item added');
           res.send('ok');  }       
      else {
        res.send('err');
      }   
});

app.get('/counter/cleanweb',function (req,res){
  if(req.session&&req.session._id){
   counter_movies.update({uid:req.session._id},{$unset:{weblinkstore:1}});
  }
  else{
    res.redirect('/counter');
  }
});

app.post('/counter/addweb',function (req,res){
  if(req.session&&req.session._id)
 {console.log('adding a web link');
          var ms = {};
          ms.trouble =1;
            var v_r_name = req.body.r_name;//RESOURCE NAME
            var v_r_link = req.body.r_link;// RESOURCE LINK
            if(!v_r_name){
              v_r_name = '--';
              //SEND ERROR
            }
            if(!v_r_link){
              v_r_link = '--';
            }
          var vtmstmp = Date.now();
          counter_web.update({uid:req.session._id},{$push:{weblinkstore:{r_link:v_r_link,r_name:v_r_name,tmstmp:vtmstmp}},$inc:{total:1}},function(err,done){
            console.log(done);
          });
           res.send('ok');  }       
      else {
        res.send('err');
      }   
});


app.post('/backup',function (req,res){
  if(req.session&&req.session._id)
  { var json = {};
     counter_items.findOne({uid:req.session._id},function (err,doc){
            if(err){
               console.log('ERR WHILE BACKUP REQUEST');
               console.log(err3);
             }
             else 
           {
            json.items={};
            json.items.itemstore=doc.itemstore;
            json.items.total=doc.total;
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
            var filename = 'CONSORCIO_backup_'+date+'.json'; // or whatever
            var mimetype = 'application/json';
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);
            res.write(JSON.stringify(json));
            res.end();
           }
         });

    }
    else {
      res.send('err');
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



app.post('/counter/restore',function (req,res){
 if(req.session&&req.session._id){      
  console.log('breakpoint 0, req.files: \n'+req.files);
    var oldPath = req.files.userjson.path;
     console.log('breakpoint 1');
    fs.readFile(oldPath , 'utf8', function(err, data) {
       console.log('breakpoint 2');
      var valid = validateJSON(data);
       console.log('breakpoint 3');
       if (valid) {
         console.log('breakpoint 4');
         data = JSON.parse(data);
         counter_items.update({uid:req.session._id},{$set:{total:data.items.total,itemstore:data.items.itemstore}},function (err,done){
           if(err){
            console.log('err');
           }
           else {
              console.log('breakpoint 5');
              fs.unlink(oldPath, function(){
                //if(err) throw err;
                if(err) console.log(err);
                res.redirect('/counter/comb');
               });
           }
         });
       }
    });
  }
  else{
    res.send('err');
  }
});

//------------------test-------------------//


app.get('/',function(req,res) {
  res.send('boo');
/*   var tmstmp=0;
    if(req.session.tmstmp)
    {console.log('setting last_visit');
      req.session.last_visit=req.session.tmstmp;
     req.session.tmstmp = Date.now();
    }
  else {
    console.log('NEW CLIENT');
    console.log('User-Agent: ' + req.headers['user-agent']);
    console.log('IP: '+req.ip);
    req.session.tmstmp = Date.now();
  }
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
   }*/
});

//app.get('/userpage',function (req,res){
//  res.render('userpage_new');
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
  var re = /^[a-zA-Z0-9\u0400-\u04FF\-<>_ ?!¡()%#&:¿’'‘ÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
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
function addhttp(url) {
   if (!/^(f|ht)tps?:\/\//i.test(url)) {
      url = "http://" + url;
   }
   return url;
}
function is_email(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
    } 

// will be used on writes mostly

//END OF DATA VALIDATION

//app.post('/getitems',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  items.find({},function (err,doc){
//    //console.log(doc);
//    if(err) {
//      console.log('ERR WHILE ITEMS QUERY');
//      res.send(ms);
//    }
//    else if(doc!=null){
//      ms.doc = doc;
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      res.send(ms);
//    }
//  });
//});
//
//app.post('/getitems_b',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  business.find({},function (err,doc){
//    //console.log(doc);
//    if(err) {
//      console.log('ERR WHILE ITEMS_b QUERY');
//      res.send(ms);
//    }
//    else if(doc!=null){
//      ms.doc = doc;
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      res.send(ms);
//    }
//  });
//});

//app.post('/getitems_m',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  misc.find({},function (err,doc){
//    //console.log(doc);
//    if(err) {
//      console.log('ERR WHILE ITEMS_b QUERY');
//      res.send(ms);
//    }
//    else if(doc!=null){
//      ms.doc = doc;
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      res.send(ms);
//    }
//  });
//});

//

//app.post('/getitems_q',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  questions.find({},function (err,doc){
//    //console.log(doc);
//    if(err) {
//      console.log('ERR WHILE ITEMS_q QUERY');
//      res.send(ms);
//    }
//    else if(doc!=null){
//      ms.doc = doc;
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      res.send(ms);
//    }
//  });
//});

//app.post('/getitems_ic',function (req,res){
//  var ms ={};
//  ms.trouble=1;
//  concepts.find({},function (err,doc){
//    //console.log(doc);
//    if(err) {
//      console.log('ERR WHILE CONCEPTS QUERY');
//      res.send(ms);
//    }
//    else if(doc!=null){
//      ms.doc = doc;
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      res.send(ms);
//    }
//  });
//});




//app.post('/ic',function (err,done){
//  var ms ={};
//  concepts.find({},function(err,done){
//    if(err)
//    {
//      ms.trouble=0;
//      res.send(ms);
//    }
//    else {
//      ms.articles=done;
//      ms.trouble=0;
//      res.send(ms);
//    }
//  });
//});


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






//app.get('/signin', function (req,res){
//  var color;
//   switch(Math.floor(Math.random() * 4) + 1){
//     case(1):
//     color='#ec3737';
//     break
//     case(2):
//     color='#37b6ec';
//     break
//     case(3):
//     color='#1FD081';
//     break
//     case(4):
//     color='#ec8637';
//     break
//   }
//   res.render('signin',{'color':color});
//});

app.get('/counter/logout',function (req,res){
  req.session.reset();
  res.redirect('/counter');
});

app.get('/counter/showusers',function (req,res){
  counter_users.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

app.get('/counter/showteamlists',function (req,res){
  counter_teamlists.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

app.get('/counter/showitems',function (req,res){
  counter_items.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

//app.get('/counter/showusers',function (req,res){
//  counter_users.find({},function(err,done){
//    counter_books.find({},function(err,done1){
//      counter_movies.find({},function(err,done2){
//       res.send(JSON.stringify(done)+'\n'+JSON.stringify(done1)+'\n'+JSON.stringify(done2));
//      });
//    });
//  });
//});

//app.get('/counter/showweb',function (req,res){
//  counter_web.find({},function(err,done){
//       res.send(JSON.stringify(done));
//  });
//});

//app.get('/counter/showme',function (req,res){
//  counter_users.findOne({_id:req.session._id},function(err,done){
//    counter_books.findOne({uid:req.session._id},function(err,done1){
//      counter_movies.findOne({uid:req.session._id},function(err,done2){
//        counter_friends.findOne({uid:req.session._id},function(err,done3){
//          counter_web.findOne({uid:req.session._id},function(err,done4){
//       res.send(req.session._id+'\n'+'USERS:'+'\n'+JSON.stringify(done)+'\n'+'BOOKS:'+'\n'+JSON.stringify(done1)+'\n'+'MOVIES:'+'\n'+JSON.stringify(done2)+'\n'+'FRIENDS:'+'\n'+JSON.stringify(done3)+'\n'+'WEB:'+'\n'+JSON.stringify(done4));
//          });
//        });
//      });
//    });
//  });
//});

app.get('/counter/logout',function (req,res){
  delete req.session._id;
  delete req.session.nick;
  res.redirect('/counter');
});

app.get('/counter/testdb',function (req,res){
  counter_books.findOne({uid:"57e815540825521938000001"},function(err,done){
    res.send(done);
  });
});

function validateEmail(email) { 
        console.log('checking email');
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);} 

app.post('/counter/rmteamlist',function (req,res){
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var vteamlistid= req.body.teamlistid;
    //var vmail = req.body.mail;
    if(req.session&&req.session._id&&vteamlistname)
 {
   counter_teamlists.remove({_id:vteamlistname});
    ms.trouble=0;
    res.send(ms);
 }
else {
  res.send('err');
}
});


app.post('/counter/newteamlist',function (req,res){
  //console.log('brp 1');
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var vteamlistname = req.body.teamlistname;
    //var vmail = req.body.mail;
    if(req.session&&req.session._id&&vteamlistname)
 {
   counter_teamlists.insert({list_name:vteamlistname,totallinks:0,last_item:0,create_date:Date.now(),users:[req.session._id]},function (err,done){
    //console.log('brp 2');
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
           // console.log('brp 3');
          //counter_stats.update({$inc:{users:1}});
          //var vuid = JSON.stringify(done._id).replace(/"/g,'').trim();
          //console.log('vuid: '+vuid);
          //counter_items.insert({uid:vuid,total:0,itemstore:[]});
          //counter_friends.insert({uid:vuid,total_fd:0,total_fl:0,friendstore:[],followers:[]});
          //req.session._id=done._id;
               counter_users.findOne({_id:req.session._id},function (err,done_0){
                //console.log('brp 4');
                if(err)
                  {
                    ms.mtext='db';
                   res.send(ms); 
                  }
                else {
                 // console.log('brp 6');
                  counter_items.insert({uid:done._id,total:0,itemstore:[]});
                  counter_users.update({_id:req.session._id},{$push:{teamlists:{_id:done._id,list_name:vteamlistname}}},function (err,done_1){
                    //console.log('brp 7');
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
              }
            });
          //ms.trouble =0;
          //ms.mtext='success';
          //res.send(ms);
          }
          });
        }
else{
  res.send('err');
}
});

app.get('/correction',function(req,res){
  if(req.session&&req.session._id)
 {
  counter_teamlists.remove({});
  counter_users.update({_id:req.session._id},{$set:{friendstore:[]}},function(err,done){
    if(err){
      res.send(err);
    }
    else {
      res.redirect('/counter');
    }
  });}
  else{
    res.send('boo');
  }
});

app.post('/newuser',function(req,res){
    //var reload = req.body.reload;
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect'; 
    var vp = req.body.p;
    var vpc = req.body.pc;
    var vmail = req.body.mail;
    if(validateEmail(vmail)&&vp===vpc)
    {
      console.log('\ndata ok\n')
    counter_users.findOne({mail:vmail},function (err,done_0){
      if(err)
        {
          ms.mtext='db';
         res.send(ms); 
        }
      else {
        if(!done_0)
    {var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
        var ms = {};
        // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
        // CHECK MAIL BEFOR WRTING
        //checkmail function was here before being moved out of scope
          counter_users.insert({mail:vmail,phr:vp,totallinks:0,last_item:0,friendstore:[],first_time:1,regdate:Date.now()},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          //counter_stats.update({$inc:{users:1}});
          var vuid = JSON.stringify(done._id).replace(/"/g,'').trim();
          console.log('vuid: '+vuid);
          counter_items.insert({uid:vuid,total:0,itemstore:[]});
          //counter_friends.insert({uid:vuid,total_fd:0,total_fl:0,friendstore:[],followers:[]});
          req.session._id=done._id;
          ms.trouble =0;
          ms.mtext='success';
          res.send(ms);
          }
          });}
          else{
            var ms={};
            ms.trouble=1;
             ms.mtext='email exists';
             res.send(ms); 
          }
        }
      });
    }
    else{
      ms.mtext='bad data';
      res.send(ms);
    }
    });

app.post('/counter/chcknck',function (req,res){
  var ms={};
  ms.mtext=0;
  if(req.body.nick&&is_nick(req.body.nick))
  {counter_users.findOne({nick:req.body.nick},function(err,confirmed){
      if (err)
        {res.send(ms);}
      else 
      {
        if(confirmed){
          res.send(ms);
        }
        else{
          ms.mtext=1;
          res.send(ms);
        }
      }
    });}
else {
  res.send(ms);
}
});

app.post('/counter/join_teamlist', function (req,res){
  var ms={};
  ms.trouble =1;
  console.log('req.body._id: '+req.body);
  if(req.session&&req.session._id&&req.body._id)
  { var v_id=new ObjectID(req.body._id);
    counter_teamlists.findOne({_id:v_id},function (err,done){
       if(err){
        console.log('bp1');
        res.send(ms);
      }
     else{
      console.log('bp2');
        counter_users.update({_id:req.session._id},{$push:{teamlists:{_id:done._id,list_name:done.list_name}}},function (err1,done1){
        if(err1){
          console.log('bp3');
          res.send(ms);
        }
          else{
            counter_teamlists.update({_id:done._id},{$push:{users:req.session._id}});
            console.log('success joining teamlist: '+done1);
            ms.trouble=0;
            res.send(ms);
          }
      });
        }
    });
  }
  else{
    console.log('bp4');
  res.send(ms);
  }
});

app.post('/counter/get_nick',function (req,res){
  var ms={};
  ms.trouble =1;
  ms.mtext;
  console.log('_id: '+req.body._id);
  if(req.session&&req.session._id)
  {var v_id = new ObjectID(req.body._id);
    counter_users.findOne({_id:v_id},function(err,user){
      if (err)
        {console.log('bp3');
          res.send(ms);}
      else 
      {
        if(user){
          ms.trouble=0;
          ms.mtext=user.nick
          res.send(ms);
        }
        else{
          console.log('bp1');
          res.send(ms);
        }
      }
    });}
else {
  console.log('bp2');
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
  counter_users.findOne({mail:vlgn},function(err,confirmed){
    if (err)
      {res.send(ms);}
    else 
    {
      if (confirmed)
      {console.log('we have found :'+JSON.stringify(confirmed));
          if(bcrypt.compareSync(vphr,confirmed.phr))
          {
          req.session._id = confirmed._id;
          if(confirmed.nick){
            req.session.nick = confirmed.nick;
          }
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





//******************** HELPERS ********************//


//app.get('/see:items',function (req,res){
//  switch(req.params.items){
//    case('items'):
//  items.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//  case('m'):
//  misc.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//  case('b'):
//  business.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//  case('ic'):
//  concepts.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//  case('q'):
//  questions.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//  case('user'):
//  users.find({},function (err,done){
//    if(err){
//
//    }
//    else {
//      res.send(done);
//    }
//  });
//  break;
//}
//});


//app.get('/clearitems',function (req,res){
//  concepts.remove({});
//  business.remove({});
//  misc.remove({});
//  items.remove({});
//  res.redirect('/');
//});


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