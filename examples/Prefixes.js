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
		// :-)
	});
	
	example.MyView = conbo.View.extend
	({
		render: function()
		{
			this.html('Hello from '+this.context().app().prefix()+'!');
			return this;
		}
	});
	
	/**
	 * Using a prefix enables you to apply the same app to multiple
	 * existing DOM elements on the same page
	 */
	new example.MyApp({namespace:example, prefix:'prefix1'});
	new example.MyApp({namespace:example, prefix:'prefix2'});
	new example.MyApp({namespace:example, prefix:'prefix3'});
	
})();