/**
 * Template example for ConboJS
 * 
 * Demonstrates how to load a template into a View class, which will then 
 * automatically be parsed and bound as appropriate
 * 
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	ns.MyLoadedView = conbo.View.extend
	({
		tagName: 'p',
		
		/**
		 * HTML templates can be loaded by adding a templateUrl property to your
		 * class, passing options.templateUrl or loading a URL using this.loadTemplate('url/of/my.html');
		 */
		initialize: function()
		{
			this.templateUrl || (this.templateUrl = 'template-1.html');
			this.favoriteColor = 'blue';
		}
	});
	
	ns.MyOtherView = conbo.View.extend
	({
		tagName: 'p',
		
		/**
		 * HTML templates can be added directly to your class using the template
		 * property or passing in options.template to your constructor
		 */
		initialize: function()
		{
			this.template || (this.template = 'This is an internal template using the <b>template property of the View class</b> whose favourite colour is <span cb-style="favoriteColor:color">{{favoriteColor}}</span>');
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
				new ns.MyOtherView(this.context.addTo({template:'This is an internal template using <b>options.template</b> that hates <span cb-style="favoriteColor:color">{{favoriteColor}}</span>'}))
			);
		}
	});
	
});
