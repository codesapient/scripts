function setTitleHeightSame(selector){
  var maxHeight = 0;
  $(selector).each(function(){
  	if ($(this).height() > maxHeight) { maxHeight = $(this).height(); }
  });
  $(selector).height(maxHeight);
}

setTitleHeightSame(".product_title");