/**
 * Simple data binding example for ConboJS
 * 
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		template:
			'<p>My name is <input type="text" cb-bind="name" /></p>'+
			'<h1>Hello <span cb-bind="name" />!</h1>',
			
		initialize: function()
		{
			this.name = "Conbo";
		}
	});
	
});