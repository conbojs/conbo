/**
 * Example of how to use bind arrays and Collections using cb-repeat
 * attributes with Conbo.js
 * 
 * @author	Neil Rackett
 */
(function(undefined)
{
	'use strict'
	
	var app = {};
	
	app.MyContext = conbo.Context.extend
	({
		initialize: function()
		{
			this.mapSingleton('myArray', [{name:'Tom'}, {name:'Dick'}, {name:'Sally'}]);
		}
	});
	
	app.MyApp = conbo.Application.extend
	({
		contextClass: app.MyContext,
		myArray: undefined,
		
		test: "Hello"
	});
	
	new app.MyApp({namespace:app});
	
})();