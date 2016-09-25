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

var db = require('monk')('localhost/tav'),counter_users = db.get('counter_users'),counter_stats = db.get('counter_stats'),counter_books = db.get('counter_books'),counter_movies = db.get('counter_movies');

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



app.get('/test',function (req,res){
  items.findOne({user:req.session._id},function (err,done){
                  res.send(done);});
});

//-----------------test-----------------//

app.get('/counter',function (req,res){
  if(req.session&&req.session.uid)
 {console.log(req.session);
  res.render('index_in');}
 else {
  res.render('counter_index_login');
 }
 //res.render('index_counter_out');
});

app.get('/counter/session/:session',function (req,res){
  if(req.params.session==='give') {
    req.session.uid = 1;
    console.log(req.session.uid);
    res.send('done');
  }
  if(req.params.session==='clean') {
    req.session delete;
    res.redirect('/counter');
  }
});

app.get('/counter/p3345',function (req,res){
  res.render('index_in');
});

app.get('/counter/p3345/b',function (req,res){
  res.render('index_in_b');
});

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

app.get('/counter/deletemovies',function (req,res){
  movies.remove({},function(err,done){
  stats.update({queryhook:'stats'},{$set:{newmovies:0,totalmovies:0,seenmovies:0}});
    res.redirect('/counter/initdb');
  });
});

app.post('/counter/getmovies',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session.uid)
  {movies.find({uid:req.session.uid},function(err,doc){
      if(err) {
        console.log('ERR WHILE MOVIES QUERY');
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
    });}
else{
   res.send(ms);
}
});

app.post('/counter/getbooks',function (req,res){
  var ms ={};
  ms.trouble=1;
  if(req.session&&req.session.uid)
  {books.find({uid:req.session.uid},function(err,doc){
      if(err) {
        console.log('ERR WHILE MOVIES QUERY');
        res.send(ms);
      }
      else if(doc!=null){
        ms.doc = doc.bookstore;
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

app.post('/counter/getstat',function (req,res){
  var ms ={};
  ms.trouble=1;
  stats.find({},function(err,doc){
    if(err) {
      console.log('ERR WHILE STATS QUERY');
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

app.post('/counter/rm_movie/:newmovie/:movie_id',function(req,res){
  var ms = {};
  ms.trouble =1;
  var vmovie_id = req.params.movie_id;
  var vnewmovie = req.params.newmovie;
  if(vmovie_id) {
    movies.remove({_id:vmovie_id},function(err,done){
      if(err) {
        res.send(ms);
      }
      else {
        if(vnewmovie)
        {stats.update({queryhook:'stats'},{$inc:{newmovies:-1,totalmovies:-1}});}
        else {
         stats.update({queryhook:'stats'},{$inc:{seenmovies:-1,totalmovies:-1}});
        }
        res.send(ms);
      }
    });
  }
  else {
    res.send(ms);
  }
});

app.post('/counter/switch_clmn/:movie_id',function(req,res){
  var ms = {};
  ms.trouble =1;
  var vmovie_id = req.params.movie_id;
  if(vmovie_id) {
    movies.findOne({_id:vmovie_id},function(err,done){
      if(err) {
        res.send(ms);
      }
      else {
        var set_var = parseInt(done.newmovie)?0:1;
        movies.update({_id:vmovie_id},{$set:{newmovie:set_var}},function(err,done2){
         if(err) {
           res.send(ms);
         }
         else {
           if(done.newmovie)
           {stats.update({queryhook:'stats'},{$inc:{newmovies:-1,seenmovies:1}});}
           else {
            stats.update({queryhook:'stats'},{$inc:{seenmovies:-1,newmovies:1}});
           }
           ms.trouble=0;
           ms.present_clmn=set_var;
           console.log('hey');
           res.send(ms);
         }
    });
      }
    });
  }
});
  
app.post('/counter/addmovie',function(req,res){
 console.log('adding a movie');
  var ms = {};
  ms.trouble =1;
 
    var vmovietitle = req.body.movietitle;
    var vnewmovie = parseInt(req.body.newmovie);
    console.log('breakpoint one');
    var vmovieyear = req.body.year;
    var vmoviestar = parseInt(req.body.star);
    console.log('ADDING A movie: movietitle:'+vmovietitle+' ,year: '+vmovieyear+' ,star: '+vmoviestar+' , newmovie'+vnewmovie);
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
    var vyear = dd.getUTCFullYear().toString();
    var fulldate = vyear+vmonth+vday;
    fulldate = parseInt(fulldate);

    if(!vmovietitle){
      vmovietitle = '--';
      //SEND ERROR
    }
    if(!vmovieyear){
      vvmovieyear = '--';
    }
  var vtmstmp = Date.now();
  movies.insert({year:vmovieyear,movietitle:vmovietitle,newmovie:vnewmovie,star:vmoviestar,regdateint:fulldate,tmstmp:vtmstmp});
  if(vnewmovie)
  {stats.update({queryhook:'stats'},{$inc:{newmovies:1,totalmovies:1}});}
  else {
   stats.update({queryhook:'stats'},{$inc:{seenmovies:1,totalmovies:1}});
  }
   res.send('ok');         
             
});

app.post('/backup',function (req,res){
  { var json = [];
     movies.find({},function (err,doc2){
        if(err){
           console.log('ERR WHILE BACKUP REQUEST');
           console.log(err2);
         }
         else 
       {
         doc2.forEach(function(element,index){
          json.push(element);
         });
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
         var filename = 'Movies_backup_'+date+'.json'; // or whatever
         var mimetype = 'application/json';
         res.setHeader('Content-disposition', 'attachment; filename=' + filename);
         res.setHeader('Content-type', mimetype);
         res.write(JSON.stringify(json));
         res.end();
       }
     });
    //res.redirect('/');
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
 // if(req.session._id){      
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
         data.forEach(function(element,index){
           console.log('breakpoint loop');
          movies.insert({year:element.year,movietitle:element.movietitle,newmovie:element.newmovie,star:element.moviestar,regdateint:element.regdateint,tmstmp:element.tmstmp});
          if(element.newmovie)
          {stats.update({queryhook:'stats'},{$inc:{newmovies:1,totalmovies:1}});}
          else {
            stats.update({queryhook:'stats'},{$inc:{seenmovies:1,totalmovies:1}});
          }
         });
       }
        console.log('breakpoint 5');
      fs.unlink(oldPath, function(){
        //if(err) throw err;
        if(err) console.log(err);
        res.redirect('/counter');
       });
    });
 //  }
 // else {
 //   res.redirect('/');
 // }
});

//------------------test-------------------//


app.get('/',function(req,res) {
    var tmstmp=0;
    if(req.session.tmstmp)
    {console.log('setting last_visit');
      req.session.last_visit=req.session.tmstmp;
     req.session.tmstmp = Date.now();
    }
  else {
    console.log('NEW CLIENT');
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

//

app.post('/getitems_q',function (req,res){
  var ms ={};
  ms.trouble=1;
  questions.find({},function (err,doc){
    //console.log(doc);
    if(err) {
      console.log('ERR WHILE ITEMS_q QUERY');
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
  var tmstmp=0;
  if(req.session.tmstmp_ic)
    {console.log('setting last_visit');
      req.session.last_visit_ic=req.session.tmstmp_ic;
     req.session.tmstmp_ic = Date.now();
    }
  else {
    console.log('NEW CLIENT');
    req.session.tmstmp_ic = Date.now();
  }
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
               if(req.session.last_visit_ic)
                {tmstmp=req.session.last_visit_ic}
               res.render('ic_out',{'tmstmp':tmstmp});
                }
            else {
              if(done){
                res.render('ic');
              }
              else {
                if(req.session.last_visit_ic)
                {tmstmp=req.session.last_visit_ic}
                res.render('ic_out',{'tmstmp':tmstmp});
              }
            }
          });
});

app.get('/b',function (req,res){
  var tmstmp=0;
  if(req.session.tmstmp_b)
    {console.log('setting last_visit');
      req.session.last_visit_b=req.session.tmstmp_b;
     req.session.tmstmp_b = Date.now();
    }
  else {
    console.log('NEW CLIENT');
    req.session.tmstmp_b = Date.now();
  }
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
              if(req.session.last_visit_b)
                {tmstmp=req.session.last_visit_b}
               res.render('b_out',{'tmstmp':tmstmp});
                }
            else {
              if(done){
                res.render('b');
              }
              else {
                if(req.session.last_visit_b)
                {tmstmp=req.session.last_visit_b}
                res.render('b_out',{'tmstmp':tmstmp});
              }
            }
          });
});

app.get('/m',function (req,res){
  var tmstmp=0;
  if(req.session.tmstmp_m)
    {console.log('setting last_visit');
      req.session.last_visit_m=req.session.tmstmp_m;
     req.session.tmstmp_m = Date.now();
    }
  else {
    console.log('NEW CLIENT');
    req.session.tmstmp_m = Date.now();
  }
  users.findOne({_id:req.session._id},function (err,done){
            if(err){
               if(req.session.last_visit_m)
                {tmstmp=req.session.last_visit_m}
               res.render('m_out',{'tmstmp':tmstmp});
                }
            else {
              if(done){
                res.render('m');
              }
              else {
                if(req.session.last_visit_m)
                {tmstmp=req.session.last_visit_m}
                res.render('m_out',{'tmstmp':tmstmp});
              }
            }
          });
});

app.get('/a',function (req,res){
  res.render('a');
});

app.get('/q',function (req,res){
  res.render('q');
})

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

app.get('/counter/showusers',function (req,res){
  counter_users.find({},function(err,done){
    counter_books.find({},function(err,done1){
      counter_movies.find({},function(err,done2){
       res.send(done+'\n'+done1+'\n'+done2);
      });
    });
  });
});

app.post('/newuser',function(req,res){
    //var reload = req.body.reload;
    var ms = {};
    ms.trouble=1;
    ms.mtext='email incorrect'; 
    var vp = req.body.p;
    var vpc = req.body.pc;
    var vmail = req.body.mail;
    if(validatEmail(vmail)&&vp===pvc)
    {
      console.log('\ndata ok\n')
    }
    var vp = bcrypt.hashSync(req.body.p,bcrypt.genSaltSync(10));
    var ms = {};
    // MUST INCLUDE enquiries - all  - accepted WHEN WRITING TO THE DB
    // CHECK MAIL BEFOR WRTING
    //checkmail function was here before being moved out of scope
      counter_users.insert({mail:vmail,phr:vp,totallinks:0,last_item:0,regdate:Date.now()},function (err,done){
        if(err)
        {
          ms.mtext='db';
         res.send(ms); 
        }
      else {
      counter_stats.update({$inc:{users:1}});
      counter_books.insert({uid:done._id,total:0,oldones:0,newones:0,bookstore:[]});
      counter_movies.insert({uid:done._id,total:0,oldones:0,newones:0,moviestore:[]});
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
  users.findOne({mail:vlgn},function(err,confirmed){
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
  case('q'):
  questions.find({},function (err,done){
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
    case('q'):
    questions.count({},function (err,done){
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
      case('q'):
      console.log('removing a question');
      questions.remove({_id:req.body._id});
      res.send(ms);
      break;
  }
}
});


app.post('/edititem/:id',function (req,res){
  if(req.session && req.session._id ){
    //conditioning is left due to plans of bringing in a section of "terms", to be added the same way
  var cond = req.params.id; 
  var ms ={};
  switch(cond){
    case('link'):
    if(req.body.title){
    var vcomment = req.body.comment && req.body.comment!='0' ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
      items.update({_id:req.body._id},{$set:{title:req.body.title,link:vlink,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);}
      else {
      items.update({_id:req.body._id},{$set:{title:req.body.title,link:0,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while editing a link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('ic'):
    if(req.body.title && req.body.link ){
     // console.log(req.body);
      var vlink = req.body.link;
        vlink=addhttp(vlink);
     concepts.update({_id:req.body._id},{$set:{title:req.body.title,topic:req.body.topic,link:vlink}},function(err,done){
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
    case('m'):
    if(req.body.title){
    var vcomment = req.body.comment && req.body.comment!='0' ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
      misc.update({_id:req.body._id},{$set:{title:req.body.title,link:vlink,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);}
      else {
      misc.update({_id:req.body._id},{$set:{title:req.body.title,link:0,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while editing a link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('b'):
    if(req.body.title){
    var vcomment = req.body.comment && req.body.comment!='0'  ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
      business.update({_id:req.body._id},{$set:{title:req.body.title,link:vlink,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);}
      else {
      business.update({_id:req.body._id},{$set:{title:req.body.title,link:0,comment:vcomment}});
      ms.trouble=0;
      res.send(ms);
      }
    }
    else {
    console.log('data check fail while editing a link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('q'):
    if(req.body.title&&req.body._id){
      questions.insert({_id:req.body._id},{$set:{title:req.body.title}});
      ms.trouble=0;
      res.send(ms); 
    }
    else {
    console.log('data check fail while editing a question');
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



app.post('/additem/:id',function (req,res){
  if(req.session && req.session._id ){
    //conditioning is left due to plans of bringing in a section of "terms", to be added the same way
  var cond = req.params.id; 
  var ms ={};
  switch(cond){
    case('link'):
    console.log(req.body.title);
    //if(req.body.title&& is_title(req.body.title)&& req.body.link&& is_link(req.body.link) ){
    if(req.body.title){
    //var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link&& is_link(req.body.link))
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
        users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,nlinks:1}});
      items.insert({tmstmp:newdate,title:req.body.title,link:vlink,comment:vcomment});
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
    console.log('data check fail while adding a link');
    ms.trouble=1;
    res.send(ms);
    }
    break;
    case('ic'):
     if(req.body.title && req.body.link ){
      var vlink = req.body.link;
        vlink=addhttp(vlink);
      users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{concepts:1}});
     concepts.insert({title:req.body.title,link:vlink,topic:req.body.topic, tmstmp:Date.now()},function(err,done){
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
    if(req.body.title){
    //var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link)
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
        users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,blinks:1}});
      business.insert({tmstmp:newdate,title:req.body.title,link:vlink,comment:vcomment});
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
    if(req.body.title){
    //var newlink = parseInt(req.body.newlink);
    var newdate = Date.now();
    var vcomment = req.body.comment ? req.body.comment : 0;
    if(req.body.link)
      { var vlink = req.body.link;
        vlink=addhttp(vlink);
        users.update({_id:req.session._id},{$set:{last_item:newdate},$inc:{totallinks:1,mlinks:1}});
      misc.insert({tmstmp:newdate,title:req.body.title,link:vlink,comment:vcomment});
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
    case('q'):
    if(req.body.title){
    var newdate = Date.now();
    
      questions.insert({tmstmp:newdate,title:req.body.title});
      ms.trouble=0;
      res.send(ms); 
    }
    else {
    console.log('data check fail while adding an question');
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