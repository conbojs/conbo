/**
 * Hello Namespace example for Conbo.js
 * 
 * Demonstrates how to automatically apply Application and View classes
 * to existing DOM elements using a namespace
 * 
 * @author	Neil Rackett
 */
(function()
{
	var example = {};
	
	example.MyApp = conbo.Application.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			// DOM elements are automatically bound to Application and View classes
			// unless options.autoApply === false
		},
		
	});
	
	example.MyView = conbo.View.extend
	({
		/**
		 * Someone's favourite colour
		 */
		favoriteColor: 'blue',
		
		/**
		 * URL of external template
		 * Could also be passed in via options.url or loaded using this.load('url/of/my.html');
		 */
		url: 'HelloTemplate-MyView.html',
		
		/**
		 * Entry point
		 */
		initialize: function(options)
		{
			// Nothing to do here!
		},
		
	});
	
	new example.MyApp({namespace:example});
	
})();