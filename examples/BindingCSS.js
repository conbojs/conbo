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
		// You don't need to declare properties in your Application
		// or View to bind them, but we definitely recommend it!
		
		namespace: ns
	});
	
	new ns.MyApp();
	
})();