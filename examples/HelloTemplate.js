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
		// DOM elements are automatically bound to Application and View 
		// classes unless options.autoApply === false
	});
	
	example.MyLoadedView = conbo.View.extend
	({
		/**
		 * Someone's favourite colour
		 */
		favoriteColor: 'blue',
		
		/**
		 * URL of template to load
		 * Could also be passed in via options.templateUrl or loaded using this.load('url/of/my.html');
		 */
		templateUrl: 'HelloTemplate-MyLoadedView.html',
		
	});
	
	example.MyOtherView = conbo.View.extend
	({
		/**
		 * Someone's favourite colour
		 */
		favoriteColor: 'pink',
		
		/**
		 * HTML template
		 */
		template: '<p>This is an internal template whose favourite colour is <span cb-bind="favoriteColor"></span></p>',
		
	});
	
	new example.MyApp({namespace:example});
	
})();