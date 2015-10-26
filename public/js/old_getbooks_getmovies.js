function getbooks(books,i) {
        console.log('i:'+i);
        var url = '/getbook/'+books[i]._id;
        $.ajax({
         method: "POST",
         url: url,
         data: 0
       })
         .done(function( msg ) {
            if ($(".nobooks")[0])
            { console.log('HAS LENGTH');
              $('.books').empty();}
            else {
              console.log('HASNT GOT LENGTH');
            }
            var authors_insert=' ';
            msg.authors.forEach(function(element){
             authors_insert+='  '+element;
              });
            //for(var xi=0;xi<msg.authors.length;xi++){
            //  authors_insert = msg.authors[xi];
            //  if(!authors_insert){
            //    authors_insert = ' ';
            //  }
            //}
            console.log('newbook :'+books[i].newbook);
            console.log('goodbook :'+books[i].goodbook);
            var insert;
            switch(true){
              case(books[i].goodbook&&!books[i].newbook):
              console.log('1st case');
              insert = "<div class='row book read book"+books[i]._id+"'><div class='col-xs-12 bookpadding hovershade' onclick='redactbookmodal("+i+");'><h3 class='btitle"+books[i]._id+"' style='margin-left:25px;'>"+msg.title.capitalizeFirstLetter()+"<span class='good"+books[i]._id+" label label-primary pull-right'>GOOD</span></h3><h5 class='hidden-lg hidden-md hidden-sm sm_hd"+books[i]._id+"' style='color:#ddd;margin-left:25px;'>"+authors_insert+"</h5></div></div>";
              var thisbook={};
              thisbook.author = authors_insert;
              thisbook.title = msg.title.capitalizeFirstLetter();
              modal_data_store.unshift(thisbook);
              break
              case(books[i].newbook&&!books[i].goodbook):
              console.log('2st case');
              insert = "<div class='row book new book"+books[i]._id+"' ><div class='col-xs-12 bookpadding hovershade' onclick='redactbookmodal("+i+");'><h3 class='btitle"+books[i]._id+"' style='margin-left:15px;'> "+msg.title.capitalizeFirstLetter()+"<small class='hidden-xs' style='margin-left:15px;color:#ddd;' >"+authors_insert+"</small></h3><h5 class='hidden-lg hidden-md hidden-sm' style='color:#ddd;margin-left:25px;'>"+authors_insert+"</h5></div></div>";
              var thisbook={};
              thisbook.author = authors_insert;
              thisbook.title = msg.title.capitalizeFirstLetter();
              modal_data_store.unshift(thisbook);
              console.log(modal_data_store);
              break
              case(!books[i].newbook&&!books[i].goodbook):
              console.log('3st case');
              insert = "<div class='row book read book"+books[i]._id+"'><div class='col-xs-12 bookpadding hovershade' onclick='redactbookmodal("+i+");'><h3 class='btitle"+books[i]._id+"' style='margin-left:25px;'> "+msg.title.capitalizeFirstLetter()+"<small class='hidden-xs' style='margin-left:15px;color:#ddd;''>"+authors_insert+"</small></h3><h5 class='hidden-lg hidden-md hidden-sm' style='color:#ddd;margin-left:25px;'>"+authors_insert+"</h5></div></div>";
              var thisbook={};
              thisbook.author = authors_insert;
              thisbook.title = msg.title.capitalizeFirstLetter();
              modal_data_store.unshift(thisbook);
              break
            }         
           $('.books').append(insert);
           });
         count_b--;
         console.log('before iteration, count_b: '+count_b);
         if(count_b!=-1)
        {getbooks(books,count_b);}
        else {
          return 0;
        }
      }
      function getmovies(movies,i) {
        console.log('i:'+i);
        var url = '/getmovie/'+movies[i]._id;
        $.ajax({
         method: "POST",
         url: url,
         data: 0
       })
         .done(function( msg ) {
            if ($(".nomovies")[0])
            { console.log('HAS LENGTH');
              $('.movies').empty();}
            else {
              console.log('HASNT GOT LENGTH');
            }
            var insert;   
            switch(true){
              case(movies[i].goodmovie&&!movies[i].newmovie):
              console.log('1st case');
              insert = "<div class='row book read movie"+movies[i]._id+"'><div class='col-xs-12 bookpadding hovershade' onclick='redactmoviemodal("+i+");'><h3 class='mtitle"+movies[i]._id+"' style='margin-left:25px;'> "+msg.title.capitalizeFirstLetter()+"<small class='hidden-xs' style='margin-left:15px;color:#ddd;'>"+msg.year+"</small><span class='good"+movies[i]._id+" label label-primary pull-right'>GOOD</span></h3><h5  class='hidden-lg hidden-md hidden-sm sm_hd"+movies[i]._id+"' style='color:#ddd;margin-left:25px;'>"+msg.year+"</h5></div></div>";
              var thismovie={};
              thismovie.year = msg.year;
              thismovie.title = msg.title.capitalizeFirstLetter();
              movie_modal_data_store.unshift(thismovie);
              break
              case(movies[i].newmovie&&!movies[i].goodmovie):
              console.log('2st case');
              insert = "<div class='row book new movie"+movies[i]._id+"'><div class='col-xs-12 bookpadding hovershade' onclick='redactmoviemodal("+i+");'><h3 class='mtitle"+movies[i]._id+"' style='margin-left:25px;'> "+msg.title.capitalizeFirstLetter()+"<small class='hidden-xs' style='margin-left:15px;color:#ddd;' >"+msg.year+"</small></h3><h5 class='hidden-lg hidden-md hidden-sm sm_hd"+movies[i]._id+"' style='color:#ddd;margin-left:25px;'>"+msg.year+"</h5></div></div>";
              var thismovie={};
              thismovie.year = msg.year;
              thismovie.title = msg.title.capitalizeFirstLetter();
              movie_modal_data_store.unshift(thismovie);
              console.log(modal_data_store);
              break
              case(!movies[i].newmovie&&!movies[i].goodmovie):
              console.log('3st case');
              insert = "<div class='row book read movie"+movies[i]._id+"'><div class='col-xs-12 bookpadding hovershade' onclick='redactmoviemodal("+i+");'><h3 class='mtitle"+movies[i]._id+"' style='margin-left:25px;'> "+msg.title.capitalizeFirstLetter()+"<small class='hidden-xs' style='margin-left:15px;color:#ddd;''>"+msg.year+"</small></h3><h5 class='hidden-lg hidden-md hidden-sm sm_hd"+movies[i]._id+"' style='color:#ddd;margin-left:25px;'>"+msg.year+"</h5></div></div>";
              var thismovie={};
              thismovie.year = msg.year;
              thismovie.title = msg.title.capitalizeFirstLetter();
              movie_modal_data_store.unshift(thismovie);
              break
            }         
           $('.movies').append(insert);
           });
         count_m--;
         console.log('before iteration, count_m: '+count_m);
         if(count_m!=-1)
        {getmovies(movies,count_m);}
        else {
          return 0;
        }
      }