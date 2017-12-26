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

var db = require('monk')('localhost/tav'),counter_users = db.get('counter_users'),counter_invite = db.get('counter_invite'), counter_teamlists = db.get('counter_teamlist'),counter_items = db.get('counter_items'),counter_stats = db.get('counter_stats'),counter_books = db.get('counter_books'),counter_movies = db.get('counter_movies'),counter_friends = db.get('counter_friends'),counter_current = db.get('counter_current'),counter_web = db.get('counter_web'),ltps_posts = db.get('ltps_posts'),ltps_users = db.get('ltps_users');

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
  domain:'teamlists.space'
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





app.get('/settings',function (req,res) {
  res.render('counter_settings');
});


//-----------------test-----------------//

app.get('/update_users',function (req,res){
  counter_users.update({_id:req.session._id},{$set:{'teamlists':[]}},function(err,done){
    if(err){
      console.log('err updating users: '+err);}
      else{
        console.log('update users success');
        console.log('done: '+done)
        res.redirect('/');
      }
    
  });
});

app.get('/',function (req,res){
  if(req.session&&req.session._id)
 {console.log(req.session);
  if(req.session.nick){
    //res.render('index_counter_comb',{'_id':req.session._id,'nick':req.session.nick});
    console.log('MAIN ROUTE: friendstore'+JSON.stringify(req.session.friendstore));
    if(!req.session.friendstore||req.session.friendstore.length<1)
      {req.session.friendstore=0;}
    //res.render('index_counter_comb_09:17',{'_id':req.session._id,'nick':req.session.nick,'friendstore':JSON.stringify(req.session.friendstore)});
    res.render('index_rewrite',{'_id':req.session._id,'nick':req.session.nick,'friendstore':JSON.stringify(req.session.friendstore)});
  }
  else{
    if(!req.session.friendstore||req.session.friendstore.length<1)
      {req.session.friendstore=0;}
  //res.render('index_counter_comb',{'_id':req.session._id,'nick':0});
  //res.render('index_counter_comb_09:17',{'_id':req.session._id,'nick':0,'friendstore':JSON.stringify(req.session.friendstore)});
  res.render('index_rewrite',{'_id':req.session._id,'nick':0,'friendstore':JSON.stringify(req.session.friendstore)});
}}
 else {
  console.log(' MAIN REQUEST FROM '+req.ip);
  res.render('counter_index_login');
 }
 //res.render('index_counter_out');
});


app.get('/session/:session',function (req,res){
  if(req.params.session==='give'||req.params.session==='clean')
  {if(req.params.session==='give') {
      req.session._id = 1;
      console.log(req.session._id);
      res.send('done');
    }
    if(req.params.session==='clean') {
      delete req.session._id;
      res.redirect('/');
    }}
    else {
res.redirect('/');
    }
});


app.get('/setfirsttime',function (req,res){
  counter_users.update({},{$set:{first_time:1}},function (err,done){
    res.send(done);
});
});

app.post('/greeting/:_id',function (req,res){
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

app.post('/getshowmail/:_id',function (req,res){
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

app.post('/setshowmail',function (req,res){
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

app.post('/get_teamlist',function (req,res){
   var ms ={};
   ms.trouble=1;
   if(req.session&&req.session._id&&req.body._id){
      //var list_id = new ObjectID(req.body._id);
      counter_teamlists.findOne({_id:new ObjectID(req.body._id)},function (err,done){
           if(err){
            console.log('GET_TEAMLISTS: DB query err - '+err);
             res.send(ms);
           }
           else{
             if(done)
             {ms.trouble=0;
              console.log('GET_TEAMLISTS done: '+JSON.stringify(done));
             ms.doc=done;
             res.send(ms);}
             else {
              console.log('GET_TEAMLISTS: !done ');
               res.send(ms);
             }
           }
         });
   }
     else{
      console.log('GET_TEAMLISTS: req problem ');
       res.send(ms);
     }
});

app.post('/gn/:_id',function (req,res){
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


app.get('/friends_in',function (req,res){
  res.render('index_in_friend');
});

app.get('/friends_out',function (req,res){
  res.render('index_out_friend');
});


app.get('/web_init',function (req,res){
  if(req.session&&req.session._id)
  {counter_web.insert({uid:req.session._id,total:0,weblinkstore:[]});
    res.redirect('/current');}
    else {
      res.redirect('/');
    }
});

app.post('/setnick',function (req,res){
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

app.get('/profile/:_id',function (req,res){
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


app.post('/getteamlists',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id)
  {counter_users.findOne({_id:new ObjectID(req.session._id)},function(err,doc){
    if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        console.log('TEAMLISTS: '+JSON.stringify(doc));
        ms.doc = doc.teamlists;
        ms.last_list = doc.last_list;
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


app.post('/getitems',function (req,res){
  var ms ={};
  ms.trouble=1;
  //var vuid = req.body._id.replace(/"/g,'').trim();
  //console.log('vuid: '+vuid);
  if(req.session&&req.session._id)
  {
    //var temp_id=req.body&&req.body._id&&req.body._id.length>1?new ObjectID(req.body._id):req.session._id;
    var temp_id=new ObjectID(req.body._id);
    console.log('GETITEMS temp_id: '+temp_id);
    console.log('GETITEMS typeof: '+typeof temp_id);
    counter_teamlists.findOne({_id:temp_id},function(err,doc){
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
        console.log('GETITEMS hey 2: '+doc);
        res.send(ms);
      }
    });}
else{
   console.log('hey 1');
   res.send(ms);
}
});

app.post('/getlistname',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session._id&&req.body.list_id)
  {
    var temp_id=typeof req.body.list_id === 'string'?new ObjectID(req.body.list_id):req.body.list_id;
    counter_teamlists.findOne({'_id':temp_id},function(err,doc){
      if(err) {
        console.log('GETLISTNAME: DB query err - '+err);
        res.send(ms);
      }
      else if(doc!=null){
        //console.log(doc);
        ms.doc = doc;
        ms.trouble=0;
        res.send(ms);
      }
      else {
        console.log('GETLISTNAME doc is null : '+doc);
        res.send(ms);
      }
    });}
else{
   console.log('GETLISTNAME req problem');
   res.send(ms);
}
});


app.post('/getfriends',function (req,res){
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

app.post('/getfl',function (req,res){
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


app.post('/rm_item/',function(req,res){
  //add user verification
  var ms = {};
  ms.trouble =1;
  var vtitle = req.body.item_title;
  var vtmstmp= parseInt(req.body.item_tmstmp);
  var teamlist = parseInt(req.body.teamlist);
  var v_id=req.session._id;
  v_id=new ObjectID(req.body.teamlist_id);
  console.log('RM_ITEM: removing: '+vtitle+','+vtmstmp);
  if(req.session&&req.session._id)
  {
  counter_teamlists.update({_id:v_id},{$pull:{itemstore:{item_title:vtitle,tmstmp:vtmstmp}},$inc:{total:-1}},function (err,done){
    if(err)
    {
      console.log('RM_ITEM: TEAMLIST trouble removing a item\n'+err);
      res.send(ms);
    }
      else{
        ms.trouble=0;
        res.send(ms);
      }
     });
 //-----// 
}
  else {
    res.send(ms);
  }
});


app.post('/rd_item/',function(req,res){
  // add user verification
  var ms = {};
  ms.trouble =1;
  var vtitle = req.body.item_title;
  var vcomment = req.body.item_comment;
  var vlink = req.body.item_link;
  if(vlink&&vlink!='--'){
    vlink=addhttp(vlink);
  }
  var vtags=req.body.item_tags.trim();
  if(vtags)
     {console.log('RD_ITEM: has tags: '+req.body.item_tags);
       vtags=req.body.item_tags.split(',');
       vtags.forEach(function (element, index){
     vtags[index]=trim1(element).toLowerCase();
   });
     }
  var v_index = req.body.v_index;
  var vtmstmp= parseInt(req.body.item_tmstmp);
  console.log('RD_ITEM:redacting: '+vtitle+',\n comment:'+vcomment+',\n link:'+vlink+',\n tags:'+vtags+',\n timestamp:'+vtmstmp+',\n teamlist:'+teamlist);
  if(req.session&&req.session._id&&vtmstmp)
  {
  var v_id=new ObjectID(req.session._id);
  console.log('RD_ITEM: redacting an item from a teamlist');
  v_id=new ObjectID(req.body.teamlist_id);
  console.log('RD_ITEM: _id is:'+v_id+',\n session: '+req.session._id+',\n type:'+typeof v_id);
  //---------//
  counter_teamlists.findOne({_id:v_id},function (err,done){
  if(err)
  {
    console.log('RD_ITEM: TEAMLIST trouble finding a list by _id\n'+err);
    res.send(ms);
  }
    else{
      console.log('RD_ITEM: TEAMLIST found a profile: '+JSON.stringify(done));
      //--------------//
      if(done&&done.itemstore){
        var itemstore_length = done.itemstore.length;
        console.log('RD_ITEM: TEAMLIST has an itemstore, length: '+itemstore_length);
        for(var i =0;i<itemstore_length;i++){
          console.log(done.itemstore[i].tmstmp+'  :  '+vtmstmp);
         if (parseInt(done.itemstore[i].tmstmp) == vtmstmp){
              console.log('RD_ITEM: TEAMLIST found to redact: '+done.itemstore[i].item_title);
              done.itemstore[i].item_title = vtitle;
              done.itemstore[i].item_comment = vcomment;
              done.itemstore[i].item_link = vlink;
              done.itemstore[i].item_tags = vtags;
              counter_teamlists.update({_id:v_id},{$set:{itemstore:done.itemstore}},function (err2,done2){
                 if(err2){
                   console.log(err2);
                   console.log('RD_ITEM: TEAMLIST – trouble 1');
                 res.send(ms);
                 }
                   else{
                    console.log('RD_ITEM: TEAMLIST – everything is good');
                  ms.trouble=0;
                 res.send(ms);
                   }
        });
            }
      }
    }
  }
   });
  //---------//
}
  else {
    console.log('RD_ITEM: TEAMLIST – trouble 3');
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




app.post('/addfriend',function (req,res){
  if(req.session&&req.session._id&&req.body._id)
 {var ms={};
  ms.trouble=1;
  console.log('adding a friend: '+req.body._id);
  //console.log(JSON.stringify(req.session._id).replace(/"/g,'').trim());
  //console.log(req.body._id.toString());
  var u_id= new ObjectID(req.session._id);
  counter_users.update({_id:u_id},{$push:{friendstore:req.body._id}},function (err,done){
    if(err){
      console.log('err adding a friend');
      res.send(ms);}
      else {
        //console.log('adding a friend: '+JSON.stringify(done));
        if(req.session.friendstore!=0)
          {
            req.session.friendstore.push(req.body._id);
          }
        else{
         req.session.friendstore=[];
         req.session.friendstore.push(req.body._id);
        }
        ms.trouble=0;
        res.send(ms);
      }
  });
 }       
      else {
        res.send('err');
      }   
});

app.get('/clearfr',function (req,res){
  counter_users.update({_id:req.session._id},{friendstore:[]},function(err,done){
    if(err){
      console.log('say hello');
    }
    else{
      req.session.friendstore=[];
      res.redirect('/');
    }
  });
});

  
function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

app.post('/additem',function (req,res){
  //req:
  //--item_title
  //--list_id
  //--item_link
  //--item_comment
  //--item_tags
  if(req.session&&req.session._id)
 {       console.log('adding an item');
          var ms = {};
          ms.trouble =1;
            var list_id=new ObjectID(req.body.list_id);
            var vtitle = req.body.item_title.replace(/\s{2,}/g,' ').trim();
            var vlink = req.body.item_link;
            console.log('breakpoint one');
            var vcomment = req.body.item_comment;
            var vtags;
            if(req.body.item_tags)
              {console.log('ADDITEM: has tags: '+req.body.item_tags);
               console.log('ADDITEM: typeof tags: '+typeof req.body.item_tags);
                if(typeof req.body.item_tags === 'string'){vtags=req.body.item_tags.split(',');}
                else{vtags=req.body.item_tags;}
                console.log('ADDITEM: vtags: '+vtags);
                vtags.forEach(function (element, index){
              vtags[index]=trim1(element);
            });
              }
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
            counter_teamlists.update({_id:list_id},{$push:{itemstore:{item_comment:vcomment,item_title:vtitle,item_link:vlink,item_tags:vtags,regdateint:fulldate,tmstmp:vtmstmp}},$inc:{total:1}},function(err,done){
            console.log(done);
            //console.log(err);
            if(err){
              console.log('ADDITEM TEAMLIST DB ERR');
              res.send(ms);
            }
              else{
                ms.trouble=0;
                ms.date=vtmstmp;
                res.send(ms);
              }
          });
          
          console.log('breakpoint five');
          //console.log('item added');
          }       
      else {
        res.send('err');
      }   
});

//app.get('/cleanweb',function (req,res){
//  if(req.session&&req.session._id){
//   counter_movies.update({uid:req.session._id},{$unset:{weblinkstore:1}});
//  }
//  else{
//    res.redirect('/');
//  }
//});

app.post('/invite',function (req,res){
  //prevent double invites
   var ms = {};
       ms.trouble =1;
    if(req.session&&req.session._id&&req.body.list_id&&req.body.friends_id&&req.body.list_name)
   { 
      counter_invite.update({uid:new ObjectID(req.body.friends_id)},{$push:{invitationstore:{_id:new ObjectID(req.body.list_id),list_name:req.body.list_name}}},function(err,done){
        if(err){
         console.log('INVITE: db err '+err);
         res.send(ms);
        }
        else{
          ms.trouble=0;
          res.send(ms);
        }
      });  }       
      else {
        console.log('INVITE: err ');
        res.send(ms);
      }   
});

app.post('/check_invite',function (req,res){
   var ms = {};
       ms.trouble =1;
       ms.mtext ;
    if(req.session&&req.session._id)
   { 
      counter_invite.findOne({uid:new ObjectID(req.session._id)},function(err,done){
        console.log('CHECK INVITE: done '+JSON.stringify(done));
        if(err){
         res.send(ms);
        }
        else{
          if(done&&done.invitationstore&&done.invitationstore.length>0){
            ms.mtext=done.invitationstore;
            ms.trouble=0;
            res.send(ms);
          }
          else{
            res.send(ms);
          }
        }
      });  }       
      else {
        res.send(ms);
      }   
});

app.post('/confirm_invite',function (req,res){
   var ms = {};
       ms.trouble =1;
       ms.mtext ;
    if(req.session&&req.session._id&&req.body.list_id)
   { 
      var temp_id=typeof req.body.list_id === 'string'?new ObjectID(req.body.list_id):req.body.list_id;
      counter_invite.update({uid:new ObjectID(req.session._id)},{$pull:{invitationstore:{'_id':temp_id}}},function (err,done){
        if(err){
         res.send(ms);
        }
        else{
          counter_users.update({_id:new ObjectID(req.session._id)},{$push:{teamlists:temp_id}},function (err1,done1){
            if(err){
               res.send(ms);
              }
              else{
                  counter_teamlists.update({_id:temp_id},{$push:{users:req.session._id}},function (err1,done1){
            if(err){
               res.send(ms);
              }
              else{
                console.log('CONFIRM INVITE done: '+done1);
                 ms.trouble=0;
                 res.send(ms);
              }
            });
              }
          });
        }
      });
      }       
      else {
        res.send(ms);
      }   
});

app.post('/decline_invite',function (req,res){
   var ms = {};
       ms.trouble =1;
       ms.mtext ;
    if(req.session&&req.session._id&&req.body.list_id)
   { 
      counter_invite.update({uid:new ObjectID(req.session._id)},{$pull:{invitationstore:{'_id':new ObjectID(req.body.list_id)}}},function (err,done){
        if(err){
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

app.post('/set_last_list',function (req,res){
   var ms = {};
       ms.trouble =1;
       ms.mtext ;
    if(req.session&&req.session._id&&req.body.list_id)
   { 
      counter_users.update({_id:new ObjectID(req.session._id)},{$set:{last_list:new ObjectID(req.body.list_id)}},function (err,done){
        if(err){
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

app.post('/backup',function (req,res){
  if(req.session&&req.session._id)
  { var json = {};
     var _id=new ObjectID(req.session._id);
     counter_items.findOne({uid:_id},function (err,doc){
            if(err){
               console.log('ERR WHILE BACKUP REQUEST');
               console.log(err3);
             }
             else 
           {
            json.items={};
            json.items.itemstore=doc.itemstore;
            json.teamlists = doc.teamlists;
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
            var filename = 'TEAMLISTS_backup_'+date+'.json'; // or whatever
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

app.get('/tabak',function (req,res){
   counter_users.update({"_id":new ObjectID(req.session._id)},{$set:{"teamlists":[new ObjectID("59d6743979005c1d15000001")]}},function (err1,done1){
       res.redirect('/');
   });
});

app.get('/eval/:eval',function (req,res){
   eval(req.params.eval);
   res.redirect('/');
});


app.post('/restore',function (req,res){
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
         counter_items.update({uid:new ObjectID(req.session._id)},{$set:{itemstore:data.items.itemstore,teamlists:data.teamlists}},function (err,done){
           if(err){
            console.log('err');
           }
           else {
              console.log('breakpoint 5');
              fs.unlink(oldPath, function(){
                //if(err) throw err;
                if(err) console.log(err);
                res.redirect('/');
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



app.get('/logout',function (req,res){
  req.session.reset();
  res.redirect('/');
});

app.get('/showusers',function (req,res){
  counter_users.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

app.get('/showinvites',function (req,res){
  counter_invite.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

app.get('/showteamlists',function (req,res){
  counter_teamlists.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});

app.get('/showitems',function (req,res){
  counter_items.find({},function(err,done){
      res.send(JSON.stringify(done));
    });
});


app.get('/showme',function (req,res){
  counter_users.findOne({_id:new ObjectID(req.session._id)},function(err,done){
    counter_invite.findOne({uid:new ObjectID(req.session._id)},function(err,done1){
        counter_items.findOne({uid:new ObjectID(req.session._id)},function(err,done2){     
       res.send('<br><b>SESSION:</b><br>'+req.session._id+'<br><b>USERS:</b><br>'+JSON.stringify(done)+'<br><b>INVITE:</b><br>'+JSON.stringify(done1)+'<br><b>ITEMS:</b><br>'+JSON.stringify(done2));    
      });
    });
  });
});

app.get('/logout',function (req,res){
  delete req.session._id;
  delete req.session.nick;
  res.redirect('/');
});

app.get('/testdb',function (req,res){
  counter_books.findOne({uid:"57e815540825521938000001"},function(err,done){
    res.send(done);
  });
});

function validateEmail(email) { 
        console.log('checking email');
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);} 

app.post('/leave_list',function (req,res){
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var v_id= new ObjectID(req.body._id);
    if(req.session&&req.session._id&&v_id)
 { 
   counter_users.findOne({_id:req.session._id},function (err,done){
    if(err){

    }
    else{
      if(done.teamlists.length>1){
        var temp_last_list;
        if(done.teamlists[0]!=v_id){
          temp_last_list=temp_lists_arr[0];
        }
        else{
          temp_last_list=temp_lists_arr[1];
        }
       counter_users.update({_id:new ObjectID(req.session._id)},{$pull:{teamlists:v_id},$set:{last_list:temp_last_list}});
         ms.trouble=0;
         res.send(ms);
      }
      else{
        counter_users.update({_id:new ObjectID(req.session._id)},{$pull:{teamlists:v_id},$set:{last_list:0}});
         ms.trouble=0;
         res.send(ms);
      }
    }
   });
   //counter_users.update({_id:new ObjectID(req.session._id)},{$pull:{teamlists:v_id}});
   //ms.trouble=0;
   //res.send(ms);
 }
else {
  res.send('RMTEAMLIST: err');
}
});

app.post('/rmteamlist',function (req,res){
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var v_id= new ObjectID(req.body._id);
    if(req.session&&req.session._id&&v_id)
 {
   counter_teamlists.findOne({_id:v_id},function (err,done){
    if(err){
      console.log('RMTEAMLIST: DB err');
      res.send(ms);
    }
      else{
        if(done._id&&done.admin===req.session._id) {
           counter_teamlists.remove({_id:v_id});
           counter_users.update({_id:new ObjectID(req.session._id)},{$pull:{teamlists:v_id}});
            ms.trouble=0;
            res.send(ms);
        }
        else{
          console.log('RMTEAMLIST: low privileges teamlist remove attempt');
         res.send(ms);
        }
      }
   });
 }
else {
  res.send('RMTEAMLIST: err');
}
});

app.post('/rm_friend',function (req,res){
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var v_id=req.body._id;
    if(req.session&&req.session._id&&v_id)
 {
   console.log('RMFRIEND: session: '+req.session._id+',\n friends ID: '+v_id);
   counter_users.update({_id:req.session._id},{$pull:{friendstore:v_id}},function (err,done){
    if(err){
      console.log('RMFRIEND: DB err');
    }
    else {
      var temp_arr=[];
      req.session.friendstore.forEach(function (elem,index){
        if(elem!=v_id){
          temp_arr.push(elem);
        }
      });
      req.session.friendstore = temp_arr;
      console.log('RMFRIEND: done: '+done);
      ms.trouble=0;
      res.send(ms);
    }
   });
 }
else {
  console.log('RMFRIEND: err');
  res.send(ms);
}
});


app.post('/newteamlist',function (req,res){
  var ms = {};
    ms.trouble=1;
    ms.mtext='trouble'; 
    var vteamlistname = req.body.teamlistname;
    //var vmail = req.body.mail;
    if(req.session&&req.session._id&&vteamlistname)
 {
   counter_teamlists.insert({list_name:vteamlistname,totallinks:0,last_item:0,create_date:Date.now(),admin:req.session._id,users:[req.session._id]},function (err,done){
            if(err)
            {
              ms.mtext='db';
             res.send(ms); 
            }
          else {
               counter_users.findOne({_id:req.session._id},function (err,done_0){
                if(err)
                  {
                    ms.mtext='db';
                   res.send(ms); 
                  }
                else {
                  //counter_items.insert({uid:done._id,total:0,itemstore:[]});
                  counter_users.update({_id:req.session._id},{$push:{teamlists:done._id},$set:{last_list:done._id}},function (err,done_1){
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
  console.log('NEWTEAMLIST err');
  res.send('err');
}
});

app.get('/correction',function(req,res){
  if(req.session&&req.session._id)
 {
  //counter_teamlists.remove({});
  counter_users.update({_id:req.session._id},{$set:{friendstore:[],teamlists:[]}},function(err,done){
    if(err){
      res.send(err);
    }
    else {
      console.log('CORRECTION: '+JSON.stringify(done));
      res.redirect('/');
    }
  });}
  else{
    res.send('boo');
  }
});

app.get('/clear_teamlists',function(req,res){
  if(req.session&&req.session._id)
 {
  //counter_teamlists.remove({});
  counter_users.update({_id:req.session._id},{$set:{teamlists:[]}},function(err,done){
    if(err){
      res.send(err);
    }
    else {
      console.log('CLEAR_TEAMLISTS: '+JSON.stringify(done));
      res.redirect('/');
    }
  });}
  else{
    res.send('boo');
  }
});


app.get('/quick_correction_v2',function(req,res){
  if(req.session&&req.session._id)
 {
  //counter_teamlists.remove({});
  counter_invite.remove({uid:new ObjectID(req.session._id)});
  counter_invite.insert({uid:new ObjectID(req.session._id),invitationstore:[]});
  res.redirect('/');
}
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
        //var vuid = new ObjectID('592c0f45e3e371e70f000001');
          counter_users.insert({mail:vmail,phr:vp,totallinks:0,last_item:0,last_list:0,friendstore:[],first_time:1,regdate:Date.now()},function (err,done){
            if(err)
            {
              console.log('db: '+err);
              ms.mtext='db';
             res.send(ms); 
            }
          else {
          //counter_stats.update({$inc:{users:1}});
          //var vuid = JSON.stringify(done._id).replace(/"/g,'').trim();
          //console.log('vuid: '+vuid);
          counter_invite.insert({uid:done._id,invitationstore:[]});
          //counter_friends.insert({uid:vuid,total_fd:0,total_fl:0,friendstore:[],followers:[]});
          req.session._id=done._id;
          req.session.friendstore=[];
          ms.trouble =0;
          console.log('success');
          ms.mtext='success';
          res.send(ms);
          }
          });}
          else{
            var ms={};
            ms.trouble=1;
            console.log('email exists');
             ms.mtext='email exists';
             res.send(ms); 
          }
        }
      });
    }
    else{
      console.log('bad data');
      ms.mtext='bad data';
      res.send(ms);
    }
    });

app.post('/chcknck',function (req,res){
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


app.post('/get_nick',function (req,res){
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
          req.session.friendstore = confirmed.friendstore;
          //counter_invite.insert({uid:confirmed._id,invitationstore:[]});
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

app.get('/ins_t',function (req,res){
  counter_teamlists.insert({"_id":"59d6743979005c1d15000002","itemstore":[{"item_comment":"--","item_title":"Dunhill De Luxe Navy Rolls","item_link":"http://www.mirtabaka.net/Tabak-dlya-trubki-dunhill-luxe-navy-rolls-p-17338.html","item_tags":["dunhill"],"regdateint":20171005,"tmstmp":1507226739871},{"item_comment":"Сигарный","item_title":"","item_link":"http://www.mirtabaka.net/Tabak-dlya-trubki-mcclelland-dominican-glory-p-22531.html","item_tags":["mcclelland","ribbon"],"regdateint":20171005,"tmstmp":1507226861686},{"item_comment":"Чёрный Кавендиш и Вирджиния дымовой сушки смешиваются для создания «Свежего яблока». Сладкий, «хрустящий» вкус со свежим ароматом фруктового сада.","item_title":"","item_link":"http://www.mirtabaka.net/Tabak-dlya-trubki-mcclelland-fresh-apple-p-24385.html","item_tags":["mcclelland","ribbon"],"regdateint":20171005,"tmstmp":1507226912847},{"item_comment":"--","item_title":"Capstan Gold Flake","item_link":"","item_tags":["capstan","flake"],"regdateint":20171007,"tmstmp":1507397943940},{"item_comment":"--","item_title":"Davidoff Flake Medaillons","item_link":"","item_tags":["davidoff","flake"],"regdateint":20171007,"tmstmp":1507398732565},{"item_comment":"--","item_title":"","item_link":"","item_tags":["dunhill","flake"],"regdateint":20171007,"tmstmp":1507398897181},{"item_comment":"--","item_title":"Petersen & Sorensen The Squire’s 50 гр","item_link":"--","item_tags":["Petersen & Sorensen"],"regdateint":20171007,"tmstmp":1507399311987},{"item_comment":"Может быть ароматизированным","item_title":"Rattray's Malcolm Flake - 50гр","item_link":"--","item_tags":["Rattray's"],"regdateint":20171007,"tmstmp":1507399438006},{"item_comment":"ароматизатор – ром","item_title":"Robert McConnell Scottish Flake","item_link":"--","item_tags":["Robert McConnell"],"regdateint":20171007,"tmstmp":1507399528368},{"item_comment":"--","item_title":"Peterson Irish Flake","item_link":"--","item_tags":["Peterson"],"regdateint":20171007,"tmstmp":1507399713742},{"item_comment":"Похож на peterson irish flake","item_title":"Rattray's Stirling Flake - 50гр","item_link":"","item_tags":["rattray's"],"regdateint":20171007,"tmstmp":1507399742126},{"item_comment":"--","item_title":"Petersen & Sorensen Waterloo No.2 Mixture 50 гр","item_link":"--","item_tags":["Petersen & Sorensen"],"regdateint":20171007,"tmstmp":1507399909586},{"item_comment":"--","item_title":"Samuel Gawith Full Virginia Flake -50 гр","item_link":"--","item_tags":["Samuel Gawith"],"regdateint":20171007,"tmstmp":1507400233216},{"item_comment":"--","item_title":"Solani Aged Burley Flake - blend 656 50гр","item_link":"--","item_tags":["Solani"],"regdateint":20171007,"tmstmp":1507400459269},{"item_comment":"--","item_title":"Solani Red Label - blend 131 100 гр.","item_link":"--","item_tags":["Solani"],"regdateint":20171007,"tmstmp":1507400503806},{"item_comment":"--","item_title":"Solani Silver Flake - blend 660 100 гр.","item_link":"--","item_tags":["Solani"],"regdateint":20171007,"tmstmp":1507400556121},{"item_comment":"--","item_title":"Solani Virginia Flake - blend 633 50 гр","item_link":"--","item_tags":["Solani"],"regdateint":20171007,"tmstmp":1507400592773},{"item_comment":"ароматизирован яблоком","item_title":"Solani Green Label - blend 127 100 гр","item_link":"--","item_tags":["Solani"],"regdateint":20171007,"tmstmp":1507400630433},{"item_comment":"--","item_title":"A. G. Ruhtenberg Limited Edition - 100 гр","item_link":"","item_tags":["a. g. ruhtenberg","flake"],"regdateint":20171007,"tmstmp":1507401005386},{"item_comment":"--","item_title":"Capstan Original Flake - 50гр","item_link":"","item_tags":["capstan","flake"],"regdateint":20171007,"tmstmp":1507401103882},{"item_comment":"--","item_title":"McClelland Personal Reserve British Woods - 100 гр","item_link":"","item_tags":["mcclelland","ribbon"],"regdateint":20171007,"tmstmp":1507401136296},{"item_comment":"--","item_title":"McClelland Oriental Mixture №6 - 50 гр","item_link":"--","item_tags":["McClelland","ribbon"],"regdateint":20171007,"tmstmp":1507401210055},{"item_comment":"--","item_title":"McClelland Dominican Glory - 100 гр","item_link":"--","item_tags":["McClelland","ribbon"],"regdateint":20171007,"tmstmp":1507402954018}],"total":23,"admin":new ObjectID("59e5257fa86e6c3c6a000001"),"users":[new ObjectID("59e5257fa86e6c3c6a000001")],"create_date":1507226739860,"list_name":"Tobacco"},function (err,done){
    if(err){
      res.send('ins_t err');
    }
      else{
        res.redirect('/ins_t_2');
      }
  });
});

app.get('/ins_t_2',function (req,res){
  counter_users.update({_id:req.session._id},{$push:{teamlists:new ObjectID("59d6743979005c1d15000002")}},function (err,done){
    if(err){
      res.send('ins_t_2 err');
    }
      else{
        res.redirect('/');
      }
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