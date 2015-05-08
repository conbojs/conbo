/**
 * CSS styles and utilities
 * @author 	Neil Rackett
 */

if (!!$)
{
	$(function()
	{
		var $head = $('head');
		
		if (!!$head.find('#cb-css').length)
		{
			return;
		}
		
		$('head').append($
		(
			'<style id="cb-css" type="text/css">'+
				'\n.cb-hide { visibility:hidden !important; }'+
				'\n.cb-exclude { display:none !important; }'+
				'\n.cb-disable { pointer-events:none !important; cursor:default !important; }'+
			'\n</style>'
		));
	});
}
