/**
 * Mutation observer example for ConboJS
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
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
	
});