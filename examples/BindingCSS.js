/**
 * Example of how to use bind CSS classes using cb-* 
 * attributes with Conbo.js
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
		
		// You don't need to declare properties in your Application
		// or View to bind them, but we definitely recommend it!
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();