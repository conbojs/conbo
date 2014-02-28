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
	
	example.MyLoadedView = conbo.View.extend
	({
		/**
		 * Someone's favourite colour
		 */
		favoriteColor: 'blue',
		
		/**
		 * HTML templates can be loaded by adding a templateUrl property to your
		 * class, passing options.templateUrl or loaded a URL using this.load('url/of/my.html');
		 */
		templateUrl: 'HelloTemplate-1.html',
		
	});
	
	example.MyOtherView = conbo.View.extend
	({
		/**
		 * Someone's favourite colour
		 */
		favoriteColor: 'pink',
		
		/**
		 * HTML templates can be added directly to your class using the templat
		 * property or passing in options.template to your constructor
		 */
		template: 'This is an internal template using the <b>template property of the View class</b> whose favourite colour is <span cb-bind="favoriteColor"></span>',
		
	});
	
	example.MyApp = conbo.Application.extend
	({
		// DOM elements are automatically bound to Application and View 
		// classes unless options.autoApply === false
		
		initialize: function()
		{
			this.appendView
			(
				new example.MyLoadedView(this.context({templateUrl:'HelloTemplate-2.html'})),
				new example.MyOtherView(this.context({template:'This is an internal template using <b>options.template</b> that hates <span cb-bind="favoriteColor"></span>'}))
			);
		}
	});
	
	new example.MyApp({namespace:example});
	
})();