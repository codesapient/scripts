
function setTitleHeightSame(selector){
  var maxHeight = 0;
  $(selector).each(function(){
  	if ($(this).height() > maxHeight) { maxHeight = $(this).height(); }
  });
  $(selector).height(maxHeight);
}

$(document).ready(function(){
	setTitleHeightSame(".product_title");
})
