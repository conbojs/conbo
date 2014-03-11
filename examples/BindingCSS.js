/**
 * Example of how to use bind CSS classes using cb-* 
 * attributes with Conbo.js
 * 
 * @author	Neil Rackett
 */
(function()
{
	var app = {};
	
	app.MyApp = conbo.Application.extend
	({
		// You don't need to declare properties in your Application
		// or View to bind them, but we definitely recommend it!
	});
	
	new app.MyApp({namespace:app});
	
})();