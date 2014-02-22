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
		// DOM elements are automatically bound to Application and View classes
		// unless options.autoApply === false
	});
	
	example.MyView = conbo.View.extend
	({
		render: function()
		{
			this.el.innerHTML = 'Hello from '+this.context().app().prefix()+'!';
			return this;
		}
	});
	
	new example.MyApp({namespace:example, prefix:'ns1'});
	new example.MyApp({namespace:example, prefix:'ns2'});
	new example.MyApp({namespace:example, prefix:'ns3'});
	
})();