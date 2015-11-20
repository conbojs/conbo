/**
 * States example for Conbo.js
 * Demonstrates how to use states
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		initialize: function()
		{
			this.currentState = 'happy';
		}
	});
	
	/**
	 * ns.initDom automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	ns.initDom();
	
});