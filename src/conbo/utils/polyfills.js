/*
 * Polyfill methods for useful ECMAScript 5 methods that aren't quite universal
 */

if (!String.prototype.trim) 
{
	String.prototype.trim = function () 
	{
		return this.replace(/^\s+|\s+$/g,''); 
	};
}

if (!window.requestAnimationFrame)
{
	window.requestAnimationFrame = (function()
	{
		return window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback)
			{
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}
