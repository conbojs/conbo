/**
 * States example for ConboJS
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
	
});
