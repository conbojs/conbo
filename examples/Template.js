/**
 * Template example for Conbo.js
 * 
 * Demonstrates how to load a template into a View class, which will then 
 * automatically be parsed and bound as appropriate
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	ns.MyLoadedView = conbo.View.extend
	({
		/**
		 * HTML templates can be loaded by adding a templateUrl property to your
		 * class, passing options.templateUrl or loaded a URL using this.loadTemplate('url/of/my.html');
		 */
		templateUrl: 'template-1.html',
		
		initialize: function()
		{
			// Someone's favourite colour
			this.favoriteColor = 'blue';
		}
	});
	
	ns.MyOtherView = conbo.View.extend
	({
		/**
		 * HTML templates can be added directly to your class using the templat
		 * property or passing in options.template to your constructor
		 */
		template: 'This is an internal template using the <b>template property of the View class</b> whose favourite colour is <span cb-style="favoriteColor:color" cb-bind="favoriteColor"></span>',
		
		initialize: function()
		{
			// Someone's favourite colour
			this.favoriteColor = 'pink';
		}
	});
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		/**
		 * All classes have an initialize entry point
		 */
		initialize: function()
		{
			this.appendView
			(
				new ns.MyLoadedView(this.context.addTo({templateUrl:'template-2.html'})),
				new ns.MyOtherView(this.context.addTo({template:'This is an internal template using <b>options.template</b> that hates <span cb-style="favoriteColor:color" cb-bind="favoriteColor"></span>'}))
			);
		}
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();