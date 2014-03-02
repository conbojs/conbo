/**
 * Namespace example for Conbo.js
 * 
 * Demonstrates how to automatically apply Application and View classes
 * to existing DOM elements using a namespace.
 * 
 * We suggest that all Conbo.js apps are allocated a namespace.
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
	
	/**
	 * Adding a namespace to your app enabled Conbo.js to automatically
	 * apply your app to existing DOM elements using the cb-app attribute
	 * and guarantees that the correct Views are applies to existing DOM
	 * elements that use the cb-view attribute, without any additional
	 * code needing to be written!
	 */
	new example.MyApp({namespace:example});
	
})();