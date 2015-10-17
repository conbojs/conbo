/**
 * Example of how to use cb-* binding attributes with Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	/**
	 * Switch conbo.Hash for conbo.RemoteHash if you need web services
	 */
	ns.MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			selected: true
		}
	});
	
	ns.MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapSingleton('myModel', ns.MyModel);
		}
	});
	
	ns.MyView = conbo.View.extend
	({
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 * 
		 * Properties of this model can be bound using the magic of cb-* attributes
		 */
		myModel: undefined,
		
		/**
		 * Value that's bound to the DOM using cb-value
		 */
		myValue: "I love binding!",
		
		/**
		 * Event handler that's bound to the DOM using cb-onclick
		 */
		myClick: function(event)
		{
			alert("WOW! No code needed!");
		}
	});
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: ns.MyContext,
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();