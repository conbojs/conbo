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
			var myCollection = new conbo.Collection([{name:'Tom'}, {name:'Dick'}, {name:'Sally'}]);
			
			this.mapSingleton('myCollection', myCollection);
		}
	});
	
	app.MyApp = conbo.Application.extend
	({
		contextClass: app.MyContext,
		myCollection: undefined,
		
		initialize: function()
		{
			this.proxyAll();
		},
		
		addItem: function(event)
		{
			this.myCollection.push({name:new Date().getTime().toString()});
			this.trigger('change:myCollection');
		},
		
		removeItem: function(event)
		{
			this.myCollection.pop();
			this.trigger('change:myCollection');
		}
	});
	
	new app.MyApp({namespace:app});
	
})();