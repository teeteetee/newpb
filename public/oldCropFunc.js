app.post('/userp/crop',function (req,res){
  console.log('INTO CROP');
  // Although duplicate check was implemented, if the new image has another extension it will fail, nothing major as soon as we will accept only two formats
  // resize is done with this ttps://github.com/EyalAr/lwip#resize, shit quality, needs to be tweaked or replaced
  console.log(req.body);
  if(req.session&&req.session.mail&&is_email(req.session.mail)&&req.session._id&&is_uid(req.session._id)&&req.body.x1&&is_multiple(req.body.x1)&&req.body.x2&&is_multiple(req.body.x2)&&req.body.y1&&is_multiple(req.body.y1)&&req.body.y2&&is_multiple(req.body.y2)&&req.body.img)
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