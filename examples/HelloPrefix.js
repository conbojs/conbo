/**
 * Hello Prefix example for Conbo.js
 * 
 * Demonstrates the use of a prefix to specify which existing DOM elements
 * should have Application and View classes automatically applied to them
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
			// unless options.autoBind === false
		},
		
	});
	
	example.MyView = conbo.View.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.render();
		},
		
		render: function()
		{
			this.el.innerHTML = 'Hello from '+this.context.application.prefix+'!';
		}
		
	});
	
	new example.MyApp({namespace:example, prefix:'ns1'});
	new example.MyApp({namespace:example, prefix:'ns2'});
	new example.MyApp({namespace:example, prefix:'ns3'});
	
})();