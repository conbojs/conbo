/**
 * States example for Conbo.js
 * Demonstrates how to use states
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		initialize: function()
		{
			this.currentState = 'happy';
		}
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();