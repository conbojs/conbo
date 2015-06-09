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
	var ns = {};
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
	});
	
	ns.MyView = conbo.View.extend
	({
		initialize: function()
		{
			this.el.innerHTML = 'Hello from '+this.context.app.prefix+'!';
			return this;
		}
	});
	
	/**
	 * Using a prefix enables you to apply the same app to multiple
	 * existing DOM elements on the same page
	 */
	new ns.MyApp({prefix:'prefix1'});
	new ns.MyApp({prefix:'prefix2'});
	new ns.MyApp({prefix:'prefix3'});
	
})();