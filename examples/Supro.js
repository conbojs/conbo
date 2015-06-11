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
	 * Passing el to the constructor will automatically add your
	 * application to that element
	 */
	new ns.MyApp();
	
})();