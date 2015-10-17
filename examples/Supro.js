/**
 * Supro example for Conbo.js
 * Demonstrates how to use the supro object
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	/**
	 * Super class
	 */
	ns.BaseApp = conbo.Application.extend
	({
		namespace: ns,
			
		greeting: "Hello",
		
		getName: function()
		{
			return "Mr Original";
		}
	});
	
	ns.MyApp = ns.BaseApp.extend
	({
		greeting: "Goodbye",
		
		getName: function()
		{
			return "Mr Override";
		},
		
		initialize: function()
		{
			// Set output using a mix of properties from this and the super class
			this.output = this.supro.greeting+" "+this.supro.getName()+", from "+this.getName()+"!";
		}
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();