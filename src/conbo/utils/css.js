/**
 * CSS styles and utilities
 * @author 	Neil Rackett
 */

conbo.cssClassExists = function (className) 
{
	var styleSheets = document.styleSheets;
	
	for (var s=0; s<styleSheets.length; s++) 
	{
		var classes = styleSheets[s].rules || document.styleSheets[s].cssRules;
		
		for (var c=0; c<classes.length; c++) 
		{
			if (classes[c].selectorText == className) 
			{
				return true;               
			}
		}
	}
	
	return false;
};

$(function()
{
	if (conbo.cssClassExists('.cb-hide'))
	{
		return;
	}
	
	$('head').append($
	(
		'<style type="text/css">'+
			'.cb-hide { visibility:hidden !important; }'+
			'.cb-exclude { display:none !important; }'+
			'.cb-disable { pointer-events:none !important; cursor:default !important; }'+
		'</style>'
	));
});
