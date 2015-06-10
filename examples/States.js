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
	 * Passing el to the constructor will automatically add your
	 * application to that element
	 */
	new ns.MyApp();
	
})();