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
			this.bindViews();
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
			this.el.innerHTML = "Hello Namespace!";
		}
		
	});
	
	new example.MyApp({namespace:example});
	
})();