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
			'<h1>Hello <span cb-bind="name" />!</h1>'+
			'<p>My name is <input type="text" cb-bind="name" /></p>',
		
		initialize: function()
		{
			this.name = "Conbo";
		}
	});
	
});