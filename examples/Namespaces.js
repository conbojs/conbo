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
	var ns = {};
	
	/**
	 * By requiring your app to have a namespace, Conbo.js can automatically
	 * apply your app to existing DOM elements using the cb-app attribute
	 * and guarantees that the correct Views are applies to existing DOM
	 * elements that use the cb-view attribute, without any additional
	 * code needing to be written!
	 */
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
	});
	
	ns.MyView = conbo.View.extend
	({
		template: 'Hello Namespace!'
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();