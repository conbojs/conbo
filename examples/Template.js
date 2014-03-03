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
		 * class, passing options.templateUrl or loaded a URL using this.loadTemplate('url/of/my.html');
		 */
		templateUrl: 'template-1.html',
		
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
		/**
		 * All classes have an initialize entry point
		 */
		initialize: function()
		{
			this.appendView
			(
				new example.MyLoadedView(this.context.addTo({templateUrl:'template-2.html'})),
				new example.MyOtherView(this.context.addTo({template:'This is an internal template using <b>options.template</b> that hates <span cb-bind="favoriteColor"></span>'}))
			);
		}
	});
	
	new example.MyApp({namespace:example});
	
})();