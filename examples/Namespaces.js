/**
 * Hello Namespace example for Conbo.js
 * 
 * Demonstrates how to automatically apply Application and View classes
 * to existing DOM elements using a namespace
 * 
 * @author	Neil Rackett
 */
(function()
{
	var example = {};
	
	example.MyApp = conbo.Application.extend
	({
		// :-)
	});
	
	example.MyView = conbo.View.extend
	({
		template: 'Hello Namespace!'
	});
	
	new example.MyApp({namespace:example});
	
})();