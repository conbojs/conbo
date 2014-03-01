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
		// DOM elements are automatically bound to Application and View classes
		// unless options.autoApply === false
	});
	
	example.MyView = conbo.View.extend
	({
		template: 'Hello Namespace!'
	});
	
	new example.MyApp({namespace:example});
	
})();