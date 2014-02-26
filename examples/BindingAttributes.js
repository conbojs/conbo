/**
 * Example of how to use cb-* binding attributes with Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var app = {};
	
	/**
	 * Switch conbo.Hash for conbo.Model if you need web services
	 */
	app.MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			selected: true
		}
	});
	
	app.MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapSingleton('myModel', app.MyModel);
		}
	});
	
	app.MyView = conbo.View.extend
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
	
	app.MyApp = conbo.Application.extend
	({
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: app.MyContext,
	});
	
	new app.MyApp({namespace:app});
	
})();