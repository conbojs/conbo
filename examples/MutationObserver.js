/**
 * Supro example for Conbo.js
 * Demonstrates how to use the supro object
 * 
 * @author	Neil Rackett
 */
(function()
{
	var ns = {};
	
	ns.MyView = conbo.View.extend
	({
		template: 'An automagically instantiated view! <button cb-onclick="close">X</button>',
		
		initialize: function()
		{
			this.bindAll();
		},
		
		close: function()
		{
			this.remove();
		}
	});
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		initialize: function()
		{
			this.observeEnabled = true;
			this.bindAll();
		},
		
		addView: function()
		{
			this.$el.append('<p cb-view="MyView" />');
		}
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	conbo.init(ns);
	
})();