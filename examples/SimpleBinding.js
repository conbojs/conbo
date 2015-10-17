/**
 * Simple data binding example for Conbo.js
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
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
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();