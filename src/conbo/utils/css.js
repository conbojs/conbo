/*
 * CSS styles used by ConboJS
 * @author 	Neil Rackett
 */

if (document && !document.querySelector('#cb-style'))
{
	document.querySelector('head').innerHTML += 
		'<style id="cb-style" type="text/css">'+
			'\n.cb-hide { visibility:hidden !important; }'+
			'\n.cb-exclude { display:none !important; }'+
			'\n.cb-disable { pointer-events:none !important; cursor:default !important; }'+
			'\nspan { font:inherit; color:inherit; }'+
		'\n</style>';
}
