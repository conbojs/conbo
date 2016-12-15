/*
 * CSS styles and utilities
 * @author 	Neil Rackett
 */

if (!!$)
{
	var $head = $('head');
	
	if (!!$head.find('#cb-style').length)
	{
		return;
	}
	
	$head.append
	(
		'<style id="cb-style" type="text/css">'+
			'\n.cb-hide { visibility:hidden !important; }'+
			'\n.cb-exclude { display:none !important; }'+
			'\n.cb-disable { pointer-events:none !important; cursor:default !important; }'+
			'\n.cb-app span { font:inherit; color:inherit; }'+
		'\n</style>'
	);
}
