// x1, y1, x2, y2 - Координаты для обрезки изображения
// crop - Папка для обрезанных изображений
var x1, y1, x2, y2,cwg,chg, crop = 'userpics/';
var jcrop_api;

jQuery(function($){             
    //maxSize: [ 700, 700 ]
	$('#target').Jcrop({
	    boxWidth: 450,
	     boxHeight: 400,	
		onChange:   showCoords,
		onSelect:   showCoords,
		 aspectRatio: 1 ,
		 minSize: [ 300, 300 ]
	},function(){		
		jcrop_api = this;		
	});
	// Снять выделение	
    $('#release').click(function(e) {		
		release();
    });   
	// Соблюдать пропорции
   // $('#ar_lock').change(function(e) {
	//	jcrop_api.setOptions(this.checked?
	//		{ aspectRatio: 1/1 }: { aspectRatio: 0 });
	//	jcrop_api.focus();
   // });
   // Установка минимальной/максимальной ширины и высоты
   //$('#size_lock').change(function(e) {
	//	jcrop_api.setOptions(this.checked? {
	//		minSize: [ 100,100  ],
	//		maxSize: [ 400, 400 ]
	//	}: {
	//		minSize: [ 0, 0 ],
	//		maxSize: [ 0, 0 ]
	//	});
	//	jcrop_api.focus();
   // });
	// Изменение координат
	function showCoords(c){
		x1 = c.x+40; $('#x1').val(c.x);		
		y1 = c.y+30; $('#y1').val(c.y);		
		x2 = c.x2; $('#x2').val(c.x2);		
		y2 = c.y2; $('#y2').val(c.y2);
		cwg = c.w;
        chg = c.h;
		cw = c.w;
        ch = c.h;
		
		$('#w').val(c.w);
		$('#h').val(c.h);
		
		if(c.w > 0 && c.h > 0){
			$('#crop').show();
		}else{
			$('#crop').hide();
		}
		
	}	
});

function release(){
	jcrop_api.release();
	$('#crop').hide();
}
// Обрезка изображение и вывод результата

jQuery(function($){
	$('#crop').click(function(e) {
		//alert('cwg,chg: '+cwg+', '+chg+', x2,y2: '+x2+', '+y2);
		var img = $('#target').attr('src');
		//$.post('/userp/crop', {'x1': x1, 'x2': x2, 'y1': y1, 'y2': y2,'cw' : cw,'ch' : ch, 'img': img, 'crop': crop}, function(file) {
		//	$('#cropresult').append('<img src="'+crop+file+'" class="mini">');
		//	release();	
		//});
		$.ajax({
         method: 'POST',
         url: '/userp/crop',
         data: {'x1': x1, 'x2': cwg, 'y1': y1, 'y2': chg, 'img': img, 'crop': crop}
       }).done(function (data) {
           ///var response = JSON.parse(jqXHR.responseText);
           //var redurl = 'http://vntrlst.com/userpics/'+data.rdurl;
           //var redurl = '/userpics/'+data.rdurl;
           //var insert = "<img class='img-circle' src='"+redurl+"'></img>";
           //$('#cropresult').append(insert);
           window.location='http://peopleandbooks.com/';
           });
           
    });   
});



 